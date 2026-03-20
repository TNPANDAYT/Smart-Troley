document.addEventListener("DOMContentLoaded", () => {

  // 🔹 Product database
  const products = {
    "8901725015275": { name: "Dark Fantasy", price: 10 },
    "8901063025448": { name: "Milk Biscuit", price: 15 },
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
  window.increaseItem = function(code) {
    cart[code].quantity++;
    updateCart();
  };

  // ➖ Decrease
  window.decreaseItem = function(code) {
    cart[code].quantity--;
    if (cart[code].quantity <= 0) delete cart[code];
    updateCart();
  };

  // ❌ Remove
  window.removeItem = function(code) {
    delete cart[code];
    updateCart();
  };

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

  // 🧾 PDF BILL
  window.generateBill = function() {
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

    const tableData = Object.values(cart).map(item => [
      item.name,
      "₹" + item.price,
      item.quantity,
      "₹" + (item.price * item.quantity)
    ]);

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
  };

  // 📷 START SCANNER
  window.startScanner = function() {
    console.log("Start clicked");

    if (scannerRunning) {
      alert("Scanner already running");
      return;
    }

    if (typeof Quagga === "undefined") {
      alert("Quagga library not loaded!");
      return;
    }

    const target = document.getElementById("qr-reader");
    if (!target) {
      alert("qr-reader element not found!");
      return;
    }

    Quagga.init({
      inputStream: {
        type: "LiveStream",
        target: target,
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
      console.log("Camera started");
    });

    Quagga.onDetected(function(result) {
      const code = result.codeResult.code;
      console.log("Detected:", code);

      const now = Date.now();
      if (now - lastScanTime > delay) {
        addToCart(code);
        lastScanTime = now;
      }
    });
  };

  // ⛔ STOP SCANNER
  window.stopScanner = function() {
    if (scannerRunning) {
      Quagga.stop();
      scannerRunning = false;
      console.log("Scanner stopped");
    }
  };

});
