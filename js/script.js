

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
