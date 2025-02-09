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

  quoteDisplay.innerHTML = `"${selectedQuote.text}" - ${selectedQuote.category}`;

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

  categoryFilter.innerHTML = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");

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
    p.innerText = `"${quote.text}" - ${quote.category}`;
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
  quoteDisplay.innerHTML = `"${parsedQuote.text}" - ${parsedQuote.category}`;
}
