console.log("Script loaded successfully!");

const themeToggle = document.getElementById("themeToggle");

// Check which theme is currently active
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

// Switch themes when the button is clicked
if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        // Save the selected theme
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });
}