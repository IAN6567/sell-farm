// js/admin.js - COMPLETE & RESPONSIVE
document.addEventListener('DOMContentLoaded', function() {
    console.log('👑 Admin Panel Initializing...');
    
    // Check if user is authenticated and is an admin
    if (!isLoggedIn()) {
        alert('Please login to access the admin panel.');
        window.location.href = 'index.html';
        return;
    }
    
    if (getUserType() !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return;
    }
    
    initAdminPanel();
});

async function initAdminPanel() {
    try {
        setupAdminTabs();
        await loadAdminData();
        console.log('✅ Admin Panel Ready');
    } catch (error) {
        console.error('❌ Admin panel initialization failed:', error);
        showAdminMessage('Error loading admin panel. Please refresh the page.', 'error');
    }
}

function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs and sections
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding section
            const tabId = this.getAttribute('data-tab');
            const section = document.getElementById(tabId);
            if (section) {
                section.classList.add('active');
                
                // Load section-specific data
                switch(tabId) {
                    case 'pending-products':
                        loadPendingProducts();
                        break;
                    case 'all-products':
                        loadAllProducts();
                        break;
                    case 'users':
                        loadUsers();
                        break;
                    case 'orders':
                        loadAdminOrders();
                        break;
                    case 'overview':
                        loadAdminStats();
                        break;
                }
                
                console.log(`📁 Switched to admin tab: ${tabId}`);
            }
        });
    });
}

async function loadAdminData() {
    try {
        await Promise.all([
            loadAdminStats(),
            loadPendingProducts()
        ]);
    } catch (error) {
        console.error('Error loading admin data:', error);
        showAdminMessage('Error loading admin data', 'error');
    }
}

async function loadAdminStats() {
    try {
        console.log('📊 Loading admin stats...');
        const stats = await adminAPI.getStats();
        
        document.getElementById('admin-total-users').textContent = stats.totalUsers || 0;
        document.getElementById('admin-total-farmers').textContent = stats.totalFarmers || 0;
        document.getElementById('admin-total-products').textContent = stats.totalProducts || 0;
        document.getElementById('admin-pending-products').textContent = stats.pendingProducts || 0;
        document.getElementById('admin-total-orders').textContent = stats.totalOrders || 0;
        document.getElementById('admin-total-revenue').textContent = (stats.totalRevenue || 0).toLocaleString();
        
        console.log('✅ Admin stats loaded');
        
    } catch (error) {
        console.error('Error loading admin stats:', error);
        document.getElementById('admin-overview').innerHTML = `
            <div class="message error">
                Error loading statistics. Please try again.
            </div>
        `;
    }
}

