// js/cart.js
// Cart functionality

let cart = [];

function initCart() {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('farmconnect_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    updateCartUI();
    
    // Set up cart sidebar
    setupCartSidebar();
}

function setupCartSidebar() {
    const cartLink = document.getElementById('cart-link');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    
    if (cartLink && cartSidebar) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            cartSidebar.classList.add('open');
        });
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
        });
    }
}

function addToCart(product) {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Save to localStorage
    saveCart();
    
    // Update UI
    updateCartUI();
    
    // Show confirmation
    alert(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    
    // Save to localStorage
    saveCart();
    
    // Update UI
    updateCartUI();
}

function updateCartUI() {
    // Update cart count
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
    
    // Update cart items in sidebar
    updateCartItems();
    
    // Update cart total
    updateCartTotal();
    
    // Update checkout page if exists
    updateCheckoutPage();
}

function updateCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/80x80?text=Product'">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">KSh ${item.price} x ${item.quantity}</p>
                <button class="cart-item-remove" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        // Add event listener to remove button
        const removeBtn = cartItem.querySelector('.cart-item-remove');
        removeBtn.addEventListener('click', function() {
            removeFromCart(item.id);
        });
        
        cartItemsContainer.appendChild(cartItem);
    });
}

function updateCartTotal() {
    const cartTotalAmount = document.getElementById('cart-total-amount');
    
    if (cartTotalAmount) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalAmount.textContent = total;
    }
}

function updateCheckoutPage() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total-amount');
    
    if (checkoutItems) {
        checkoutItems.innerHTML = '';
        
        if (cart.length === 0) {
            checkoutItems.innerHTML = '<p>Your cart is empty</p>';
            return;
        }
        
        cart.forEach(item => {
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'cart-item';
            
            checkoutItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/80x80?text=Product'">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">KSh ${item.price} x ${item.quantity}</p>
                </div>
            `;
            
            checkoutItems.appendChild(checkoutItem);
        });
    }
    
    if (checkoutTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        checkoutTotal.textContent = total;
    }
}

function saveCart() {
    localStorage.setItem('farmconnect_cart', JSON.stringify(cart));
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;