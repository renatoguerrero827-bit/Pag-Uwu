// Cart array to store selected items
let cart = [];

// CONFIGURACIÓN DISCORD
// Pega aquí SOLAMENTE la URL que te da Discord (sin proxies)
const DISCORD_WEBHOOK_KEY = 'https://discord.com/api/webhooks/1456194404216737857/y5_szzKa4gH12g0ANvy4ZXL_FEjXF0Ue0CaDVCi_61y0VYrhfjJ-u13Aua5SU6cz5Fre'; 

// El proxy es necesario para que funcione desde el navegador (evitar bloqueo CORS)
// Usamos thingproxy como alternativa si corsproxy falla
const CORS_PROXY = 'https://thingproxy.freeboard.io/fetch/';

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
const offerAdd6x6Btn = document.getElementById('offer-add-6x6');
const offerAdd6x6ColBtn = document.getElementById('offer-add-6x6-col');
const offerAddCol1Btn = document.getElementById('offer-add-col-1');
const offerAddCol5Btn = document.getElementById('offer-add-col-5');
const offerAddCol10Btn = document.getElementById('offer-add-col-10');
const offerFoodsCount = document.getElementById('offer-foods-count');
const offerDrinksCount = document.getElementById('offer-drinks-count');
const offerBundlesCount = document.getElementById('offer-bundles-count');
const offerSavingsEl = document.getElementById('offer-savings');
const clearCartBtn = document.getElementById('clear-cart-btn');
const accountBtn = document.getElementById('account-btn');
const accountModal = document.getElementById('account-modal');
const accountCloseBtn = document.getElementById('account-close-btn');
const accountSaveBtn = document.getElementById('account-save-btn');
const accountResetUserSalesBtn = document.getElementById('account-reset-user-sales');
const accountUsernameInput = document.getElementById('account-username');
const accountCurrentUserEl = document.getElementById('account-current-user');
const accountCurrentSalesEl = document.getElementById('account-current-sales');
const workerDisplayEl = document.getElementById('worker-display');
const accountLogoutBtn = document.getElementById('account-logout-btn');
const loginModal = document.getElementById('login-modal');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginSubmitBtn = document.getElementById('login-submit-btn');
const loginRegisterBtn = document.getElementById('login-register-btn');
const loginErrorEl = document.getElementById('login-error');

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
const COLLECTIBLE_FEE = 400;
let promo6x6Selected = false;
let collectibleSelected = false;

const USERS_KEY = 'uwu_users';
const SESSION_KEY = 'uwu_session_user';

