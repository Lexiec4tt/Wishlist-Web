
import "./ui.js";
import "./auth.js";
import "./profile.js";
import "./wishlist.js";
import { loadWishlist, setWishlistOwner } from "./wishlist.js";

import { auth } from "./firebase.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

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
const aside = document.getElementById("aside");
let isOwner = false;

const params = new URLSearchParams(window.location.search);
const viewedUid = params.get("user");

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


    const owner = uidToLoad === user.uid;
    setWishlistOwner(owner);

    if(wishlistContainer){
      loadWishlist(uidToLoad);

      if (!owner) {
        wishlistFormContainer.hidden = true;
        aside.style.display = "none";
      }
    }

});