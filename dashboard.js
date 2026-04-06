import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

async function loadDashboard() {
  await calculateSales();
  await calculateInventory();
}

async function calculateSales() {
  const snapshot = await getDocs(collection(db, "sales"));

  let todayTotal = 0;
  let weeklyTotal = 0;
  let monthlyTotal = 0;
  let totalProfit = 0;
  let productCounter = {};

  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  snapshot.forEach((docSnap) => {
    const sale = docSnap.data();
    if (!sale.date) return;

    let saleDateObj;
    if (sale.date?.toDate) {
      saleDateObj = sale.date.toDate();
    } else {
      saleDateObj = new Date(sale.date.replace(/-/g, "/"));
    }

    if (isNaN(saleDateObj.getTime())) return;

    const productName = sale.productName || "Unknown";
    const quantity = Number(sale.quantity) || 0;
    const total = Number(sale.total) || 0;
    const profit = Number(sale.profit) || 0;

    totalProfit += profit;
    productCounter[productName] = (productCounter[productName] || 0) + quantity;

    const saleTime = saleDateObj.getTime();
    if (saleTime >= startOfDay.getTime()) todayTotal += total;
    if (saleTime >= startOfWeek.getTime()) weeklyTotal += total;
    if (saleTime >= startOfMonth.getTime()) monthlyTotal += total;
  });

  setText("todaySales", todayTotal.toFixed(2));
  setText("weeklySales", weeklyTotal.toFixed(2));
  setText("monthlySales", monthlyTotal.toFixed(2));
  setText("totalProfit", totalProfit.toFixed(2));

  let bestSeller = "None";
  let highest = 0;
  for (const product in productCounter) {
    if (productCounter[product] > highest) {
      highest = productCounter[product];
      bestSeller = product;
    }
  }
  setText("bestSeller", bestSeller);
}

// ================= INVENTORY =================
async function calculateInventory() {
  const snapshot = await getDocs(collection(db, "products"));

  let totalStock = 0;
  let lowStockProducts = [];

  snapshot.forEach((docSnap) => {
    const product = docSnap.data();

    const stock = Number(product.stock) || 0;
    const limit = Number(product.lowStockLimit) || 0;

    totalStock += stock;

    if (stock <= limit && product.name) {
      lowStockProducts.push(product.name);
    }
  });

  setText("totalStock", totalStock);

  const el = document.getElementById("lowStock");
  if (!el) return;

  if (lowStockProducts.length > 0) {
    el.textContent = `${lowStockProducts.length} need top-up: ${lowStockProducts.join(", ")}`;
    el.style.color = "red";
    el.style.fontWeight = "bold";
  } else {
    el.textContent = "All stocked";
    el.style.color = "green";
  }
}