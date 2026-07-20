

const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const themeToggle = document.getElementById("theme-toggle");

settingsBtn.addEventListener("click", () => {
		settingsMenu.classList.toggle("hidden");
	});	

themeToggle.addEventListener("click", () => {
		document.body.classList.toggle("dark");
		if (document.body.classList.contains("dark")) {
			themeToggle.textContent = "☀️ Light Mode";
		} else {
			themeToggle.textContent = "🌙 Dark Mode";
		}
	});

/*Firebase code*/

 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyC9WQ71akGdS5KzEMXKc6hpYt0ejqcQOS4",
    authDomain: "wishlist-database-71af3.firebaseapp.com",
    projectId: "wishlist-database-71af3",
    storageBucket: "wishlist-database-71af3.firebasestorage.app",
    messagingSenderId: "674788319469",
    appId: "1:674788319469:web:23b4ec2b9c0adacc46ece4",
    measurementId: "G-RLKKQSWSLT"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  
console.log(app);

