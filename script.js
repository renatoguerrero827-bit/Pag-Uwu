// Cart array to store selected items
let cart = [];

// DOM Elements
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total-price');
const cartCountElement = document.getElementById('cart-count');
const offerNoteElement = document.getElementById('cart-offer-note');
const checkoutBtn = document.getElementById('checkout-btn');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
const offerAddBtn = document.getElementById('offer-add-btn');
const offerFoodsCount = document.getElementById('offer-foods-count');
const offerDrinksCount = document.getElementById('offer-drinks-count');
const offerBundlesCount = document.getElementById('offer-bundles-count');
const offerSavingsEl = document.getElementById('offer-savings');
const clearCartBtn = document.getElementById('clear-cart-btn');

const categories = {
    'Choco Kitty': 'beb',
    'Cat Paw Café': 'beb',
    'Donut Milkshake': 'beb',
    'Summer Bubble': 'beb',
    'uwu Galaxy': 'beb',
    'Sandía Fresh': 'beb',
    'Ice Tea': 'beb',
    'Kitty Jelly': 'com',
    'Mochi Galaxy': 'com',
    'Ice Tea Float': 'com',
    'Bento uwu': 'com',
    'Kitty Nigiris': 'com',
    'Chick Burger': 'com'
};

const drinksCatalog = ['Choco Kitty','Cat Paw Café','Donut Milkshake','Summer Bubble','uwu Galaxy','Sandía Fresh','Ice Tea'];
const foodsCatalog = ['Kitty Jelly','Mochi Galaxy','Ice Tea Float','Bento uwu','Kitty Nigiris','Chick Burger'];

function addCombo() {
    const pick3 = (list) => list.slice(0,3);
    pick3(drinksCatalog).forEach(name => addToCart(name, 600));
    pick3(foodsCatalog).forEach(name => addToCart(name, 600));
}

if (offerAddBtn) {
    offerAddBtn.addEventListener('click', () => {
        addCombo();
        cartModal.classList.remove('hidden');
    });
}

// Toggle Cart Visibility
cartBtn.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
});

closeCartBtn.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.add('hidden');
    }
});

if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
        cart = [];
        updateCartUI();
    });
}

// Add to Cart Functionality
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        
        addToCart(name, price);
    });
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function changeQuantity(index, change) {
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
    } else {
        // If quantity goes to 0, ask to remove or just remove? 
        // Let's just remove it if they click minus on 1, or maybe keep it at 1?
        // Standard behavior: usually keeps at 1 or removes. Let's remove if it goes to 0.
        cart.splice(index, 1);
    }
    updateCartUI();
}

function updateCartUI() {
    // Update Product Buttons on the page
    updateProductButtons();

    // Update Cart Count (Total items count)
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalCount;
    
    let baseTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let drinks = cart.reduce((sum, item) => sum + (categories[item.name] === 'beb' ? item.quantity : 0), 0);
    let foods = cart.reduce((sum, item) => sum + (categories[item.name] === 'com' ? item.quantity : 0), 0);
    let bundles = Math.min(Math.floor(drinks / 3), Math.floor(foods / 3));
    let discount = bundles * (6 * 600 - 1600);
    let total = baseTotal - discount;
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
    if (offerNoteElement) {
        offerNoteElement.textContent = bundles > 0 ? `Oferta aplicada: ${bundles} combo(s) 3+3 por $1600 • Ahorro $${discount}` : '';
    }
    
    // Render Cart Items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío 😿</p>';
    } else {
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">🗑️</button>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
    }
    
    updateOfferUI();
}

function updateOfferUI() {
    if (!offerFoodsCount || !offerDrinksCount || !offerBundlesCount || !offerSavingsEl) return;
    let drinks = cart.reduce((sum, item) => sum + (categories[item.name] === 'beb' ? item.quantity : 0), 0);
    let foods = cart.reduce((sum, item) => sum + (categories[item.name] === 'com' ? item.quantity : 0), 0);
    let bundles = Math.min(Math.floor(drinks / 3), Math.floor(foods / 3));
    let discount = bundles * (6 * 600 - 1600);
    offerFoodsCount.textContent = Math.min(foods, 3);
    offerDrinksCount.textContent = Math.min(drinks, 3);
    offerBundlesCount.textContent = bundles;
    offerSavingsEl.textContent = `$${discount}`;
}
function updateProductButtons() {
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(button => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        const item = cart.find(i => i.name === name);
        const parent = button.parentElement;
        
        let controls = parent.querySelector('.quantity-controls');
        
        if (item) {
            button.style.display = 'none';
            
            if (!controls) {
                controls = document.createElement('div');
                controls.className = 'quantity-controls';
                controls.innerHTML = `
                    <button class="qty-control-btn minus"><i class="fas fa-minus">-</i></button>
                    <span class="qty-control-val">${item.quantity}</span>
                    <button class="qty-control-btn plus"><i class="fas fa-plus">+</i></button>
                `;
                
                // Add listeners
                const minusBtn = controls.querySelector('.minus');
                const plusBtn = controls.querySelector('.plus');
                
                minusBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = cart.findIndex(i => i.name === name);
                    if (idx > -1) changeQuantity(idx, -1);
                });
                
                plusBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    addToCart(name, price);
                });
                
                // Insert after the button
                button.insertAdjacentElement('afterend', controls);
            } else {
                controls.style.display = 'flex';
                controls.querySelector('.qty-control-val').textContent = item.quantity;
            }
        } else {
            button.style.display = 'block';
            button.innerHTML = 'Agregar 🛒';
            button.classList.remove('has-items');
            if (controls) {
                controls.style.display = 'none';
            }
        }
    });
}

// Checkout Functionality (Simple Alert for now)
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('¡Tu carrito está vacío! Agrega algunas cositas ricas primero.');
        return;
    }
    
    let baseTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let drinks = cart.reduce((sum, item) => sum + (categories[item.name] === 'beb' ? item.quantity : 0), 0);
    let foods = cart.reduce((sum, item) => sum + (categories[item.name] === 'com' ? item.quantity : 0), 0);
    let bundles = Math.min(Math.floor(drinks / 3), Math.floor(foods / 3));
    let discount = bundles * (6 * 600 - 1600);
    let total = baseTotal - discount;
    alert(`¡Gracias por tu compra! \nTotal a pagar: $${total.toFixed(2)}\n\nTu pedido llegará pronto. 🛵💨`);
    
    cart = [];
    updateCartUI();
    cartModal.classList.add('hidden');
});
