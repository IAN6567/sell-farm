// js/admin.js
// Admin panel functionality

document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
});

function initAdminPanel() {
    setupAdminTabs();
    loadAdminData();
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
            }
        });
    });
}

function loadAdminData() {
    loadAdminStats();
    loadPendingProducts();
}

function loadAdminStats() {
    // Mock data - in real app, fetch from API
    document.getElementById('admin-total-users').textContent = '156';
    document.getElementById('admin-total-farmers').textContent = '42';
    document.getElementById('admin-total-products').textContent = '287';
    document.getElementById('admin-pending-products').textContent = '15';
    document.getElementById('admin-total-orders').textContent = '89';
    document.getElementById('admin-total-revenue').textContent = '256,800';
}

function loadPendingProducts() {
    const tableBody = document.getElementById('pending-products-body');
    
    if (!tableBody) return;
    
    // Mock data
    const pendingProducts = [
        { id: 1, name: 'Fresh Goat Milk', category: 'dairy', price: 120, farmer: 'Kamau Farm', date: '2023-10-15' },
        { id: 2, name: 'Organic Eggs', category: 'poultry', price: 300, farmer: 'Njeri Poultry', date: '2023-10-16' },
        { id: 3, name: 'Avocados', category: 'fruits', price: 50, farmer: 'Muthoni Farm', date: '2023-10-14' },
        { id: 4, name: 'Sheep', category: 'livestock', price: 8000, farmer: 'Omondi Ranch', date: '2023-10-13' }
    ];
    
    tableBody.innerHTML = '';
    
    pendingProducts.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>KSh ${product.price}</td>
            <td>${product.farmer}</td>
            <td>${product.date}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn approve-btn" data-id="${product.id}">Approve</button>
                    <button class="action-btn reject-btn" data-id="${product.id}">Reject</button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            approveProduct(productId);
        });
    });
    
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            rejectProduct(productId);
        });
    });
}

function loadAllProducts() {
    const tableBody = document.getElementById('all-products-body');
    
    if (!tableBody) return;
    
    // Mock data
    const allProducts = [
        { id: 1, name: 'Fresh Tomatoes', category: 'vegetables', price: 150, farmer: 'Mwangi Farm', status: 'approved', date: '2023-10-10' },
        { id: 2, name: 'Organic Chicken', category: 'poultry', price: 800, farmer: 'Njeri Poultry', status: 'approved', date: '2023-10-11' },
        { id: 3, name: 'Goat Meat', category: 'livestock', price: 1200, farmer: 'Kamau Farm', status: 'pending', date: '2023-10-15' },
        { id: 4, name: 'Sukuma Wiki', category: 'vegetables', price: 50, farmer: 'Omondi Farm', status: 'approved', date: '2023-10-12' },
        { id: 5, name: 'Mangoes', category: 'fruits', price: 80, farmer: 'Muthoni Farm', status: 'rejected', date: '2023-10-13' }
    ];
    
    tableBody.innerHTML = '';
    
    allProducts.forEach(product => {
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
                statusText = 'Pending';
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
            <td>${product.farmer}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>${product.date}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn approve-btn" data-id="${product.id}">Approve</button>
                    <button class="action-btn reject-btn" data-id="${product.id}">Reject</button>
                    <button class="action-btn" data-id="${product.id}">Delete</button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function loadUsers() {
    const tableBody = document.getElementById('users-table-body');
    
    if (!tableBody) return;
    
    // Mock data
    const users = [
        { id: 1, name: 'John Mwangi', email: 'john@example.com', type: 'farmer', location: 'Nakuru', joinDate: '2023-09-15' },
        { id: 2, name: 'Jane Njeri', email: 'jane@example.com', type: 'buyer', location: 'Nairobi', joinDate: '2023-09-20' },
        { id: 3, name: 'Peter Kamau', email: 'peter@example.com', type: 'farmer', location: 'Kiambu', joinDate: '2023-09-25' },
        { id: 4, name: 'Mary Wanjiku', email: 'mary@example.com', type: 'buyer', location: 'Mombasa', joinDate: '2023-10-01' }
    ];
    
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.type}</td>
            <td>${user.location}</td>
            <td>${user.joinDate}</td>
            <td>
                <button class="action-btn">View</button>
                <button class="action-btn reject-btn">Suspend</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function loadAdminOrders() {
    const tableBody = document.getElementById('admin-orders-body');
    
    if (!tableBody) return;
    
    // Mock data
    const orders = [
        { id: 'FC-001', customer: 'Jane Njeri', amount: 1200, status: 'completed', payment: 'paid', date: '2023-10-15' },
        { id: 'FC-002', customer: 'David Ochieng', amount: 800, status: 'pending', payment: 'pending', date: '2023-10-16' },
        { id: 'FC-003', customer: 'Mary Wanjiku', amount: 2500, status: 'processing', payment: 'paid', date: '2023-10-14' },
        { id: 'FC-004', customer: 'Paul Kimani', amount: 450, status: 'completed', payment: 'paid', date: '2023-10-13' }
    ];
    
    tableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>KSh ${order.amount}</td>
            <td>${order.status}</td>
            <td>${order.payment}</td>
            <td>${order.date}</td>
            <td>
                <button class="action-btn">View</button>
                <button class="action-btn">Update</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function approveProduct(productId) {
    if (confirm('Are you sure you want to approve this product?')) {
        // In real app, call API to approve product
        console.log(`Approving product ${productId}`);
        alert('Product approved successfully!');
        loadPendingProducts(); // Refresh the list
        loadAllProducts(); // Refresh all products list
        loadAdminStats(); // Refresh stats
    }
}

function rejectProduct(productId) {
    if (confirm('Are you sure you want to reject this product?')) {
        // In real app, call API to reject product
        console.log(`Rejecting product ${productId}`);
        alert('Product rejected!');
        loadPendingProducts(); // Refresh the list
        loadAllProducts(); // Refresh all products list
        loadAdminStats(); // Refresh stats
    }
}