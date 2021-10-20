console.log('Hardik');

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');
const cartClosebtn = document.querySelector('.fa-window-close');

let cart = localStorage.getItem('cart');
cart = JSON.parse(cart) || [];

let buttonsDom = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch('./products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { id } = item.sys;
        const { title, price } = item.fields;
        const img = item.fields.image.fields.file.url;
        return { id, title, price, img };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// Display Products
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach((product) => {
      result += `<article class="product">
        <div class="img-container">
            <img src=${product.img} alt="product" class="product-img">
            <button class="bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart"></i>
                add to bag
            </button>
        </div>
        <h3>${product.title}</h3>
        <h3>${product.price}</h3>
    </article>`;
    });
    productsDom.innerHTML = result;
  }
  getBagButtons() {
    const addToBagBtns = [...document.querySelectorAll('.bag-btn')];
    buttonsDom = addToBagBtns;
    addToBagBtns.forEach((addToBagBtn) => {
      const { id } = addToBagBtn.dataset;
      let inCart = cart?.find((item) => item.id === id);
      if (inCart) {
        addToBagBtn.innerHTML = 'Already in cart';
        addToBagBtn.disabled = true;
      }
      addToBagBtn.addEventListener('click', (event) => {
        event.target.innerText = 'Already in cart';
        event.target.disabled = true;
        //    get product from products
        const allProducts = JSON.parse(localStorage.getItem('products'));
        //    add product from cart
        //    save cart in local storage
        //    set cart values
        cart = [...cart, ...(allProducts.filter((product) => product.id === id) || [])];
        localStorage.setItem('cart', JSON.stringify(cart));
        cartOverlay.style.visibility = 'visible';
        let displatcart = ``;
        cart.forEach((cartItem) => {
          displatcart += ` <div class="cart-item">
          <img src=${cartItem.img} alt="product">
          <div>
              <h4>${cartItem.title}</h4>
              <h5>${cartItem.price}</h5>
              <span class="remove-item">remove</span>
          </div>
          <div>
              <i class="fas fa-chevron-up"></i>
              <p class="item-amount">1</p>
              <i class="fas fa-chevron-down"></i>

          </div>
      </div> `;
        });
        cartContent.innerHTML = displatcart;
        //    display cart item
        cartClosebtn.addEventListener('click', () => {
          cartOverlay.style.visibility = 'hidden';
        });
        //    show the cart
      });
    });
  }
}

// Local Storage

class Storage {
  // static methods can be used without having a class instance
  static saveProduct(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();
  //   get All Products
  let allProducts = products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProduct(products);
    })
    .then(() => ui.getBagButtons());

  console.log('DOM LOADED');
});
