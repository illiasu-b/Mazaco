import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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
    await addDoc(collection(db, "products"), product);
    alert("Product added successfully!");
    form.reset();
    loadProducts();
    if (typeof loadDashboard === "function") loadDashboard();
  } catch (error) {
    console.error("Error adding product:", error);
  }
});

// ---------------- LOAD PRODUCTS ----------------
export async function loadProducts() {
  if (!productTable) return;

  try {
    const snapshot = await getDocs(collection(db, "products"));

    if (snapshot.empty) {
      productTable.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center; color: gray;">No products found.</td>
        </tr>
      `;
      return;
    }

    let rows = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const stock = Number(data.stock) || 0;
      const lowStockLimit = Number(data.lowStockLimit) || 0;
      const costPrice = Number(data.costPrice) || 0;
      const price = Number(data.price) || 0;

      rows += `
        <tr style="background-color: ${stock <= lowStockLimit ? '#f8d7da' : 'transparent'}">
          <td>${data.name}</td>
          <td>${data.business}</td>
          <td>${data.category}</td>
          <td>${stock}</td>
          <td>${costPrice}</td>
          <td>${price}</td>
          <td>${lowStockLimit}</td>
          <td>${stock * price}</td>
          <td>
  <button onclick="sellProduct('${docSnap.id}', '${data.name}', ${price}, ${costPrice}, ${stock})">Sell</button>
  <button onclick="editProduct('${docSnap.id}')">Edit</button> <!-- ✅ NEW -->
  <button onclick="deleteProduct('${docSnap.id}', '${data.name}')">Delete</button>
</td>
        </tr>
      `;
    });

    productTable.innerHTML = rows;

  } catch (error) {
    console.error("Error loading products:", error);
  }
}

// ---------------- SELL PRODUCT ----------------
window.sellProduct = async function (id, name, price, costPrice, currentStock) {
  const qty = Number(prompt(`How many units of "${name}" are you selling?`));

  if (!qty || qty <= 0) return alert("Invalid quantity.");
  if (qty > currentStock) return alert("Not enough stock.");

  try {
    // ✅ SAVE SALE (CORRECT STRUCTURE)
    await addDoc(collection(db, "sales"), {
      name: name,
      quantity: qty,
      costPrice: costPrice,
      sellingPrice: price,
      createdAt: serverTimestamp() // ✅ REQUIRED
    });

    // ✅ UPDATE STOCK
    await updateDoc(doc(db, "products", id), {
      stock: currentStock - qty
    });

    alert("Sale recorded!");

    loadProducts();
    if (typeof loadDashboard === "function") loadDashboard();

  } catch (error) {
    console.error("Error recording sale:", error);
  }
};

// ---------------- DELETE PRODUCT ----------------
window.deleteProduct = async function (id, name) {
  const confirmed = confirm(`Delete "${name}"?`);
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "products", id));

    // ✅ DELETE RELATED SALES (FIXED FIELD NAME)
    const q = query(collection(db, "sales"), where("name", "==", name));
    const snap = await getDocs(q);

    const promises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(promises);

    alert("Deleted successfully!");

    loadProducts();
    if (typeof loadDashboard === "function") loadDashboard();

  } catch (error) {
    console.error("Error deleting:", error);
  }
};

window.editProduct = async function (id) {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    const productDoc = snapshot.docs.find(doc => doc.id === id);

    if (!productDoc) return alert("Product not found");

    const data = productDoc.data();

    // Prompt user for new values
    const name = prompt("Edit name:", data.name);
    const business = prompt("Edit business:", data.business);
    const category = prompt("Edit category:", data.category);
    const costPrice = Number(prompt("Edit cost price:", data.costPrice));
    const price = Number(prompt("Edit selling price:", data.price));
    const stock = Number(prompt("Edit stock:", data.stock));
    const lowStockLimit = Number(prompt("Edit low stock limit:", data.lowStockLimit));

    // Prevent empty updates
    if (!name || !business || !category) {
      return alert("Fields cannot be empty");
    }

    // Update Firestore
    await updateDoc(doc(db, "products", id), {
      name,
      business,
      category,
      costPrice,
      price,
      stock,
      lowStockLimit
    });

    alert("Product updated successfully!");

    loadProducts();
    if (typeof loadDashboard === "function") loadDashboard();

  } catch (error) {
    console.error("Error updating product:", error);
  }
};

// ---------------- INITIAL LOAD ----------------
loadProducts();