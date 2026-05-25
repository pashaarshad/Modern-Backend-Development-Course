const productsContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

let allProducts = [];

async function fetchProducts() {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=100");
    const data = await response.json();

    allProducts = data.products;

    displayProducts(allProducts);

  } catch (error) {
    productsContainer.innerHTML = `
      <div class="loading">Failed to load products</div>
    `;
    console.log(error);
  }
}

async function fetchCategories() {
  try {
    const response = await fetch("https://dummyjson.com/products/category-list");
    const categories = await response.json();

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });

  } catch (error) {
    console.log(error);
  }
}

function displayProducts(products) {

  if(products.length === 0){
    productsContainer.innerHTML = `
      <div class="loading">No products found</div>
    `;
    return;
  }

  productsContainer.innerHTML = products.map(product => `
  
    <div class="product-card">

      <img 
        src="${product.thumbnail}" 
        alt="${product.title}" 
        class="product-image"
      />

      <div class="product-content">

        <span class="category">
          ${product.category}
        </span>

        <div class="product-title">
          ${product.title}
        </div>

        <div class="description">
          ${product.description}
        </div>

        <div class="price-row">
          <div class="price">
            $${product.price}
          </div>

          <div class="rating">
            <i class="fa-solid fa-star"></i>
            ${product.rating}
          </div>
        </div>

        <button class="btn">
          <i class="fa-solid fa-cart-plus"></i>
          Add To Cart
        </button>

      </div>

    </div>

  `).join("");
}

function filterProducts() {

  let filtered = [...allProducts];

  const searchText = searchInput.value.toLowerCase();
  const category = categorySelect.value;
  const sort = sortSelect.value;

  // Search
  if(searchText){
    filtered = filtered.filter(product =>
      product.title.toLowerCase().includes(searchText)
    );
  }

  // Category
  if(category !== "all"){
    filtered = filtered.filter(product =>
      product.category === category
    );
  }

  // Sorting
  if(sort === "asc"){
    filtered.sort((a,b) => a.price - b.price);
  }

  if(sort === "desc"){
    filtered.sort((a,b) => b.price - a.price);
  }

  displayProducts(filtered);
}

searchInput.addEventListener("input", filterProducts);
categorySelect.addEventListener("change", filterProducts);
sortSelect.addEventListener("change", filterProducts);

fetchProducts();
fetchCategories();