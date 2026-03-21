// 🔹 PRODUCTS
const products = {
  "8901725015275": { name: "Dark Fantasy", price: 10 },
  "8901234567890": { name: "Milk Biscuit", price: 15 },
  "8901063161110": { name: "Good Day", price: 20 }
};

// 🔹 GLOBAL
let cart = {};
let total = 0;
let lastScanTime = 0;
const delay = 2000;

// 🔹 ELEMENTS
const popup = document.getElementById("popup");
const totalText = document.getElementById("total");
const cartBody = document.getElementById("cart-body");
const scanStatus = document.getElementById("scan-status");

// 🔊 SOUND
const beep = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");

// ➕ ADD TO CART
function addToCart(code) {
  const product = products[code];

  if (!product) {
    scanStatus.textContent = "❌ Not found: " + code;
    return;
  }

  if (cart[code]) cart[code].quantity++;
  else cart[code] = { ...product, quantity: 1 };

  beep.play();
  updateCart();
  showPopup();
  scanStatus.textContent = "✅ " + product.name;
}

// 🔄 UPDATE CART
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
      <td>
        <button onclick="decreaseItem('${code}')">-</button>
        ${item.quantity}
        <button onclick="increaseItem('${code}')">+</button>
      </td>
      <td>₹${subtotal}</td>
      <td><button onclick="removeItem('${code}')">❌</button></td>
    `;
    cartBody.appendChild(row);
  });

  totalText.textContent = "Total: ₹" + total;
}

// ➕ / ➖ / ❌
function increaseItem(code) { cart[code].quantity++; updateCart(); }
function decreaseItem(code) { 
  cart[code].quantity--; 
  if (cart[code].quantity <= 0) delete cart[code]; 
  updateCart(); 
}
function removeItem(code) { delete cart[code]; updateCart(); }

// 🔔 POPUP
function showPopup() {
  popup.style.display = "block";
  setTimeout(() => popup.style.display = "none", 1000);
}

// 📷 START SCANNER
function startScanner() {
  scanStatus.textContent = "📷 Starting...";

  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: document.querySelector("#qr-reader"),
      constraints: { facingMode: "environment" }
    },
    decoder: { readers: ["ean_13_reader", "code_128_reader"] }
  }, function(err) {
    if (err) {
      console.error(err);
      scanStatus.textContent = "❌ Camera error";
      return;
    }

    Quagga.start();
    scanStatus.textContent = "📷 Running";

    Quagga.onDetected(data => {
      const code = data.codeResult.code;
      const now = Date.now();

      if (now - lastScanTime > delay) {
        addToCart(code);
        lastScanTime = now;
      }
    });
  });
}

// ⛔ STOP SCANNER
function stopScanner() {
  Quagga.stop();
  scanStatus.textContent = "⛔ Stopped";
}

// 🧾 GENERATE PDF BILL
function generateBill() {
  if (Object.keys(cart).length === 0) {
    alert("Cart empty");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let rows = Object.values(cart).map(item => [
    item.name,
    "₹" + item.price,
    item.quantity,
    "₹" + item.price * item.quantity
  ]);

  doc.text("Smart Trolley Bill", 14, 15);
  doc.autoTable({ head: [["Product","Price","Qty","Subtotal"]], body: rows, startY: 25 });
  doc.text("Total: ₹" + total, 14, doc.lastAutoTable.finalY + 10);
  doc.save("bill.pdf");
}
