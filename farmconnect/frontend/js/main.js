// js/main.js - COMPLETELY FIXED WITH IMAGE FALLBACKS
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 FarmConnect Frontend Initializing...');
    initApp();
});

async function initApp() {
    try {
        setupEventListeners();
        await checkAuthStatus();
        await loadFeaturedProducts();
        initCart();
        console.log('✅ FarmConnect Frontend Ready');
    } catch (error) {
        console.error('❌ App initialization failed:', error);
    }
}

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            console.log('📱 Mobile menu toggled');
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
            console.log('🔐 Login modal opened');
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            loginModal.style.display = 'none';
            console.log('❌ Login modal closed');
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
            console.log('📝 Switched to registration form');
        });
    }
    
    if (loginLinkForm) {
        loginLinkForm.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginFormElem.style.display = 'block';
            console.log('🔐 Switched to login form');
        });
    }
    
    // Registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Farm name field toggle
    const userTypeSelect = document.getElementById('reg-user-type');
    if (userTypeSelect) {
        userTypeSelect.addEventListener('change', function() {
            const farmNameGroup = document.getElementById('farm-name-group');
            if (farmNameGroup) {
                farmNameGroup.style.display = this.value === 'farmer' ? 'block' : 'none';
                console.log('🏠 Farm name field toggled:', this.value);
            }
        });
    }
}

async function checkAuthStatus() {
    if (isLoggedIn()) {
        try {
            const userData = getUserData();
            if (userData) {
                updateUIForUser(userData.userType, userData.name);
                console.log('✅ User authenticated:', userData.name);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            authAPI.logout();
        }
    } else {
        console.log('👤 User not authenticated');
    }
}

async function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products');
    
    if (!featuredProductsContainer) return;
    
    try {
        console.log('🔄 Loading featured products...');
        const products = await productsAPI.getFeaturedProducts();
        
        featuredProductsContainer.innerHTML = '';
        
        if (products.length === 0) {
            featuredProductsContainer.innerHTML = '<p class="loading">No featured products available</p>';
            console.log('ℹ️ No featured products found');
            return;
        }
        
        console.log(`✅ Loaded ${products.length} featured products`);
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            featuredProductsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading featured products:', error);
        featuredProductsContainer.innerHTML = '<p class="loading">Error loading products. Please try again later.</p>';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Try to use product image, fallback to placeholder
    const imageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : null;
    
    const farmerName = product.farmer?.farmName || product.farmer?.name || 'Unknown Farmer';
    
    card.innerHTML = `
        <div class="product-image-container">
            ${imageUrl ? `
                <img src="${imageUrl}" alt="${product.name}" class="product-image" 
                     onerror="this.classList.add('fallback'); this.nextElementSibling.style.display='flex'">
            ` : ''}
            <div class="product-image-placeholder" data-category="${product.category}" 
                 style="${imageUrl ? 'display: none;' : 'display: flex;'}">
                <div class="product-emoji">${getCategoryEmoji(product.category)}</div>
                <div class="product-category">${product.category}</div>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">KSh ${product.price}</p>
            <p class="product-farmer">By ${farmerName}</p>
            <button class="btn btn-primary add-to-cart" data-id="${product._id}">Add to Cart</button>
        </div>
    `;
    
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            image: getCategoryEmoji(product.category),
            farmer: farmerName
        });
    });
    
    return card;
}

function getCategoryEmoji(category) {
    const emojis = {
        'livestock': '🐄',
        'poultry': '🐔',
        'vegetables': '🥦',
        'fruits': '🍎',
        'dairy': '🥛',
        'other': '📦'
    };
    return emojis[category] || '📦';
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
        
        console.log('🔄 Attempting login...');
        const result = await authAPI.login(email, password, userType);
        
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('login-form').reset();
        
        updateUIForUser(result.user.userType, result.user.name);
        
        console.log('✅ Login successful:', result.user.name);
        alert(`Welcome back, ${result.user.name}!`);
        
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
        const loginBtn = document.querySelector('#login-form button[type="submit"]');
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
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
        
        console.log('🔄 Attempting registration...');
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
        
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('register-form').reset();
        
        updateUIForUser(result.user.userType, result.user.name);
        
        console.log('✅ Registration successful:', result.user.name);
        alert(`Welcome to FarmConnect, ${result.user.name}!`);
        
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message || 'Registration failed. Please try again.');
    } finally {
        const registerBtn = document.querySelector('#register-form button[type="submit"]');
        if (registerBtn) {
            registerBtn.textContent = 'Register';
            registerBtn.disabled = false;
        }
    }
}

function updateUIForUser(userType, userName) {
    const loginLink = document.getElementById('login-link');
    
    if (loginLink && userName) {
        loginLink.innerHTML = `
            ${userName} ▼
            <ul class="dropdown-menu">
                <li><a href="#" id="logout-btn">Logout</a></li>
                ${userType === 'farmer' ? '<li><a href="dashboard.html">Dashboard</a></li>' : ''}
                ${userType === 'admin' ? '<li><a href="admin.html">Admin Panel</a></li>' : ''}
            </ul>
        `;
        
        loginLink.classList.add('has-dropdown');
        
        // Add logout event listener
        setTimeout(() => {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🚪 User logging out');
                    authAPI.logout();
                });
            }
        }, 100);
        
        // Dropdown functionality
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.querySelector('.dropdown-menu');
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
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
        
        console.log('✅ UI updated for user:', userName, 'Type:', userType);
    }
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount);
}