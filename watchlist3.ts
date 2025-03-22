<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>suza</title>
  <title>suza</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css">
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <style>
    body {
      background: #000;
      color: white;
      font-family: 'Poppins', sans-serif;
    }
    .container {
      margin-top: 50px;
    }
    h2 {
      text-align: center;
      font-weight: bold;
      text-shadow: 0px 0px 10px cyan;
    }
    .card {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 10px;
      color: white;
      text-align: center;
      transition: all 0.3s ease-in-out;
      box-shadow: 0px 0px 10px rgba(0, 255, 255, 0.2);
    }
    .card:hover {
      transform: scale(1.05);
      box-shadow: 0px 0px 15px cyan;
    }
    .card img {
      height: 150px;
      width: 100%;
      object-fit: cover;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      cursor: pointer;
    }
    .remove-btn {
      background: #ff1744;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 5px;
      transition: 0.3s ease;
      font-weight: bold;
    }
    .remove-btn:hover {
      background: #d50000;
    }
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
    .nav-link.active {
  color: cyan;
  font-weight: bold;
     }
  </style>
</head>
<body>
  <div class="container">
    <h2>🎬 My Watchlist</h2>
    <!-- Har row me 3 cards show karne ke liye "col-4" ka use hua hai -->
    <div id="watchlist-container" class="row g-2"></div>
  </div>
  
  <script>
    function loadWatchlist() {
      const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
      const container = document.querySelector("#watchlist-container");
      container.innerHTML = "";

      if (watchlist.length === 0) {
        container.innerHTML =
          "<p class='text-center text-warning fs-4'>Your watchlist is empty! 📭</p>";
        return;
      }

      watchlist.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("col-4");

        const shortTitle =
          item.title && item.title.length > 15
            ? item.title.substring(0, 15) + "..."
            : item.title || "Unknown";

        card.innerHTML = `
          <div class="card shadow-sm">
            <img src="${item.poster || 'no-image.jpg'}" 
                 alt="${item.title || 'Unknown Title'}" 
                 class="movie-poster">
            <div class="card-body p-1">
              <button class="remove-btn"><i class="bi bi-x-circle"></i></button>
            </div>
          </div>
          <small class="d-block text-center text-white mt-1">${shortTitle} (${item.releaseYear || "N/A"})</small>
        `;

        card.querySelector(".movie-poster").addEventListener("click", () => {
          openWatchPage(item);
        });

        card.querySelector(".remove-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          removeItem(item.title);
        });

        container.appendChild(card);
      });
    }

    function removeItem(title) {
      let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
      watchlist = watchlist.filter(item => item.title !== title);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      loadWatchlist();
    }

    function openWatchPage(movie) {
      localStorage.setItem("selectedMovie", JSON.stringify(movie));
      window.location.href = "watch.html";
    }

    document.addEventListener("DOMContentLoaded", loadWatchlist);

        
      // Wait until the DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Get the current file name from the URL (default to home.html if empty)
    var path = window.location.pathname.split("/").pop();
    if (path === '') {
      path = 'watchlist.html';
    }
    
    // Select all nav links inside the navbar
    var navLinks = document.querySelectorAll('nav.navbar .nav-link');
    
    // Loop through each nav link and add active class if href matches current path
    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href === path) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
    
    
    
  </script>
  
  <nav class="navbar navbar-dark fixed-bottom">
    <div class="container-fluid d-flex justify-content-around">
      <a href="home.html" class="nav-link"><i class="bi bi-house-door-fill"></i></a>
      <a href="search.html" class="nav-link"><i class="bi bi-search"></i></a>
      <a href="watchlist.html" class="nav-link"><i class="bi bi-bookmark-fill"></i></a>
      <a href="settings.html" class="nav-link"><i class="bi bi-gear-fill"></i></a>
    </div>
  </nav>
</body>
</html>
