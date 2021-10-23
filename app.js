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

let cart = [];

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
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add pproduct to cart
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        this.setCartValues(cart);
        this.addCartItem(cartItem);
        this.showCart();
      });
    });
  }
  setCartValues = (cart) => {
    let numberOfItemsInCart = 0;
    let cartItemsTotalValue = 0;
    cart.map((item) => {
      numberOfItemsInCart += item.amount;
      cartItemsTotalValue += item.price * item.amount;
    });
    cartItems.innerHTML = numberOfItemsInCart;
    cartTotal.innerHTML = parseFloat(cartItemsTotalValue).toFixed(2);
  };
  addCartItem = (item) => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = ` 
    <img src=${item.img} alt="product">
    <div>
        <h4>${item.title}</h4>
        <h5>${item.price}</h5>
        <span class="remove-item" data-id = ${item.id} >remove</span>
    </div>
    <div>
        <i class="fas fa-chevron-up" data-id = ${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id = ${item.id}></i>
    </div>
 `;
    cartContent.appendChild(div);
  };
  showCart = () => {
    cartDom.classList.add('showCart');
    cartOverlay.classList.add('showTransparentBcg');
  };
  hideCart = () => {
    cartOverlay.classList.remove('showTransparentBcg');
    cartDom.classList.remove('showCart');
  };
  populateCart = () => {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  };
  setUpApp = () => {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  };
  cartLogic = () => {
    // clear cart button
    clearCartBtn.addEventListener('click', this.clearCart);
    // cart functionality
    cartContent.addEventListener('click', (event) => {
      if (event.target.className === 'remove-item') {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItemFromCart(id);
        cartContent.children.length === 0 && this.hideCart();
      } else if (event.target.classList.contains('fa-chevron-up')) {
        // update cart total
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains('fa-chevron-down')) {
        // update cart total
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItemFromCart(id);
          cartContent.children.length === 0 && this.hideCart();
        }
      }
    });
  };
  clearCart = () => {
    let cartItems = cart.map((cartItem) => cartItem.id);
    cartItems.forEach((id) => this.removeItemFromCart(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  };
  removeItemFromCart = (id) => {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    button.disabled = false;
  };
  getSingleButton = (id) => {
    return buttonsDom.find((bagButtons) => bagButtons.dataset.id === id);
  };
}

// Local Storage

class Storage {
  // static methods can be used without having a class instance
  static saveProduct(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    const allProducts = JSON.parse(localStorage.getItem('products'));
    return allProducts.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    let cartItemsinLocalStorage = localStorage.getItem('cart');
    return cartItemsinLocalStorage ? JSON.parse(cartItemsinLocalStorage) : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();
  // setUp APP
  ui.setUpApp();
  //   get All Products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProduct(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });

  console.log('DOM LOADED');
});
