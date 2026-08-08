
/* more of UI stuff; toggling settings menu and theme */
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const themeToggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");

if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    settingsMenu.classList.toggle("hidden");
  });
}

if(savedTheme === "dark"){
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Light Mode";
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme","dark");
      themeToggle.textContent = "☀️ Light Mode";
    } else {
      localStorage.setItem("theme","light");
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
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter
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
const usernameCache = new Map();
const loadMoreBtn = document.getElementById("loadMoreBtn");
const getStartedLinks = { wishlist: document.getElementById("wishlistCard"), 
  explore: document.getElementById("exploreCard"),
  rules: document.getElementById("guidelines")
 }
const getStartedHeader = document.getElementById("get-started-header");

let lastVisible = null;
let currentWishlistuid = null;
const pageSize = 20;
let isOwner = false;
let editingItemId = null;


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
      console.log("User logged in:", user);
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


onAuthStateChanged(auth, (user) => {

    const loggedIn = !!user;

    if (logoutBtn) {
      logoutBtn.hidden = !loggedIn;
    }

    if (wishlistContainer) {
        wishlistContainer.hidden = !loggedIn;
        wishlistFormContainer.hidden = !loggedIn;
        loggedout.hidden = loggedIn;
    }

    if (profileContainer) {
        profileContainer.hidden = !loggedIn;
        loggedout.hidden = loggedIn;
    }

    if (loginSection) {
        loginSection.hidden = loggedIn;
        getStartedHeader.hidden = !loggedIn;
        getStartedLinks.wishlist.hidden = !loggedIn;
        getStartedLinks.explore.hidden = !loggedIn;
        getStartedLinks.rules.hidden = !loggedIn;
    }


    if (!user) return;
    const uidToLoad = viewedUid || user.uid;

    isOwner = uidToLoad === user.uid;
    if(wishlistContainer){
      loadWishlist(uidToLoad);

      if (!isOwner) {
        wishlistFormContainer.hidden = true;
      }
    }

});

const params = new URLSearchParams(window.location.search);
const viewedUid = params.get("user");

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

        if (editingItemId) {

          const itemRef = doc(
            db,
            "users",
            user.uid,
            "wishlist",
            editingItemId
          );

          await updateDoc(itemRef, {
            name: itemName,
            link: itemLink,
            priority: itemPriority,
            description: itemDescription
          });

          const card = wishlistContainer.querySelector(
            `.card[data-id="${editingItemId}"]`
          );

          card.querySelector(".card h3 a").textContent = itemName;
          card.querySelector(".card h3 a").href = itemLink;
          card.querySelector(".priority").textContent =
            `Priority level: ${itemPriority}`;
          card.querySelector(".desc").textContent =
            `Description/Specification: ${itemDescription}`;

          editingItemId = null;
          wishlistForm.reset();

        } else {  
          const itemData = {
            name: itemName,
            link: itemLink,
            priority: itemPriority,
            description: itemDescription,
            received: false,
            reservedBy: null,
            addedDate: serverTimestamp()
          }

          const wishlistItemRef = collection(db, "users", user.uid, "wishlist");
          const docRef = await addDoc(wishlistItemRef, itemData);
          console.log("Item added to wishlist");

          itemData.id = docRef.id;

          const newItem = createWishlistItem(itemData, itemData.id);
          wishlistContainer.appendChild(newItem);
          WishlistForm.reset();

        }
      }
    } catch (error) {
      console.error(error);
    }
  });
}



if(profileContainer) {
  loadProfiles();
}


function createWishlistItem(itemData, itemDataid, vieweduid) {
  const template = document.getElementById("wishlist-template");
  const newItem = template.content.cloneNode(true);
  newItem.querySelector(".card").dataset.id = itemDataid;
  const receivedCheckbox = newItem.querySelector(".received-checkbox");
  const deleteButton = newItem.querySelector(".deleteBtn");
  const reserveButton = newItem.querySelector(".reserveBtn");
  const reservedMessage = newItem.querySelector(".reservedMsg");
  const editButton = newItem.querySelector(".editBtn");
  deleteButton.hidden = !isOwner; // Hide delete button if not the owner
  editButton.hidden = !isOwner; // Hide edit button if not the owner
  newItem.querySelector(".card h3 a").textContent = itemData.name;
  newItem.querySelector(".card h3 a").href = itemData.link;
  newItem.querySelector(".card h3 a").target = "_blank";
  newItem.querySelector(".card h3 a").rel = "noopener noreferrer";
  newItem.querySelector(".desc").textContent = `Description/Specification: ${itemData.description || "N/A"}`;
  newItem.querySelector(".priority").textContent = `Priority level: ${itemData.priority}`;
  newItem.querySelector(".date").textContent = `Added: ${toJsDate(itemData.addedDate).toLocaleDateString()}`;
  newItem.querySelector(".received-checkbox").checked = itemData.received;
  receivedCheckbox.disabled = !isOwner;
  reservedMessage.hidden = isOwner || itemData.reservedBy === null;

  const reserveOwner = itemData.reservedBy === auth.currentUser.uid;
  const isReserved = itemData.reservedBy != null;
  const canReserve = !isOwner && (!isReserved || reserveOwner);
  reserveButton.hidden = !canReserve;
  reserveButton.textContent = reserveOwner ? "Cancel Reservation" : "Reserve";
  if(reserveOwner){
  reservedMessage.textContent = "You have reserved this item to gift.";
  }

  checkboxUpdate(receivedCheckbox,itemDataid);
  deleteItem(deleteButton, itemDataid);
  reserveItem(reserveButton, itemData, itemDataid, vieweduid, reservedMessage);
  updateWishlistItem(editButton, itemDataid, itemData);
  return newItem;
}

