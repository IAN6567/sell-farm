// js/api.js - UPDATED with real API calls
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
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API call failed:', error);
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
        
        // Store token and user data
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
        
        // Store token and user data
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
        const formData = new FormData();
        
        // Append all product data to formData
        Object.keys(productData).forEach(key => {
            if (productData[key] !== undefined && productData[key] !== null) {
                formData.append(key, productData[key]);
            }
        });
        
        return await apiCall('/products', {
            method: 'POST',
            headers: {}, // Let browser set content-type for FormData
            body: formData
        });
    },
    
    async getMyProducts() {
        return await apiCall('/products/my-products');
    },
    
    async getProduct(id) {
        return await apiCall(`/products/${id}`);
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
    },
    
    async getAllOrders() {
        return await apiCall('/orders');
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
    },
    
    async getUsers() {
        return await apiCall('/admin/users');
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

function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Make functions available globally
window.authAPI = authAPI;
window.productsAPI = productsAPI;
window.ordersAPI = ordersAPI;
window.adminAPI = adminAPI;
window.isLoggedIn = isLoggedIn;
window.getUserType = getUserType;
window.getUserData = getUserData;
window.getAuthToken = getAuthToken;