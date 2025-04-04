<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Search Page</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" />
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <style>
    body {
      background-color: #121212;
      color: #ffffff;
    }
    .search-box {
      max-width: 500px;
      margin: auto;
      background: #222;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.2);
      position: relative; /* For suggestion dropdown positioning */
    }
    .list-group-item {
      background-color: #333;
      color: white;
      border: none;
      transition: all 0.3s ease-in-out;
    }
    .list-group-item:hover {
      background-color: #444;
      transform: scale(1.05);
      cursor: pointer;
    }
    .clear-btn {
      background-color: red;
      color: white;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 14px;
      border-radius: 5px;
      transition: all 0.3s;
    }
    .clear-btn:hover {
      background-color: darkred;
    }
    /* Suggestion dropdown styling */
    #suggestions {
      position: center;
      top: 50px; /* Adjust based on your input height */
      width: 400px;
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
      display: none;
    }
    #suggestions .suggestion-item {
      cursor: pointer;
      background-color: #333;
      padding: 10px;
    }
    #suggestions .suggestion-item:hover {
      background-color: #444;
    }
    /* Custom Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
    /* Navbar */
    nav.navbar {
  background: transparent;
  backdrop-filter: blur(8px);
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #444;
}
    .nav-link {
      text-align: center;
      color: white;
      transition: all 0.3s ease-in-out;
      padding: 5px;
      border-radius: 10px;
      font-size: 14px;
    }
    .nav-link i {
      font-size: 24px;
    }
    .nav-link:hover {
      color: cyan;
      transform: scale(1.1);
    }
  </style>
</head>
<body>
  <div class="container mt-5">
    <div class="search-box text-center">
      <h2>Search Movies & TV Shows</h2>
      <div class="input-group my-4">
        <input type="text" id="searchInput" class="form-control" placeholder="Enter name..." autocomplete="off" />
        <button class="btn btn-primary" onclick="performSearch()">Search</button>
      </div>
      <!-- Live suggestions dropdown -->
      <ul id="suggestions" class="list-group"></ul>
      
      <div class="d-flex justify-content-between align-items-center mt-4">
        <h5>Search History</h5>
        <button class="clear-btn" onclick="clearHistory()">Clear History</button>
      </div>
      <ul id="searchHistory" class="list-group mt-2"></ul>
    </div>
  </div>

  <script>
    // Perform search and store in history
    function performSearch() {
      let query = $("#searchInput").val().trim();
      if (query.length === 0) return;

      // Store search history
      let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
      if (!history.includes(query)) {
        history.push(query);
        localStorage.setItem("searchHistory", JSON.stringify(history));
      }
      // Redirect to results page
      window.location.href = `results.html?query=${encodeURIComponent(query)}`;
    }

    // Load search history
    function loadSearchHistory() {
      let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
      let list = $("#searchHistory");
      list.empty();
      
      if (history.length === 0) {
        list.html("<li class='list-group-item text-center'>No Search History</li>");
        return;
      }
      
      history.forEach(item => {
        let li = $("<li></li>")
          .addClass("list-group-item d-flex justify-content-between align-items-center")
          .text(item)
          .click(() => {
            $("#searchInput").val(item);
          });
        let deleteBtn = $("<button></button>")
          .text("X")
          .addClass("btn btn-sm btn-danger")
          .click(e => {
            e.stopPropagation();
            deleteHistoryItem(item);
          });
        li.append(deleteBtn);
        list.append(li);
      });
    }

    // Clear search history
    function clearHistory() {
      localStorage.removeItem("searchHistory");
      loadSearchHistory();
    }

    // Delete a single history item
    function deleteHistoryItem(item) {
      let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
      history = history.filter(entry => entry !== item);
      localStorage.setItem("searchHistory", JSON.stringify(history));
      loadSearchHistory();
    }

    // Fetch live suggestions using the OMDb API
    function showSuggestions() {
      let query = $("#searchInput").val().trim();
      let suggestionBox = $("#suggestions");

      if (query.length === 0) {
        suggestionBox.empty().hide();
        return;
      }
      
      $.ajax({
        url: "https://www.omdbapi.com/",
        data: {
          apikey: "245f8617",  // Replace with your actual OMDb API key
          s: query
        },
        dataType: "json",
        success: function(response) {
          suggestionBox.empty();
          // Check if the response is successful and contains results
          if (response.Response === "True" && response.Search && response.Search.length > 0) {
            // Limit suggestions to the first 5 results
            let suggestions = response.Search.slice(0, 5);
            suggestions.forEach(function(item) {
              let title = item.Title;
              if (title) {
                let li = $("<li></li>")
                  .addClass("list-group-item suggestion-item")
                  .text(title)
                  .click(function() {
                    $("#searchInput").val(title);
                    suggestionBox.empty().hide();
                    performSearch(); // Trigger search on click
                  });
                suggestionBox.append(li);
              }
            });
            suggestionBox.show();
          } else {
            suggestionBox.hide();
          }
        },
        error: function(err) {
          console.error("Error fetching suggestions", err);
          suggestionBox.hide();
        }
      });
    }

    // Listen for input changes to fetch live suggestions
    $("#searchInput").on("input", showSuggestions);

    // Hide suggestions when clicking outside the search box
    $(document).click(function (event) {
      if (!$(event.target).closest(".search-box").length) {
        $("#suggestions").empty().hide();
      }
    });

    // Load search history on page load
    $(document).ready(loadSearchHistory);
  </script>

  <!-- Bottom Navigation Bar -->
  <nav class="navbar navbar-dark fixed-bottom">
    <div class="container-fluid d-flex justify-content-around">
      <a href="home.html" class="nav-link"><i class="bi bi-house-door-fill"></i><br /></a>
      <a href="search.html" class="nav-link"><i class="bi bi-search"></i><br /></a>
      <a href="watchlist.html" class="nav-link"><i class="bi bi-bookmark-fill"></i><br /></a>
      <a href="settings.html" class="nav-link"><i class="bi bi-gear-fill"></i><br /></a>
    </div>
  </nav>
</body>
</html>
