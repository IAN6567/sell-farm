// js/main.js - COMPLETELY FIXED
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    setupEventListeners();
    await checkAuthStatus();
    await loadFeaturedProducts();
    initCart();
}

function setupEventListeners() {
    // Mobile menu
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
    
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // Login form
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
    
    // Registration form
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
            }
        } catch (error) {
            console.error('Auth check failed:', error);
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
            featuredProductsContainer.innerHTML = '<p class="loading">No featured products available</p>';
            return;
        }
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            featuredProductsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading featured products:', error);
        featuredProductsContainer.innerHTML = '<p class="loading">Error loading products</p>';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const imageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://via.placeholder.com/300x200?text=Product+Image';
    
    const farmerName = product.farmer?.farmName || product.farmer?.name || 'Unknown Farmer';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="product-image">
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
            image: imageUrl,
            farmer: farmerName
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
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        
        await authAPI.login(email, password, userType);
        
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('login-form').reset();
        
        const userData = getUserData();
        updateUIForUser(userData.userType, userData.name);
        
        alert(`Welcome back, ${userData.name}!`);
        
    } catch (error) {
        alert(error.message || 'Login failed. Please check your credentials.');
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
        
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('register-form').reset();
        
        updateUIForUser(result.user.userType, result.user.name);
        alert(`Welcome to FarmConnect, ${result.user.name}!`);
        
    } catch (error) {
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
    }
}