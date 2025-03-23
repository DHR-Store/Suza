// Global variables
let currentImdb = "";          // IMDb id from OMDb
let currentTMDB = "";          // TMDB id (passed in URL for Filmu embed)
let currentMovieTitle = "";
let isSeasonContainerOpen = false;
    // Prevent default right-click/context menu on the entire document
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });

    // Prevent long-press on touch devices from showing image preview
    document.addEventListener('touchstart', function(e) {
      if(e.touches.length > 1) {
        e.preventDefault();
      }
    });


document.addEventListener("DOMContentLoaded", function () {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const showIDParam = urlParams.get("id");
  const tmdbParam = urlParams.get("tmdb"); // New parameter for TMDB id
  const title = decodeURIComponent(urlParams.get("title") || "Sample Movie");
  const type = (urlParams.get("type") || "series").toLowerCase();

  // Set currentTMDB if provided; otherwise, it will be set later from OMDb (if needed)
  if (tmdbParam && tmdbParam !== "null") {
    currentTMDB = tmdbParam;
  }

  // Big poster parameter
  const bigPosterParam = urlParams.get("bigPoster")
    ? decodeURIComponent(urlParams.get("bigPoster"))
    : "";
  const bigPosterURL =
    bigPosterParam && bigPosterParam !== "null"
      ? bigPosterParam
      : "your-big-poster-image.jpg";

  // Small poster parameter
  const smallPosterParam = urlParams.get("poster")
    ? decodeURIComponent(urlParams.get("poster"))
    : "";
  const smallPosterURL =
    smallPosterParam && smallPosterParam !== "null"
      ? smallPosterParam
      : "small-poster.jpg";

  // Update poster elements
  document.getElementById("bigPosterSection").style.backgroundImage = `url('${bigPosterURL}')`;
  document.getElementById("smallPoster").src = smallPosterURL;

  // For anime type, use the anime loader
  if (type === "anime") {
    loadAnimeVideo();
    return;
  }

  // Load details from OMDb for movies and series
  loadMovieDetails(title, function (data) {
    updateShowDetails(data);
    currentImdb = data.imdbID;
    // If TMDB id was not provided in the URL, you might consider falling back to IMDb id (for other providers)
    if (!currentTMDB) {
      currentTMDB = currentImdb;
    }
    
    // For movies (or multi movies) hide season UI
    if (data.Type.toLowerCase() === "movie" || type === "movie" || type === "multi") {
      currentMovieTitle = data.title;
      document.getElementById("season-container-toggle").style.display = "none";
      document.getElementById("season-selector").style.display = "none";
      document.getElementById("episode-buttons-container").innerHTML = `
        <div id="movie-search-container" style="margin-bottom:15px; text-align:center;">
          <input id="movieSearch" type="text" placeholder="Search movie..." value="${data.title}"
            style="padding:8px; font-size:14px; border-radius:4px; border:none; margin-right:5px;">
          <button onclick="searchMovie()" class="episode-watch-btn">Search</button>
        </div>
        <div style="text-align:center;">
          <button class="episode-watch-btn" onclick="loadMovieVideoFromSearch()">Watch ${type === "multi" ? "Multi Movie" : "Movie"}</button>
        </div>
      `;
    } else {
      // For series (TV shows), fetch seasons using the IMDb id
      const lookupID = showIDParam || data.imdbID;
      if (lookupID) {
        fetchSeasonsTVMaze(lookupID, data.title);
      }
    }
  });
});

// --- Update Function ---
function updatePageDetails(newTitle) {
  loadMovieDetails(newTitle, function (data) {
    updateShowDetails(data);
    currentImdb = data.imdbID;
    currentMovieTitle = data.title;
    if (!currentTMDB) {
      currentTMDB = currentImdb;
    }
    if (data.Type.toLowerCase() === "movie") {
      document.getElementById("season-container-toggle").style.display = "none";
      document.getElementById("season-selector").style.display = "none";
      document.getElementById("episode-buttons-container").innerHTML = `
        <div id="movie-search-container" style="margin-bottom:15px; text-align:center;">
          <input id="movieSearch" type="text" placeholder="Search movie..." value="${data.title}"
            style="padding:8px; font-size:14px; border-radius:4px; border:none; margin-right:5px;">
          <button onclick="searchMovie()" class="episode-watch-btn">Search</button>
        </div>
        <div style="text-align:center;">
          <button class="episode-watch-btn" onclick="loadMovieVideoFromSearch()">Watch Movie</button>
        </div>
      `;
    } else {
      const lookupID = data.imdbID;
      fetchSeasonsTVMaze(lookupID, data.title);
    }
  });
}

