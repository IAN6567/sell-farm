// js/cart.js - COMPLETE & RESPONSIVE
let cart = [];

function initCart() {
    console.log('🛒 Initializing cart...');
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('farmconnect_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log(`✅ Loaded ${cart.length} items from cart`);
        } catch (error) {
            console.error('❌ Error loading cart from localStorage:', error);
            cart = [];
        }
    }
    
    updateCartUI();
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
            console.log('🛒 Cart sidebar opened');
        });
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
            console.log('❌ Cart sidebar closed');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (cartSidebar && cartSidebar.classList.contains('open')) {
            if (!cartSidebar.contains(e.target) && e.target !== cartLink) {
                cartSidebar.classList.remove('open');
            }
        }
    });
}

function addToCart(product) {
    console.log('➕ Adding to cart:', product.name);
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log(`📦 Increased quantity to ${existingItem.quantity}`);
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
        console.log('🆕 New item added to cart');
    }
    
    // Save to localStorage
    saveCart();
    
    // Update UI
    updateCartUI();
    
    // Show confirmation with animation
    showCartNotification(`${product.name} added to cart!`);
    
    // Open cart sidebar on mobile
    if (window.innerWidth <= 768) {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('open');
        }
    }
}

function removeFromCart(productId) {
    console.log('🗑️ Removing item from cart:', productId);
    
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        
        // Save to localStorage
        saveCart();
        
        // Update UI
        updateCartUI();
        
        showCartNotification(`${removedItem.name} removed from cart`);
    }
}

function updateCartQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
}

function updateCartUI() {
    // Update cart count in header
    updateCartCount();
    
    // Update cart items in sidebar
    updateCartItems();
    
    // Update cart total
    updateCartTotal();
    
    // Update checkout page if exists
    updateCheckoutPage();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Add animation for count change
        if (totalItems > 0) {
            cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        }
    }
}

function updateCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <p>Your cart is empty</p>
                <a href="products.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        // Use emoji or image for product
        const itemDisplay = item.image && item.image.startsWith('/') 
            ? `<img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.classList.add('fallback')">`
            : `<div class="cart-item-image fallback">${item.image || '📦'}</div>`;
        
        cartItem.innerHTML = `
            ${itemDisplay}
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">KSh ${item.price} × ${item.quantity}</p>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">−</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    <button class="cart-item-remove" data-id="${item.id}">Remove</button>
                </div>
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
        cartTotalAmount.textContent = total.toLocaleString();
    }
}

function updateCheckoutPage() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total-amount');
    
    if (checkoutItems) {
        checkoutItems.innerHTML = '';
        
        if (cart.length === 0) {
            checkoutItems.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <p>Your cart is empty</p>
                    <a href="products.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }
        
        cart.forEach(item => {
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'cart-item';
            
            const itemDisplay = item.image && item.image.startsWith('/') 
                ? `<img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.classList.add('fallback')">`
                : `<div class="cart-item-image fallback">${item.image || '📦'}</div>`;
            
            checkoutItem.innerHTML = `
                ${itemDisplay}
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">KSh ${item.price} × ${item.quantity}</p>
                    <p class="cart-item-subtotal">Subtotal: KSh ${(item.price * item.quantity).toLocaleString()}</p>
                </div>
            `;
            
            checkoutItems.appendChild(checkoutItem);
        });
    }
    
    if (checkoutTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        checkoutTotal.textContent = total.toLocaleString();
    }
}

function saveCart() {
    try {
        localStorage.setItem('farmconnect_cart', JSON.stringify(cart));
    } catch (error) {
        console.error('❌ Error saving cart to localStorage:', error);
    }
}

function clearCart() {
    console.log('🗑️ Clearing entire cart');
    cart = [];
    saveCart();
    updateCartUI();
    showCartNotification('Cart cleared');
}

function showCartNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow-lg);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .empty-cart {
        text-align: center;
        padding: 40px 20px;
    }
    
    .empty-cart-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        opacity: 0.5;
    }
    
    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 8px;
    }
    
    .quantity-btn {
        width: 30px;
        height: 30px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1rem;
        transition: var(--transition);
    }
    
    .quantity-btn:hover {
        background: #f5f5f5;
        border-color: var(--primary-color);
    }
    
    .quantity-display {
        font-weight: 600;
        min-width: 30px;
        text-align: center;
    }
    
    .cart-item-subtotal {
        font-weight: 600;
        color: var(--primary-color);
        margin-top: 5px;
    }
`;
document.head.appendChild(style);

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.clearCart = clearCart;