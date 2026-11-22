
console.log("Script loaded successfully!");

// ==========================================
// DARK MODE
// ==========================================

const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        const currentTheme = document.body.classList.contains("dark-mode")
            ? "dark"
            : "light";

        localStorage.setItem("theme", currentTheme);
    });
}


// ==========================================
// BUDGET TRANSACTIONS
// ==========================================

const transactionForm = document.getElementById("transactionForm");
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function formatMoney(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateBudget() {
    const income = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const expenses = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const balance = income - expenses;

    const incomeElement = document.getElementById("income");
    const expensesElement = document.getElementById("expenses");
    const balanceElement = document.getElementById("balance");

    if (incomeElement) incomeElement.textContent = formatMoney(income);
    if (expensesElement) expensesElement.textContent = formatMoney(expenses);
    if (balanceElement) balanceElement.textContent = formatMoney(balance);
}

function displayTransactions() {
    const transactionList = document.getElementById("transactionList");
    if (!transactionList) return;

    transactionList.innerHTML = "";

    if (transactions.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No transactions yet. Add one above!";
        row.appendChild(cell);
        transactionList.appendChild(row);
        return;
    }

    [...transactions].reverse().forEach(transaction => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        const descriptionCell = document.createElement("td");
        const categoryCell = document.createElement("td");
        const typeCell = document.createElement("td");
        const amountCell = document.createElement("td");

        dateCell.textContent = transaction.date || "";
        descriptionCell.textContent = transaction.description || "";
        categoryCell.textContent = transaction.category || "";
        typeCell.textContent = transaction.type || "";
        amountCell.textContent = formatMoney(Number(transaction.amount) || 0);

        row.append(
            dateCell,
            descriptionCell,
            categoryCell,
            typeCell,
            amountCell
        );

        transactionList.appendChild(row);
    });
}

if (transactionForm) {
    transactionForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const amount = Number(document.getElementById("amount").value);
        const type = document.getElementById("type").value;
        const category = document.getElementById("category").value;
        const description = document.getElementById("description").value.trim();
        const date = document.getElementById("date").value;

        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Please enter an amount greater than zero.");
            return;
        }

        const newTransaction = {
            amount,
            type,
            category,
            description,
            date
        };

        transactions.push(newTransaction);
        saveTransactions();
        updateBudget();
        displayTransactions();
        transactionForm.reset();
    });

    updateBudget();
    displayTransactions();
}


// ==========================================
// THEMEALDB API - CHEAP EATS
// ==========================================

const mealAPI = "https://www.themealdb.com/api/json/v1/1";

const recipeForm = document.getElementById("recipeSearchForm");
const recipeSearch = document.getElementById("recipeSearch");
const mealType = document.getElementById("mealType");
const recipeResults = document.getElementById("recipeResults");
const recipeDetails = document.getElementById("recipeDetails");
const weeklyMealPlan = document.getElementById("weeklyMealPlan");

async function loadMealCategories() {
    if (!mealType) return;

    try {
        const response = await fetch(`${mealAPI}/categories.php`);
        if (!response.ok) throw new Error("Could not load categories.");

        const data = await response.json();

        mealType.innerHTML = '<option value="">All Categories</option>';

        (data.categories || []).forEach(category => {
            const option = document.createElement("option");
            option.value = category.strCategory;
            option.textContent = category.strCategory;
            mealType.appendChild(option);
        });
    } catch (error) {
        console.error("Category error:", error);
        mealType.innerHTML = '<option value="">Categories unavailable</option>';
    }
}

async function searchMeals(event) {
    event.preventDefault();

    const searchTerm = recipeSearch ? recipeSearch.value.trim() : "";
    const selectedCategory = mealType ? mealType.value : "";

    if (recipeResults) recipeResults.textContent = "Searching for recipes...";
    if (recipeDetails) recipeDetails.innerHTML = "";

    if (!searchTerm && !selectedCategory) {
        if (recipeResults) {
            recipeResults.textContent = "Enter a recipe name or select a category!";
        }
        return;
    }

    try {
        let meals = [];

        if (searchTerm) {
            const response = await fetch(
                `${mealAPI}/search.php?s=${encodeURIComponent(searchTerm)}`
            );
            if (!response.ok) throw new Error("Recipe search failed.");

            const data = await response.json();
            meals = data.meals || [];

            if (selectedCategory) {
                meals = meals.filter(meal => meal.strCategory === selectedCategory);
            }
        } else {
            const response = await fetch(
                `${mealAPI}/filter.php?c=${encodeURIComponent(selectedCategory)}`
            );
            if (!response.ok) throw new Error("Category search failed.");

            const data = await response.json();
            meals = data.meals || [];
        }

        displayMeals(meals);
    } catch (error) {
        console.error("Recipe search error:", error);
        if (recipeResults) {
            recipeResults.textContent = "Could not load recipes. Please try again.";
        }
    }
}

