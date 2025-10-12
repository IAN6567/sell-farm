// js/dashboard.js - UPDATED with real API calls
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated and is a farmer
    if (!isLoggedIn() || getUserType() !== 'farmer') {
        alert('Access denied. Please login as a farmer.');
        window.location.href = 'index.html';
        return;
    }
    
    initDashboard();
});

async function initDashboard() {
    setupDashboardTabs();
    await loadDashboardData();
    setupProductForm();
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
            }
        });
    });
}

async function loadDashboardData() {
    await loadOverviewStats();
    await loadMyProducts();
    await loadProfileData();
}

async function loadOverviewStats() {
    try {
        const products = await productsAPI.getMyProducts();
        
        const totalProducts = products.length;
        const approvedProducts = products.filter(p => p.status === 'approved').length;
        const pendingProducts = products.filter(p => p.status === 'pending').length;
        
        // Mock data for orders and sales (in real app, get from orders API)
        const pendingOrders = 3;
        const totalSales = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('total-sales').textContent = totalSales.toLocaleString();
        document.getElementById('approved-products').textContent = approvedProducts;
        
    } catch (error) {
        console.error('Error loading overview stats:', error);
        alert('Error loading dashboard data');
    }
}

async function loadMyProducts() {
    const tableBody = document.getElementById('products-table-body');
    
    if (!tableBody) return;
    
    try {
        const products = await productsAPI.getMyProducts();
        
        tableBody.innerHTML = '';
        
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No products found. Add your first product!</td></tr>';
            return;
        }
        
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
            }
            
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>KSh ${product.price}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editProduct('${product._id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteProduct('${product._id}')">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Error loading products</td></tr>';
    }
}

async function loadMyOrders() {
    const tableBody = document.getElementById('orders-table-body');
    
    if (!tableBody) return;
    
    try {
        const orders = await ordersAPI.getMyOrders();
        
        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
            return;
        }
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.createdAt).toLocaleDateString();
            
            row.innerHTML = `
                <td>${order._id}</td>
                <td>${order.products.map(p => p.product?.name).join(', ')}</td>
                <td>${order.products.reduce((sum, p) => sum + p.quantity, 0)}</td>
                <td>KSh ${order.totalAmount}</td>
                <td>${order.status}</td>
                <td>${orderDate}</td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading orders</td></tr>';
    }
}

async function loadProfileData() {
    try {
        const userData = await authAPI.getCurrentUser();
        
        document.getElementById('farm-name').value = userData.farmName || '';
        document.getElementById('farmer-name').value = userData.name || '';
        document.getElementById('location').value = userData.location ? `${userData.location.county}, ${userData.location.town}` : '';
        document.getElementById('contact').value = userData.phone || '';
        document.getElementById('farm-description').value = userData.description || '';
        
    } catch (error) {
        console.error('Error loading profile:', error);
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
}

async function addNewProduct() {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const quantity = document.getElementById('product-quantity').value;
    const unit = document.getElementById('product-unit').value;
    const description = document.getElementById('product-description').value;
    const imageFile = document.getElementById('product-image').files[0];
    
    // Basic validation
    if (!name || !category || !price) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const productData = {
            name,
            category,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            unit,
            description
        };
        
        // Add image if provided
        if (imageFile) {
            productData.image = imageFile;
        }
        
        await productsAPI.addProduct(productData);
        
        alert('Product added successfully! It will be visible after admin approval.');
        
        // Reset form
        document.getElementById('add-product-form').reset();
        
        // Reload products list and stats
        await loadMyProducts();
        await loadOverviewStats();
        
    } catch (error) {
        console.error('Error adding product:', error);
        alert(error.message || 'Error adding product. Please try again.');
    }
}

async function editProduct(productId) {
    // In a real implementation, you would fetch the product and show an edit form
    alert('Edit functionality coming soon!');
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            // Note: You would need to add a delete endpoint in your backend
            alert('Delete functionality coming soon!');
            // await productsAPI.deleteProduct(productId);
            // await loadMyProducts();
            // await loadOverviewStats();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    }
}

// Update profile
document.getElementById('profile-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        // This would call a profile update endpoint
        alert('Profile update functionality coming soon!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
    }
});