// Toggle season container visibility
function toggleSeasonContainer() {
  const seasonSelector = document.getElementById("season-selector");
  isSeasonContainerOpen = !isSeasonContainerOpen;
  seasonSelector.style.display = isSeasonContainerOpen ? "flex" : "none";
}

// Load movie details from OMDb
function loadMovieDetails(title, callback) {
  const API_KEY = "90b37ad0"; // Replace with your own OMDb API key
  fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`)
    .then(response => response.json())
    .then(data => {
      if (data.Response === "True") {
        const movie = {
          title: data.Title,
          poster: (data.Poster && data.Poster !== "N/A") ? data.Poster : "",
          releaseYear: data.Year,
          duration: data.Runtime,
          genres: data.Genre ? data.Genre.split(",").map(g => g.trim()) : [],
          cast: data.Actors ? data.Actors.split(",").map(a => a.trim()) : [],
          synopsis: data.Plot,
          Type: data.Type,
          imdbID: data.imdbID,
          rating: (data.imdbRating && data.imdbRating !== "N/A") ? data.imdbRating + "/10" : "N/A"
        };
        callback(movie);
      } else {
        console.error("OMDb Error:", data.Error);
      }
    })
    .catch(error => console.error("Error fetching OMDb details:", error));
}

// Update UI with movie details
function updateShowDetails(movie) {
  document.getElementById("show-title").innerText = movie.title || "N/A";
  document.getElementById("rating-box").innerText = movie.rating || "N/A";
  document.getElementById("year-box").innerText = movie.releaseYear || "";
  document.getElementById("time-box").innerText = movie.duration || "";
  if (movie.genres && movie.genres.length > 0) {
    document.getElementById("genre1").innerText = movie.genres[0] || "";
    document.getElementById("genre2").innerText = movie.genres[1] || "";
  }
  if (movie.cast) {
    document.getElementById("cast-list").innerText = movie.cast.join(", ");
  }
  document.getElementById("synopsis").innerText = movie.synopsis || "Synopsis not available.";
  
  // Update poster images
  document.getElementById("bigPosterSection").style.backgroundImage = `url('${movie.poster}')`;
  document.getElementById("smallPoster").src = movie.poster;
}

// For series: Fetch seasons from TVMaze
function fetchSeasonsTVMaze(lookupID, title) {
  fetch(`https://api.tvmaze.com/lookup/shows?imdb=${lookupID}`)
    .then(response => response.json())
    .then(data => {
      const seasonSelector = document.getElementById("season-selector");
      seasonSelector.innerHTML = "";
      fetch(`https://api.tvmaze.com/shows/${data.id}/seasons`)
        .then(response => response.json())
        .then(seasons => {
          seasons.forEach(season => {
            const btn = document.createElement("button");
            btn.className = "season-btn";
            btn.innerText = `Season ${season.number}` + (season.premiereDate ? ` (${season.premiereDate})` : "");
            btn.onclick = () => {
              fetchEpisodesTVMaze(data.id, season.id, season.number, title);
              isSeasonContainerOpen = false;
              seasonSelector.style.display = "none";
            };
            seasonSelector.appendChild(btn);
          });
          // Show season selector by default
          isSeasonContainerOpen = true;
          seasonSelector.style.display = "flex";
          if (seasons.length > 0) {
            fetchEpisodesTVMaze(data.id, seasons[0].id, seasons[0].number, title);
          }
        })
        .catch(err => console.error("Error fetching seasons:", err));
    })
    .catch(err => console.error("Error fetching show data:", err));
}