async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function getWorkerSales() {
    try {
        const raw = localStorage.getItem('uwu_worker_sales');
        return raw ? JSON.parse(raw) : {};
    } catch (_) {
        return {};
    }
}
function setWorkerSales(map) {
    try {
        localStorage.setItem('uwu_worker_sales', JSON.stringify(map));
    } catch (_) {}
}
function getUsers() {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (_) {
        return {};
    }
}
function setUsers(map) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(map));
    } catch (_) {}
}
function setSessionUser(username) {
    try {
        localStorage.setItem(SESSION_KEY, username);
        localStorage.setItem('uwu_current_worker', username);
    } catch (_) {}
}
function getSessionUser() {
    return localStorage.getItem(SESSION_KEY) || null;
}
function updateWorkerDisplay() {
    const name = localStorage.getItem('uwu_current_worker') || 'Sin asignar';
    const salesMap = getWorkerSales();
    const count = salesMap[name] || 0;
    if (workerDisplayEl) {
        workerDisplayEl.textContent = `Trabajador: ${name} • Ventas: ${count}`;
    }
    if (accountCurrentUserEl) accountCurrentUserEl.textContent = name;
    if (accountCurrentSalesEl) accountCurrentSalesEl.textContent = count;
}
function showLoginRequired() {
    if (!loginModal) return;
    loginModal.classList.remove('hidden');
}
function hideLogin() {
    if (!loginModal) return;
    loginModal.classList.add('hidden');
    if (loginErrorEl) loginErrorEl.textContent = '';
    if (loginUsernameInput) loginUsernameInput.value = '';
    if (loginPasswordInput) loginPasswordInput.value = '';
}
function setLockedUI(locked) {
    const main = document.getElementById('main-content');
    const cartButton = document.getElementById('cart-btn');
    const promo = document.getElementById('promo-banner');
    const accountButton = document.getElementById('account-btn');
    const toggle = (el) => {
        if (!el) return;
        if (locked) el.classList.add('locked'); else el.classList.remove('locked');
    };
    toggle(main); toggle(cartButton); toggle(promo); toggle(accountButton);
}
async function handleLogin() {
    const username = (loginUsernameInput && loginUsernameInput.value.trim()) || '';
    const password = (loginPasswordInput && loginPasswordInput.value) || '';
    if (!username || !password) {
        if (loginErrorEl) loginErrorEl.textContent = 'Completa usuario y contraseña';
        return;
    }
    const users = getUsers();
    const hash = await sha256(password);
    if (!users[username] || users[username] !== hash) {
        if (loginErrorEl) loginErrorEl.textContent = 'Usuario o contraseña inválidos';
        return;
    }
    setSessionUser(username);
    updateWorkerDisplay();
    hideLogin();
    showToast(`Bienvenido, ${username}`);
    setLockedUI(false);
}
async function handleRegister() {
    const username = (loginUsernameInput && loginUsernameInput.value.trim()) || '';
    const password = (loginPasswordInput && loginPasswordInput.value) || '';
    if (!username || !password) {
        if (loginErrorEl) loginErrorEl.textContent = 'Completa usuario y contraseña para registrar';
        return;
    }
    const users = getUsers();
    if (users[username]) {
        if (loginErrorEl) loginErrorEl.textContent = 'Usuario ya existe';
        return;
    }
    const hash = await sha256(password);
    users[username] = hash;
    setUsers(users);
    setSessionUser(username);
    const sales = getWorkerSales();
    sales[username] = sales[username] || 0;
    setWorkerSales(sales);
    updateWorkerDisplay();
    hideLogin();
    showToast(`Cuenta creada: ${username}`);
    setLockedUI(false);
}

function addCombo() {
    const top3D = drinksCatalog.slice(0,3);
    const top3F = foodsCatalog.slice(0,3);
    addToCartQty(top3D[0], 500, 2);
    addToCartQty(top3D[1], 500, 1);
    addToCartQty(top3F[0], 500, 2);
    addToCartQty(top3F[1], 500, 1);
    updateCartUI();
    showToast('Combo 3+3 agregado');
}
function addPromo6x6(includeCollectible) {
    const top3D = drinksCatalog.slice(0,3);
    const top3F = foodsCatalog.slice(0,3);
    addToCartQty(top3D[0], 500, 3);
    addToCartQty(top3D[1], 500, 2);
    addToCartQty(top3D[2], 500, 1);
    addToCartQty(top3F[0], 500, 3);
    addToCartQty(top3F[1], 500, 2);
    addToCartQty(top3F[2], 500, 1);
    promo6x6Selected = true;
    collectibleSelected = !!includeCollectible;
    updateCartUI();
    showToast(includeCollectible ? 'Promo 6+6 + coleccionable agregada' : 'Promo 6+6 agregada');
}

function addCollectiblesPack(count) {
    const qty = Math.max(1, Math.min(MAX_QTY, count));
    const unitPrice = qty === 1 ? 1200 : 800;
    addToCartQty('Coleccionable', unitPrice, qty);
    updateCartUI();
    showToast(`Coleccionables x${qty} agregados`);
}

if (offerAddBtn) {
    offerAddBtn.addEventListener('click', () => {
        addCombo();
        cartModal.classList.remove('hidden');
    });
}
if (offerAdd6x6Btn) {
    offerAdd6x6Btn.addEventListener('click', () => {
        addPromo6x6(false);
        cartModal.classList.remove('hidden');
    });
}
if (offerAdd6x6ColBtn) {
    offerAdd6x6ColBtn.addEventListener('click', () => {
        addPromo6x6(true);
        cartModal.classList.remove('hidden');
    });
}