function displayMeals(meals) {
    if (!recipeResults) return;

    recipeResults.innerHTML = "";

    if (!meals || meals.length === 0) {
        recipeResults.textContent = "No recipes found. Try another search!";
        return;
    }

    meals.forEach(meal => {
        const column = document.createElement("div");
        column.className = "col-md-4 mb-3";

        const card = document.createElement("div");
        card.className = "card p-3 h-100";

        const image = document.createElement("img");
        image.src = meal.strMealThumb;
        image.alt = `Photo of ${meal.strMeal}`;
        image.className = "img-fluid rounded mb-2";
        image.loading = "lazy";

        const title = document.createElement("h4");
        title.textContent = meal.strMeal;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-primary mt-auto";
        button.textContent = "View Recipe";
        button.dataset.mealId = meal.idMeal;

        card.append(image, title, button);
        column.appendChild(card);
        recipeResults.appendChild(column);
    });
}

async function getMealDetails(mealId) {
    if (!recipeDetails) return;

    recipeDetails.textContent = "Loading recipe...";

    try {
        const response = await fetch(
            `${mealAPI}/lookup.php?i=${encodeURIComponent(mealId)}`
        );
        if (!response.ok) throw new Error("Could not load recipe.");

        const data = await response.json();
        const meal = data.meals?.[0];

        if (!meal) throw new Error("Recipe not found.");

        displayMealDetails(meal);
    } catch (error) {
        console.error("Recipe details error:", error);
        recipeDetails.textContent = "Could not load this recipe.";
    }
}


// ==========================================
// RECIPE DETAILS + ADD TO MEAL PLAN
// ==========================================

function displayMealDetails(meal) {
    if (!recipeDetails) return;

    recipeDetails.innerHTML = "";

    const card = document.createElement("div");
    card.className = "card p-3 mt-4";

    const heading = document.createElement("h3");
    heading.textContent = meal.strMeal;

    const image = document.createElement("img");
    image.src = meal.strMealThumb;
    image.alt = `Photo of ${meal.strMeal}`;
    image.className = "img-fluid rounded mb-3";
    image.style.maxWidth = "300px";

    const ingredientsHeading = document.createElement("h4");
    ingredientsHeading.textContent = "Ingredients";

    const ingredientList = document.createElement("ul");

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
            const item = document.createElement("li");
            item.textContent = `${measure || ""} ${ingredient}`.trim();
            ingredientList.appendChild(item);
        }
    }

    const instructionsHeading = document.createElement("h4");
    instructionsHeading.textContent = "Instructions";

    const instructions = document.createElement("p");
    instructions.textContent = meal.strInstructions || "No instructions available.";

    const planHeading = document.createElement("h4");
    planHeading.textContent = "Add to Weekly Meal Plan";

    const dayLabel = document.createElement("label");
    dayLabel.htmlFor = "mealDay";
    dayLabel.textContent = "Choose a day:";

    const daySelect = document.createElement("select");
    daySelect.id = "mealDay";
    daySelect.className = "form-select mb-2";

    const days = [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
    ];

    days.forEach(day => {
        const option = document.createElement("option");
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    });

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.id = "addToMealPlan";
    addButton.className = "btn btn-primary";
    addButton.textContent = "Add to Meal Plan";
    addButton.dataset.mealId = meal.idMeal;
    addButton.dataset.mealName = meal.strMeal;

    card.append(
        heading,
        image,
        ingredientsHeading,
        ingredientList,
        instructionsHeading,
        instructions,
        planHeading,
        dayLabel,
        daySelect,
        addButton
    );

    recipeDetails.appendChild(card);
    recipeDetails.scrollIntoView({ behavior: "smooth", block: "start" });
}


// ==========================================
// WEEKLY MEAL PLANNER
// ==========================================

let mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || [];

const weekDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
];

function saveMealPlan() {
    localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
}

