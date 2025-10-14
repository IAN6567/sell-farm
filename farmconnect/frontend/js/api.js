// js/api.js - FIXED VERSION
const API_BASE_URL = "http://localhost:5000/api";

// Enhanced API call function with better CORS handling
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`🔄 API Call: ${url}`, options.method || "GET");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    mode: "cors", // Explicitly set CORS mode
    credentials: "same-origin", // or 'include' if using cookies
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add body for POST, PUT, PATCH requests
  if (options.body && ["POST", "PUT", "PATCH"].includes(options.method)) {
    config.body = options.body;
  }

  try {
    const response = await fetch(url, config);

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Handle empty responses (like 204 No Content)
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0" || response.status === 204) {
      console.log(`✅ API Success (Empty): ${url}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ API Success: ${url}`);
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);

    // Enhanced connection error detection
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to server. Please make sure:\n1. Backend is running on http://localhost:5000\n2. CORS is enabled on the backend\n3. You are accessing frontend via http:// (not file://)"
      );
    }

    // Handle CORS errors specifically
    if (
      error.message.includes("CORS") ||
      error.message.includes("cross-origin")
    ) {
      throw new Error(
        "CORS error: Backend is not allowing requests from your frontend. Please enable CORS on the backend server."
      );
    }

    throw error;
  }
}

// Auth API calls
const authAPI = {
  async login(email, password, userType) {
    const data = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, userType }),
    });

    if (data && data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userType", data.user.userType);
      localStorage.setItem("userData", JSON.stringify(data.user));
    }

    return data;
  },

  async register(userData) {
    const data = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (data && data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userType", data.user.userType);
      localStorage.setItem("userData", JSON.stringify(data.user));
    }

    return data;
  },

  async getCurrentUser() {
    return await apiCall("/auth/me");
  },

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("userData");
    window.location.href = "index.html";
  },
};

// Products API calls
const productsAPI = {
  async getProducts(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/products?${queryParams}` : "/products";
    return await apiCall(endpoint);
  },

  async getFeaturedProducts() {
    return await apiCall("/products/featured");
  },

  async addProduct(productData) {
    return await apiCall("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  },

  async getMyProducts() {
    return await apiCall("/products/my-products");
  },

  async getProduct(id) {
    return await apiCall(`/products/${id}`);
  },
};

// Orders API calls
const ordersAPI = {
  async createOrder(orderData) {
    return await apiCall("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  async getMyOrders() {
    return await apiCall("/orders/my-orders");
  },
};

// Admin API calls
const adminAPI = {
  async getPendingProducts() {
    return await apiCall("/admin/pending-products");
  },

  async updateProductStatus(productId, status) {
    return await apiCall(`/admin/products/${productId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async getStats() {
    return await apiCall("/admin/stats");
  },
};

// Utility functions
function isLoggedIn() {
  return !!localStorage.getItem("authToken");
}

function getUserType() {
  return localStorage.getItem("userType");
}

function getUserData() {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
}

function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Enhanced connection test
async function testConnection() {
  try {
    console.log("🔍 Testing backend connection...");

    // Test the health endpoint that your backend provides
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Backend connection successful:", data);
      return true;
    } else {
      console.warn("⚠️ Backend responded with error:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Backend connection failed:", error.message);

    // Provide specific guidance based on error type
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.error(
        "💡 Solution: Check if backend is running and CORS is enabled"
      );
    } else if (error.message.includes("CORS")) {
      console.error("💡 Solution: Add CORS middleware to your backend server");
    }

    return false;
  }
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
window.testConnection = testConnection;

// Test connection when API loads with delay to ensure DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    testConnection();
  }, 1000);
});
