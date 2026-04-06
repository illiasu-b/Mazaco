import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

async function loadDashboard() {

  const salesSnapshot = await getDocs(collection(db, "sales"));
  const productsSnapshot = await getDocs(collection(db, "products"));

  let todaySales = 0;
  let weeklySales = 0;
  let monthlySales = 0;
  let totalProfit = 0;

  let totalStock = 0;
  let lowStock = 0;

  let bestSeller = {};
  let bestSellerName = "None";
  let bestSellerQty = 0;

  const today = new Date();
  const todayStr = today.toDateString();

  const weekStart = new Date();
  weekStart.setDate(today.getDate() - 7);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // SALES CALCULATIONS
  salesSnapshot.forEach((doc) => {

    const data = doc.data();

    if (!data.date) return;

    const saleDate = data.date.toDate();

    totalProfit += data.profit || 0;

    if (saleDate.toDateString() === todayStr) {
      todaySales += data.total;
    }

    if (saleDate >= weekStart) {
      weeklySales += data.total;
    }

    if (saleDate >= monthStart) {
      monthlySales += data.total;
    }

    // BEST SELLER
    if (!bestSeller[data.productName]) {
      bestSeller[data.productName] = 0;
    }

    bestSeller[data.productName] += data.quantity;

    if (bestSeller[data.productName] > bestSellerQty) {
      bestSellerQty = bestSeller[data.productName];
      bestSellerName = data.productName;
    }

  });

  // INVENTORY CALCULATIONS
  productsSnapshot.forEach((doc) => {

    const data = doc.data();

    totalStock += data.stock || 0;

    if (data.stock <= data.lowStockLimit) {
      lowStock++;
    }

  });

  // DISPLAY VALUES
  document.getElementById("todaySales").textContent = todaySales;
  document.getElementById("weeklySales").textContent = weeklySales;
  document.getElementById("monthlySales").textContent = monthlySales;
  document.getElementById("totalProfit").textContent = totalProfit;

  document.getElementById("totalStock").textContent = totalStock;
  document.getElementById("lowStock").textContent = lowStock;
  document.getElementById("bestSeller").textContent = bestSellerName;

}

loadDashboard();