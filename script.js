// 🔹 Product database
const products = {
  "8901725015275": { name: "Dark Fantasy", price: 10 },
  "8901234567890": { name: "Milk Biscuit", price: 15 },
  "123456789012": { name: "Sample Product", price: 20 }
};

let cart = {};
let total = 0;
let lastScanTime = 0;
const delay = 1500;

let scannerRunning = false;

// 🔊 Sound
const beep = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");

// 🔹 Elements
const cartBody = document.getElementById("cart-body");
const totalText = document.getElementById("total");
const scanStatus = document.getElementById("scan-status");

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

    beep.play().catch(() => {});
    updateCart();
  } else {
    scanStatus.textContent = "❌ Not found: " + code;
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
  if (cart[code].quantity <= 0) delete cart[code];
  updateCart();
}

// ❌ Remove
function removeItem(code) {
  delete cart[code];
  updateCart();
}

// 🔄 Update Cart
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

// 🧾 Generate PDF Bill
function generateBill() {
  if (Object.keys(cart).length === 0) {
    alert("Cart is empty!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("SMART TROLLEY BILL", 14, 15);

  doc.setFontSize(10);
  doc.text("Date: " + new Date().toLocaleString(), 14, 22);

  const tableData = [];

  Object.values(cart).forEach(item => {
    tableData.push([
      item.name,
      "₹" + item.price,
      item.quantity,
      "₹" + (item.price * item.quantity)
    ]);
  });

  doc.autoTable({
    startY: 30,
    head: [["Product", "Price", "Qty", "Subtotal"]],
    body: tableData,
    theme: "grid"
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text("Total: ₹" + total, 14, finalY);

  doc.save("Smart_Trolley_Bill.pdf");
}

// 📷 START SCANNER (Quagga)
function startScanner() {
  if (scannerRunning) {
    alert("Scanner already running");
    return;
  }

  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: document.querySelector("#qr-reader"),
      constraints: {
        facingMode: "environment",
        width: 640,
        height: 480
      }
    },
    locator: {
      patchSize: "medium",
      halfSample: true
    },
    numOfWorkers: navigator.hardwareConcurrency || 4,
    decoder: {
      readers: [
        "ean_reader",
        "ean_8_reader",
        "code_128_reader",
        "upc_reader",
        "upc_e_reader"
      ]
    },
    locate: true
  }, function(err) {
    if (err) {
      console.error(err);
      alert("Camera error: " + err);
      return;
    }

    Quagga.start();
    scannerRunning = true;
  });

  // 🔥 Detect barcode
  Quagga.onDetected(function(result) {
    const code = result.codeResult.code;

    const now = Date.now();
    if (now - lastScanTime > delay) {
      addToCart(code);
      lastScanTime = now;
      alert(result.codeResult.code);
    }
  });
}

// ⛔ Stop Scanner
function stopScanner() {
  if (scannerRunning) {
    Quagga.stop();
    scannerRunning = false;
  }
}
