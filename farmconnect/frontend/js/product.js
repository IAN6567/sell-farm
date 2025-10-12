// js/products.js - COMPLETE & RESPONSIVE WITH IMAGE FALLBACKS
document.addEventListener("DOMContentLoaded", function () {
  console.log("🛍️ Products Page Initializing...");
  initProductsPage();
});

let currentPage = 1;
const productsPerPage = 12;
let allProducts = [];
let filteredProducts = [];

async function initProductsPage() {
  try {
    await loadProducts();
    setupSearchAndFilter();
    console.log("✅ Products Page Ready");
  } catch (error) {
    console.error("❌ Products page initialization failed:", error);
    showProductsMessage(
      "Error loading products. Please refresh the page.",
      "error"
    );
  }
}

async function loadProducts() {
  const productsGrid = document.getElementById("products-grid");

  if (!productsGrid) return;

  try {
    console.log("🔄 Loading all products...");
    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

    const response = await productsAPI.getProducts();
    allProducts = response.products || [];
    filteredProducts = [...allProducts];

    if (allProducts.length === 0) {
      productsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">📦</div>
                    <h3>No Products Available</h3>
                    <p>Check back later for new farm products.</p>
                </div>
            `;
      return;
    }

    console.log(`✅ Loaded ${allProducts.length} products`);

    displayProducts(filteredProducts);
    setupPagination(filteredProducts.length);
  } catch (error) {
    console.error("Error loading products:", error);
    productsGrid.innerHTML = `
            <div class="message error" style="grid-column: 1 / -1;">
                Error loading products. Please try again later.
            </div>
        `;
  }
}

function displayProducts(products) {
  const productsGrid = document.getElementById("products-grid");

  if (!productsGrid) return;

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = products.slice(startIndex, endIndex);

  if (productsToShow.length === 0) {
    productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🔍</div>
                <h3>No Products Found</h3>
                <p>Try adjusting your search or filter criteria.</p>
                <button onclick="clearFilters()" class="btn btn-primary">
                    Clear Filters
                </button>
            </div>
        `;
    return;
  }

  productsGrid.innerHTML = "";

  productsToShow.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  // Try to use product image, fallback to placeholder
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0] : null;

  const farmerName =
    product.farmer?.farmName || product.farmer?.name || "Unknown Farmer";
  const location = product.farmer?.location
    ? `${product.farmer.location.county}, ${product.farmer.location.town}`
    : "Location not specified";

  card.innerHTML = `
        <div class="product-image-container">
            ${
              imageUrl
                ? `
                <img src="${imageUrl}" alt="${product.name}" class="product-image" 
                     onerror="this.classList.add('fallback'); this.nextElementSibling.style.display='flex'">
            `
                : ""
            }
            <div class="product-image-placeholder" data-category="${
              product.category
            }" 
                 style="${imageUrl ? "display: none;" : "display: flex;"}">
                <div class="product-emoji">${getCategoryEmoji(
                  product.category
                )}</div>
                <div class="product-category">${product.category}</div>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">KSh ${product.price?.toLocaleString()}</p>
            <p class="product-farmer">
                <strong>By:</strong> ${farmerName}
            </p>
            <p class="product-location">
                <small>📍 ${location}</small>
            </p>
            ${
              product.description
                ? `<p class="product-description">${product.description.substring(
                    0,
                    80
                  )}...</p>`
                : ""
            }
            <button class="btn btn-primary add-to-cart" data-id="${
              product._id
            }">
                Add to Cart
            </button>
        </div>
    `;

  const addToCartBtn = card.querySelector(".add-to-cart");
  addToCartBtn.addEventListener("click", function () {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: getCategoryEmoji(product.category),
      farmer: farmerName,
    });
  });

  return card;
}

function getCategoryEmoji(category) {
  const emojis = {
    livestock: "🐄",
    poultry: "🐔",
    vegetables: "🥦",
    fruits: "🍎",
    dairy: "🥛",
    other: "📦",
  };
  return emojis[category] || "📦";
}