function displayMealPlan() {
    if (!weeklyMealPlan) return;

    weeklyMealPlan.innerHTML = "";

    weekDays.forEach(day => {
        const dayCard = document.createElement("div");
        dayCard.className = "card p-3 mb-3";

        const dayHeading = document.createElement("h3");
        dayHeading.textContent = day;
        dayCard.appendChild(dayHeading);

        const mealsForDay = mealPlan
            .map((meal, index) => ({ ...meal, index }))
            .filter(meal => meal.day === day);

        if (mealsForDay.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "No meals planned yet.";
            dayCard.appendChild(emptyMessage);
        } else {
            mealsForDay.forEach(meal => {
                const mealRow = document.createElement("div");
                mealRow.className = "d-flex justify-content-between align-items-center gap-2 mb-2";

                const mealName = document.createElement("span");
                mealName.textContent = meal.name;

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.className = "btn btn-sm btn-danger";
                removeButton.textContent = "Remove";
                removeButton.dataset.removeMeal = meal.index;

                mealRow.append(mealName, removeButton);
                dayCard.appendChild(mealRow);
            });
        }

        weeklyMealPlan.appendChild(dayCard);
    });
}

// Add a recipe to the selected day.
if (recipeDetails) {
    recipeDetails.addEventListener("click", function (event) {
        const button = event.target.closest("#addToMealPlan");
        if (!button) return;

        const daySelect = document.getElementById("mealDay");
        if (!daySelect) return;

        const mealId = button.dataset.mealId;
        const mealName = button.dataset.mealName;
        const selectedDay = daySelect.value;

        const alreadyPlanned = mealPlan.some(meal =>
            meal.id === mealId && meal.day === selectedDay
        );

        if (alreadyPlanned) {
            button.textContent = "Already planned!";
            return;
        }

        mealPlan.push({
            id: mealId,
            name: mealName,
            day: selectedDay
        });

        saveMealPlan();
        displayMealPlan();

        button.textContent = "Added!";
    });
}

// Remove a recipe from the meal plan.
if (weeklyMealPlan) {
    weeklyMealPlan.addEventListener("click", function (event) {
        const button = event.target.closest("[data-remove-meal]");
        if (!button) return;

        const index = Number(button.dataset.removeMeal);
        if (!Number.isInteger(index) || index < 0 || index >= mealPlan.length) return;

        mealPlan.splice(index, 1);
        saveMealPlan();
        displayMealPlan();
    });
}


// ==========================================
// PAGE STARTUP
// ==========================================

if (recipeForm) {
    recipeForm.addEventListener("submit", searchMeals);
}

if (recipeResults) {
    recipeResults.addEventListener("click", function (event) {
        const button = event.target.closest("[data-meal-id]");
        if (button) getMealDetails(button.dataset.mealId);
    });
}

if (mealType) {
    loadMealCategories();
}

displayMealPlan();

// ==========================================
// NEARBY FOOD MAP - LEAFLET + OPENSTREETMAP
// ==========================================

