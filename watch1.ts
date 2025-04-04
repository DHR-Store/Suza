<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Watch Now</title>
  
  <!-- Bootstrap & Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://www.youtube.com/iframe_api?key=AIzaSyBTpP0-7enNqizPGetb_2G5Km_pKdguNF8"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background-color: #121212;
      color: white;
      text-align: center;
      margin: 0;
      padding: 0;
    }
    
    /* Poster Section */
    .poster-container {
      position: relative;
      width: 100%;
      height: 300px;  /* Increased height for better poster display */
      overflow: hidden;
    }
    
    .poster-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    /* Gradient Overlay for Dark-to-Light (Dark White) Effect */
    .poster-container::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      /* Adjust gradient direction and colors as needed */
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.7));
      pointer-events: none;
      z-index: 2;
    }
    
button {
    padding: 8px 16px;
    font-size: 14px;
    background: #ff5733;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 50px;
}

button:hover {
    background: #e64a19;
}

    /* Icons on Poster */
    .icon-container {
      position: absolute;
      top: 10px;
      right: 15px;
      display: flex;
      gap: 10px;
      z-index: 3;
    }
    
    .icon-container i {
      font-size: 38px;
      cursor: pointer;
      color: white;
      transition: 0.3s;
    }
    
    .icon-container i:hover {
      color: cyan;
      transform: scale(1.2);
    }
    
    /* Movie Details */
    .movie-details {
      padding: 15px;
      text-align: left;
    }
    
    .movie-title {
      font-size: 24px;
      font-weight: 600;
    }
    
    .info-box {
      display: inline-block;
      background: #222;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 14px;
      margin: 5px;
    }
    
    .cast {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 10px;
    }
    
    .cast span {
      background: #1f1f1f;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 14px;
    }
    
    /* Video Section */
    .video-container {
      margin: 15px 0;
    }
    
    iframe {
      width: 95%;
      height: 450px;
      border-radius: 10px;
    }
    
/* Container for Seasons & Episodes */
.season-container {
  margin: 20px auto;
  width: 90%;
  max-width: 800px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* The season list inside the container */
#season-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Season buttons */
.season-btn {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.season-btn:hover {
  background-color: #0056b3;
}

/* Episodes container displayed below the season buttons */
#episodes-container {
  margin-top: 15px;
  background-color: #222;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
}

/* Each episode item */
.episode-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

/* Watch button for episodes */
.episode-watch-btn {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.3s;
}
.episode-watch-btn:hover {
  background-color: #218838;
}

/* Circular download button */
.download-btn {
  background-color: #ffc107;
  border: none;
  color: #000;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  transition: background-color 0.3s;
}
.download-btn:hover {
  background-color: #e0a800;
}
         /* Bottom Navigation Bar */
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
      transition: transform 0.3s ease;
    }
    .nav-link {
      text-align: center;
      color: white;
      transition: transform 0.3s ease, color 0.3s ease;
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
  
  <!-- Poster Section -->
  <div class="poster-container">
    <img id="poster" src="your-poster-image.jpg" alt="Movie Poster">
    <div class="icon-container">
      <i class="bi bi-bookmark-fill" title="Add to Watchlist"></i>
      <i class="bi bi-play-circle-fill" title="Watch Trailer"></i>
    </div>
  </div>
  
  <!-- Movie Details -->
  <div class="movie-details">
    <h1 class="movie-title" id="show-title">Movie Title</h1>
    <span class="info-box" id="release-year">2025</span>
    <span class="info-box" id="duration">120 min</span>
    <span class="info-box" id="genre1">Action</span>
    <span class="info-box" id="genre2">Adventure</span>
    
    <h3>Cast</h3>
    <div class="cast" id="cast-list">
      <span>Actor 1</span>
      <span>Actor 2</span>
      <span>Actor 3</span>
    </div>
    
    <h3>Synopsis</h3>
    <p id="synopsis">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
  </div>
  
  <!-- Video Section -->
    <div class="video-container">
        <iframe id="videoPlayer" allowfullscreen></iframe>
        <button id="fullscreen-btn">⛶ Full Screen</button>
    </div>
  
  <!-- Seasons & Episodes -->
  <div class="season-container">
    <h3>Seasons & Episodes</h3>
    <div id="season-list">
      <!-- Season and episode details go here -->
    </div>
  </div>
  
    <!-- BOTTOM NAVIGATION BAR -->
  <nav class="navbar navbar-dark fixed-bottom" id="bottom-nav">
    <div class="container-fluid d-flex justify-content-around">
      <a href="home.html" class="nav-link"><i class="bi bi-house-door-fill"></i><br></a>
      <a href="search.html" class="nav-link"><i class="bi bi-search"></i><br></a>
      <a href="watchlist.html" class="nav-link"><i class="bi bi-bookmark-fill"></i><br></a>
      <a href="settings.html" class="nav-link"><i class="bi bi-gear-fill"></i><br></a>
    </div>
  </nav>
  
  <!-- Include the YouTube IFrame API with your API key -->

  
  <!-- JavaScript -->
  <script src="watch.js"></script>
</body>
</html>
