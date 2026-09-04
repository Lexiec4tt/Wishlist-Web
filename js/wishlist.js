import { db, auth } from "./firebase.js";

import {
  doc,
  getDoc,
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

const wishlistContainer =
  document.getElementById("wishlist-container");

const wishlistFormContainer =
  document.getElementById("wishlist-edit");

const wishlistForm =
  document.getElementById("wishlist-form");

const loadMoreBtn =
  document.getElementById("loadMoreBtn");

const usernameCache = new Map();

const pageSize = 20;

let lastVisible = null;
let editingItemId = null;
let isOwner = false;

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

            card.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

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
          wishlistForm.reset();

        }
      }
    } catch (error) {
      console.error(error);
    }
  });
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
  reservedMessage.hidden = isOwner || itemData.reservedBy === null || itemData.received;

  const reserveOwner = itemData.reservedBy === auth.currentUser.uid;
  const isReserved = itemData.reservedBy != null;
  const canReserve = !isOwner && (!isReserved || reserveOwner);
  reserveButton.hidden = (!canReserve || itemData.received);
  reserveButton.textContent = reserveOwner ? "Cancel Reservation" : "Reserve";
  if(reserveOwner){
  reservedMessage.textContent = "You have reserved this item to gift.";
  }
  
  wishlistForm.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  checkboxUpdate(receivedCheckbox,itemDataid);
  deleteItem(deleteButton, itemDataid);
  reserveItem(reserveButton, itemData, itemDataid, vieweduid, reservedMessage);
  updateWishlistItem(editButton, itemDataid, itemData);
  return newItem;
}

export async function loadWishlist(uid) {

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

export function setWishlistOwner(owner) {
  isOwner = owner;
}