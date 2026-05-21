// script.js

const productsContainer = document.getElementById("products");

fetch("https://dummyjson.com/products?limit=0")
  .then(response => response.json())
  .then(data => {

    console.log(data);

    data.products.forEach(product => {

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${product.thumbnail}" alt="${product.title}">
        
        <div class="title">${product.title}</div>

        <div class="price">$${product.price}</div>

        <div class="desc">
          ${product.description}
        </div>

        <div class="category">
          Category: ${product.category}
        </div>

        <p><b>Rating:</b> ${product.rating}</p>
        <p><b>Stock:</b> ${product.stock}</p>
        <p><b>Brand:</b> ${product.brand}</p>
      `;

      productsContainer.appendChild(card);
    });

  })
  .catch(error => {
    console.log("Error fetching products:", error);
  });