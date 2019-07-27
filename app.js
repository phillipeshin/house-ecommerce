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
}

// Local storage
class Storage {

}

document.addEventListener("DOMContentLoaded", ()=> {
    const userinterface = new UI();
    const houses = new Houses();

    // Get all houses
    houses.getHouses().then(houses=>userinterface.displayHouses(houses));
})