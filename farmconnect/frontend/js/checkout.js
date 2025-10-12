// js/checkout.js
// Checkout functionality

document.addEventListener('DOMContentLoaded', function() {
    initCheckout();
});

function initCheckout() {
    updateCheckoutPage();
    setupCheckoutForm();
}

function setupCheckoutForm() {
    const form = document.getElementById('checkout-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            processOrder();
        });
    }
}

function processOrder() {
    const fullName = document.getElementById('full-name').value;
    const phone = document.getElementById('phone').value;
    const county = document.getElementById('county').value;
    const town = document.getElementById('town').value;
    const address = document.getElementById('address').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Basic validation
    if (!fullName || !phone || !county || !town || !address) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // In a real application, this would send order to backend
    const orderData = {
        customer: {
            name: fullName,
            phone: phone,
            address: {
                county: county,
                town: town,
                details: address
            }
        },
        products: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: paymentMethod
    };
    
    console.log('Processing order:', orderData);
    
    // Generate random order ID
    const orderId = 'FC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Show success modal
    document.getElementById('order-id').textContent = orderId;
    document.getElementById('order-success-modal').style.display = 'block';
    
    // Clear cart
    clearCart();
}

// Close success modal
document.addEventListener('DOMContentLoaded', function() {
    const closeModal = document.querySelector('#order-success-modal .close');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            document.getElementById('order-success-modal').style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('order-success-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});