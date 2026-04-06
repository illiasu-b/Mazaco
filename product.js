import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const form = document.getElementById("productForm");
const productTable = document.getElementById("productTable");

// ---------------- ADD PRODUCT ----------------
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const product = {
    name: document.getElementById("name").value,
    business: document.getElementById("business").value,
    category: document.getElementById("category").value,
    costPrice: Number(document.getElementById("costPrice").value),
    price: Number(document.getElementById("price").value),
    stock: Number(document.getElementById("stock").value),
    lowStockLimit: Number(document.getElementById("lowStockLimit").value),
    createdAt: serverTimestamp()
  };

  try {
    // 1️⃣ Add product to Firestore
    const productRef = await addDoc(collection(db, "products"), product);
    alert("Product added successfully!");
    form.reset();
    loadProducts();

    // 2️⃣ Log sale for this product
    await addSale({
      productName: product.name,
      quantity: product.stock,                          // or quantity sold
      total: product.stock * product.price,            // or actual sale total
      profit: (product.price - product.costPrice) * product.stock
    });

    // 3️⃣ Refresh dashboard totals
    if (typeof loadDashboard === "function") loadDashboard();

  } catch (error) {
    console.error("Error adding product:", error);
  }
});

// ---------------- ADD SALE FUNCTION ----------------
export async function addSale(sale) {
  try {
    await addDoc(collection(db, "sales"), {
      ...sale,
      date: serverTimestamp() // important for today/weekly/monthly totals
    });
  } catch (error) {
    console.error("Error adding sale:", error);
  }
}

// ---------------- LOAD PRODUCTS ----------------
export async function loadProducts() {
  if (!productTable) return;

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    let rows = "";

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const stock = Number(data.stock) || 0;
      const lowStockLimit = Number(data.lowStockLimit) || 0;
      const costPrice = Number(data.costPrice) || 0;
      const price = Number(data.price) || 0;
      const totalStockValue = stock * price;

      rows += `
<tr style="background-color: ${stock <= lowStockLimit ? '#f8d7da' : 'transparent'}">
  <td>${data.name}</td>
  <td>${data.business}</td>
  <td>${data.category}</td>
  <td>${stock}</td>
  <td>${costPrice}</td>
  <td>${price}</td>
  <td>${lowStockLimit}</td>
  <td>${totalStockValue}</td>
  <td>
    <button onclick="deleteProduct('${docSnap.id}')">Delete</button>
  </td>
</tr>
      `;
    });

    productTable.innerHTML = rows;

  } catch (error) {
    console.error("Error loading products:", error);
  }
}

// ---------------- DELETE PRODUCT ----------------
window.deleteProduct = async function(id) {
  try {
    await deleteDoc(doc(db, "products", id));
    alert("Product deleted!");
    loadProducts();
  } catch (error) {
    console.error("Error deleting product:", error);
  }
};

// ---------------- INITIAL LOAD ----------------
loadProducts();