<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Movie & TV Show Home</title>
  
  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"/>
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"/>
  
  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

  <!-- Custom CSS -->
  <style>
    /* Custom Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

    * {
      font-family: 'Poppins', sans-serif;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      scroll-behavior: smooth;
    }

    body.bg-dark {
      background-color: #000;
      color: #fff;
    }

    /* HERO SECTION */
    #hero {
      position: relative;
      height: 70vh;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
      transition: background 0.5s ease;
      overflow: hidden;
    }

    /* Semi-transparent overlay for contrast */
    #hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10;
    }

    /* Hero Content & Animation */
    #hero-content {
      position: relative;
      z-index: 20;
      opacity: 0;
      transform: translateY(30px);
      animation: fadeInUp 1s forwards;
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    #hero-title {
      font-size: 2.8rem;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    #hero-rating {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .hero-btn {
      padding: 12px 25px;
      background: linear-gradient(90deg, #00ffff, #00d4ff);
      color: black;
      font-size: 16px;
      border: none;
      border-radius: 25px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
      font-weight: bold;
      margin-top: 1rem;
    }

    .hero-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
    }

    /* Dot Indicators */
    #hero-dots {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 8px;
    }
    .hero-dot {
      width: 12px;
      height: 12px;
      background: #ccc;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .hero-dot.active {
      background: cyan;
    }

    /* Horizontal Scroll Sections (for additional content) */
    .horizontal-scroll {
      display: flex;
      overflow-x: auto;
      padding: 10px 0;
      gap: 12px;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }
    .horizontal-scroll::-webkit-scrollbar {
      display: none;
    }
    .scroll-item {
      flex: 0 0 auto;
      width: 150px;
      scroll-snap-align: center;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    .scroll-item img {
      width: 100%;
      border-radius: 8px;
      transition: transform 0.3s ease;
    }
    .scroll-item:hover {
      transform: scale(1.1);
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

<body class="bg-dark text-light">

  <!-- HERO SECTION -->
  <div id="hero">
    <div id="hero-overlay"></div>
    <div id="hero-content">
      <h1 id="hero-title">Movie Title</h1>
      <div id="hero-rating">Rating: N/A</div>
      <button class="hero-btn" id="watch-hero">Watch Now</button>
      <!-- Dot indicators container -->
      <div id="hero-dots"></div>
    </div>
  </div>

  <!-- MAIN CONTENT (Horizontal Scroll Sections) -->
  <div class="container mt-4">
    <h3>Movies</h3>
    <div class="horizontal-scroll" id="movies-scroll"></div>

    <h3>Anime</h3>
    <div class="horizontal-scroll" id="anime-scroll"></div>

    <h3>Web Series</h3>
    <div class="horizontal-scroll" id="web-series-scroll"></div>

    <h3>TV Shows</h3>
    <div class="horizontal-scroll" id="tv-shows-scroll"></div>
  </div>

  <!-- BOTTOM NAVIGATION BAR -->
  <nav class="navbar navbar-dark fixed-bottom">
    <div class="container-fluid d-flex justify-content-around">
      <a href="home.html" class="nav-link"><i class="bi bi-house-door-fill"></i><br></a>
      <a href="search.html" class="nav-link"><i class="bi bi-search"></i><br></a>
      <a href="watchlist.html" class="nav-link"><i class="bi bi-bookmark-fill"></i><br></a>
      <a href="settings.html" class="nav-link"><i class="bi bi-gear-fill"></i><br></a>
    </div>
  </nav>

  <!-- SCRIPTS -->
  <script>
    const API_KEY = "245f8617"; // Replace with your OMDb API Key if needed

    let heroMovies = [];  // Array to store full movie details for hero carousel
    let heroIndex = 0;    // Current index in the heroMovies array
    let heroInterval;     // Interval reference

    // Fetch movies for the hero carousel
    async function fetchHeroMovies() {
      const categories = ["movie", "series", "anime", "bollywood", "hollywood", "korean", "chinese", "Hindi", "Tamil", "urdu", "Bhojpuri", "cultural", "solo leveling", "I'm getting married", "one piece", "Dr stone", "Chhava"];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      try {
        const response = await fetch(`https://www.omdbapi.com/?s=${randomCategory}&apikey=${API_KEY}`);
        const data = await response.json();
        if (data.Search && data.Search.length > 0) {
          // Limit to first 5 items for the carousel
          const moviesToFetch = data.Search.slice(0, 5);
          // Fetch full details (including rating) for each movie concurrently
          const detailsPromises = moviesToFetch.map(movie =>
            fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}&plot=short`).then(res => res.json())
          );
          heroMovies = await Promise.all(detailsPromises);
          // Start the carousel
          heroIndex = 0;
          showHeroMovie(heroIndex);
          // Build dot indicators
          buildHeroDots();
          // Clear previous interval if exists
          if (heroInterval) clearInterval(heroInterval);
          heroInterval = setInterval(() => {
            heroIndex = (heroIndex + 1) % heroMovies.length;
            showHeroMovie(heroIndex);
          }, 5000); // Change movie every 5 seconds
        }
      } catch (error) {
        console.error("Error fetching hero movies:", error);
      }
    }

    // Update the dot indicators to reflect the active slide
    function buildHeroDots() {
      const dotsContainer = document.getElementById("hero-dots");
      dotsContainer.innerHTML = "";
      heroMovies.forEach((movie, idx) => {
        const dot = document.createElement("div");
        dot.classList.add("hero-dot");
        if (idx === heroIndex) dot.classList.add("active");
        dot.addEventListener("click", () => {
          heroIndex = idx;
          showHeroMovie(heroIndex);
          // Reset the interval when a dot is clicked
          clearInterval(heroInterval);
          heroInterval = setInterval(() => {
            heroIndex = (heroIndex + 1) % heroMovies.length;
            showHeroMovie(heroIndex);
          }, 5000);
        });
        dotsContainer.appendChild(dot);
      });
    }

    // Update hero section with movie name, rating, background image, and update dot indicators
    function showHeroMovie(index) {
      const movie = heroMovies[index];
      if (!movie) return;
      // Update background image (fallback if not available)
      if (movie.Poster && movie.Poster !== "N/A") {
        document.getElementById("hero").style.backgroundImage = `url(${movie.Poster})`;
      } else {
        document.getElementById("hero").style.backgroundImage = "url('fallback-image.jpg')";
      }
      // Update movie title and rating
      document.getElementById("hero-title").textContent = movie.Title || "Unknown Title";
      document.getElementById("hero-rating").textContent = `Rating: ${movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : "N/A"}`;
      // "Watch Now" button navigates to watch page with the movie title
      document.getElementById("watch-hero").onclick = () => {
        window.location.href = `watch.html?title=${encodeURIComponent(movie.Title)}`;
      };
      // Update dot indicators active state
      const dots = document.querySelectorAll(".hero-dot");
      dots.forEach((dot, idx) => {
        if (idx === index) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
      // Reset animation for hero content for a smooth transition
      const heroContent = document.getElementById("hero-content");
      heroContent.style.animation = 'none';
      setTimeout(() => heroContent.style.animation = '', 50);
    }

    // Horizontal scroll sections update (Movies, Web Series, TV Shows)
    async function updateSection(sectionId, query) {
      try {
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
        const data = await response.json();
        let htmlContent = "";
        if (data.Search) {
          data.Search.slice(0, 10).forEach(item => {
            let shortTitle = item.Title.length > 15 ? item.Title.substring(0, 15) + "..." : item.Title;
            htmlContent += `
              <div class="scroll-item" onclick="openWatchPage('${item.Title}')">
                <img src="${item.Poster}" alt="${item.Title}" title="${item.Title}">
                <p style="font-size: 12px; text-align: center;">${shortTitle}</p>
              </div>`;
          });
        }
        document.getElementById(sectionId).innerHTML = htmlContent;
      } catch (error) {
        console.error(`Error updating section ${sectionId}:`, error);
      }
    }

    // Anime section update (placeholder example)
    async function updateAnimeSection() {
      try {
        const url = 'https://myanimelist.p.rapidapi.com/v2/manga/genres';
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '3fdc1fd0afmshc378615ce550f79p1ab528jsn36eb3459f082',
            'x-rapidapi-host': 'myanimelist.p.rapidapi.com'
          }
        };
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Anime data example:", data);
        if (!data || !data.data || !Array.isArray(data.data)) {
          console.error("Invalid anime data format:", data);
          return;
        }
        const animeScroll = document.getElementById("anime-scroll");
        if (!animeScroll) {
          console.error("Element with ID 'anime-scroll' not found!");
          return;
        }
        animeScroll.innerHTML = data.data.slice(0, 10).map(anime => {
          const title = anime.title || "Unknown";
          const shortTitle = title.length > 15 ? title.substring(0, 15) + "..." : title;
          const imageUrl = anime.images?.jpg?.image_url || "fallback-image.jpg";
          return `
            <div class="scroll-item" onclick="openWatchPage('${encodeURIComponent(title)}')">
              <img src="${imageUrl}" alt="${title}" title="${title}">
              <p style="font-size: 12px; text-align: center;">${shortTitle}</p>
            </div>`;
        }).join("");
      } catch (error) {
        console.error("Anime data fetch error:", error);
      }
    }

    // Open watch page function
    function openWatchPage(title) {
      window.location.href = `watch.html?title=${encodeURIComponent(title)}`;
    }

    // INITIAL CALLS
    fetchHeroMovies();                     // Fetch and start hero carousel
    updateSection("movies-scroll", "movie"); // Movies
    updateAnimeSection();                    // Anime
    updateSection("web-series-scroll", "series"); // Web Series
    updateSection("tv-shows-scroll", "drama");      // TV Shows

    // Update horizontal sections every 1 minute
    setInterval(() => {
      updateSection("movies-scroll", "movie");
      updateSection("web-series-scroll", "series");
      updateSection("tv-shows-scroll", "drama");
    }, 60000);
  </script>
</body>
</html>
