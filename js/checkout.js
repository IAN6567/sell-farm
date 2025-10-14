// js/checkout.js - COMPLETE & RESPONSIVE
document.addEventListener('DOMContentLoaded', function() {
    console.log('💰 Checkout Page Initializing...');
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        alert('Please login to proceed with checkout.');
        window.location.href = 'index.html';
        return;
    }
    
    // Check if cart has items
    if (cart.length === 0) {
        alert('Your cart is empty. Please add some products first.');
        window.location.href = 'products.html';
        return;
    }
    
    initCheckout();
});

function initCheckout() {
    updateCheckoutPage();
    setupCheckoutForm();
    loadUserProfileData();
    console.log('✅ Checkout Ready');
}

function setupCheckoutForm() {
    const form = document.getElementById('checkout-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            processOrder();
        });
    }
    
    // Add form validation
    setupFormValidation();
}

function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    field.classList.remove('error');
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific validations
    if (field.type === 'tel') {
        const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    if (field.id === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    field.classList.add('valid');
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function loadUserProfileData() {
    const userData = getUserData();
    
    if (userData) {
        const fullNameInput = document.getElementById('full-name');
        const phoneInput = document.getElementById('phone');
        
        if (fullNameInput && !fullNameInput.value) {
            fullNameInput.value = userData.name || '';
        }
        
        if (phoneInput && !phoneInput.value && userData.phone) {
            phoneInput.value = userData.phone;
        }
        
        // Set location if available
        if (userData.location) {
            const countyInput = document.getElementById('county');
            const townInput = document.getElementById('town');
            
            if (countyInput && !countyInput.value) {
                countyInput.value = userData.location.county || '';
            }
            
            if (townInput && !townInput.value) {
                townInput.value = userData.location.town || '';
            }
        }
    }
}

async function processOrder() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    // Validate all required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showCheckoutMessage('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Prepare order data
    const orderData = {
        customer: {
            name: document.getElementById('full-name').value.trim(),
            phone: document.getElementById('phone').value.trim()
        },
        shippingAddress: {
            county: document.getElementById('county').value.trim(),
            town: document.getElementById('town').value.trim(),
            details: document.getElementById('address').value.trim()
        },
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        products: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
        }))
    };
    
    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing Order...';
        submitBtn.disabled = true;
        
        console.log('🔄 Processing order...', orderData);
        
        // Simulate API call (replace with actual ordersAPI.createOrder)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, we'll simulate success
        // const order = await ordersAPI.createOrder(orderData);
        
        const order = {
            _id: 'ORD-' + Date.now(),
            ...orderData,
            totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending'
        };
        
        console.log('✅ Order created:', order);
        
        // Clear cart
        clearCart();
        
        // Show success modal
        showOrderSuccess(order);
        
    } catch (error) {
        console.error('Error creating order:', error);
        showCheckoutMessage(
            error.message || 'Error processing order. Please try again.', 
            'error'
        );
    } finally {
        const submitBtn = document.querySelector('#checkout-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Place Order';
            submitBtn.disabled = false;
        }
    }
}

function showOrderSuccess(order) {
    const modal = document.getElementById('order-success-modal');
    const orderIdElement = document.getElementById('order-id');
    
    if (orderIdElement) {
        orderIdElement.textContent = order._id;
    }
    
    if (modal) {
        modal.style.display = 'block';
        
        // Add confetti effect for celebration
        createConfetti();
    }
}

function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2001;
    `;
    
    document.body.appendChild(confettiContainer);
    
    // Create confetti particles
    for (let i = 0; i < 50; i++) {
        createConfettiParticle(confettiContainer);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
        confettiContainer.remove();
    }, 3000);
}

function createConfettiParticle(container) {
    const particle = document.createElement('div');
    const colors = ['#2e7d32', '#4caf50', '#ff9800', '#ff5722', '#2196f3', '#9c27b0'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: ${color};
        top: -10px;
        left: ${Math.random() * 100}%;
        border-radius: 2px;
        animation: confettiFall ${1 + Math.random() * 2}s linear forwards;
    `;
    
    container.appendChild(particle);
}

function showCheckoutMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.checkout-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} checkout-message`;
    messageDiv.textContent = message;
    
    // Add to checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.insertBefore(messageDiv, checkoutForm.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Close success modal
document.addEventListener('DOMContentLoaded', function() {
    const closeModal = document.querySelector('#order-success-modal .close');
    const modal = document.getElementById('order-success-modal');
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            window.location.href = 'index.html';
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                window.location.href = 'index.html';
            }
        });
    }
});

// Add CSS for checkout page
const checkoutStyles = document.createElement('style');
checkoutStyles.textContent = `
    .form-group input.error,
    .form-group textarea.error {
        border-color: var(--danger-color);
        background-color: #fff5f5;
    }
    
    .form-group input.valid {
        border-color: var(--success-color);
    }
    
    .field-error {
        color: var(--danger-color);
        font-size: 0.85rem;
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .field-error::before {
        content: "⚠";
    }
    
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .checkout-message {
        margin-bottom: 20px;
    }
    
    .order-summary-item {
        display: flex;
        justify-content: between;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }
    
    .order-summary-item:last-child {
        border-bottom: none;
    }
    
    .order-summary-label {
        flex: 1;
        color: var(--text-light);
    }
    
    .order-summary-value {
        font-weight: 600;
    }
    
    .checkout-total {
        background: #f8f9fa;
        padding: 20px;
        border-radius: var(--border-radius);
        margin-top: 20px;
        border: 2px solid var(--primary-color);
    }
    
    .checkout-total .order-summary-item {
        border-bottom: none;
        margin-bottom: 5px;
    }
    
    .checkout-total .order-summary-value {
        color: var(--primary-color);
        font-size: 1.2rem;
    }
    
    @media (max-width: 768px) {
        .checkout-container {
            grid-template-columns: 1fr;
        }
        
        .checkout-summary {
            order: 2;
        }
        
        .checkout-form {
            order: 1;
        }
    }
`;
document.head.appendChild(checkoutStyles);