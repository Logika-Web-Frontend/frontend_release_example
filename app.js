/* ==========================================
   LogikaShop - JavaScript функціонал
   ========================================== */
// 1. Універсальна функція для збереження будь-яких даних (масивів/об'єктів) у Cookie
function getJsonCookie(cookieName) {
  const allCookies = document.cookie.split('; ');

  const targetCookie = allCookies.find(row => row.startsWith(cookieName + '='));

  if (targetCookie) {
    const encodedData = targetCookie.split('=')[1];
    return JSON.parse(decodeURIComponent(encodedData));
  }
  return null;
}

// 2. Універсальна функція для збереження будь-яких даних (масивів/об'єктів) у Cookie
function saveJsonCookie(cookieName, data, seconds) {
  const jsonString = JSON.stringify(data);
  const safeString = encodeURIComponent(jsonString);
  document.cookie = `${cookieName}=${safeString}; max-age=${seconds}; path=/`;
}

// ========== Глобальні змінні ==========
let products = []; // Масив всіх товарів
let cart = []; // Масив товарів у кошику
let currentCategory = 'all'; // Поточна категорія фільтра

// ========== DOM елементи ==========
const productsGrid = document.querySelector('#productsGrid');
const categoryFilters = document.querySelector('#categoryFilters');
const cartCount = document.querySelector('#cartCount');
const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
const noProducts = document.querySelector('#noProducts');
const cartContainer = document.querySelector('#cartItems');


// ========== Ініціалізація при завантаженні сторінки ==========
document.addEventListener('DOMContentLoaded', function () {
  loadCart(); // Завантажуємо кошик з LocalStorage
  fetchProducts(); // Отримуємо товари з JSON
});

// ========== Отримання товарів з JSON ==========
async function fetchProducts() {
  const response = await fetch('store_db.json');
  const data = await response.json();
  products = data; // Оновлюємо глобальний масив для роботи addToCart
  if (productsGrid) {
    displayProducts(data);
  }
}

// ========== Відображення товарів ==========
function displayProducts(products) {
  productsGrid.innerHTML = ''; // Очищаємо блок товарів

  products?.forEach(product => {
    const card = createProductCard(product);
    productsGrid.innerHTML += card;
  });
}

// ========== Створення картки товару ==========
function createProductCard(product) {
  return `<div class="card" style="width: 18rem;">
        <img src="img/${product.image}" class="card-img-top" alt="${product.title}">
        <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text text-primary fw-bold">${product.price} грн </p>
            <button onclick="addToCart(${product.id})"  class="btn btn-warning add-to-cart-btn"> <i class="bi bi-cart-plus"></i> В кошик</button>
        </div>
    </div>`;
}

// ========== Робота з кошиком ==========

// Додавання товару до кошика
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const cartItem = cart.find(item => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1; // Якщо товар вже в кошику, збільшуємо кількість
  } else {
    cart.push({ ...product, quantity: 1 }); // Додаємо новий товар до кошика
  }
  saveJsonCookie('cart', cart, 3600 * 24 * 7); // Зберігаємо кошик у Cookie на 1 тиждень
}


// Завантаження кошика з Cookie
function loadCart() {
  const savedCart = getJsonCookie('cart');
  if (savedCart !== null) {
    cart = savedCart;
    displayCart(); // Відображаємо кошик після завантаження
  }
}


function displayCart() {
  if (!cartContainer) return; // Якщо елемент для відображення кошика не знайдено, зупиняємо функцію

  // Очищаємо контейнер перед виведенням
  cartContainer.innerHTML = '';
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Ваш кошик порожній 🛒</p>';
    return; // Зупиняємо функцію, далі йти не треба
  }
  let total = 0;
  // ...продовження функції renderCart
  cart.forEach((product) => {
    total += product.price * product.quantity; // Підрахунок загальної суми

    cartContainer.innerHTML += `
      <div class="card border-0 border-bottom rounded-0">
        <div class="card-body d-flex align-items-center gap-3 p-3">
          <img src="img/${product.image}" height="80" >
          <div class="flex-grow-1">
              <h5 class="card-title mb-1">${product.title}</h5>
              <p class="card-text text-muted mb-1">Кількість: ${product.quantity}</p>
              <p class="card-text text-primary fw-bold mb-0">Ціна: ${product.price} грн</p>
          </div>
        </div>
      </div>
    `;
  });
  document.querySelector('#totalPrice').textContent = `${total} грн`; // Виводимо загальну суму

}