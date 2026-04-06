// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// 🔹 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAePKTqnuOeKuzj94xhlQ7b3HD6zwf8pDY",
  authDomain: "mazaco.firebaseapp.com",
  projectId: "mazaco",
  storageBucket: "mazaco.appspot.com", // ✅ must be .appspot.com
  messagingSenderId: "423890478638",
  appId: "1:423890478638:web:5a8dc1a30a0f6a310b21bf"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };