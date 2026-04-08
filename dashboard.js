import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

export async function loadDashboard() {
  await calculateDashboard();
}

// ================= MAIN DASHBOARD =================
async function calculateDashboard() {
  const snapshot = await getDocs(collection(db, "products"));

  let totalSellingValue = 0;
  let totalCostValue = 0;
  let totalProfit = 0;
  let totalStock = 0;

  let bestSeller = "None";
  let highestStock = 0;

  let lowStockProducts = [];

  if (snapshot.empty) {
    setText("todaySales", "0.00");
    setText("weeklySales", "0.00");
    setText("monthlySales", "0.00");
    setText("totalProfit", "0.00");
    setText("totalStock", "0");
    setText("bestSeller", "None");

    const el = document.getElementById("lowStock");
    if (el) el.textContent = "0";

    return;
  }

  snapshot.forEach((docSnap) => {
    const p = docSnap.data();

    const stock = Number(p.stock) || 0;
    const cost = Number(p.costPrice) || 0;
    const price = Number(p.price) || 0;
    const limit = Number(p.lowStockLimit) || 0;
    const name = p.name || "Unknown";

    const sellingValue = stock * price;
    const costValue = stock * cost;
    const profit = sellingValue - costValue;

    totalSellingValue += sellingValue;
    totalCostValue += costValue;
    totalProfit += profit;
    totalStock += stock;

    // Best seller (based on stock quantity)
    if (stock > highestStock) {
      highestStock = stock;
      bestSeller = name;
    }

    // Low stock
    if (stock <= limit) {
      lowStockProducts.push(name);
    }
  });

  // ⚠️ Since no real sales → same values everywhere
  setText("todaySales", totalSellingValue.toFixed(2));
  setText("weeklySales", totalSellingValue.toFixed(2));
  setText("monthlySales", totalSellingValue.toFixed(2));

  setText("totalProfit", totalProfit.toFixed(2));
  setText("totalStock", totalStock);
  setText("bestSeller", bestSeller);

  // Low stock display
  const el = document.getElementById("lowStock");
  if (!el) return;

  if (lowStockProducts.length > 0) {
    el.textContent = `${lowStockProducts.length} need top-up: ${lowStockProducts.join(", ")}`;
    el.style.color = "red";
  } else {
    el.textContent = "All stocked";
    el.style.color = "green";
  }
}