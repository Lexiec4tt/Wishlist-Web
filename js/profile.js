import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const profileContainer = document.getElementById("explore-container");

function createProfileCard(user, uid) {

    const template = document.querySelector(".profile-template");
    const clone = template.content.cloneNode(true);

    clone.querySelector(".profile-name").textContent = user.username + "'s Wishlist";
    clone.querySelector(".card-link").href = `wishlist.html?user=${uid}`;

    return clone;
}

async function loadProfiles() {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  snapshot.forEach((doc) => {
    const userData = { uid: doc.id, ...doc.data() };
    const profileCard = createProfileCard(userData, doc.id);
    profileContainer.appendChild(profileCard);
  });
}

if (profileContainer) {
  loadProfiles();
}