async function loadPendingProducts() {
    const tableBody = document.getElementById('pending-products-body');
    
    if (!tableBody) return;
    
    try {
        console.log('⏳ Loading pending products...');
        tableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading pending products...</td></tr>';
        
        const response = await adminAPI.getPendingProducts();
        const products = response.products || [];
        
        tableBody.innerHTML = '';
        
        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state">
                            <div class="empty-icon">✅</div>
                            <p>No pending products</p>
                            <p class="text-light">All products have been reviewed.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        console.log(`✅ Loaded ${products.length} pending products`);
        
        products.forEach(product => {
            const row = document.createElement('tr');
            const productDate = new Date(product.createdAt).toLocaleDateString('en-KE');
            
            row.innerHTML = `
                <td>
                    <div class="product-info-small">
                        <strong>${product.name}</strong>
                        <small>${product.description ? product.description.substring(0, 60) + '...' : 'No description'}</small>
                    </div>
                </td>
                <td><span class="category-badge">${product.category}</span></td>
                <td><strong>KSh ${product.price}</strong></td>
                <td>
                    <div class="farmer-info">
                        <strong>${product.farmer?.farmName || product.farmer?.name}</strong>
                        <small>${product.farmer?.email}</small>
                    </div>
                </td>
                <td>${productDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn approve-btn" onclick="approveProduct('${product._id}')">
                            Approve
                        </button>
                        <button class="action-btn reject-btn" onclick="rejectProduct('${product._id}')">
                            Reject
                        </button>
                        <button class="action-btn" onclick="viewProductDetails('${product._id}')">
                            View
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading pending products:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="message error">
                        Error loading pending products. Please try again.
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadAllProducts() {
    const tableBody = document.getElementById('all-products-body');
    
    if (!tableBody) return;
    
    try {
        console.log('📦 Loading all products...');
        tableBody.innerHTML = '<tr><td colspan="7" class="loading">Loading all products...</td></tr>';
        
        // For demo, we'll use featured products
        const products = await productsAPI.getFeaturedProducts();
        
        tableBody.innerHTML = '';
        
        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state">
                            <div class="empty-icon">📦</div>
                            <p>No products found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        console.log(`✅ Loaded ${products.length} products`);
        
        products.forEach(product => {
            const row = document.createElement('tr');
            const productDate = new Date(product.createdAt).toLocaleDateString('en-KE');
            
            let statusClass = '';
            let statusText = '';
            
            switch(product.status) {
                case 'approved':
                    statusClass = 'status-approved';
                    statusText = 'Approved';
                    break;
                case 'pending':
                    statusClass = 'status-pending';
                    statusText = 'Pending';
                    break;
                case 'rejected':
                    statusClass = 'status-rejected';
                    statusText = 'Rejected';
                    break;
            }
            
            row.innerHTML = `
                <td>
                    <div class="product-info-small">
                        <strong>${product.name}</strong>
                    </div>
                </td>
                <td><span class="category-badge">${product.category}</span></td>
                <td><strong>KSh ${product.price}</strong></td>
                <td>${product.farmer?.farmName || product.farmer?.name}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>${productDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn approve-btn" onclick="approveProduct('${product._id}')">
                            Approve
                        </button>
                        <button class="action-btn reject-btn" onclick="rejectProduct('${product._id}')">
                            Reject
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading all products:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="message error">
                        Error loading products. Please try again.
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadUsers() {
    const tableBody = document.getElementById('users-table-body');
    
    if (!tableBody) return;
    
    try {
        console.log('👥 Loading users...');
        tableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading users...</td></tr>';
        
        // For demo, we'll create mock users
        const mockUsers = [
            {
                _id: '1',
                name: 'John Mwangi',
                email: 'john@farmconnect.com',
                userType: 'farmer',
                location: { county: 'Nakuru', town: 'Naivasha' },
                createdAt: new Date('2024-01-15')
            },
            {
                _id: '2',
                name: 'Jane Njeri',
                email: 'jane@farmconnect.com',
                userType: 'farmer',
                location: { county: 'Kiambu', town: 'Thika' },
                createdAt: new Date('2024-01-20')
            },
            {
                _id: '3',
                name: 'David Ochieng',
                email: 'david@farmconnect.com',
                userType: 'buyer',
                location: { county: 'Nairobi', town: 'Westlands' },
                createdAt: new Date('2024-02-01')
            }
        ];
        
        tableBody.innerHTML = '';
        
        mockUsers.forEach(user => {
            const row = document.createElement('tr');
            const joinDate = new Date(user.createdAt).toLocaleDateString('en-KE');
            const location = user.location ? `${user.location.county}, ${user.location.town}` : 'N/A';
            
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="user-type-badge ${user.userType}">
                        ${user.userType}
                    </span>
                </td>
                <td>${location}</td>
                <td>${joinDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="viewUser('${user._id}')">
                            View
                        </button>
                        <button class="action-btn reject-btn" onclick="suspendUser('${user._id}')">
                            Suspend
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        console.log('✅ Users loaded');
        
    } catch (error) {
        console.error('Error loading users:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="message error">
                        Error loading users. Please try again.
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadAdminOrders() {
    const tableBody = document.getElementById('admin-orders-body');
    
    if (!tableBody) return;
    
    try {
        console.log('📋 Loading all orders...');
        tableBody.innerHTML = '<tr><td colspan="7" class="loading">Loading orders...</td></tr>';
        
        // For demo, we'll create mock orders
        const mockOrders = [
            {
                _id: 'ORD-001',
                customerName: 'David Ochieng',
                totalAmount: 1200,
                status: 'completed',
                paymentStatus: 'paid',
                createdAt: new Date('2024-03-01')
            },
            {
                _id: 'ORD-002',
                customerName: 'Mary Wanjiku',
                totalAmount: 800,
                status: 'pending',
                paymentStatus: 'pending',
                createdAt: new Date('2024-03-02')
            },
            {
                _id: 'ORD-003',
                customerName: 'Paul Kimani',
                totalAmount: 2500,
                status: 'processing',
                paymentStatus: 'paid',
                createdAt: new Date('2024-03-01')
            }
        ];
        
        tableBody.innerHTML = '';
        
        mockOrders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-KE');
            
            row.innerHTML = `
                <td><code>${order._id}</code></td>
                <td>${order.customerName}</td>
                <td><strong>KSh ${order.totalAmount}</strong></td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td><span class="payment-${order.paymentStatus}">${order.paymentStatus}</span></td>
                <td>${orderDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="viewOrder('${order._id}')">
                            View
                        </button>
                        <button class="action-btn" onclick="updateOrder('${order._id}')">
                            Update
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        console.log('✅ Orders loaded');
        
    } catch (error) {
        console.error('Error loading orders:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="message error">
                        Error loading orders. Please try again.
                    </div>
                </td>
            </tr>
        `;
    }
}

async function approveProduct(productId) {
    if (!confirm('Are you sure you want to approve this product?')) {
        return;
    }
    
    try {
        console.log('✅ Approving product:', productId);
        
        await adminAPI.updateProductStatus(productId, 'approved');
        
        showAdminMessage('Product approved successfully!', 'success');
        
        // Reload data
        await Promise.all([
            loadPendingProducts(),
            loadAllProducts(),
            loadAdminStats()
        ]);
        
    } catch (error) {
        console.error('Error approving product:', error);
        showAdminMessage(error.message || 'Error approving product', 'error');
    }
}

async function rejectProduct(productId) {
    if (!confirm('Are you sure you want to reject this product?')) {
        return;
    }
    
    try {
        console.log('❌ Rejecting product:', productId);
        
        await adminAPI.updateProductStatus(productId, 'rejected');
        
        showAdminMessage('Product rejected successfully!', 'success');
        
        // Reload data
        await Promise.all([
            loadPendingProducts(),
            loadAllProducts(),
            loadAdminStats()
        ]);
        
    } catch (error) {
        console.error('Error rejecting product:', error);
        showAdminMessage(error.message || 'Error rejecting product', 'error');
    }
}

function viewProductDetails(productId) {
    console.log('👀 Viewing product details:', productId);
    alert('Product details view coming soon!');
}

function viewUser(userId) {
    console.log('👀 Viewing user details:', userId);
    alert('User details view coming soon!');
}

function suspendUser(userId) {
    if (confirm('Are you sure you want to suspend this user?')) {
        console.log('⏸️ Suspending user:', userId);
        alert('User suspension functionality coming soon!');
    }
}

function viewOrder(orderId) {
    console.log('👀 Viewing order details:', orderId);
    alert('Order details view coming soon!');
}

function updateOrder(orderId) {
    console.log('✏️ Updating order:', orderId);
    alert('Order update functionality coming soon!');
}

function showAdminMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.admin-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} admin-message`;
    messageDiv.textContent = message;
    
    // Add to current active section
    const activeSection = document.querySelector('.admin-section.active');
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

// Add CSS for admin-specific styles
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .farmer-info strong {
        display: block;
        margin-bottom: 2px;
    }
    
    .farmer-info small {
        color: var(--text-light);
        font-size: 0.8rem;
    }
    
    .user-type-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: capitalize;
    }
    
    .user-type-badge.farmer {
        background: rgba(46, 125, 50, 0.1);
        color: var(--primary-color);
    }
    
    .user-type-badge.buyer {
        background: rgba(255, 152, 0, 0.1);
        color: var(--secondary-color);
    }
    
    .user-type-badge.admin {
        background: rgba(156, 39, 176, 0.1);
        color: #9c27b0;
    }
    
    .payment-paid {
        color: var(--success-color);
        font-weight: 600;
        padding: 4px 8px;
        background: rgba(67, 160, 71, 0.1);
        border-radius: 12px;
        font-size: 0.8rem;
    }
    
    .payment-pending {
        color: var(--warning-color);
        font-weight: 600;
        padding: 4px 8px;
        background: rgba(255, 179, 0, 0.1);
        border-radius: 12px;
        font-size: 0.8rem;
    }
    
    .admin-message {
        margin-bottom: 20px;
    }
    
    @media (max-width: 768px) {
        .action-buttons {
            flex-direction: column;
            gap: 5px;
        }
        
        .action-btn {
            width: 100%;
            text-align: center;
            justify-content: center;
        }
    }
`;
document.head.appendChild(adminStyles);