(function () {
    const mapElement = document.getElementById("foodMap");

    // Only run this feature on the Cheap Eats page
    if (!mapElement || typeof L === "undefined") {
        return;
    }

    const locationButton = document.getElementById("locationButton");
    const mapStatus = document.getElementById("mapStatus");
    const restaurantResults = document.getElementById("restaurantResults");

    // Start with a general map view, not the user's location
    const map = L.map("foodMap").setView([39.5, -98.35], 4);

    // Add OpenStreetMap map tiles
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let foodMarkers = L.layerGroup().addTo(map);

    // Calculate distance between two coordinates
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const earthRadius = 6371;
        const toRadians = degrees => degrees * Math.PI / 180;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

        return earthRadius * 2 *
            Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Create a safe popup for a food location
    function createPopup(name, type, address) {
        const popup = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = name;

        const category = document.createElement("p");
        category.textContent = type;

        popup.appendChild(title);
        popup.appendChild(category);

        if (address) {
            const addressText = document.createElement("p");
            addressText.textContent = address;
            popup.appendChild(addressText);
        }

        return popup;
    }

    // Find nearby food locations using OpenStreetMap data
    async function findNearbyFood(latitude, longitude) {
        mapStatus.textContent = "Looking for nearby food places...";

        if (restaurantResults) {
            restaurantResults.innerHTML = "";
        }

        foodMarkers.clearLayers();

        const query = `
            [out:json][timeout:25];
            (
                node["amenity"~"^(restaurant|cafe|fast_food)$"]
                    (around:1500,${latitude},${longitude});
                way["amenity"~"^(restaurant|cafe|fast_food)$"]
                    (around:1500,${latitude},${longitude});
                relation["amenity"~"^(restaurant|cafe|fast_food)$"]
                    (around:1500,${latitude},${longitude});
            );
            out center tags;
        `;

        try {
            const response = await fetch(
                "https://overpass-api.de/api/interpreter",
                {
                    method: "POST",
                    body: "data=" + encodeURIComponent(query)
                }
            );

            if (!response.ok) {
                throw new Error("The food search service is unavailable.");
            }

            const data = await response.json();

            const places = data.elements || [];

            let displayedPlaces = 0;

            places.forEach(place => {
                const lat = place.lat ?? place.center?.lat;
                const lon = place.lon ?? place.center?.lon;

                if (lat === undefined || lon === undefined) {
                    return;
                }

                const name = place.tags?.name || "Unnamed food place";
                const type = place.tags?.cuisine ||
                    place.tags?.amenity ||
                    "Food location";

                const distance = calculateDistance(
                    latitude,
                    longitude,
                    lat,
                    lon
                );

                const address = [
                    place.tags?.["addr:housenumber"],
                    place.tags?.["addr:street"]
                ].filter(Boolean).join(" ");

                const marker = L.marker([lat, lon]).addTo(foodMarkers);

                marker.bindPopup(createPopup(name, type, address));

                if (restaurantResults && displayedPlaces < 30) {
                    const result = document.createElement("div");
                    result.className = "restaurant-result";

                    const title = document.createElement("h5");
                    title.textContent = name;

                    const description = document.createElement("p");
                    description.textContent =
                        type + " • " + distance.toFixed(2) + " km away";

                    result.appendChild(title);
                    result.appendChild(description);

                    result.addEventListener("click", () => {
                        map.setView([lat, lon], 17);
                        marker.openPopup();
                    });

                    restaurantResults.appendChild(result);
                }

                displayedPlaces++;
            });

            if (displayedPlaces === 0) {
                mapStatus.textContent =
                    "No food places found within 1.5 km. Try another location.";
            } else {
                mapStatus.textContent =
                    `Found ${displayedPlaces} nearby food places!`;
            }

        } catch (error) {
            console.error("Food map error:", error);

            mapStatus.textContent =
                "Could not load nearby food places. Please try again later.";
        }
    }

    // Ask the browser for permission to use the user's location
    if (locationButton) {
        locationButton.addEventListener("click", () => {
            if (!navigator.geolocation) {
                mapStatus.textContent =
                    "Your browser does not support location services.";
                return;
            }

            mapStatus.textContent = "Requesting your location...";

            navigator.geolocation.getCurrentPosition(
                position => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    map.setView([latitude, longitude], 15);

                    L.circleMarker([latitude, longitude], {
                        radius: 9,
                        color: "#315B43",
                        fillColor: "#6FAF83",
                        fillOpacity: 1
                    })
                    .addTo(map)
                    .bindPopup("Your approximate location");

                    findNearbyFood(latitude, longitude);
                },

                error => {
                    console.error("Location error:", error);

                    mapStatus.textContent =
                        "Location permission was denied or unavailable. " +
                        "You can still explore the map.";
                },

                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

})();

// ==========================================
// SAVINGS GOALS
// ==========================================

const goalForm = document.getElementById("goalForm");
const savingsGoalList = document.getElementById("savingsGoalList");

// Load saved goals from LocalStorage
let savingsGoals = JSON.parse(localStorage.getItem("savingsGoals")) || [];

// Save goals to LocalStorage
function saveSavingsGoals() {
    localStorage.setItem("savingsGoals", JSON.stringify(savingsGoals));
}

// Update the savings summary
function updateSavingsSummary() {
    const totalSaved = savingsGoals.reduce(
        (total, goal) => total + Number(goal.saved),
        0
    );

    const activeGoals = savingsGoals.filter(
        goal => Number(goal.saved) < Number(goal.target)
    );

    const totalSavedElement = document.getElementById("totalSaved");
    const activeGoalsElement = document.getElementById("activeGoals");
    const nextMilestoneElement = document.getElementById("nextMilestone");

    if (totalSavedElement) {
        totalSavedElement.textContent = formatMoney(totalSaved);
    }

    if (activeGoalsElement) {
        activeGoalsElement.textContent = activeGoals.length;
    }

    if (nextMilestoneElement) {
        if (activeGoals.length === 0) {
            nextMilestoneElement.textContent = "No active goals";
        } else {
            // Find the goal closest to completion
            const nextGoal = activeGoals.reduce((closest, goal) => {
                const goalProgress = goal.saved / goal.target;
                const closestProgress = closest.saved / closest.target;

                return goalProgress > closestProgress ? goal : closest;
            });

            nextMilestoneElement.textContent =
                `${nextGoal.name}: ${formatMoney(nextGoal.target)}`;
        }
    }
}

// Display all savings goals
function displaySavingsGoals() {
    if (!savingsGoalList) return;

    savingsGoalList.innerHTML = "";

    if (savingsGoals.length === 0) {
        const message = document.createElement("p");
        message.textContent =
            "You haven't created any savings goals yet. Create one above to get started!";

        savingsGoalList.appendChild(message);
        updateSavingsSummary();
        return;
    }

    savingsGoals.forEach(goal => {
        const saved = Number(goal.saved) || 0;
        const target = Number(goal.target) || 0;

        const percentage = target > 0
            ? Math.min((saved / target) * 100, 100)
            : 0;

        const completed = saved >= target;

        const card = document.createElement("div");
        card.className = "card p-3 mb-3";

        // Goal title
        const heading = document.createElement("h4");
        heading.textContent = goal.name;

        // Goal date
        const dateText = document.createElement("p");

        dateText.textContent = goal.date
            ? `Target date: ${goal.date}`
            : "No target date set";

        // Saved amount
        const amountText = document.createElement("p");
        amountText.textContent =
            `${formatMoney(saved)} saved out of ${formatMoney(target)}`;

        // Progress bar
        const progressContainer = document.createElement("div");
        progressContainer.className = "progress mb-2";
        progressContainer.setAttribute("role", "progressbar");
        progressContainer.setAttribute(
            "aria-label",
            `Progress for ${goal.name}`
        );
        progressContainer.setAttribute("aria-valuenow", Math.round(percentage));
        progressContainer.setAttribute("aria-valuemin", "0");
        progressContainer.setAttribute("aria-valuemax", "100");

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${Math.round(percentage)}%`;

        progressContainer.appendChild(progressBar);

        // Completion message
        const status = document.createElement("p");

        if (completed) {
            status.textContent = "Goal completed! Congratulations!";
        } else {
            status.textContent =
                `${formatMoney(target - saved)} left to reach your goal.`;
        }

        // Deposit form
        const depositForm = document.createElement("form");
        depositForm.className = "d-flex flex-wrap gap-2 mb-2";
        depositForm.dataset.goalId = goal.id;

        const depositInput = document.createElement("input");
        depositInput.type = "number";
        depositInput.min = "0.01";
        depositInput.step = "0.01";
        depositInput.placeholder = "Deposit amount";
        depositInput.className = "form-control";
        depositInput.setAttribute(
            "aria-label",
            `Deposit amount for ${goal.name}`
        );
        depositInput.required = true;

        const depositButton = document.createElement("button");
        depositButton.type = "submit";
        depositButton.className = "btn btn-primary";
        depositButton.textContent = "Add Deposit";

        depositForm.append(depositInput, depositButton);

        // Delete goal button
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-outline-danger";
        deleteButton.textContent = "Delete Goal";
        deleteButton.dataset.deleteGoal = goal.id;

        card.append(
            heading,
            dateText,
            amountText,
            progressContainer,
            status
        );

        if (!completed) {
            card.appendChild(depositForm);
        }

        card.appendChild(deleteButton);
        savingsGoalList.appendChild(card);
    });

    updateSavingsSummary();
}

// Create a new savings goal
if (goalForm) {
    goalForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("goalName").value.trim();
        const target = Number(document.getElementById("targetAmount").value);
        const date = document.getElementById("targetDate").value;

        if (!name || !Number.isFinite(target) || target <= 0) {
            alert("Please enter a valid goal name and target amount.");
            return;
        }

        const newGoal = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            name: name,
            target: target,
            saved: 0,
            date: date
        };

        savingsGoals.push(newGoal);

        saveSavingsGoals();
        displaySavingsGoals();

        goalForm.reset();
    });
}

// Add deposits and delete goals
if (savingsGoalList) {
    savingsGoalList.addEventListener("submit", function (event) {
        const form = event.target.closest("form[data-goal-id]");
        if (!form) return;

        event.preventDefault();

        const goal = savingsGoals.find(
            item => item.id === form.dataset.goalId
        );

        if (!goal) return;

        const depositInput = form.querySelector("input");
        const deposit = Number(depositInput.value);

        if (!Number.isFinite(deposit) || deposit <= 0) {
            alert("Please enter a deposit greater than zero.");
            return;
        }

        goal.saved = Number(goal.saved) + deposit;

        saveSavingsGoals();
        displaySavingsGoals();
    });

    savingsGoalList.addEventListener("click", function (event) {
        const button = event.target.closest("[data-delete-goal]");
        if (!button) return;

        const goalId = button.dataset.deleteGoal;

        if (!confirm("Are you sure you want to delete this savings goal?")) {
            return;
        }

        savingsGoals = savingsGoals.filter(
            goal => goal.id !== goalId
        );

        saveSavingsGoals();
        displaySavingsGoals();
    });
}

// Load savings goals when the page opens
displaySavingsGoals();
