const products = {
  "P101": { name: "Milk", price: 25 },
  "P102": { name: "Bread", price: 40 },
  "P103": { name: "Rice", price: 60 },
  "P104": { name: "Apple", price: 30 },
  "P105": { name: "Egg", price: 5 },
  "P106": { name: "Oil", price: 50 },
  "P107": { name: "Salt", price: 20 },
  "P108": { name: "Honey", price: 150 },
  "P109": { name: "Curd", price: 40 },
  "P110": { name: "Juice", price: 50 }
};

let cart = {};              // Store items with quantity
let total = 0;
let lastScanTime = 0;
const delay = 2000;         // 2-second delay between scans

const popup = document.getElementById("popup");
const totalText = document.getElementById("total");
const cartBody = document.getElementById("cart-body");

// ✅ Add product to cart or increase quantity
function addToCart(code) {
  const product = products[code];
  if (product) {
    if (cart[code]) {
      cart[code].quantity += 1;
    } else {
      cart[code] = { ...product, quantity: 1 };
    }
    updateCart();
    showPopup();
  } else {
    alert("❌ Unknown product: " + code);
  }
}

// ✅ Update cart table and total price
function updateCart() {
  cartBody.innerHTML = "";
  total = 0;

  Object.keys(cart).forEach(code => {
    const item = cart[code];
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>₹${item.price}</td>
      <td>${item.quantity}</td>
      <td>₹${subtotal}</td>
    `;
    cartBody.appendChild(row);
  });

  totalText.textContent = `Total: ₹${total}`;
}

// ✅ Popup animation
function showPopup() {
  popup.style.display = "block";
  setTimeout(() => { popup.style.display = "none"; }, 1800);
}

// ✅ QR Code Scanner Setup
const html5QrCode = new Html5Qrcode("qr-reader");

html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  qrCodeMessage => {
    const now = Date.now();
    if (now - lastScanTime > delay) {
      addToCart(qrCodeMessage.trim());
      lastScanTime = now;
    }
  },
  error => {
    // Ignore scan errors to keep scanner running
  }
).catch(err => console.error("Camera start failed:", err));
