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


// ==========================================
// BUDGET TRANSACTIONS
// ==========================================

// Find the transaction form
const transactionForm = document.getElementById("transactionForm");

// Load saved transactions, or start with an empty list
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Format numbers as US dollars
function formatMoney(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}

// Save transactions to LocalStorage
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Update the budget summary
function updateBudget() {
    const income = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const expenses = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const balance = income - expenses;

    document.getElementById("income").textContent = formatMoney(income);
    document.getElementById("expenses").textContent = formatMoney(expenses);
    document.getElementById("balance").textContent = formatMoney(balance);
}

// Display transactions in the table
function displayTransactions() {
    const transactionList = document.getElementById("transactionList");

    if (!transactionList) return;

    // Clear the table before rebuilding it
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

    // Show newest transactions first
    [...transactions].reverse().forEach(transaction => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        const descriptionCell = document.createElement("td");
        const categoryCell = document.createElement("td");
        const typeCell = document.createElement("td");
        const amountCell = document.createElement("td");

        dateCell.textContent = transaction.date;
        descriptionCell.textContent = transaction.description;
        categoryCell.textContent = transaction.category;
        typeCell.textContent = transaction.type;
        amountCell.textContent = formatMoney(transaction.amount);

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

// Listen for new transactions
if (transactionForm) {
    transactionForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const amount = Number(document.getElementById("amount").value);
        const type = document.getElementById("type").value;
        const category = document.getElementById("category").value;
        const description = document.getElementById("description").value.trim();
        const date = document.getElementById("date").value;

        // Make sure the amount is valid
        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Please enter an amount greater than zero.");
            return;
        }

        // Create the new transaction
        const newTransaction = {
            amount: amount,
            type: type,
            category: category,
            description: description,
            date: date
        };

        // Add it to our list
        transactions.push(newTransaction);

        // Save and refresh the dashboard
        saveTransactions();
        updateBudget();
        displayTransactions();

        // Clear the form
        transactionForm.reset();
    });
}

// Load saved data when the page opens
if (transactionForm) {
    updateBudget();
    displayTransactions();
}
