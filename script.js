// 🔹 Product database (use real barcode numbers)
const products = {
  "8901725015275": { name: "Dark fantasy", price: 10 },
  "8901234567890": { name: "Milk Biscuit", price: 15 },
  "P101": { name: "Apple", price: 30 }
};

let cart = {};
let total = 0;
let lastScanTime = 0;
const delay = 2000;

// Elements
const popup = document.getElementById("popup");
const totalText = document.getElementById("total");
const cartBody = document.getElementById("cart-body");
const scanStatus = document.getElementById("scan-status");

// 🔊 Sound
const beep = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");

// ✅ Add to cart
function addToCart(code) {
  const product = products[code];

  if (product) {
    if (cart[code]) {
      cart[code].quantity++;
    } else {
      cart[code] = { ...product, quantity: 1 };
    }

    scanStatus.textContent = "Scanned: " + product.name;
    beep.play();
    updateCart();
    showPopup();
  } else {
    alert("❌ Product not found: " + code);
  }
}

// ➕ Increase
function increaseItem(code) {
  cart[code].quantity++;
  updateCart();
}

// ➖ Decrease
function decreaseItem(code) {
  cart[code].quantity--;
  if (cart[code].quantity <= 0) {
    delete cart[code];
  }
  updateCart();
}

// ❌ Remove item
function removeItem(code) {
  delete cart[code];
  updateCart();
}

// 🔄 Update cart
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
      <td>
        <button onclick="removeItem('${code}')">❌</button>
      </td>
    `;

    cartBody.appendChild(row);
  });

  totalText.textContent = "Total: ₹" + total;
}

// ✅ Popup
function showPopup() {
  popup.style.display = "block";
  setTimeout(() => {
    popup.style.display = "none";
  }, 1500);
}

//
// 🧾 PDF BILL 
//GENERATION
function generateBill() {
  if (Object.keys(cart).length === 0) {
    alert("Cart is empty!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // 🏪 Title
  doc.setFontSize(16);
  doc.text("SMART TROLLEY BILL", 14, 15);

  doc.setFontSize(10);
  doc.text("Date: " + new Date().toLocaleString(), 14, 22);

  // 📊 Table data
  const tableData = [];

  Object.values(cart).forEach(item => {
    tableData.push([
      item.name,
      "₹" + item.price,
      item.quantity,
      "₹" + (item.price * item.quantity)
    ]);
  });

  // 🧾 Table
  doc.autoTable({
    startY: 30,
    head: [["Product", "Price", "Qty", "Subtotal"]],
    body: tableData
  });

  // 💰 Total (below table)
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text("Total: ₹" + total, 14, finalY);

  doc.setFontSize(10);
  doc.text("Thank you for shopping!", 14, finalY + 8);

  // 📄 Save PDF
  doc.save("Smart_Trolley_Bill.pdf");
}

// 📷 Scanner
const html5QrCode = new Html5Qrcode("qr-reader");

let html5QrCode;

function startScanner() {
  html5QrCode = new Html5Qrcode("qr-reader");

  html5QrCode.start(
    { facingMode: { exact: "environment" } }, // 👈 important for iPhone
    {
      fps: 10,
      qrbox: 250,
      aspectRatio: 1.0
    },
    (decodedText) => {
      const now = Date.now();

      if (now - lastScanTime > delay) {
        addToCart(decodedText.trim());
        lastScanTime = now;
      }
    },
    () => {}
  ).catch(err => {
    alert("Camera error: " + err);
    console.error(err);
  });
}
