import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

// If already logged in, go straight to dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "index.html";
  }
});

// Login form submit
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  errorMessage.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html"; // go to dashboard
  } catch (error) {
    if (error.code === "auth/user-not-found") errorMessage.textContent = "User does not exist.";
    else if (error.code === "auth/wrong-password") errorMessage.textContent = "Incorrect password.";
    else if (error.code === "auth/invalid-credential") errorMessage.textContent = "Invalid email or password.";
    else errorMessage.textContent = error.message;
  }
});