async function loadWishlist(uid) {

  if (!uid) return;

  wishlistContainer.replaceChildren();
  lastVisible = null;

  const wishlistName = document.getElementById("wishlist-name");
  wishlistName.textContent = `${await getUsername(uid)}'s Wishlist`;

  await loadWishlistPage(uid);
}

async function loadWishlistPage(uid) {

  const wishlistRef = collection(db, "users", uid, "wishlist");

  let wishlistQuery;

  if (lastVisible) {
    wishlistQuery = query(
      wishlistRef,
      orderBy("received", "asc"),
      orderBy("addedDate", "desc"),
      startAfter(lastVisible),
      limit(pageSize)
    );
  } else {
    wishlistQuery = query(
      wishlistRef,
      orderBy("received", "asc"),
      orderBy("addedDate", "desc"),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(wishlistQuery);

  snapshot.forEach((doc) => {
    const itemData = doc.data();
    itemData.id = doc.id;

    const newItem = createWishlistItem(itemData, itemData.id, uid);
    wishlistContainer.appendChild(newItem);
  });

  lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

  loadMoreBtn.hidden = snapshot.size < pageSize;
}

if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", async () => {

    const uid = viewedUid || auth.currentUser.uid;

    await loadWishlistPage(uid);

  });
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
    if (!timestamp?.seconds) {
    return new Date(); // temporary fallback
  }

  return new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
}

async function checkboxUpdate(receivedCheckbox,itemDataid) {
    receivedCheckbox.addEventListener("change", async () => {
    const wishlistItemRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "wishlist",
      itemDataid
    );

    console.log("Updating:", itemDataid);

    await updateDoc(wishlistItemRef, {
      received: receivedCheckbox.checked
    });
    console.log("done!");
  })
}

async function deleteItem(deleteBtn, itemDataid) {
  deleteBtn.addEventListener("click", async () => {
    const wishlistItemRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "wishlist",
      itemDataid
    );

    await deleteDoc(wishlistItemRef);
    deleteBtn.closest(".card").remove();
  })
}

async function reserveItem(reserveBtn, itemData, itemDataid, viewedUid, reservedMsg) {
  reserveBtn.addEventListener("click", async () => {

    const wishlistItemRef = doc(
      db,
      "users",
      viewedUid,
      "wishlist",
      itemDataid
    );

    // Nobody has reserved it yet
    if (itemData.reservedBy == null) {

    await updateDoc(wishlistItemRef, {
        reservedBy: auth.currentUser.uid
    });

    itemData.reservedBy = auth.currentUser.uid;
    reserveBtn.textContent = "Cancel Reservation";
    reservedMsg.textContent = "You have reserved this item to gift.";
    reservedMsg.hidden = false;

    } else if (itemData.reservedBy === auth.currentUser.uid) {

        await updateDoc(wishlistItemRef, {
            reservedBy: null
        });

        itemData.reservedBy = null;
        reserveBtn.textContent = "Reserve";
        reservedMsg.hidden = true;
    } 
  });
}

async function getUsername(uid) {

  if (usernameCache.has(uid)) {
    return usernameCache.get(uid);
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return "Unknown";

  const username = userSnap.data().username;

  usernameCache.set(uid, username);

  return username;
}

async function updateWishlistItem(editBtn,itemDataid, itemData) {
  editBtn.addEventListener("click", async () => {
    editingItemId = itemDataid;

    wishlistForm["item-name"].value = itemData.name;
    wishlistForm["item-link"].value = itemData.link;
    wishlistForm["item-priority"].value = itemData.priority;
    wishlistForm["item-desc"].value = itemData.description || "";

    wishlistForm.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });
}