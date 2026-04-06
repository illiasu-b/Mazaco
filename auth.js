// auth.js
import { auth } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const googleBtn = document.getElementById("googleLogin");
const provider = new GoogleAuthProvider();

googleBtn?.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User signed in:", result.user.email);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Google login error:", error.code, error.message);
    alert("Google login failed: " + error.message);
  }
});