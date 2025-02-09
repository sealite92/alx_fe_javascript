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

// ===== NEW CODE FOR SYNCING, CONFLICT RESOLUTION, AND SERVER INTERACTIONS =====

// Mock API URL for fetching and posting data (using JSONPlaceholder)
const serverUrl = "https://jsonplaceholder.typicode.com/posts";

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

// New syncQuotes function: fetches server data, resolves conflicts,
// and updates local storage. In this conflict resolution, the server’s
// data takes precedence.
async function syncQuotes() {
  try {
    // Fetch data from the server
    const response = await fetch(serverUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch quotes from server");
    }
    const data = await response.json();

    // Map the fetched data to our quote format (using the first 5 items)
    const serverQuotes = data.slice(0, 5).map((item) => ({
      category: "General",
      text: item.title,
    }));

    let conflictsResolved = false;
    // For each server quote, check if it exists locally.
    // If it exists but differs, or if it's new, update/add it.
    serverQuotes.forEach((serverQuote) => {
      const index = quotes.findIndex((q) => q.text === serverQuote.text);
      if (index === -1) {
        // New quote; add to local storage.
        quotes.push(serverQuote);
        conflictsResolved = true;
      } else {
        // Quote exists; update local data to match the server (server takes precedence)
        if (quotes[index].category !== serverQuote.category) {
          quotes[index] = serverQuote;
          conflictsResolved = true;
        }
      }
    });

    // If any changes were made, update local storage and UI.
    if (conflictsResolved) {
      saveQuotes();
      updateCategoryFilter();
      showNotification("Data synced with server and conflicts resolved.");
    } else {
      console.log("No conflicts found; local data is up-to-date with server.");
    }
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// Function to notify the user via UI about updates or resolved conflicts.
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

// OPTIONAL: Manual sync trigger (if a button with id "syncButton" exists)
document.getElementById("syncButton")?.addEventListener("click", syncQuotes);

// Periodically sync with the server every 10 seconds
setInterval(syncQuotes, 10000);