// For series: Fetch episodes from TVMaze
function fetchEpisodesTVMaze(showID, seasonID, seasonNumber, title) {
  fetch(`https://api.tvmaze.com/seasons/${seasonID}/episodes`)
    .then(response => response.json())
    .then(episodes => {
      const container = document.getElementById("episode-buttons-container");
      container.innerHTML = "";
      container.style.display = "flex";
      episodes.forEach(ep => {
        const item = document.createElement("div");
        item.className = "episode-item";
        
        const img = document.createElement("img");
        img.className = "episode-image";
        img.src = ep.image && ep.image.medium ? ep.image.medium : "episode-placeholder.jpg";
        item.appendChild(img);
        
        const content = document.createElement("div");
        content.className = "episode-content";
        
        const tDiv = document.createElement("div");
        tDiv.className = "episode-title";
        tDiv.innerText = `S${seasonNumber}E${ep.number} - ${ep.name}`;
        content.appendChild(tDiv);
        
        const metaDiv = document.createElement("div");
        metaDiv.className = "episode-meta";
        const airdate = ep.airdate ? `Airdate: ${ep.airdate}` : "";
        const runtime = ep.runtime ? ` | ${ep.runtime} min` : "";
        metaDiv.innerText = airdate + runtime;
        content.appendChild(metaDiv);
        
        if (ep.summary) {
          const sumDiv = document.createElement("div");
          sumDiv.className = "episode-summary";
          sumDiv.innerText = ep.summary.replace(/(<([^>]+)>)/gi, "");
          content.appendChild(sumDiv);
        }
        
        const dBtn = document.createElement("button");
        dBtn.className = "download-btn";
        dBtn.innerText = "Download";
        dBtn.onclick = (e) => {
          e.stopPropagation();
          downloadEpisode(showID, seasonNumber, ep.number, title);
        };
        content.appendChild(dBtn);
        
        item.appendChild(content);
        
        item.onclick = () => {
          loadEpisodeSourceTVMaze(seasonNumber, ep.number, title, ep.name);
          container.style.display = "none";
          document.getElementById("darkOverlay").style.display = "block";
        };
        
        container.appendChild(item);
      });
    })
    .catch(err => console.error("Error fetching episodes:", err));
}

// For series: Load episode source based on the selected embed provider
function loadEpisodeSourceTVMaze(season, episode, title, epName) {
  const embedProvider = document.getElementById("iframeSource").value;
  let src = "";
  if (embedProvider === "filmu") {
    // Updated Filmu embed using TMDB id for TV episodes
    src = `https://embed.filmu.fun/embed/tmdb-tv-${currentTMDB}/${season}/${episode}`;
  } else if (embedProvider === "2embed") {
    src = `https://www.2embed.cc/embedtv/${currentImdb}&s=${season}&e=${episode}`;
  } else if (embedProvider === "multiembed") {
    src = `https://multiembed.mov/?video_id=${currentImdb}&s=${season}&e=${episode}`;
  } else {
    // Default: VidAPI endpoint
    src = `https://vidapi.xyz/embed/tv/${currentImdb}&s=${season}&e=${episode}`;
  }
  document.getElementById("videoPlayer").src = src;
  document.getElementById("videoCaption").innerText = `S${season}E${episode} - ${epName}`;
  document.getElementById("videoContainer").style.display = "block";
}

