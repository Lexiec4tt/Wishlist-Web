import { db, auth } from "./firebase.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login");
const logoutBtn = document.getElementById("logoutBtn");


if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signupForm["signup-email"].value;
    const username = signupForm["signup-username"].value;
    const password = signupForm["signup-password"].value;

  try {
   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created:", user);

    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, {
      username: username,
      email: email,
      joined: serverTimestamp()
    });
    
    window.location.href = "index.html";
  } catch (error) {
    console.error(error);
  }

  
});
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMessage = document.getElementById("error-message");
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-credential":
          errorMessage.textContent = "Invalid email or password. Please try again.";
          break;

        case "auth/network-request-failed":
          errorMessage.textContent = "Unable to connect. Check your internet connection.";
          break;

        case "auth/too-many-requests":
          errorMessage.textContent = "Too many failed attempts. Please try again later.";
          break;

        default:
          errorMessage.textContent = "Something went wrong. Please try again.";
      }
      errorMessage.hidden = false;
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      window.location.reload();
    } catch (error) {
      console.error(error);
    } 
});
}