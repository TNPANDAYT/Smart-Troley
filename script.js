const products = {
  "P101": { name: "Milk", price: 25 },
  "P102": { name: "Bread", price: 40 },
  "P103": { name: "Rice", price: 60 },
  "P104": { name: "Apple", price: 30 },
  "P105": { name: "Egg", price: 5 },
  "p106": { name: "Oil", price: 50 },
  "p107": { name: "Salt", price: 20 },
  "p108": { name: "Honey", price: 150},
  "p109": { name: "Curd", price: 40},
  "p110": { name: "Juice", price: 50 },


let cart = [];
let total = 0;
let lastScanTime = 0;
const delay = 2000; // 2-second delay

const cartList = document.getElementById("cart");
const popup = document.getElementById("popup");

function addToCart(code) {
  if (products[code]) {
    cart.push(products[code]);
    total += products[code].price;
    updateCart();
    showPopup();
  } else {
    alert("❌ Unknown product: " + code);
  }
}

function updateCart() {
  cartList.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ₹${item.price}`;
    cartList.appendChild(li);
  });
  totalText.textContent = `Total: ₹${total}`;
}

function showPopup() {
  popup.style.display = "block";
  setTimeout(() => { popup.style.display = "none"; }, 1800);
}

const html5QrCode = new Html5Qrcode("qr-reader");

html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  qrCodeMessage => {
    const now = Date.now();
    if (now - lastScanTime > delay) {
      addToCart(qrCodeMessage);
      lastScanTime = now;
    }
  },
  error => {}
).catch(err => console.error("Camera start failed:", err));
