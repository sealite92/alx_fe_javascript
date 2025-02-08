const quotes = [
  {
    category: "",
    text: "",
  },
];

function displayRandomQuotes() {
  const randomQuote = Math.floor(Math.random() * quotes.length);

  const addNewQuotes = document.getElementById("quoteDisplay");
  if (quotes[randomQuote]) {
    addNewQuotes.innerHTML = `${quotes[randomQuote].text}: ${quotes[randomQuote].category}`;
  }
}

function showRandomQuote() {}

const newQuoteBtn = document
  .getElementById("newQuote")
  .addEventListener("click", displayRandomQuotes);
function createAddQuoteForm() {}

const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

function addQuote() {
  const category = newQuoteCategory.value.trim();
  const text = newQuoteText.value.trim();

  if (!category || !text) {
    alert("enter text and category");
  } else {
    const newQuote = {
      category: category,
      text: text,
    };

    quotes.push(newQuote);

    newQuoteCategory.value = "";
    newQuoteText.value = "";
  }
}
