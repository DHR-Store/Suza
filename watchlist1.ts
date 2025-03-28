<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>My Watchlist</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
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
      height: 220px;
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
    /* Navbar */
    nav.navbar {
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      border-top: 1px solid #444;
      padding: 10px 0;
      font-size: 15px;
      height: 60px;
      z-index: 1000;
      position: fixed;
      bottom: 0;
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
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
  <div class="container">
    <h2>🎬 My Watchlist</h2>
    <div id="watchlist-container" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4"></div>
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
    card.classList.add("col");

    // Use the full title for storage but shorten it for display if necessary
    const shortTitle =
      item.title && item.title.length > 15
        ? item.title.substring(0, 15) + "..."
        : item.title || "Unknown";

    card.innerHTML = `
      <div class="card shadow-sm">
        <img src="${item.poster || 'no-image.jpg'}" 
             alt="${item.title || 'Unknown Title'}" 
             class="movie-poster" style="cursor:pointer;">
        <div class="card-body">
          <h6 class="card-title">${shortTitle} (${item.releaseYear || "N/A"})</h6>
          <button class="remove-btn">❌ Remove</button>
        </div>
      </div>
    `;

    // Clicking the poster stores the full movie data and navigates to watch.html
    card.querySelector(".movie-poster").addEventListener("click", () => {
      openWatchPage(item);
    });

    // Prevent propagation in case the remove button is clicked
    card.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      removeItem(item.title);
    });

    container.appendChild(card);
  });
}

// Remove the selected movie from the watchlist
function removeItem(title) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter(item => item.title !== title);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  loadWatchlist();
}

// Function to open the watch page and update the stored movie
function openWatchPage(movie) {
  // Save the full movie object so you can access all its data in watch.html
  localStorage.setItem("selectedMovie", JSON.stringify(movie));
  window.location.href = "watch.html"; // Redirect to watch page
}

// Load the watchlist when the page is ready
document.addEventListener("DOMContentLoaded", loadWatchlist);

  </script>
  
  <!-- Bottom Navigation Bar -->
  <nav class="navbar navbar-dark fixed-bottom">
    <div class="container-fluid d-flex justify-content-around">
      <a href="home.html" class="nav-link"><i class="bi bi-house-door-fill"></i><br></a>
      <a href="search.html" class="nav-link"><i class="bi bi-search"></i><br></a>
      <a href="watchlist.html" class="nav-link"><i class="bi bi-bookmark-fill"></i><br></a>
      <a href="settings.html" class="nav-link"><i class="bi bi-gear-fill"></i><br></a>
    </div>
  </nav>
</body>
</html>
