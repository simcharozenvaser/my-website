async function fetchQuote() {
  try {
    const response = await fetch("https://api.quotable.io/random");

    const data = await response.json();
    const { content, author } = data;
    return { content, author };

  } catch (error) {
    console.error("Error fetching quote:", error);
    return { content: "Could not load quote.", author: "" };
  }
}

function displayQuote(content, author) {
  document.getElementById("quote-text").textContent = `"${content}"`;
  document.getElementById("quote-author").textContent = `— ${author}`;
}

export async function loadQuote() {
  const savedQuote = localStorage.getItem("dailyQuote");
  const savedDate = localStorage.getItem("quoteDate");

  const today = new Date().toDateString();

  console.log("Saved Quote:", savedQuote);
  console.log("Saved Date:", savedDate);
  console.log("Today's Date:", today);

  if (savedQuote && savedDate === today) {
    const { content, author } = JSON.parse(savedQuote);
    displayQuote(content, author);
  } else {
    const quote = await fetchQuote();

    displayQuote(quote.content, quote.author);

    localStorage.setItem("dailyQuote", JSON.stringify(quote));
    localStorage.setItem("quoteDate", today);
  }
}
