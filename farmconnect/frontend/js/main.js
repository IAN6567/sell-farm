// js/main.js - UPDATED with real authentication
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Check if user is already logged in
    await checkAuthStatus();
    
    // Load featured products
    await loadFeaturedProducts();
    
    // Initialize cart
    initCart();
}

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
    
    // Login modal
    const loginLink = document.getElementById('login-link');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.close');
    
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'block';
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Registration form toggle
    const registerLink = document.getElementById('register-link');
    const loginLinkForm = document.getElementById('login-link-form');
    const loginFormElem = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginFormElem.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }
    
    if (loginLinkForm) {
        loginLinkForm.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginFormElem.style.display = 'block';
        });
    }
    
    // Registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authAPI.logout();
        });
    }
}

async function checkAuthStatus() {
    if (isLoggedIn()) {
        try {
            const userData = getUserData();
            updateUIForUser(userData.userType, userData.name);
        } catch (error) {
            console.error('Error checking auth status:', error);
            authAPI.logout();
        }
    }
}

async function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products');
    
    if (!featuredProductsContainer) return;
    
    try {
        const products = await productsAPI.getFeaturedProducts();
        
        featuredProductsContainer.innerHTML = '';
        
        if (products.length === 0) {
            featuredProductsContainer.innerHTML = '<p>No featured products available</p>';
            return;
        }
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            featuredProductsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading featured products:', error);
        featuredProductsContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const imageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://via.placeholder.com/300x200?text=Product+Image';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=Product+Image'">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">KSh ${product.price}</p>
            <p class="product-farmer">By ${product.farmer?.farmName || product.farmer?.name || 'Unknown Farmer'}</p>
            <button class="btn btn-primary add-to-cart" data-id="${product._id}">Add to Cart</button>
        </div>
    `;
    
    // Add event listener to the add to cart button
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            image: imageUrl,
            farmer: product.farmer?.farmName || product.farmer?.name
        });
    });
    
    return card;
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('user-type').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    try {
        const loginBtn = document.querySelector('#login-form button[type="submit"]');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        
        const result = await authAPI.login(email, password, userType);
        
        // Close the modal
        document.getElementById('login-modal').style.display = 'none';
        
        // Update UI
        updateUIForUser(result.user.userType, result.user.name);
        
        // Show success message
        alert(`Welcome back, ${result.user.name}!`);
        
        // Reset form
        document.getElementById('login-form').reset();
        
    } catch (error) {
        alert(error.message || 'Login failed. Please try again.');
    } finally {
        const loginBtn = document.querySelector('#login-form button[type="submit"]');
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
    }
}

async function handleRegistration() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('reg-phone').value;
    const location = document.getElementById('reg-location').value;
    const userType = document.getElementById('reg-user-type').value;
    const farmName = userType === 'farmer' ? document.getElementById('reg-farm-name')?.value : undefined;
    
    if (!name || !email || !password || !phone || !location) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    try {
        const registerBtn = document.querySelector('#register-form button[type="submit"]');
        const originalText = registerBtn.textContent;
        registerBtn.textContent = 'Registering...';
        registerBtn.disabled = true;
        
        const userData = {
            name,
            email,
            password,
            userType,
            phone,
            location,
            farmName
        };
        
        const result = await authAPI.register(userData);
        
        // Close the modal
        document.getElementById('login-modal').style.display = 'none';
        
        // Update UI
        updateUIForUser(result.user.userType, result.user.name);
        
        // Show success message
        alert(`Registration successful! Welcome to FarmConnect, ${result.user.name}!`);
        
        // Reset form
        document.getElementById('register-form').reset();
        
    } catch (error) {
        alert(error.message || 'Registration failed. Please try again.');
    } finally {
        const registerBtn = document.querySelector('#register-form button[type="submit"]');
        registerBtn.textContent = 'Register';
        registerBtn.disabled = false;
    }
}

function updateUIForUser(userType, userName) {
    const loginLink = document.getElementById('login-link');
    const nav = document.querySelector('.nav');
    
    if (loginLink) {
        loginLink.innerHTML = `
            ${userName} ▼
            <ul class="dropdown-menu">
                <li><a href="#" id="logout-btn">Logout</a></li>
                ${userType === 'farmer' ? '<li><a href="dashboard.html">Dashboard</a></li>' : ''}
                ${userType === 'admin' ? '<li><a href="admin.html">Admin Panel</a></li>' : ''}
            </ul>
        `;
        
        // Add event listener to logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                authAPI.logout();
            });
        }
        
        // Add dropdown functionality
        loginLink.classList.add('has-dropdown');
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.querySelector('.dropdown-menu');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.has-dropdown')) {
                const dropdowns = document.querySelectorAll('.dropdown-menu');
                dropdowns.forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });
    }
    
    // Show/hide admin link based on user type
    const adminLink = document.querySelector('a[href="admin.html"]');
    if (adminLink) {
        adminLink.style.display = userType === 'admin' ? 'block' : 'none';
    }
    
    // Show/hide dashboard link based on user type
    const dashboardLink = document.querySelector('a[href="dashboard.html"]');
    if (dashboardLink) {
        dashboardLink.style.display = userType === 'farmer' ? 'block' : 'none';
    }
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount);
}