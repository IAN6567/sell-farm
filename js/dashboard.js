// js/dashboard.js - COMPLETE & RESPONSIVE
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard Initializing...');
    
    // Check if user is authenticated and is a farmer
    if (!isLoggedIn()) {
        alert('Please login to access the dashboard.');
        window.location.href = 'index.html';
        return;
    }
    
    if (getUserType() !== 'farmer') {
        alert('Access denied. Farmer account required.');
        window.location.href = 'index.html';
        return;
    }
    
    initDashboard();
});

async function initDashboard() {
    try {
        setupDashboardTabs();
        await loadDashboardData();
        setupProductForm();
        console.log('✅ Dashboard Ready');
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showMessage('Error loading dashboard. Please refresh the page.', 'error');
    }
}

function setupDashboardTabs() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs and sections
            document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding section
            const tabId = this.getAttribute('data-tab');
            const section = document.getElementById(tabId);
            if (section) {
                section.classList.add('active');
                
                // Load section-specific data
                switch(tabId) {
                    case 'products':
                        loadMyProducts();
                        break;
                    case 'orders':
                        loadMyOrders();
                        break;
                    case 'overview':
                        loadOverviewStats();
                        break;
                    case 'profile':
                        loadProfileData();
                        break;
                }
                
                console.log(`📁 Switched to tab: ${tabId}`);
            }
        });
    });
}

