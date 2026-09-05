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
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logoutBtn");


if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signupForm["signup-email"].value;
    const username = signupForm["signup-username"].value.trim();
    const usernameLower = username.toLowerCase();
    const password = signupForm["signup-password"].value;

  try {

    const usernameDoc = await getDoc(
      doc(db, "usernames", usernameLower)
    );

    if (usernameDoc.exists()) {
      const error = new Error("User already Taken");
      error.code = "username-taken";
      throw error;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, {
      username: username,
      email: email,
      joined: serverTimestamp(),
      privacy: false
    });
    await setDoc(doc(db, "usernames", usernameLower), {
      uid: user.uid
    });
    
    window.location.href = "index.html";
  } catch (error) {
    console.log(error);
    const errorMessage = document.getElementById("error-message");
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage.textContent = "That email is already in use. Please try another.";
        break;
      case "username-taken":
        errorMessage.textContent = "That username is already taken. Please try another.";
        break;
      default:
        errorMessage.textContent = "Something went wrong. Please try again.";
    }
    errorMessage.hidden = false;
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