// Movie Search & Watch functions
function searchMovie() {
  document.getElementById("movieSearch").focus();
}
function loadMovieVideoFromSearch() {
  let query = document.getElementById("movieSearch").value;
  if (!query) {
    query = currentMovieTitle;
  }
  const embedProvider = document.getElementById("iframeSource").value;
  let src = "";
  if (embedProvider === "filmu") {
    // Updated Filmu embed using TMDB id for movies
    src = `https://embed.filmu.fun/embed/tmdb-movie-${currentTMDB}`;
  } else if (embedProvider === "2embed") {
    src = `https://www.2embed.cc/embed/${currentImdb}`;
  } else if (embedProvider === "multiembed") {
    src = `https://multiembed.mov/?video_id=${currentImdb}`;
  } else {
    // Default: VidAPI endpoints
    const urlParams = new URLSearchParams(window.location.search);
    const type = (urlParams.get("type") || "movie").toLowerCase();
    if (type === "multi") {
      src = `https://vidapi.xyz/embedmulti/movie/${currentImdb}`;
    } else {
      src = `https://vidapi.xyz/embed/movie/${currentImdb}`;
    }
  }
  document.getElementById("videoPlayer").src = src;
  document.getElementById("videoCaption").innerText = query;
  document.getElementById("videoContainer").style.display = "block";
  document.getElementById("darkOverlay").style.display = "block";
}
// in episode button image
// For series: Fetch episodes from TVMaze and display as vertical items with a play icon overlay
function fetchEpisodesTVMaze(showID, seasonID, seasonNumber, title) {
  fetch(`https://api.tvmaze.com/seasons/${seasonID}/episodes`)
    .then(response => response.json())
    .then(episodes => {
      const container = document.getElementById("episode-buttons-container");
      container.innerHTML = "";
      container.style.display = "flex";
      episodes.forEach(ep => {
        const item = document.createElement("div");
        item.className = "episode-item";
        
        // Create a container for the image and the play icon overlay
        const imgContainer = document.createElement("div");
        imgContainer.style.position = "relative";
        
        const img = document.createElement("img");
        img.className = "episode-image";
        img.src = (ep.image && ep.image.medium) ? ep.image.medium : "episode-placeholder.jpg";
        imgContainer.appendChild(img);
        
        // Create a play icon overlay using a Bootstrap icon
        const playIcon = document.createElement("div");
        playIcon.className = "episode-play-icon";
        // Style the play icon to appear centered over the image
        playIcon.style.position = "absolute";
        playIcon.style.top = "25%";
        playIcon.style.left = "50%";
        playIcon.style.transform = "translate(-50%, -50%)";
        playIcon.style.fontSize = "24px";
        playIcon.style.color = "#fff";
        playIcon.style.cursor = "pointer";
        playIcon.innerHTML = `<i class="bi bi-play-circle-fill"></i>`;
        // When play icon is clicked, play the episode and stop propagation.
        playIcon.addEventListener("click", function(e) {
          e.stopPropagation();
          loadEpisodeSourceTVMaze(showID, seasonNumber, ep.number, title, ep.name);
          container.style.display = "none";
          document.getElementById("darkOverlay").style.display = "block";
        });
        imgContainer.appendChild(playIcon);
        
        item.appendChild(imgContainer);
        
        // Create the content container for title, meta, summary, and download button.
        const content = document.createElement("div");
        content.className = "episode-content";
        
        const tDiv = document.createElement("div");
        tDiv.className = "episode-title";
        tDiv.innerText = `S${seasonNumber}E${ep.number} - ${ep.name}`;
        content.appendChild(tDiv);
        
        const metaDiv = document.createElement("div");
        metaDiv.className = "episode-meta";
        const airdate = ep.airdate ? `Airdate: ${ep.airdate}` : "";
        const runtime = ep.runtime ? ` | ${ep.runtime} min` : "";
        metaDiv.innerText = airdate + runtime;
        content.appendChild(metaDiv);
        
        if (ep.summary) {
          const sumDiv = document.createElement("div");
          sumDiv.className = "episode-summary";
          sumDiv.innerText = ep.summary.replace(/(<([^>]+)>)/gi, "");
          content.appendChild(sumDiv);
        }
        
        const dBtn = document.createElement("button");
        dBtn.className = "download-btn";
        dBtn.innerText = "Download";
        dBtn.onclick = (e) => {
          e.stopPropagation();
          downloadEpisode(showID, seasonNumber, ep.number, title);
        };
        content.appendChild(dBtn);
        
        item.appendChild(content);
        
        // Optionally, you can keep a click handler on the entire item if desired:
        item.addEventListener("click", () => {
          loadEpisodeSourceTVMaze(showID, seasonNumber, ep.number, title, ep.name);
          container.style.display = "none";
          document.getElementById("darkOverlay").style.display = "block";
        });
        
        container.appendChild(item);
      });
    })
    .catch(err => console.error("Error fetching episodes:", err));
}
// end
// Load episode (or movie) video into the iframe player
//Anime video loader (using VidAPI)
function loadAnimeVideo() {
  const urlParams = new URLSearchParams(window.location.search);
  const link_url = urlParams.get("link_url") ? decodeURIComponent(urlParams.get("link_url")) : "";
  const episode = urlParams.get("episode") || "1";
  const title = urlParams.get("title") ? decodeURIComponent(urlParams.get("title")) : "Anime Episode";
  const src = `https://vidapi.xyz/embed/anime/${link_url}-${episode}`;
  document.getElementById("videoPlayer").src = src;
  document.getElementById("videoCaption").innerText = `${title} Episode ${episode}`;
  document.getElementById("videoContainer").style.display = "block";
  document.getElementById("darkOverlay").style.display = "block";
}

