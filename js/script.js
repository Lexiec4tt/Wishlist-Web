
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
import {
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
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
const wishlistFormContainer = document.getElementById("wishlist-edit");
const wishlistForm = document.getElementById("wishlist-form");
const profileContainer = document.getElementById("explore-container");
const logoutBtn = document.getElementById("logoutBtn");
const deleteBtn = document.getElementById("deleteBtn");


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
      Window.location.reload();
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
      wishlistFormContainer.hidden = false;
      loggedout.hidden = true;
      logoutBtn.hidden = false;
    } else {
      wishlistContainer.hidden = true;
      wishlistForm.hidden = true; 
      loggedout.hidden = false;
      logoutBtn.hidden = true;
    }
  });
  }
  else if(profileContainer) {
    onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      if (user) {
        profileContainer.hidden = false;
        loggedout.hidden = true;
        logoutBtn.hidden = false;
      } else {
        profileContainer.hidden = true;
        loggedout.hidden = false;
        logoutBtn.hidden = true;
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

const params = new URLSearchParams(window.location.search);
const viewedUid = params.get("user");

console.log("Viewed UID:", viewedUid);

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
        const itemData = {
          name: itemName,
          link: itemLink,
          priority: itemPriority,
          description: itemDescription,
          received: false,
          addedDate: serverTimestamp()
        }

        const wishlistItemRef = collection(db, "users", user.uid, "wishlist");
        const docRef = await addDoc(wishlistItemRef, itemData);
        console.log("Item added to wishlist");

        itemData.id = docRef.id;

        const newItem = createWishlistItem(itemData);
        wishlistContainer.appendChild(newItem);

      }
    } catch (error) {
      console.error(error);
    }
  });
}

let isOwner = false;

onAuthStateChanged(auth, (user) => {

    if (!user) return;
    const uidToLoad = viewedUid || user.uid;

    isOwner = uidToLoad === user.uid;

    loadWishlist(uidToLoad);

    if (!isOwner) {
      wishlistFormContainer.hidden = true;
    }
});

if(profileContainer) {
  loadProfiles();
}


function createWishlistItem(itemData) {
  const template = document.getElementById("wishlist-template");
  const newItem = template.content.cloneNode(true);
  const receivedCheckbox = newItem.querySelector("#received-checkbox");
  const deleteButton = newItem.querySelector("#deleteBtn");
  deleteButton.hidden = !isOwner; // Hide delete button if not the owner
  newItem.querySelector(".card h3 a").textContent = itemData.name;
  newItem.querySelector(".card h3 a").href = itemData.link;
  newItem.querySelector(".desc").textContent = `Description/Specification: ${itemData.description || "N/A"}`;
  newItem.querySelector(".priority").textContent = `Priority level: ${itemData.priority}`;
  newItem.querySelector(".date").textContent = `Added: ${toJsDate(itemData.addedDate).toLocaleDateString()}`;
  newItem.querySelector("#received-checkbox").checked = itemData.received;
  newItem.querySelector("#received-checkbox").disabled = !isOwner;

  return newItem;
}

async function loadWishlist() {
  const user = viewedUid ? { uid: viewedUid } : auth.currentUser;
  if (user) {
    const wishlistRef = collection(db, "users", user.uid, "wishlist");
    const snapshot = await getDocs(wishlistRef);

    snapshot.forEach((doc) => {
      const itemData = doc.data();
      const newItem = createWishlistItem(itemData);
      wishlistContainer.appendChild(newItem);
    });
  }
}

function createProfileCard(user, uid) {

    const template = document.querySelector(".profile-template");
    const clone = template.content.cloneNode(true);

    clone.querySelector(".profile-name").textContent = user.username + "'s Wishlist";
    clone.querySelector(".card-link").href = `wishlist.html?user=${uid}`;

    return clone;
}

async function loadProfiles() {
  console.log("Loading profiles...");
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  snapshot.forEach((doc) => {
    const userData = { uid: doc.id, ...doc.data() };
    const profileCard = createProfileCard(userData, doc.id);
    profileContainer.appendChild(profileCard);
  });
}

function toJsDate(timestamp) {
  const ts = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  return new Date(ts);
}