if (offerAddCol1Btn) {
    offerAddCol1Btn.addEventListener('click', () => {
        addCollectiblesPack(1);
        cartModal.classList.remove('hidden');
    });
}
if (offerAddCol5Btn) {
    offerAddCol5Btn.addEventListener('click', () => {
        addCollectiblesPack(5);
        cartModal.classList.remove('hidden');
    });
}
if (offerAddCol10Btn) {
    offerAddCol10Btn.addEventListener('click', () => {
        addCollectiblesPack(10);
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
        promo6x6Selected = false;
        collectibleSelected = false;
        updateCartUI();
    });
}

if (accountBtn && accountModal) {
    accountBtn.addEventListener('click', () => {
        updateWorkerDisplay();
        accountModal.classList.remove('hidden');
    });
}
if (accountCloseBtn && accountModal) {
    accountCloseBtn.addEventListener('click', () => {
        accountModal.classList.add('hidden');
    });
}
if (accountSaveBtn) {
    accountSaveBtn.addEventListener('click', () => {
        const val = (accountUsernameInput && accountUsernameInput.value.trim()) || '';
        if (!val) return;
        localStorage.setItem('uwu_current_worker', val);
        const map = getWorkerSales();
        map[val] = map[val] || 0;
        setWorkerSales(map);
        updateWorkerDisplay();
        if (accountModal) accountModal.classList.add('hidden');
        showToast(`Trabajador asignado: ${val}`);
        if (accountUsernameInput) accountUsernameInput.value = '';
    });
}
if (accountResetUserSalesBtn) {
    accountResetUserSalesBtn.addEventListener('click', () => {
        const name = localStorage.getItem('uwu_current_worker');
        if (!name) return;
        const map = getWorkerSales();
        map[name] = 0;
        setWorkerSales(map);
        updateWorkerDisplay();
        showToast(`Ventas reiniciadas para: ${name}`);
    });
}
if (accountLogoutBtn) {
    accountLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('uwu_current_worker');
        updateWorkerDisplay();
        if (accountModal) accountModal.classList.add('hidden');
        showLoginRequired();
        setLockedUI(true);
    });
}

if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', () => { handleLogin(); });
}
if (loginRegisterBtn) {
    loginRegisterBtn.addEventListener('click', () => { handleRegister(); });
}
document.addEventListener('DOMContentLoaded', () => {
    // Re-attach listener for box button to ensure it works
    const boxBtn = document.getElementById('offer-add-col-box');
    if (boxBtn) {
        boxBtn.addEventListener('click', () => {
            console.log('Agregando caja...');
            addToCart('Caja Coleccionables y Accesorios', 10000);
            const modal = document.getElementById('cart-modal');
            if(modal) modal.classList.remove('hidden');
        });
    }

    const sessionUser = getSessionUser();
    if (!sessionUser) {
        showLoginRequired();
        setLockedUI(true);
    } else {
        updateWorkerDisplay();
        setLockedUI(false);
    }
});

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

