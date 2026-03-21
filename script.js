const products = {
  "P101": { name: "Milk Biscuit", price: 15 },
  "P102": { name: "Good Day", price: 10 },
  "P103": { name: "Nabati", price: 10 },
  "P104": { name: "Apple", price: 30 },
  "P105": { name: "Egg", price: 5 },
  "P106": { name: "Oil", price: 50 },
  "P107": { name: "Good Day Big", price: 20 },
  "P108": { name: "Bourbon", price: 10 },
  "P109": { name: "Hide & Seek", price: 30 },
  "P110": { name: "Juice", price: 20 }
};

let cart = {};
let total = 0;
let lastScanTime = 0;
const delay = 2000;

const popup = document.getElementById("popup");
const totalText = document.getElementById("total");
const cartBody = document.getElementById("cart-body");

// Add product
function addToCart(code) {
  const product = products[code];

  if (product) {
    if (cart[code]) {
      cart[code].quantity++;
    } else {
      cart[code] = { ...product, quantity: 1 };
    }

    updateCart();
    showPopup();
  } else {
    alert("❌ Unknown product: " + code);
  }
}

// Update cart
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

  totalText.textContent = "Total: ₹" + total;
}

// Popup
function showPopup() {
  popup.style.display = "block";
  setTimeout(() => {
    popup.style.display = "none";
  }, 1500);
}

// QR Scanner
const html5QrCode = new Html5Qrcode("qr-reader");

html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },

  (decodedText) => {
    const now = Date.now();

    if (now - lastScanTime > delay) {
      addToCart(decodedText.trim());
      lastScanTime = now;
    }
  },

  (errorMessage) => {
    // ignore errors
  }
).catch(err => {
  console.error("Camera start failed:", err);
});
