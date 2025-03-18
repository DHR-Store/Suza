document.addEventListener("DOMContentLoaded", () => {
  loadSearchHistory();
});

const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const searchHistoryList = document.getElementById("searchHistory") as HTMLUListElement;
const suggestionsList = document.getElementById("suggestions") as HTMLUListElement;
const API_KEY = "YOUR_OMDB_API_KEY"; // Replace with your OMDB API key

// Perform search and store in history
function performSearch(): void {
  const query = searchInput.value.trim();
  if (query.length === 0) return;

  // Store search history
  let history: string[] = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  if (!history.includes(query)) {
    history.push(query);
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }

  // Redirect to results page
  window.location.href = `results.html?query=${encodeURIComponent(query)}`;
}

// Load search history
function loadSearchHistory(): void {
  let history: string[] = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  searchHistoryList.innerHTML = "";

  if (history.length === 0) {
    searchHistoryList.innerHTML = "<li class='list-group-item text-center'>No Search History</li>";
    return;
  }

  history.forEach((item) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    li.textContent = item;
    li.addEventListener("click", () => {
      searchInput.value = item;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.classList.add("btn", "btn-sm", "btn-danger");
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteHistoryItem(item);
    });

    li.appendChild(deleteBtn);
    searchHistoryList.appendChild(li);
  });
}

// Clear search history
function clearHistory(): void {
  localStorage.removeItem("searchHistory");
  loadSearchHistory();
}

// Delete a single history item
function deleteHistoryItem(item: string): void {
  let history: string[] = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  history = history.filter((entry) => entry !== item);
  localStorage.setItem("searchHistory", JSON.stringify(history));
  loadSearchHistory();
}

// Fetch live suggestions using the OMDB API
async function showSuggestions(): Promise<void> {
  const query = searchInput.value.trim();

  if (query.length === 0) {
    suggestionsList.innerHTML = "";
    suggestionsList.style.display = "none";
    return;
  }

  try {
    const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
    const data = await response.json();

    suggestionsList.innerHTML = "";
    if (data.Search && data.Search.length > 0) {
      data.Search.slice(0, 5).forEach((item: { Title: string }) => {
        const li = document.createElement("li");
        li.classList.add("list-group-item", "suggestion-item");
        li.textContent = item.Title;
        li.addEventListener("click", () => {
          searchInput.value = item.Title;
          suggestionsList.innerHTML = "";
          suggestionsList.style.display = "none";
          performSearch();
        });

        suggestionsList.appendChild(li);
      });
      suggestionsList.style.display = "block";
    } else {
      suggestionsList.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching suggestions", error);
    suggestionsList.style.display = "none";
  }
}

// Listen for input changes to fetch live suggestions
searchInput.addEventListener("input", showSuggestions);

// Hide suggestions when clicking outside the search box
document.addEventListener("click", (event) => {
  if (!(event.target as HTMLElement).closest(".search-box")) {
    suggestionsList.innerHTML = "";
    suggestionsList.style.display = "none";
  }
});
