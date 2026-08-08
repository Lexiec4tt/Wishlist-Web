
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