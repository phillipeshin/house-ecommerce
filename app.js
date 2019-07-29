// Variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const housesDOM = document.querySelector('.homes-container');

// Cart
let cart = [];
// Buttons
let buttonsDOM = [];

// Getting the houses
class Houses {
    async getHouses() {
        try{
            // Retrieve info from products.json file
            let result = await fetch('products.json');
            let data = await result.json();
            let houses = data.items;

            // Get product info from "fields" in json
            houses = houses.map(item => {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            })
            return houses;
        } catch (error) {
            console.log(error);
        }
    }
}

// Display products onto the dom
class UI {
    displayHouses(houses) {
        let result ='';
        houses.forEach(house => {
            result+=`
            <article class="product">
            <div class="image-container">
                <img src=${house.image} alt="house1" class="house-image">
                <button class="bag-btn" data-id=${house.id}><i class="fas fa-shopping-cart"> Add to bag</i></button>
            </div>
            <h3>${house.title}</h3>
            <h4>$ ${house.price}</h4>
            </article>
            `;
        });
        housesDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];                         // Node list to array
        buttonsDOM = buttons;                                                               // Assign buttons to buttonsDOM
        buttons.forEach(button => {
            let id = button.dataset.id;                                                     // Retrieve ids from the buttons
            let inCart = cart.find(item => item.id === id);                                 // Check if the id is in the cart
            if (inCart) {
                button.innerText = "In Cart";                                               // Change the button display
                button.disabled = true;                                                     // Disable the button

            } 
                button.addEventListener('click', (event) => {                               // Change values when added to cart
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;

                    let cartItem = {...Storage.getHouses(id), amount: 1};                   // Get house from houses array, add amount
                    cart = [...cart, cartItem];                                             // Add house to the cart

                    Storage.saveCart(cart);                                                 // Save cart into local storage
                    this.setCartValues(cart);                                               // Set cart values
                    this.addCartItem(cartItem);                                             // Display cart item 
                    this.showCart();                                                        // Show the cart
                })
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {                                                                  // Return new price totals                                                     
            tempTotal  += item.price * item.amount;                                         // Price of current item
            itemsTotal += item.amount;                                                      // Update the amount of items
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));                             // Convert values and return to DOM
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');                                          // Return the item in the cart
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src=${item.image} alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            
        </div>`;
        cartContent.appendChild(div);                                                       // Add the cart content
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP() {                                                                            // Set up the cart and home page
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);                                    // Change the css overlay on click
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    populateCart(cart) {                                                                    // Add items to cart
        cart.forEach(item => this.addCartItem(item));

    }
    hideCart() {                                                                            // Hide the cart on click
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic() {                                                                           // Shopping cart functionality
        clearCartBtn.addEventListener('click', ()=> {                                       // Clear cart on button click
            this.clearCart();
        });
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')) {
                let removeItem = event.target;                                              // If the remove button is clicked
                let id = removeItem.dataset.id;                                             // Get id of the item
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);                                                        // Remove item from the cart

            }
            else if (event.target.classList.contains("fa-chevron-up")) {                    // If the up button is clicked in cart
                let addAmount = event.target;                                               // Find event target
                let id = addAmount.dataset.id;
                let temp = cart.find(item => item.id === id);                               // If found in cart, increment by one
                temp.amount = temp.amount + 1;
                Storage.saveCart(cart);                                                     // Update the current cart
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = temp.amount;                       // Update the quantity in the cart
            } 
            else if (event.target.classList.contains("fa-chevron-down")) {                  // If the down button is clicked in cart 
                let lowerAmount = event.target;                                             // Find the target and lower quantity, update cart
                let id = lowerAmount.dataset.id;
                let temp = cart.find(item => item.id === id);
                
                if (temp.amount > 0) {
                    Storage.saveCart(cart);                                                 // Update cart
                    this.setCartValues(cart);                                               // Update the cart values
                    temp.amount = temp.amount - 1;
                    lowerAmount.previousElementSibling.innerText = temp.amount;
                }
                else {                                                                      // If quantity = 0, remove from cart
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);       // Remove the div that has the cart info
                    this.removeItem(id);
                }
            }
        });                             
    }
    clearCart() {                                                                           // Remove each item from cart
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {                                           // Remove all children from cart
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart;
    }
    removeItem(id) {                                                                        // Filter out the target ids
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);                                                           // Update the values
        Storage.saveCart(cart);                                                             // Update the cart contents
        let button = this.getSingleButton(id);                                              // Remove item button
        button.disabled = false;                                                            // Enable the cart button
        button.innerHTML = `<i class="fas fa-shopping-cart">Add to bag</i> `;               // Add the cart back to the thumbnail
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);                         // Find the clicked button 
    }
}

// Local storage
class Storage {
    static saveHouses(houses) {
        localStorage.setItem("houses", JSON.stringify(houses));
    }
    static getHouses(id) {
        let houses = JSON.parse(localStorage.getItem('houses'));                             // Parse the stringified array
        return houses.find(house => house.id === id);
    }
    static saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));                                  // Add the cart to local storage
    }
    static getCart() {                                                                       // Check if cart empty, if not, return string
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", ()=> {
    const userinterface = new UI();
    const houses = new Houses();

    // Set up the app
    userinterface.setupAPP();
    // Get all houses
    houses.getHouses()
    .then(houses=> {
        userinterface.displayHouses(houses);
        Storage.saveHouses(houses);
}).then(() => {
    userinterface.getBagButtons();
    userinterface.cartLogic();
});
});