function addToCartQty(name, price, qty) {
    const existingItem = cart.find(item => item.name === name);
    const addQty = Math.max(1, Math.min(MAX_QTY, qty));
    if (existingItem) {
        existingItem.quantity = Math.min(MAX_QTY, existingItem.quantity + addQty);
    } else {
        cart.push({ name, price, quantity: addQty });
    }
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
                    <div class="cart-item-line-total">$${(item.price * item.quantity).toFixed(2)}</div>
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
    const collectibleFeeApplied = collectibleSelected ? COLLECTIBLE_FEE : 0;
    total = total + collectibleFeeApplied;

    const paymentMethodInput = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'efectivo';
    const paymentMethodText = paymentMethod === 'banco' ? 'Banco 🏦' : 'Efectivo 💵';

    const workerName = localStorage.getItem('uwu_current_worker') || 'Sin asignar';
    let workerCount = null;
    try {
        const workers = getWorkerSales();
        const key = workerName;
        workers[key] = (workers[key] || 0) + 1;
        setWorkerSales(workers);
        workerCount = workers[key];
    } catch (e) {
        console.error('Error actualizando contador de trabajador:', e);
    }

    // Enviar a Discord
    const now = new Date();
    const dateTimeText = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    const giftsText = promo6x6Selected ? '2 minidonuts' : '';
    sendOrderToDiscord(cart, total, discount, customerName, orderTypeText, deliveryFee, paymentMethodText, workerName, workerCount, dateTimeText, giftsText, collectibleFeeApplied);

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
    promo6x6Selected = false;
    collectibleSelected = false;
    updateWorkerDisplay();
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

function sendOrderToDiscord(cartItems, total, discount, customerName, orderType, deliveryFee = 0, paymentMethod = 'Efectivo 💵', workerName = 'Sin asignar', workerCount = null, dateTimeText = '', giftsText = '', collectibleFeeApplied = 0) {
    if (!DISCORD_WEBHOOK_KEY) {
        console.log('Webhook de Discord no configurado.');
        return;
    }

    // URL se construye dinámicamente en el envío

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
                ...(giftsText ? [{ name: "🎁 Regalos", value: giftsText + (collectibleFeeApplied > 0 ? ' + coleccionable' : '') }] : (collectibleFeeApplied > 0 ? [{ name: "🎁 Regalos", value: 'Coleccionable' }] : [])),
                {
                    name: "🕒 Fecha y hora",
                    value: dateTimeText || `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
                },
                {
                    name: "💵 Resumen",
                    value: `Subtotal: $${(total + discount - deliveryFee - collectibleFeeApplied).toFixed(0)}\nDescuento: -$${discount.toFixed(0)}${deliveryFee > 0 ? `\nDelivery: +$${deliveryFee.toFixed(0)}` : ''}${collectibleFeeApplied > 0 ? `\nColeccionable: +$${collectibleFeeApplied.toFixed(0)}` : ''}\n**Total a Pagar: $${total.toFixed(0)}**`
                }
            ],
            footer: {
                text: `Pedido #${orderNumber} • ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`
            }
        }]
    };

    // Lista de proxies a probar en orden
    // Algunos requieren encodeURIComponent, otros prefieren la URL cruda
    const proxies = [
        { base: 'https://corsproxy.io/?', encode: false },
        { base: 'https://thingproxy.freeboard.io/fetch/', encode: false },
        { base: 'https://api.allorigins.win/raw?url=', encode: true }
    ];

    const attemptSend = (index) => {
        if (index >= proxies.length) {
            alert('⚠️ Error de Conexión Crítico:\nTodos los intentos fallaron. Es posible que tu red o Discord estén bloqueando las conexiones.');
            return;
        }

        const proxy = proxies[index];
        const targetUrl = proxy.base + (proxy.encode ? encodeURIComponent(DISCORD_WEBHOOK_KEY) : DISCORD_WEBHOOK_KEY);
        
        console.log(`Intento ${index + 1}/${proxies.length} usando: ${proxy.base}`);

        fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(async response => {
            if (!response.ok) {
                // Si es error 429 (Rate Limit) o 403 (Forbidden), puede ser bloqueo de IP del proxy.
                // En ese caso, vale la pena intentar el siguiente proxy.
                if (response.status === 429 || response.status === 403) {
                    console.warn(`Bloqueo de Discord (${response.status}) en este proxy. Probando siguiente...`);
                    attemptSend(index + 1);
                    return;
                }

                // Otros errores (400 Bad Request, 404 Not Found) son definitivos (culpa del payload o webhook)
                const errorText = await response.text();
                console.error('Discord rechazó la petición:', response.status, errorText);
                alert(`⚠️ Discord rechazó el pedido:\nStatus: ${response.status} ${response.statusText}\nDetalles: ${errorText.substring(0, 150)}\n\n(Revisa que el Webhook sea válido)`);
            } else {
                console.log('Pedido registrado en Discord correctamente vía ' + proxy.base);
                alert('✅ Pedido enviado a Discord con éxito! 🚀');
            }
        })
        .catch(error => {
            console.warn(`Fallo de conexión con proxy ${proxy.base}:`, error);
            // Intentar con el siguiente proxy
            attemptSend(index + 1);
        });
    };

    // Iniciar secuencia de intentos
    attemptSend(0);

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

