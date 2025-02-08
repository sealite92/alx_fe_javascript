const quotes = [
  {
    category: "text",
  },
];
function displayRandomQuotes() {
  const randomQuote = Math.floor(Math.random() * quotes.length);

  const addNewQuotes = document.getElementById("quoteDisplay");
  addNewQuotes.innerHTML = quotes[randomQuote];
}
const newQuoteBtn = document
  .getElementById("newQuote")
  .addEventListener("click", displayRandomQuotes);
function showRandomQuote() {}
function createAddQuoteForm() {}