// Download episode function for series
function downloadEpisode(showID, season, episode, title) {
  const fTitle = title.toLowerCase().replace(/\s+/g, '-');
  const s = season.toString().padStart(2, "0");
  const e = episode.toString().padStart(2, "0");
  const dURL = `https://download.example.com/${fTitle}-s${s}e${e}.mp4`;
  window.open(dURL, "_blank");
}

// Close video overlay
function closeVideo() {
  document.getElementById("videoContainer").style.display = "none";
  document.getElementById("darkOverlay").style.display = "none";
  document.getElementById("episode-buttons-container").style.display = "flex";
  document.getElementById("videoPlayer").src = "";
}
//trailer and watchlist function

document.addEventListener("DOMContentLoaded", function() {
  // Create a container for the toasts if it doesn't exist.
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.top = '1rem';
    container.style.right = '1rem';
    container.style.zIndex = '1050';
    document.body.appendChild(container);
  }

  // Function to show a Bootstrap toast notification.
  function showToast(message, type) {
    // Determine toast background color based on type.
    // type: 'success' for a new movie, 'info' for an existing movie.
    const bgClass = type === 'success' ? 'bg-success' : 'bg-info';

    // Create the toast element.
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white ${bgClass}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.style.minWidth = '250px';
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    // Append and show the toast.
    document.getElementById('toast-container').appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 1500 });
    toast.show();

    // Remove the toast from the DOM after it hides.
    toastEl.addEventListener('hidden.bs.toast', function () {
      toastEl.remove();
    });
  }

  // ----------------- WATCHLIST FUNCTIONALITY -----------------
  const bookmarkIcon = document.querySelector(".poster-background .bi-bookmark-fill");
  if (bookmarkIcon) {
    bookmarkIcon.addEventListener("click", function () {
      // Gather movie details from the page.
      // (Ensure your page contains elements with these IDs.)
      const movie = {
        title: document.getElementById("show-title").textContent.trim(),
        releaseYear: document.getElementById("year-box").textContent.trim(),
        duration: document.getElementById("time-box").textContent.trim(),
        genres: [
          document.getElementById("genre1").textContent.trim(),
          document.getElementById("genre2").textContent.trim()
        ],
        cast: document.getElementById("cast-list").textContent.trim(),
        synopsis: document.getElementById("synopsis").textContent.trim(),
        // Use the small poster image as the movie poster.
        poster: document.getElementById("smallPoster").src
      };

      // Retrieve existing watchlist from localStorage or create a new array.
      let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
      // Check if the movie is already in the watchlist.
      const exists = watchlist.some(item => item.title === movie.title);
      if (!exists) {
        watchlist.push(movie);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        showToast('Movie added to watchlist!', 'success');
      } else {
        showToast('Movie already exists in your watchlist.', 'info');
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function() {
  let miniPlayer = null; // Store YT.Player instance
  
  /***** Helper: Extract YouTube Video ID from URL *****/
  function extractVideoId(url) {
    // Matches common YouTube URL formats: embed/, watch?v=, youtu.be/
    var match = url.match(/(?:embed\/|watch\?v=|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
  }
  
  /***** Bookmark Icon: Save Movie to Watchlist *****/
    //bookmark
  
const bookmarkIcon = document.querySelector(".poster-background .bi-bookmark-fill");
if (bookmarkIcon) {
  bookmarkIcon.addEventListener("click", function() {
    // Gather movie details from the page
    var movie = {
      title: document.getElementById("show-title").textContent.trim(),
      releaseYear: document.getElementById("release-year").textContent.trim(),
      duration: document.getElementById("duration").textContent.trim(),
      genres: [
        document.getElementById("genre1").textContent.trim(),
        document.getElementById("genre2").textContent.trim()
      ],
      cast: Array.from(document.querySelectorAll("#cast-list span")).map(el => el.textContent.trim()),
      synopsis: document.getElementById("synopsis").textContent.trim(),
      poster: document.getElementById("poster").getAttribute("src")
    };

    // Retrieve existing watchlist from localStorage or create a new one
    var watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    // Check for duplicates based on movie title
    var exists = watchlist.some(item => item.title === movie.title);
    if (!exists) {
      watchlist.push(movie);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      Swal.fire({
        icon: 'success',
        title: 'Movie added to watchlist!',
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Movie already exists in your watchlist.',
        showConfirmButton: false,
        timer: 1500
      });
    }
    // Note: No redirection code here
  });
}
  /***** Trailer Icon: Search and Play Trailer in a Centered Iframe with Dark Background *****/
  const trailerIcon = document.querySelector(".poster-background .bi-play-circle-fill");
  if (trailerIcon) {
    trailerIcon.addEventListener("click", function() {
      // Use the movie title to search for its trailer
      var movieTitle = document.getElementById("show-title").textContent.trim();
      if (!movieTitle) {
        console.warn("Movie title not found.");
        return;
      }
      // Build a YouTube search query (e.g., "Movie Title trailer")
      var query = encodeURIComponent(movieTitle + " trailer");
      // YouTube Data API v3 search URL with your API key
      var apiKey = "AIzaSyBTpP0-7enNqizPGetb_2G5Km_pKdguNF8";
      var searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${apiKey}`;
      
      // Fetch trailer video info from YouTube
      fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
          if (data.items && data.items.length > 0) {
            var videoId = data.items[0].id.videoId;
            if (videoId) {
              playMiniTrailer(videoId);
            } else {
              console.warn("No video ID found for the trailer.");
            }
          } else {
            console.warn("No trailer found for this movie.");
          }
        })
        .catch(error => {
          console.error("Error fetching trailer from YouTube API:", error);
        });
    });
  }
  
  /***** Function: Create and Play Centered Mini Trailer with Dark Background, Fullscreen Toggle & Close Option *****/
  function playMiniTrailer(videoId) {
    // If an existing mini player exists, destroy it first.
    if (miniPlayer) {
      miniPlayer.destroy();
      miniPlayer = null;
    }
    // Remove any existing container and overlay.
    let existingContainer = document.getElementById("miniPlayerContainer");
    if (existingContainer) {
      existingContainer.remove();
    }
    let existingOverlay = document.getElementById("darkOverlay");
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Create dark overlay for a night dark effect background.
    let darkOverlay = document.createElement("div");
    darkOverlay.id = "darkOverlay";
    darkOverlay.style.position = "fixed";
    darkOverlay.style.top = "0";
    darkOverlay.style.left = "0";
    darkOverlay.style.width = "100%";
    darkOverlay.style.height = "100%";
    darkOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    darkOverlay.style.zIndex = "900"; // Place it behind the mini player container
    document.body.appendChild(darkOverlay);
    
    // Create the mini player container.
    let miniPlayerContainer = document.createElement("div");
    miniPlayerContainer.id = "miniPlayerContainer";
    miniPlayerContainer.style.position = "fixed";
    miniPlayerContainer.style.top = "46%";
    miniPlayerContainer.style.left = "50%";
    miniPlayerContainer.style.transform = "translate(-50%, -50%)";
    miniPlayerContainer.style.width = "360px";
    miniPlayerContainer.style.height = "260px";
    miniPlayerContainer.style.zIndex = "1000";
    miniPlayerContainer.style.backgroundColor = "#000";
    miniPlayerContainer.style.border = "2px solid #fff";
    miniPlayerContainer.style.borderRadius = "8px";
    miniPlayerContainer.style.overflow = "hidden";
    document.body.appendChild(miniPlayerContainer);
    
    // Create a dedicated child div for the YouTube player.
    let playerDiv = document.createElement("div");
    playerDiv.id = "ytplayer";
    playerDiv.style.width = "100%";
    playerDiv.style.height = "100%";
    miniPlayerContainer.appendChild(playerDiv);
    
    // Create overlay buttons (they will sit on top of the video).
    // Close button (top-right)
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "✖";
    closeButton.style.position = "absolute";
    closeButton.style.top = "5px";
    closeButton.style.right = "5px";
    closeButton.style.background = "rgba(0, 0, 0, 0.7)";
    closeButton.style.color = "#fff";
    closeButton.style.border = "none";
    closeButton.style.padding = "5px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "14px";
    closeButton.style.zIndex = "1001";
    closeButton.addEventListener("click", function() {
      if (miniPlayer) {
        miniPlayer.destroy();
        miniPlayer = null;
      }
      miniPlayerContainer.remove();
      darkOverlay.remove(); // Remove the dark overlay when closing the trailer.
    });
    miniPlayerContainer.appendChild(closeButton);
    
    // Toggle (maximize/fullscreen) button (top-left)
    const toggleButton = document.createElement("button");
    toggleButton.innerHTML = "Maximize";
    toggleButton.style.position = "absolute";
    toggleButton.style.top = "5px";
    toggleButton.style.left = "5px";
    toggleButton.style.background = "rgba(0, 0, 0, 0.7)";
    toggleButton.style.color = "#fff";
    toggleButton.style.border = "none";
    toggleButton.style.padding = "5px";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.fontSize = "14px";
    toggleButton.style.zIndex = "1001";
    toggleButton.addEventListener("click", function() {
      if (!miniPlayerContainer.classList.contains("full-size")) {
        miniPlayerContainer.classList.add("full-size");
        miniPlayerContainer.style.top = "0";
        miniPlayerContainer.style.left = "0";
        miniPlayerContainer.style.transform = "none";
        miniPlayerContainer.style.width = "100%";
        miniPlayerContainer.style.height = "100%";
        toggleButton.innerHTML = "Exit Fullscreen";
      } else {
        miniPlayerContainer.classList.remove("full-size");
        miniPlayerContainer.style.top = "50%";
        miniPlayerContainer.style.left = "50%";
        miniPlayerContainer.style.transform = "translate(-50%, -50%)";
        miniPlayerContainer.style.width = "320px";
        miniPlayerContainer.style.height = "180px";
        toggleButton.innerHTML = "Maximize";
      }
    });
    miniPlayerContainer.appendChild(toggleButton);
    
    // Create the YouTube IFrame Player inside the dedicated child div.
    miniPlayer = new YT.Player("ytplayer", {
      height: "100%",
      width: "100%",
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 1
      },
      events: {
        onReady: function(event) {
          event.target.playVideo();
        }
      }
    });
  }
  
  /***** Fallback: Ensure YouTube IFrame API is Loaded *****/
  if (typeof YT === "undefined" || typeof YT.Player === "undefined") {
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api?key=AIzaSyBTpP0-7enNqizPGetb_2G5Km_pKdguNF8";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
});

// 🎥 Fullscreen Button
document.querySelector("#fullscreen-btn").addEventListener("click", function () {
    const iframe = document.querySelector("#videoPlayer");
    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }
});

 const iframe = document.getElementById('videoPlayer');

iframe.addEventListener('load', () => {
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  // Listen for clicks within the iframe
  iframeDoc.addEventListener('click', (e) => {
    let target = e.target;

    // Traverse up in case the clicked element is nested inside an <a>
    while (target && target !== iframeDoc.body) {
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (!isAllowedLink(href)) {
          // Block navigation for unknown links
          e.preventDefault();
          console.log(`Blocked navigation to: ${href}`);
          // Optionally, you can provide feedback to the user here.
          return;
        }
        break;
      }
      target = target.parentElement;
    }
  });
});

// Define allowed links based on your criteria
function isAllowedLink(url) {
  // Allow links to your navigation pages
  const allowedPages = ['index.html', 'search.html', 'watchlist.html', 'settings.html'];
  if (url) {
    for (const allowed of allowedPages) {
      if (url.indexOf(allowed) !== -1) {
        return true;
      }
    }
    // Also allow anchor links (if needed)
    if (url.startsWith('#')) {
      return true;
    }
  }
  // Block all other links
  return false;
}

let lastScrollTop = 0;
const nav = document.getElementById('bottom-nav');
let navVisible = true;

// Hide or show nav based on scroll direction
window.addEventListener('scroll', () => {
  let st = window.pageYOffset || document.documentElement.scrollTop;
  if (st > lastScrollTop) {
    // Scrolling down: hide nav
    nav.style.transform = 'translateY(100%)';
    navVisible = false;
  } else {
    // Scrolling up: show nav
    nav.style.transform = 'translateY(0)';
    navVisible = true;
  }
  lastScrollTop = st <= 0 ? 0 : st;
});

// Double-tap detection for toggling nav visibility
let lastTap = 0;
document.addEventListener('touchend', () => {
  const currentTime = new Date().getTime();
  const tapInterval = currentTime - lastTap;
  // Check if two taps occurred within 300ms
  if (tapInterval > 0 && tapInterval < 300) {
    if (navVisible) {
      nav.style.transform = 'translateY(100%)';
      navVisible = false;
    } else {
      nav.style.transform = 'translateY(0)';
      navVisible = true;
    }
  }
  lastTap = currentTime;
});
          // Wait until the DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Get the current file name from the URL (default to home.html if empty)
    var path = window.location.pathname.split("/").pop();
    if (path === '') {
      path = 'icon-container i';
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

    // Once the iframe loads, send it a message to block ads.
    var iframe = document.getElementById('videoContainer');
    iframe.onload = function() {
      // This sends a message to the iframe (ensure same origin for this to work).
      iframe.contentWindow.postMessage({ action: 'blockAds' }, '*');
    };



    // Toggle season selector visibility
    function toggleSeasonContainer() {
      const seasonSelector = document.getElementById('season-selector');
      seasonSelector.style.display = seasonSelector.style.display === 'flex' ? 'none' : 'flex';
    }
    
    // Close video container and dark overlay
    function closeVideo() {
      document.getElementById('videoContainer').style.display = 'none';
      document.getElementById('darkOverlay').style.display = 'none';
    }
    
    // Incident: Handle first touch/click on the iframe overlay only once
    const firstClickBlocker = document.getElementById('firstClickBlocker');
    firstClickBlocker.addEventListener('click', function handleFirstTouch(event) {
      // Replace the following line with your incident-handling code
      console.log("Unknown link source touched. Incident triggered.");
      // Remove the overlay so that further interactions go directly to the iframe
      firstClickBlocker.parentNode.removeChild(firstClickBlocker);
    }, { once: true });
    
    // Also listen for touch events on the blocker
    firstClickBlocker.addEventListener('touchstart', function handleFirstTouch(event) {
      console.log("Unknown link source touched via touch event. Incident triggered.");
      firstClickBlocker.parentNode.removeChild(firstClickBlocker);
    }, { once: true });
    
    // Prevent default right-click/context menu on the video container
    document.getElementById('videoContainer').addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
    
    // Prevent long-press on touch devices from showing image preview for the video container
    document.getElementById('videoContainer').addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });
    
    // Further JavaScript for toggling video container or handling iframe source changes would go here.
        // Prevent default right-click/context menu on the video container
    document.getElementById('iframeWrapper').addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
    
    // Prevent long-press on touch devices from showing image preview on the video container
    document.getElementById('iframeWrapper').addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });
    
    // This overlay intercepts all clicks/touches and blocks them
    const overlay = document.getElementById('iframeOverlay');
    overlay.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Blocked an interaction on the iframe.");
      // If you want the overlay to remain permanently (never allow interaction),
      // leave it in place. Otherwise, you could optionally remove it here.
      // e.g., overlay.style.display = 'none';
    });
    
    // Optional: Provide a button to allow user interaction (i.e. remove the overlay)
    document.getElementById('enableIframeBtn').addEventListener('click', function() {
      overlay.style.display = 'none';
      console.log("User enabled interaction with the iframe.");
      // Optionally hide or disable the button after removing the overlay.
      this.style.display = 'none';
    });

