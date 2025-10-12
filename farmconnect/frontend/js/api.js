// js/api.js - COMPLETELY FIXED
const API_BASE_URL = 'http://localhost:5000/api';

// Generic API call function
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData, let browser set content-type
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('API call failed:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
        }
        
        throw error;
    }
}

// Auth API calls
const authAPI = {
    async login(email, password, userType) {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, userType })
        });
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userType', data.user.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        return data;
    },
    
    async register(userData) {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userType', data.user.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        return data;
    },
    
    async getCurrentUser() {
        return await apiCall('/auth/me');
    },
    
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    }
};

// Products API calls
const productsAPI = {
    async getProducts(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiCall(`/products?${queryParams}`);
    },
    
    async getFeaturedProducts() {
        return await apiCall('/products/featured');
    },
    
    async addProduct(productData) {
        return await apiCall('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },
    
    async getMyProducts() {
        return await apiCall('/products/my-products');
    }
};

// Orders API calls
const ordersAPI = {
    async createOrder(orderData) {
        return await apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },
    
    async getMyOrders() {
        return await apiCall('/orders/my-orders');
    }
};

// Admin API calls
const adminAPI = {
    async getPendingProducts() {
        return await apiCall('/admin/pending-products');
    },
    
    async updateProductStatus(productId, status) {
        return await apiCall(`/admin/products/${productId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },
    
    async getStats() {
        return await apiCall('/admin/stats');
    }
};

// Utility functions
function isLoggedIn() {
    return !!localStorage.getItem('authToken');
}

function getUserType() {
    return localStorage.getItem('userType');
}

function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Make functions available globally
window.authAPI = authAPI;
window.productsAPI = productsAPI;
window.ordersAPI = ordersAPI;
window.adminAPI = adminAPI;
window.isLoggedIn = isLoggedIn;
window.getUserType = getUserType;
window.getUserData = getUserData;