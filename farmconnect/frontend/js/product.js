// js/products.js
// Products page functionality

document.addEventListener('DOMContentLoaded', function() {
    initProductsPage();
});

function initProductsPage() {
    loadProducts();
    setupSearchAndFilter();
}

let currentPage = 1;
const productsPerPage = 12;
let allProducts = [];

function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) return;
    
    // Mock data - in real app, fetch from API
    allProducts = [
        { id: 1, name: 'Fresh Tomatoes', price: 150, image: 'images/tomatoes.jpg', farmer: 'Mwangi Farm', category: 'vegetables' },
        { id: 2, name: 'Organic Chicken', price: 800, image: 'images/chicken.jpg', farmer: 'Njeri Poultry', category: 'poultry' },
        { id: 3, name: 'Fresh Milk', price: 80, image: 'images/milk.jpg', farmer: 'Kariuki Dairy', category: 'dairy' },
        { id: 4, name: 'Sukuma Wiki', price: 50, image: 'images/sukuma.jpg', farmer: 'Omondi Farm', category: 'vegetables' },
        { id: 5, name: 'Goat Meat', price: 1200, image: 'https://via.placeholder.com/300x200?text=Goat+Meat', farmer: 'Kamau Farm', category: 'livestock' },
        { id: 6, name: 'Avocados', price: 30, image: 'https://via.placeholder.com/300x200?text=Avocados', farmer: 'Muthoni Farm', category: 'fruits' },
        { id: 7, name: 'Eggs', price: 300, image: 'https://via.placeholder.com/300x200?text=Eggs', farmer: 'Njeri Poultry', category: 'poultry' },
        { id: 8, name: 'Potatoes', price: 100, image: 'https://via.placeholder.com/300x200?text=Potatoes', farmer: 'Omondi Farm', category: 'vegetables' },
        { id: 9, name: 'Bananas', price: 40, image: 'https://via.placeholder.com/300x200?text=Bananas', farmer: 'Muthoni Farm', category: 'fruits' },
        { id: 10, name: 'Sheep', price: 8000, image: 'https://via.placeholder.com/300x200?text=Sheep', farmer: 'Omondi Ranch', category: 'livestock' },
        { id: 11, name: 'Yogurt', price: 120, image: 'https://via.placeholder.com/300x200?text=Yogurt', farmer: 'Kariuki Dairy', category: 'dairy' },
        { id: 12, name: 'Kale', price: 40, image: 'https://via.placeholder.com/300x200?text=Kale', farmer: 'Mwangi Farm', category: 'vegetables' }
    ];
    
    displayProducts(allProducts);
    setupPagination(allProducts.length);
}

function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = products.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = '<p class="loading">No products found matching your criteria.</p>';
        return;
    }
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', filterProducts);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterProducts();
            }
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    
    let filteredProducts = allProducts;
    
    // Filter by search term
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.farmer.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    if (category) {
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    currentPage = 1;
    displayProducts(filteredProducts);
    setupPagination(filteredProducts.length);
}

function setupPagination(totalProducts) {
    const pagination = document.getElementById('pagination');
    
    if (!pagination) return;
    
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    filterProducts(); // This will re-display products with the new page
}

// Make function available globally
window.changePage = changePage;