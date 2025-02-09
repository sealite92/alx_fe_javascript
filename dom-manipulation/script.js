// ===== ORIGINAL CODE (Maintained) =====

// Retrieve stored quotes from localStorage
const storedQuotes = localStorage.getItem("quotes");
const quotes = storedQuotes
  ? JSON.parse(storedQuotes)
  : [{ category: "Love", text: "To love is to be self" }];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function displayRandomQuotes() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `${selectedQuote.text} - ${selectedQuote.category}`;

  // Store last viewed quote in session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(selectedQuote));
}

function showRandomQuote() {
  console.log("showRandomQuote() was called but not implemented.");
}

function createAddQuoteForm() {
  console.log("createAddQuoteForm() was called but not implemented.");
}

document
  .getElementById("newQuote")
  .addEventListener("click", displayRandomQuotes);

async function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Enter both text and category!");
    return;
  }

  const newQuote = { category: newQuoteCategory, text: newQuoteText };

  // Add the new quote locally
  quotes.push(newQuote);
  saveQuotes(); // Save to local storage

  updateCategoryFilter(); // Update category dropdown dynamically

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");

  // NEW: Post the new quote to the server using async/await with POST method
  try {
    await postQuoteToServer(newQuote);
    console.log("Quote posted to server successfully.");
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
}

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

function populateCategories() {
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];
  const categoryFilter = document.getElementById("categoryFilter");

  // Clear existing options
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

// Restore last displayed quote from session storage
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const parsedQuote = JSON.parse(lastQuote);
  quoteDisplay.innerHTML = `${parsedQuote.text} - ${parsedQuote.category}`;
}

// ===== NEW CODE FOR SYNCING, CONFLICT RESOLUTION, & POSTING (Using async/await) =====

// Mock API URL for fetching and posting data
const serverUrl = "https://jsonplaceholder.typicode.com/posts";

// Function to fetch quotes from the server using async/await
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch quotes from server");
    }
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map((item) => ({
      category: "General",
      text: item.title,
    }));

    // Compare server data with local data and resolve conflicts
    await resolveDataConflicts(serverQuotes);
  } catch (error) {
    console.error("Error fetching data from server:", error);
  }
}

// Function to resolve data conflicts by adding only new quotes from the server
async function resolveDataConflicts(serverQuotes) {
  const localQuoteTexts = quotes.map((quote) => quote.text);
  let newQuotesAdded = false;

  serverQuotes.forEach((serverQuote) => {
    if (!localQuoteTexts.includes(serverQuote.text)) {
      quotes.push(serverQuote); // Add new quote from server
      newQuotesAdded = true;
    }
  });

  if (newQuotesAdded) {
    saveQuotes();
    updateCategoryFilter(); // Update categories
    alert("Data updated from the server!");
  }
}

// Function to post a quote to the server using async/await
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quote),
    });
    if (!response.ok) {
      throw new Error("Failed to post quote to server");
    }
    const result = await response.json();
    console.log("Posted quote:", result);
  } catch (error) {
    console.error("Error posting quote:", error);
    throw error;
  }
}

// Periodically fetch new quotes from the server every 5 seconds
setInterval(fetchQuotesFromServer, 5000);

// Function to notify the user about server updates and conflict resolution
function notifyUserOfConflict() {
  const notification = document.createElement("div");
  notification.innerText = "Server data has been updated, resolving conflicts!";
  notification.style.backgroundColor = "#f8d7da";
  notification.style.padding = "10px";
  notification.style.marginTop = "10px";
  notification.style.borderRadius = "5px";
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 5000);
}

// Periodically notify the user every 5 seconds (optional)
setInterval(notifyUserOfConflict, 5000);
