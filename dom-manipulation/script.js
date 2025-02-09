const quotes = [
  {
    category: "Love",
    text: "To love is to be self",
  },
];

const addNewQuotes = document.getElementById("quoteDisplay");
function displayRandomQuotes() {
  const randomQuote = Math.floor(Math.random() * quotes.length);

  if (quotes[randomQuote]) {
    addNewQuotes.innerHTML = `${quotes[randomQuote].text}: ${quotes[randomQuote].category}`;
  }
}

function showRandomQuote() {
  displayRandomQuotes();
}

const newQuoteBtn = document.getElementById("newQuote");
newQuoteBtn.addEventListener("click", showRandomQuote);
function createAddQuoteForm() {}

const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

function addQuote() {
  const category = newQuoteCategory.value.trim();
  const text = newQuoteText.value.trim();

  if (!category || !text) {
    alert("Enter both text and category!");
    return; // Exit function early to avoid errors
  } else {
    const newQuote = {
      category: category,
      text: text,
    };

    quotes.push(newQuote); // Add new quote to array

    // Clear input fields
    newQuoteCategory.value = "";
    newQuoteText.value = "";

    localStorage.setItem(newQuote);

    alert("Quote added successfully!");
    const p = document.createElement(`p`);
    p.innerText = Object.parse(newQuote);
    addNewQuotes.appendChild(p);
  }
}
