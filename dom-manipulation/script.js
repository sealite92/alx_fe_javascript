// ===== OLD CODE START =====

// Retrieve stored quotes from localStorage
const storedQuotes = localStorage.getItem("quotes");
const quotes = storedQuotes
  ? JSON.parse(storedQuotes)
  : [{ category: "Love", text: "To love is to be self" }];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// Function to save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to display a random quote
function displayRandomQuotes() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `${selectedQuote.text} - ${selectedQuote.category}`;

  // Store last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(selectedQuote));
}

// Placeholder function for additional features
function showRandomQuote() {
  console.log("showRandomQuote() was called but not implemented.");
}

function createAddQuoteForm() {
  console.log("createAddQuoteForm() was called but not implemented.");
}

// Event listener for displaying a random quote
document
  .getElementById("newQuote")
  .addEventListener("click", displayRandomQuotes);

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Enter both text and category!");
    return;
  }

  const newQuote = { category: newQuoteCategory, text: newQuoteText };

  quotes.push(newQuote);
  saveQuotes(); // Save to local storage

  updateCategoryFilter(); // Update category dropdown dynamically

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// Function to export quotes as JSON
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        updateCategoryFilter(); // Update categories
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON file format.");
      }
    } catch (error) {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to populate category filter
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];
  categoryFilter.textContent = "";

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
  }
}

function updateCategoryFilter() {
  populateCategories();
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayFilteredQuotes();
}

function getFilteredQuotes() {
  const selectedCategory = categoryFilter.value;
  return selectedCategory === "all"
    ? quotes
    : quotes.filter((q) => q.category === selectedCategory);
}

// Function to display filtered quotes
function displayFilteredQuotes() {
  quoteDisplay.innerHTML = "";
  const filteredQuotes = getFilteredQuotes();

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available in this category.";
    return;
  }

  filteredQuotes.forEach((quote) => {
    const p = document.createElement("p");
    p.innerText = `${quote.text} - ${quote.category}`;
    quoteDisplay.appendChild(p);
  });
}

// Restore last selected category and populate the dropdown
populateCategories();
filterQuotes(); // Apply filtering on page load

// Restore last displayed quote from sessionStorage
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const parsedQuote = JSON.parse(lastQuote);
  quoteDisplay.innerHTML = `${parsedQuote.text} - ${parsedQuote.category}`;
}

// ===== OLD CODE END =====

// ===== NEW CODE: SERVER SYNC & CONFLICT RESOLUTION =====

// Mock API URL for fetching quotes
const serverUrl = "https://jsonplaceholder.typicode.com/posts";

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverUrl);
    if (!response.ok) throw new Error("Failed to fetch quotes from server");

    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map((item) => ({
      category: "General",
      text: item.title,
    }));

    // Resolve conflicts
    await resolveDataConflicts(serverQuotes);
  } catch (error) {
    console.error("Error fetching data from server:", error);
  }
}

// Function to resolve data conflicts
async function resolveDataConflicts(serverQuotes) {
  const localQuoteTexts = new Set(quotes.map((q) => q.text));
  let newQuotesAdded = false;

  serverQuotes.forEach((serverQuote) => {
    if (!localQuoteTexts.has(serverQuote.text)) {
      quotes.push(serverQuote);
      newQuotesAdded = true;
    }
  });

  if (newQuotesAdded) {
    saveQuotes();
    updateCategoryFilter();
    showNotification("New quotes added from the server!");
  }
}

// Function to show notifications
function showNotification(message) {
  const notification = document.createElement("div");
  notification.innerText = message;
  notification.style.backgroundColor = "#f8d7da";
  notification.style.color = "#721c24";
  notification.style.padding = "10px";
  notification.style.marginTop = "10px";
  notification.style.borderRadius = "5px";
  notification.style.fontWeight = "bold";
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 5000);
}

// Periodically fetch new quotes from the server every 10 seconds
setInterval(fetchQuotesFromServer, 10000);