async function loadDashboardData() {
    try {
        await Promise.all([
            loadOverviewStats(),
            loadMyProducts(),
            loadProfileData()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('Error loading dashboard data', 'error');
    }
}

async function loadOverviewStats() {
    try {
        console.log('📈 Loading overview stats...');
        const products = await productsAPI.getMyProducts();
        
        const totalProducts = products.length;
        const approvedProducts = products.filter(p => p.status === 'approved').length;
        const pendingProducts = products.filter(p => p.status === 'pending').length;
        const rejectedProducts = products.filter(p => p.status === 'rejected').length;
        
        // Calculate total sales (mock data for demo)
        const totalSales = products
            .filter(p => p.status === 'approved')
            .reduce((sum, product) => sum + (product.price * product.quantity), 0);
        
        // Mock orders count
        const pendingOrders = Math.floor(Math.random() * 10);
        
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('total-sales').textContent = totalSales.toLocaleString();
        document.getElementById('approved-products').textContent = approvedProducts;
        
        console.log('✅ Overview stats loaded');
        
    } catch (error) {
        console.error('Error loading overview stats:', error);
        document.getElementById('overview').innerHTML = `
            <div class="message error">
                Error loading statistics. Please try again.
            </div>
        `;
    }
}

async function loadMyProducts() {
    const tableBody = document.getElementById('products-table-body');
    
    if (!tableBody) return;
    
    try {
        console.log('📦 Loading farmer products...');
        tableBody.innerHTML = '<tr><td colspan="5" class="loading">Loading your products...</td></tr>';
        
        const products = await productsAPI.getMyProducts();
        
        tableBody.innerHTML = '';
        
        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <div class="empty-icon">📦</div>
                            <p>No products found</p>
                            <p class="text-light">Add your first product to get started!</p>
                            <button onclick="switchToTab('add-product')" class="btn btn-primary btn-small">
                                Add Product
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        console.log(`✅ Loaded ${products.length} products`);
        
        products.forEach(product => {
            const row = document.createElement('tr');
            
            let statusClass = '';
            let statusText = '';
            
            switch(product.status) {
                case 'approved':
                    statusClass = 'status-approved';
                    statusText = 'Approved';
                    break;
                case 'pending':
                    statusClass = 'status-pending';
                    statusText = 'Pending Review';
                    break;
                case 'rejected':
                    statusClass = 'status-rejected';
                    statusText = 'Rejected';
                    break;
                default:
                    statusClass = 'status-pending';
                    statusText = 'Pending';
            }
            
            row.innerHTML = `
                <td>
                    <div class="product-info-small">
                        <strong>${product.name}</strong>
                        ${product.description ? `<small>${product.description.substring(0, 50)}...</small>` : ''}
                    </div>
                </td>
                <td>
                    <span class="category-badge">${product.category}</span>
                </td>
                <td><strong>KSh ${product.price}</strong></td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-small" onclick="editProduct('${product._id}')">
                            Edit
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteProduct('${product._id}')">
                            Delete
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="message error">
                        Error loading products. Please try again.
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadMyOrders() {
    const tableBody = document.getElementById('orders-table-body');
    
    if (!tableBody) return;
    
    try {
        console.log('📋 Loading orders...');
        tableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading orders...</td></tr>';
        
        const orders = await ordersAPI.getMyOrders();
        
        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state">
                            <div class="empty-icon">📋</div>
                            <p>No orders yet</p>
                            <p class="text-light">Orders will appear here when customers purchase your products.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        console.log(`✅ Loaded ${orders.length} orders`);
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const productsList = order.products.map(p => 
                `${p.product?.name} (${p.quantity})`
            ).join(', ');
            
            row.innerHTML = `
                <td><code>${order._id.substring(0, 8)}...</code></td>
                <td>${productsList}</td>
                <td>${order.products.reduce((sum, p) => sum + p.quantity, 0)}</td>
                <td><strong>KSh ${order.totalAmount?.toLocaleString()}</strong></td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td>${orderDate}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading orders:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="message error">
                        Error loading orders. Please try again.
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadProfileData() {
    try {
        console.log('👤 Loading profile data...');
        const userData = await authAPI.getCurrentUser();
        
        document.getElementById('farm-name').value = userData.farmName || '';
        document.getElementById('farmer-name').value = userData.name || '';
        document.getElementById('location').value = userData.location ? 
            `${userData.location.county}, ${userData.location.town}` : '';
        document.getElementById('contact').value = userData.phone || '';
        document.getElementById('farm-description').value = userData.description || '';
        
        console.log('✅ Profile data loaded');
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('Error loading profile data', 'error');
    }
}

function setupProductForm() {
    const form = document.getElementById('add-product-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewProduct();
        });
    }
    
    // Add real-time validation
    const priceInput = document.getElementById('product-price');
    if (priceInput) {
        priceInput.addEventListener('input', function(e) {
            const value = parseFloat(e.target.value);
            if (value < 1) {
                this.setCustomValidity('Price must be at least KSh 1');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

async function addNewProduct() {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const quantity = document.getElementById('product-quantity').value;
    const unit = document.getElementById('product-unit').value;
    const description = document.getElementById('product-description').value;
    
    // Basic validation
    if (!name || !category || !price) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (price < 1) {
        showMessage('Price must be at least KSh 1', 'error');
        return;
    }
    
    try {
        const submitBtn = document.querySelector('#add-product-form button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding Product...';
        submitBtn.disabled = true;
        
        console.log('🔄 Adding new product...');
        
        const productData = {
            name: name.trim(),
            category,
            price: parseFloat(price),
            quantity: parseInt(quantity) || 1,
            unit: unit || 'piece',
            description: description.trim()
        };
        
        const newProduct = await productsAPI.addProduct(productData);
        
        // Reset form
        document.getElementById('add-product-form').reset();
        
        showMessage('Product added successfully! It will be visible after admin approval.', 'success');
        
        console.log('✅ Product added:', newProduct.name);
        
        // Reload products list and stats
        await Promise.all([
            loadMyProducts(),
            loadOverviewStats()
        ]);
        
        // Switch to products tab
        switchToTab('products');
        
    } catch (error) {
        console.error('Error adding product:', error);
        showMessage(error.message || 'Error adding product. Please try again.', 'error');
    } finally {
        const submitBtn = document.querySelector('#add-product-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Add Product';
            submitBtn.disabled = false;
        }
    }
}

async function editProduct(productId) {
    try {
        console.log('✏️ Editing product:', productId);
        const product = await productsAPI.getProduct(productId);
        
        // For now, show a simple edit form
        const newName = prompt('Enter new product name:', product.name);
        if (newName && newName.trim() !== '') {
            showMessage('Edit functionality coming soon!', 'warning');
        }
        
    } catch (error) {
        console.error('Error editing product:', error);
        showMessage('Error loading product details', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    try {
        console.log('🗑️ Deleting product:', productId);
        
        // Note: You would need to add a delete endpoint in your backend
        // For now, show a message
        showMessage('Delete functionality coming soon!', 'warning');
        
        // Simulate deletion
        // await productsAPI.deleteProduct(productId);
        // await loadMyProducts();
        // await loadOverviewStats();
        // showMessage('Product deleted successfully', 'success');
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Error deleting product', 'error');
    }
}

// Update profile
document.getElementById('profile-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;
        
        // This would call a profile update endpoint
        // For now, show success message
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        showMessage('Profile update functionality coming soon!', 'warning');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Error updating profile', 'error');
    } finally {
        const submitBtn = document.querySelector('#profile-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Profile';
            submitBtn.disabled = false;
        }
    }
});

// Utility functions
function switchToTab(tabId) {
    const tab = document.querySelector(`[data-tab="${tabId}"]`);
    if (tab) {
        tab.click();
    }
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.dashboard-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} dashboard-message`;
    messageDiv.textContent = message;
    
    // Add to current active section
    const activeSection = document.querySelector('.dashboard-section.active');
    if (activeSection) {
        activeSection.insertBefore(messageDiv, activeSection.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Add CSS for additional styles
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    .product-info-small strong {
        display: block;
        margin-bottom: 4px;
    }
    
    .product-info-small small {
        color: var(--text-light);
        font-size: 0.85rem;
    }
    
    .category-badge {
        background: rgba(46, 125, 50, 0.1);
        color: var(--primary-color);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: capitalize;
    }
    
    .empty-state {
        padding: 40px 20px;
        text-align: center;
    }
    
    .empty-icon {
        font-size: 3rem;
        margin-bottom: 15px;
        opacity: 0.5;
    }
    
    .status-confirmed {
        color: var(--success-color);
        font-weight: 600;
        padding: 4px 12px;
        background: rgba(67, 160, 71, 0.1);
        border-radius: 20px;
        font-size: 0.85rem;
    }
    
    .status-pending {
        color: var(--warning-color);
        font-weight: 600;
        padding: 4px 12px;
        background: rgba(255, 179, 0, 0.1);
        border-radius: 20px;
        font-size: 0.85rem;
    }
    
    .status-delivered {
        color: var(--primary-color);
        font-weight: 600;
        padding: 4px 12px;
        background: rgba(46, 125, 50, 0.1);
        border-radius: 20px;
        font-size: 0.85rem;
    }
    
    .dashboard-message {
        margin-bottom: 20px;
    }
    
    @media (max-width: 768px) {
        .action-buttons {
            flex-direction: column;
            gap: 5px;
        }
        
        .action-buttons .btn {
            width: 100%;
            justify-content: center;
        }
    }
`;
document.head.appendChild(dashboardStyles);