
/* more of UI stuff; toggling settings menu and theme */
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const themeToggle = document.getElementById("theme-toggle");

if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    settingsMenu.classList.toggle("hidden");
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      themeToggle.textContent = "☀️ Light Mode";
    } else {
      themeToggle.textContent = "🌙 Dark Mode";
		}
	});
}
/*end of UI stuff*/

/*Firebase code*/

 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
  import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
  import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
  import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
  import { signOut} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
  import { serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
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
  const db = getFirestore(app);
  const auth = getAuth(app);

/*end of firebase code generated*/

/*allat firebase shmuck i needed AI to teach me */
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login");
const recentlyAddedSection = document.querySelector(".recently-added");
const loggedout = document.getElementById("logged-out");
const wishlistContainer = document.getElementById("wishlist-container");
const wishlistForm = document.getElementById("wishlist-edit");
const profileContainer = document.getElementById("profile-container");
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
      joined: new Date() 
    });
    // You can also store the username in Firestore if needed
  } catch (error) {
    console.error(error);
  }

  
});
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User logged in:", user);
    } catch (error) {
      console.error(error);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error(error);
    } 
});
}

if(loggedout) {
  if(wishlistContainer) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      wishlistContainer.hidden = false;
      wishlistForm.hidden = false;
      loggedout.hidden = true;
    } else {
      wishlistContainer.hidden = true;
      wishlistForm.hidden = true; 
      loggedout.hidden = false;
    }
  });
  }
  else if(profileContainer) {
    onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      if (user) {
        profileContainer.hidden = false;
        loggedout.hidden = true;
      } else {
        profileContainer.hidden = true;
        loggedout.hidden = false;
      }
    });
  }
} else if(recentlyAddedSection) {
  onAuthStateChanged(auth, (user) => {
    if(user) {
      recentlyAddedSection.hidden = false;
      loginSection.hidden = true;
      logoutBtn.hidden = false;
    } else {
      recentlyAddedSection.hidden = true;
      loginSection.hidden = false;
      logoutBtn.hidden = true;
    }
  });
}

if(wishlistForm) {
  wishlistForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const itemName = wishlistForm["item-name"].value;
    const itemLink = wishlistForm["item-link"].value;
    const itemPriority = wishlistForm["item-priority"].value;
    const itemDescription = wishlistForm["item-desc"].value;

    try {
      const user = auth.currentUser;
      if (user) {
        const wishlistItemRef = doc(db, "users", user.uid, "wishlist", itemName);
        await setDoc(wishlistItemRef, {
          name: itemName,
          link: itemLink,
          priority: itemPriority,
          description: itemDescription,
          received: false,
          addedDate: serverTimestamp() // Store the current date and time
        });
      }
    } catch (error) {
      console.error(error);
    }
  });
}

function createWishlistItem(itemData) {
  const template = document.getElementById("wishlist-template");
  const newItem = template.content.cloneNode(true);
  const deleteButton = newItem.querySelector("#deleteBtn");
  newItem.querySelector(".card h3 a").textContent = itemData.name;
  newItem.querySelector(".card h3 a").href = itemData.link;
  newItem.querySelector(".desc").textContent = `Description/Specification: ${itemData.description || "N/A"}`;
  newItem.querySelector(".priority").textContent = `Priority level: ${itemData.priority}`;
  newItem.querySelector(".date").textContent = `Added: ${itemData.addedDate.toDate().toLocaleDateString()}`;
  newItem.querySelector("input[type='checkbox']").checked = itemData.received;
  return newItem;
}

function createProfileCard(user, uid) {

    const template = document.getElementById("profile-template");
    const clone = template.content.cloneNode(true);

    clone.querySelector(".profile-name").textContent = user.username;
    clone.querySelector(".profile-link").href =
        `wishlist.html?user=${uid}`;

    return clone;
}

