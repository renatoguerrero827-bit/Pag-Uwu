// Cart array to store selected items
let cart = [];

// CONFIGURACIÓN DISCORD
// Pega aquí tu URL del Webhook de Discord
// Nota: Si usas esto desde el navegador directamente, es posible que necesites un proxy CORS (ej: https://corsproxy.io/?TU_URL)
const DISCORD_WEBHOOK_URL = 'https://corsproxy.io/?https://discord.com/api/webhooks/1456194404216737857/y5_szzKa4gH12g0ANvy4ZXL_FEjXF0Ue0CaDVCi_61y0VYrhfjJ-u13Aua5SU6cz5Fre'; 
const DELIVERY_FEE = 500;
const MAX_QTY = 99;

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
    pick3(drinksCatalog).forEach(name => addToCart(name, 500));
    pick3(foodsCatalog).forEach(name => addToCart(name, 500));
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
    showToast(`Agregado al carrito: ${name}`);
}

function removeFromCart(index) {
    const removed = cart[index];
    cart.splice(index, 1);
    updateCartUI();
    if (removed && removed.name) {
        showToast(`Quitado del carrito: ${removed.name}`);
    }
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
    let discount = bundles * (6 * 500 - 1600);
    let total = baseTotal - discount;
    const orderTypeSel = document.querySelector('input[name="order-type"]:checked');
    const isDelivery = orderTypeSel && orderTypeSel.value === 'delivery';
    const deliveryFee = isDelivery ? DELIVERY_FEE : 0;
    const displayTotal = total + deliveryFee;
    cartTotalElement.textContent = `$${displayTotal.toFixed(2)}`;
    const cartTotalLabel = document.querySelector('.cart-total span:first-child');
    if (cartTotalLabel) {
        cartTotalLabel.textContent = isDelivery ? 'Total (incluye delivery):' : 'Total:';
    }
    if (offerNoteElement) {
        const offerText = bundles > 0 ? `Oferta aplicada: ${bundles} combo(s) 3+3 por $1600 • Ahorro $${discount}` : '';
        offerNoteElement.textContent = isDelivery ? `${offerText}${offerText ? ' • ' : ''}Delivery +$${DELIVERY_FEE}` : offerText;
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
                        <input id="qty-input-${index}" class="qty-input" type="number" min="1" max="${MAX_QTY}" value="${item.quantity}" oninput="setQuantity(${index})">
                        <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">🗑️</button>
                `;
                
                cartItemsContainer.appendChild(cartItem);
            });
        }
    
    updateOfferUI();
}

document.querySelectorAll('input[name="order-type"]').forEach(r => {
    r.addEventListener('change', () => updateCartUI());
});

function updateOfferUI() {
    if (!offerFoodsCount || !offerDrinksCount || !offerBundlesCount || !offerSavingsEl) return;
    let drinks = cart.reduce((sum, item) => sum + (categories[item.name] === 'beb' ? item.quantity : 0), 0);
    let foods = cart.reduce((sum, item) => sum + (categories[item.name] === 'com' ? item.quantity : 0), 0);
    let bundles = Math.min(Math.floor(drinks / 3), Math.floor(foods / 3));
    let discount = bundles * (6 * 500 - 1600);
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
                    <input class="qty-control-val" type="number" min="1" max="${MAX_QTY}" inputmode="numeric" value="${item.quantity}">
                    <button class="qty-control-btn plus"><i class="fas fa-plus">+</i></button>
                `;
                
                // Add listeners
                const minusBtn = controls.querySelector('.minus');
                const plusBtn = controls.querySelector('.plus');
                const qtyInput = controls.querySelector('.qty-control-val');
                const confirmBtn = null;
                
                minusBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let val = parseInt(qtyInput.value || '1', 10);
                    if (isNaN(val)) val = 1;
                    if (val <= 1) {
                        const idx = cart.findIndex(i => i.name === name);
                        if (idx > -1) removeFromCart(idx);
                        return;
                    }
                    val = val - 1;
                    qtyInput.value = val;
                    const idx = cart.findIndex(i => i.name === name);
                    if (idx > -1) {
                        cart[idx].quantity = val;
                        updateCartUI();
                    }
                });
                
                plusBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let val = parseInt(qtyInput.value || '1', 10);
                    if (isNaN(val)) val = 1;
                    val = Math.min(MAX_QTY, val + 1);
                    qtyInput.value = val;
                    const idx = cart.findIndex(i => i.name === name);
                    if (idx > -1) {
                        cart[idx].quantity = val;
                        updateCartUI();
                    }
                });
                
                qtyInput.addEventListener('input', (e) => {
                    let val = parseInt(e.target.value || '1', 10);
                    if (isNaN(val)) val = 1;
                    if (val < 1) val = 1;
                    if (val > MAX_QTY) val = MAX_QTY;
                    e.target.value = val;
                    const idx = cart.findIndex(i => i.name === name);
                    if (idx > -1) {
                        cart[idx].quantity = val;
                        updateCartUI();
                    }
                });
                qtyInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        qtyInput.value = item.quantity;
                    }
                });
                
                // Insert after the button
                button.insertAdjacentElement('afterend', controls);
            } else {
                controls.style.display = 'flex';
                const input = controls.querySelector('.qty-control-val');
                if (input) input.value = item.quantity;
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

    // Validar nombre
    const customerNameInput = document.getElementById('customer-name');
    const customerName = customerNameInput ? customerNameInput.value.trim() : 'Anónimo';

    // COMANDO SECRETO: Reiniciar contador de órdenes
    if (customerName.toUpperCase() === 'RESET') {
        localStorage.setItem('uwu_order_count', '0');
        alert('🔄 Contador de órdenes reiniciado a 0. La próxima orden será la #1.');
        customerNameInput.value = '';
        return;
    }
    if (customerName.toUpperCase().startsWith('SETWORKER:')) {
        const newWorker = customerName.split(':')[1]?.trim() || '';
        if (newWorker) {
            localStorage.setItem('uwu_current_worker', newWorker);
            alert(`Trabajador asignado: ${newWorker}`);
        } else {
            alert('Formato inválido. Usa: SETWORKER: Nombre');
        }
        customerNameInput.value = '';
        return;
    }
    if (customerName.toUpperCase() === 'RESETVENTAS') {
        localStorage.removeItem('uwu_worker_sales');
        alert('🔄 Ventas por trabajador reiniciadas.');
        customerNameInput.value = '';
        return;
    }
    if (customerName.toUpperCase().startsWith('RESETVENTAS:')) {
        const targetWorker = customerName.split(':')[1]?.trim() || '';
        if (targetWorker) {
            try {
                const workersRaw = localStorage.getItem('uwu_worker_sales');
                const workers = workersRaw ? JSON.parse(workersRaw) : {};
                if (workers[targetWorker] !== undefined) {
                    delete workers[targetWorker];
                    localStorage.setItem('uwu_worker_sales', JSON.stringify(workers));
                    alert(`Ventas reiniciadas para: ${targetWorker}`);
                } else {
                    alert(`No hay ventas registradas para: ${targetWorker}`);
                }
            } catch (e) {
                alert('Error al reiniciar ventas.');
            }
        } else {
            alert('Formato inválido. Usa: RESETVENTAS: Nombre');
        }
        customerNameInput.value = '';
        return;
    }

    if (!customerName) {
        alert('Por favor, escribe tu nombre o número de mesa antes de pagar. ✍️');
        customerNameInput.focus();
        return;
    }
    
    let baseTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let drinks = cart.reduce((sum, item) => sum + (categories[item.name] === 'beb' ? item.quantity : 0), 0);
    let foods = cart.reduce((sum, item) => sum + (categories[item.name] === 'com' ? item.quantity : 0), 0);
    let bundles = Math.min(Math.floor(drinks / 3), Math.floor(foods / 3));
    let discount = bundles * (6 * 500 - 1600);
    let total = baseTotal - discount;
    
    // Obtener tipo de pedido
    const orderTypeInput = document.querySelector('input[name="order-type"]:checked');
    const orderType = orderTypeInput ? orderTypeInput.value : 'local';
    const orderTypeText = orderType === 'delivery' ? 'Delivery 🛵' : 'Local 🏪';
    const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
    total = total + deliveryFee;

    const paymentMethodInput = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'efectivo';
    const paymentMethodText = paymentMethod === 'banco' ? 'Banco 🏦' : 'Efectivo 💵';

    const workerName = localStorage.getItem('uwu_current_worker') || 'Sin asignar';
    let workerCount = null;
    try {
        const workersRaw = localStorage.getItem('uwu_worker_sales');
        const workers = workersRaw ? JSON.parse(workersRaw) : {};
        const key = workerName;
        workers[key] = (workers[key] || 0) + 1;
        localStorage.setItem('uwu_worker_sales', JSON.stringify(workers));
        workerCount = workers[key];
    } catch (e) {
        console.error('Error actualizando contador de trabajador:', e);
    }

    // Enviar a Discord
    const now = new Date();
    const dateTimeText = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    sendOrderToDiscord(cart, total, discount, customerName, orderTypeText, deliveryFee, paymentMethodText, workerName, workerCount, dateTimeText);

    // Mostrar modal de éxito personalizado
    document.getElementById('success-customer').textContent = customerName;
    document.getElementById('success-type').textContent = orderTypeText;
    document.getElementById('success-payment').textContent = paymentMethodText;
    const successDT = document.getElementById('success-datetime');
    if (successDT) successDT.textContent = dateTimeText;
    document.getElementById('success-total').textContent = `$${total.toFixed(0)}`;
    
    const successModal = document.getElementById('success-modal');
    successModal.classList.remove('hidden');

    // Cerrar el modal de éxito
    document.getElementById('close-success-btn').onclick = () => {
        successModal.classList.add('hidden');
    };
    
    cart = [];
    if(customerNameInput) customerNameInput.value = ''; // Limpiar nombre
    // Resetear radio button a Local
    const localRadio = document.querySelector('input[name="order-type"][value="local"]');
    if(localRadio) localRadio.checked = true;
    
    updateCartUI();
    cartModal.classList.add('hidden');
});

