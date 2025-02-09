const storedQuotes = localStorage.getItem("quotes");
const quotes = storedQuotes
  ? JSON.parse(storedQuotes)
  : [{ category: "Love", text: "To love is to be self" }];

const quoteDisplay = document.getElementById("quoteDisplay");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function displayRandomQuotes() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];

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

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");

  // Display new quote on the page
  const p = document.createElement("p");
  p.innerText = `"${newQuote.text}" - ${newQuote.category}`;
  quoteDisplay.appendChild(p);
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

// Restore last displayed quote from session storage
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const parsedQuote = JSON.parse(lastQuote);
  quoteDisplay.innerHTML = `"${parsedQuote.text}" - ${parsedQuote.category}`;
}