function setQuantity(index) {
    const input = document.getElementById(`qty-input-${index}`);
    if (!input) return;
    let val = parseInt(input.value || '1', 10);
    if (isNaN(val)) val = 1;
    if (val < 1) {
        removeFromCart(index);
        return;
    }
    if (val > MAX_QTY) val = MAX_QTY;
    cart[index].quantity = val;
    updateCartUI();
}

function qtyInputKey(index, e) {
    if (e.key === 'Escape') {
        const input = document.getElementById(`qty-input-${index}`);
        if (input) input.value = cart[index].quantity;
    }
}

function adjustQuantityDraft(index, delta) {
    const input = document.getElementById(`qty-input-${index}`);
    if (!input) return;
    let val = parseInt(input.value || '1', 10);
    if (isNaN(val)) val = 1;
    if (delta < 0 && val <= 1) {
        removeFromCart(index);
        return;
    }
    val = Math.max(1, Math.min(MAX_QTY, val + delta));
    input.value = val;
}

function sendOrderToDiscord(cartItems, total, discount, customerName, orderType, deliveryFee = 0, paymentMethod = 'Efectivo 💵', workerName = 'Sin asignar', workerCount = null, dateTimeText = '') {
    if (!DISCORD_WEBHOOK_URL) {
        console.log('Webhook de Discord no configurado.');
        return;
    }

    // Obtener y actualizar número de orden
    let orderNumber = localStorage.getItem('uwu_order_count');
    if (!orderNumber) {
        orderNumber = 1;
    } else {
        orderNumber = parseInt(orderNumber) + 1;
    }
    localStorage.setItem('uwu_order_count', orderNumber);

    const itemsList = cartItems.map(item => 
        `• **${item.name}** (x${item.quantity}) - $${(item.price * item.quantity).toFixed(0)}`
    ).join('\n');

    const payload = {
        embeds: [{
            title: `✨ Nuevo Pedido Recibido #${orderNumber} 🛍️`,
            description: `**Cliente:** ${customerName}\n**Trabajador:** ${workerName}${workerCount !== null ? ` • Ventas: ${workerCount}` : ''}\n**Tipo de Pedido:** ${orderType}\n**Método de Pago:** ${paymentMethod}`,
            color: 16738740, // Color rosado (#ff6b74)
            fields: [
                {
                    name: "📋 Productos",
                    value: itemsList || "Sin productos"
                },
                {
                    name: "🕒 Fecha y hora",
                    value: dateTimeText || `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
                },
                {
                    name: "💵 Resumen",
                    value: `Subtotal: $${(total + discount - deliveryFee).toFixed(0)}\nDescuento: -$${discount.toFixed(0)}${deliveryFee > 0 ? `\nDelivery: +$${deliveryFee.toFixed(0)}` : ''}\n**Total a Pagar: $${total.toFixed(0)}**`
                }
            ],
            footer: {
                text: `Pedido #${orderNumber} • ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`
            }
        }]
    };

    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            console.error('Error enviando a Discord:', response.statusText);
            // Si falla por CORS, el navegador lanzará error en el catch normalmente o response type opaque
        } else {
            console.log('Pedido registrado en Discord correctamente');
        }
    })
    .catch(error => {
        console.error('Error al conectar con Discord:', error);
        console.warn('NOTA: Si estás ejecutando esto localmente, Discord bloquea las peticiones por seguridad (CORS). Intenta usar un proxy como https://corsproxy.io/?TU_WEBHOOK_URL');
    });

}

function showToast(text) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

