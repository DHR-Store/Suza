document.addEventListener("DOMContentLoaded", function() {
  // URL parameters से data प्राप्त करें
  const urlParams = new URLSearchParams(window.location.search);
  const showID = urlParams.get("id");
  let title = urlParams.get("title") || "";
  title = decodeURIComponent(title);
  const type = urlParams.get("type") || "movie";
  const posterParam = urlParams.get("poster") ? decodeURIComponent(urlParams.get("poster")) : "";
  
  // Default poster सेट करें
  const posterURL = (posterParam && posterParam !== "null") ? posterParam : "placeholder.jpg";
  
  // Basic UI update
  document.getElementById("show-title").innerText = title;
  document.getElementById("poster").src = posterURL;
  
  // Set default video embed URL (you can update this logic as needed)
  let embedKey = encodeURIComponent(title.replace(/\s+/g, "+"));
  let defaultEmbedURL = `https://player4u.xyz/embed?key=${embedKey}`;
  document.getElementById("videoPlayer").src = defaultEmbedURL;
  
  if (type.toLowerCase() === "movie") {
    loadMovieDetails(title);
    // Movie UI: Hide season container since it's not applicable
    document.querySelector(".season-container").style.display = "none";
  } else {
    // TV show: fetch seasons & episodes
    fetchSeasons(showID, title);
  }
});


// -----------------------------
// 1. Load Movie Details using OMDB API
// -----------------------------
function loadMovieDetails(title) {
  const API_KEY = "245f8617"; // Replace with your OMDB API key
  const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;
  
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      if (data.Response === "True") {
        document.getElementById("show-title").innerText = data.Title || title;
        if (data.Poster && data.Poster !== "N/A") {
          document.getElementById("poster").src = data.Poster;
        }
        document.getElementById("release-year").innerText = data.Year || "N/A";
        document.getElementById("duration").innerText = data.Runtime || "N/A";
        
        // Split Genre into two info boxes (if available)
        if (data.Genre) {
          const genres = data.Genre.split(",").map(g => g.trim());
          document.getElementById("genre1").innerText = genres[0] || "";
          document.getElementById("genre2").innerText = genres[1] || "";
        }
        
        // Update Cast list
        if (data.Actors) {
          const castArray = data.Actors.split(",").map(actor => actor.trim());
          const castContainer = document.getElementById("cast-list");
          castContainer.innerHTML = "";
          castArray.forEach(actor => {
            const span = document.createElement("span");
            span.innerText = actor;
            castContainer.appendChild(span);
          });
        }
        
        // Update Synopsis
        document.getElementById("synopsis").innerText = data.Plot || "Synopsis not available.";
        
        // Based on content type, load further details
        fetchDetails(data.imdbID, data.Title, data.Poster, data.Type);
      } else {
        console.error("Movie not found:", data.Error);
      }
    })
    .catch(error => console.error("Error fetching movie details:", error));
}

// -----------------------------
// 2. Fetch Additional Details and Decide UI Based on Type
// -----------------------------
async function fetchDetails(imdbID, title, poster, type) {
  const detailsContainer = document.querySelector("#details-container");
  detailsContainer.innerHTML = `<h2>${title}</h2><img src="${poster}" alt="${title}" class="poster">`;

  // If the content is a movie, show only the watch button
  if (type.toLowerCase() === "movie") {
    detailsContainer.innerHTML += `<button class="watch-btn" onclick="watchMovie('${title}')">▶️ Watch Now</button>`;
  }
  // Otherwise, if it is a TV series (or similar), load seasons/episodes using TVMaze
  else if (type.toLowerCase() === "series" || type.toLowerCase() === "tv series") {
    console.log(`📺 TV Show Detected: ${title}`);
    fetchSeasonsTVMaze(imdbID, title);
  }
  // Fallback for any other type
  else {
    detailsContainer.innerHTML += `<button class="watch-btn" onclick="watchMovie('${title}')">▶️ Watch Now</button>`;
  }
}

// -----------------------------
// 3. Movie Watch Button Action
// -----------------------------
function watchMovie(title) {
  alert(`🎬 Playing Movie: ${title}`);
  window.open(`https://www.google.com/search?q=watch+${encodeURIComponent(title)}+online`, "_blank");
}

// -----------------------------
// 4. TV Maze API – Fetch Seasons for TV Shows
// -----------------------------
function fetchSeasonsTVMaze(imdbID, title) {
  // TVMaze lookup by IMDb id
  fetch(`https://api.tvmaze.com/lookup/shows?imdb=${imdbID}`)
    .then(response => response.json())
    .then(data => {
      // Now fetch seasons using TVMaze show id
      fetch(`https://api.tvmaze.com/shows/${data.id}/seasons`)
        .then(response => response.json())
        .then(seasons => {
          const seasonListDiv = document.getElementById("season-list");
          seasonListDiv.innerHTML = ""; // Clear previous data

          // For each season, create a button
          seasons.forEach(season => {
            const seasonBtn = document.createElement("button");
            seasonBtn.classList.add("season-btn");
            seasonBtn.innerText = `Season ${season.number}`;
            seasonBtn.onclick = () => fetchEpisodesTVMaze(data.id, season.id, season.number, title);
            seasonListDiv.appendChild(seasonBtn);
          });
        })
        .catch(error => console.error("Error fetching seasons:", error));
    })
    .catch(error => console.error("Error fetching show data:", error));
}

// -----------------------------
// 5. TV Maze API – Fetch Episodes for a Given Season and Add Download Button
// -----------------------------
function fetchEpisodesTVMaze(showID, seasonID, seasonNumber, title) {
  fetch(`https://api.tvmaze.com/seasons/${seasonID}/episodes`)
    .then(response => response.json())
    .then(episodes => {
      // Use the same season-list container to display episodes below season buttons
      let episodesContainer = document.getElementById("episodes-container");
      if (!episodesContainer) {
        episodesContainer = document.createElement("div");
        episodesContainer.id = "episodes-container";
        episodesContainer.style.padding = "10px";
        episodesContainer.style.background = "#222";
        episodesContainer.style.marginTop = "10px";
        episodesContainer.style.borderRadius = "5px";
        // Append episodes container inside the season-list container
        document.getElementById("season-list").appendChild(episodesContainer);
      }
      episodesContainer.innerHTML = "<h4>Episodes</h4>";
      
      episodes.forEach(ep => {
        const epDiv = document.createElement("div");
        epDiv.classList.add("episode-item");
        epDiv.style.display = "flex";
        epDiv.style.alignItems = "center";
        epDiv.style.marginBottom = "5px";
        
        // Watch Episode Button
        const watchBtn = document.createElement("button");
        watchBtn.classList.add("episode-watch-btn");
        watchBtn.innerText = `S${seasonNumber}E${ep.number} - ${ep.name}`;
        watchBtn.onclick = () => loadEpisodeSourceTVMaze(showID, seasonNumber, ep.number, title);
        epDiv.appendChild(watchBtn);
        
        // Small Circular Download Button
        const downloadBtn = document.createElement("button");
        downloadBtn.classList.add("download-btn");
        downloadBtn.innerText = "↓"; // download arrow symbol
        downloadBtn.style.borderRadius = "50%";
        downloadBtn.style.width = "30px";
        downloadBtn.style.height = "30px";
        downloadBtn.style.marginLeft = "10px";
        downloadBtn.onclick = () => downloadEpisode(showID, seasonNumber, ep.number, title);
        epDiv.appendChild(downloadBtn);
        
        episodesContainer.appendChild(epDiv);
      });
    })
    .catch(error => console.error("Error fetching episodes:", error));
}

// -----------------------------
// 6. Load TV Show Episode Source into Video Player Iframe
// -----------------------------
function loadEpisodeSourceTVMaze(showID, season, episode, title) {
  // Format title for URL usage: lowercase and hyphen-separated
  const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
  const formattedSeason = season.toString().padStart(2, '0');
  const formattedEpisode = episode.toString().padStart(2, '0');
  
  // Example source URL – update this based on your streaming provider
  const sourceURL = `https://vidapi.xyz/embed/tv/${formattedTitle}-s${formattedSeason}e${formattedEpisode}`;
  document.getElementById("videoPlayer").src = sourceURL;
}

// -----------------------------
// 7. Download Episode Action
// -----------------------------
function downloadEpisode(showID, season, episode, title) {
  const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
  const formattedSeason = season.toString().padStart(2, '0');
  const formattedEpisode = episode.toString().padStart(2, '0');
  
  // Example download URL – modify to match your download provider
  const downloadURL = `https://download.example.com/${formattedTitle}-s${formattedSeason}e${formattedEpisode}.mp4`;
  window.open(downloadURL, "_blank");
}



document.addEventListener("DOMContentLoaded", function () {
  // 1. Load movie/show details from OMDB API
  function loadMovieDetails(title) {
    const API_KEY = "245f8617"; // Replace with your OMDB API key if needed
    const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;

    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        if (data.Response === "True") {
          document.getElementById("show-title").innerText = data.Title || title;
          if (data.Poster && data.Poster !== "N/A") {
            document.getElementById("poster").src = data.Poster;
          }
          document.getElementById("release-year").innerText = data.Year || "N/A";
          document.getElementById("duration").innerText = data.Runtime || "N/A";

          // Update genres (split into two elements)
          if (data.Genre) {
            const genres = data.Genre.split(",").map(g => g.trim());
            document.getElementById("genre1").innerText = genres[0] || "";
            document.getElementById("genre2").innerText = genres[1] || "";
          }

          // Update cast list
          if (data.Actors) {
            const castArray = data.Actors.split(",").map(actor => actor.trim());
            document.getElementById("cast-list").innerText = castArray.join(", ");
          }

          // Update synopsis
          document.getElementById("synopsis").innerText = data.Plot || "Synopsis not available.";

          // Load additional details based on content type
          fetchDetails(data.imdbID, data.Title, data.Poster, data.Type);
        } else {
          console.error("Movie/Show not found:", data.Error);
        }
      })
      .catch(error => console.error("Error fetching movie details:", error));
  }

  // 2. Decide UI based on content type (movie vs. series)
  function fetchDetails(imdbID, title, poster, type) {
    const detailsContainer = document.getElementById("details-container");
    // If it's a movie, add a watch button; if series, fetch seasons/episodes.
    if (type.toLowerCase() === "movie") {
      detailsContainer.innerHTML += `<button class="watch-btn" onclick="watchMovie('${title}')">▶️ Watch Now</button>`;
    } else if (type.toLowerCase() === "series" || type.toLowerCase() === "tv series") {
      fetchSeasonsTVMaze(imdbID, title);
    } else {
      detailsContainer.innerHTML += `<button class="watch-btn" onclick="watchMovie('${title}')">▶️ Watch Now</button>`;
    }
  }

  // 3. Movie watch action
  window.watchMovie = function (title) {
    alert("Playing movie: " + title);
    window.open(`https://www.google.com/search?q=watch+${encodeURIComponent(title)}+online`, "_blank");
  };

  // 4. Fetch seasons for TV series using TVMaze API
  function fetchSeasonsTVMaze(imdbID, title) {
    // Look up the show using IMDb id
    fetch(`https://api.tvmaze.com/lookup/shows?imdb=${imdbID}`)
      .then(response => response.json())
      .then(data => {
        // Fetch seasons using the TVMaze show id
        fetch(`https://api.tvmaze.com/shows/${data.id}/seasons`)
          .then(response => response.json())
          .then(seasons => {
            const seasonListDiv = document.getElementById("season-list");
            seasonListDiv.innerHTML = ""; // Clear previous content
            seasons.forEach(season => {
              const seasonBtn = document.createElement("button");
              seasonBtn.className = "season-btn";
              seasonBtn.innerText = "Season " + season.number;
              seasonBtn.onclick = function () {
                fetchEpisodesTVMaze(data.id, season.id, season.number, title);
              };
              seasonListDiv.appendChild(seasonBtn);
            });
          })
          .catch(error => console.error("Error fetching seasons:", error));
      })
      .catch(error => console.error("Error fetching show data:", error));
  }

  // 5. Fetch episodes for a given season using TVMaze API
  function fetchEpisodesTVMaze(showID, seasonID, seasonNumber, title) {
    fetch(`https://api.tvmaze.com/seasons/${seasonID}/episodes`)
      .then(response => response.json())
      .then(episodes => {
        let episodesContainer = document.getElementById("episodes-container");
        if (!episodesContainer) {
          episodesContainer = document.createElement("div");
          episodesContainer.id = "episodes-container";
          episodesContainer.style.padding = "10px";
          episodesContainer.style.backgroundColor = "#222";
          episodesContainer.style.marginTop = "10px";
          episodesContainer.style.borderRadius = "4px";
          document.getElementById("season-list").appendChild(episodesContainer);
        }
        episodesContainer.innerHTML = "<h4>Episodes</h4>";
        episodes.forEach(ep => {
          const epDiv = document.createElement("div");
          epDiv.className = "episode-item";
          // Create the watch button for this episode
          const watchBtn = document.createElement("button");
          watchBtn.className = "episode-watch-btn";
          watchBtn.innerText = `S${seasonNumber}E${ep.number} - ${ep.name}`;
          watchBtn.onclick = function () {
            loadEpisodeSourceTVMaze(showID, seasonNumber, ep.number, title);
          };
          epDiv.appendChild(watchBtn);
          // Create a small circular download button
          const downloadBtn = document.createElement("button");
          downloadBtn.className = "download-btn";
          downloadBtn.innerText = "↓";
          downloadBtn.onclick = function () {
            downloadEpisode(showID, seasonNumber, ep.number, title);
          };
          epDiv.appendChild(downloadBtn);
          episodesContainer.appendChild(epDiv);
        });
      })
      .catch(error => console.error("Error fetching episodes:", error));
  }

  // 6. Load episode source into the video player iframe
  function loadEpisodeSourceTVMaze(showID, season, episode, title) {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    const formattedSeason = season.toString().padStart(2, "0");
    const formattedEpisode = episode.toString().padStart(2, "0");
    // Sample streaming URL – update this to match your provider
    const sourceURL = `https://vidapi.xyz/embed/tv/${formattedTitle}-s${formattedSeason}e${formattedEpisode}`;
    document.getElementById("videoPlayer").src = sourceURL;
  }

  // 7. Download episode action
  function downloadEpisode(showID, season, episode, title) {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    const formattedSeason = season.toString().padStart(2, "0");
    const formattedEpisode = episode.toString().padStart(2, "0");
    // Sample download URL – update as needed
    const downloadURL = `https://download.example.com/${formattedTitle}-s${formattedSeason}e${formattedEpisode}.mp4`;
    window.open(downloadURL, "_blank");
  }

  // Expose the loadMovieDetails function globally so you can call it elsewhere
  window.loadMovieDetails = loadMovieDetails;

  // Initialize with a sample title (replace with your desired title)
  loadMovieDetails("DOMContentLoaded");
});




document.addEventListener("DOMContentLoaded", function () {
  // -----------------------------
  // 1. (Fallback) Load Movie/Show Details from OMDB API if needed
  // -----------------------------
  function loadMovieDetails(title) {
    const API_KEY = "245f8617"; // Replace if needed
    const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;
    
    fetch(API_URL)
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
            imdbID: data.imdbID
          };
          updateShowDetails(movie);
        } else {
          console.error("OMDB Error:", data.Error);
        }
      })
      .catch(error => console.error("Error fetching OMDB details:", error));
  }

  // -----------------------------
  // 2. Update Show Details on the Page
  // -----------------------------
  function updateShowDetails(movie) {
    document.getElementById("show-title").innerText = movie.title || "N/A";
    if (movie.poster) {
      document.getElementById("poster").src = movie.poster;
    }
    document.getElementById("release-year").innerText = movie.releaseYear || "N/A";
    document.getElementById("duration").innerText = movie.duration || "N/A";
    if (movie.genres && movie.genres.length > 0) {
      document.getElementById("genre1").innerText = movie.genres[0] || "";
      document.getElementById("genre2").innerText = movie.genres[1] || "";
    }
    if (movie.cast) {
      document.getElementById("cast-list").innerText = Array.isArray(movie.cast)
        ? movie.cast.join(", ")
        : movie.cast;
    }
    document.getElementById("synopsis").innerText = movie.synopsis || "Synopsis not available.";

    // Clear any existing extra buttons in details container
    const detailsContainer = document.getElementById("details-container");
    // Remove any existing watch button if present
    const existingWatchBtn = detailsContainer.querySelector(".watch-btn");
    if (existingWatchBtn) {
      existingWatchBtn.remove();
    }

    // If the content is a TV series (or similar), fetch seasons/episodes; else, show a watch button.
    if (movie.Type && (movie.Type.toLowerCase() === "series" || movie.Type.toLowerCase() === "tv series")) {
      if (movie.imdbID) {
        fetchSeasonsTVMaze(movie.imdbID, movie.title);
      } else {
        // If no imdbID, try to load details from OMDB again
        loadMovieDetails(movie.title);
      }
    } else {
      detailsContainer.innerHTML += `<button class="watch-btn" onclick="watchMovie('${movie.title}')">▶️ Watch Now</button>`;
    }
  }

  // -----------------------------
  // 3. Movie Watch Action
  // -----------------------------
  window.watchMovie = function (title) {
    alert("Playing movie: " + title);
    window.open(`https://www.google.com/search?q=watch+${encodeURIComponent(title)}+online`, "_blank");
  };

  // -----------------------------
  // 4. Fetch Seasons for TV Series via TVMaze API
  // -----------------------------
  function fetchSeasonsTVMaze(imdbID, title) {
    fetch(`https://api.tvmaze.com/lookup/shows?imdb=${imdbID}`)
      .then(response => response.json())
      .then(data => {
        if (!data.id) {
          console.error("TVMaze show not found for:", title);
          return;
        }
        fetch(`https://api.tvmaze.com/shows/${data.id}/seasons`)
          .then(response => response.json())
          .then(seasons => {
            const seasonListDiv = document.getElementById("season-list");
            seasonListDiv.innerHTML = ""; // Clear previous content
            if (seasons.length === 0) {
              seasonListDiv.innerHTML = "<p>No seasons available.</p>";
              return;
            }
            seasons.forEach(season => {
              const seasonBtn = document.createElement("button");
              seasonBtn.className = "season-btn";
              seasonBtn.innerText = `Season ${season.number}`;
              seasonBtn.onclick = function () {
                fetchEpisodesTVMaze(data.id, season.id, season.number, title);
              };
              seasonListDiv.appendChild(seasonBtn);
            });
          })
          .catch(error => console.error("Error fetching seasons:", error));
      })
      .catch(error => console.error("Error fetching TVMaze show data:", error));
  }

  // -----------------------------
  // 5. Fetch Episodes for a Season via TVMaze API
  // -----------------------------
  function fetchEpisodesTVMaze(showID, seasonID, seasonNumber, title) {
    fetch(`https://api.tvmaze.com/seasons/${seasonID}/episodes`)
      .then(response => response.json())
      .then(episodes => {
        const episodesContainer = document.getElementById("episodes-container");
        episodesContainer.innerHTML = ""; // Clear previous episodes
        if (episodes.length === 0) {
          episodesContainer.innerHTML = "<p>No episodes available.</p>";
          return;
        }
        episodes.forEach(ep => {
          const epDiv = document.createElement("div");
          epDiv.className = "episode-item";
          epDiv.style.display = "flex";
          epDiv.style.alignItems = "center";
          epDiv.style.marginBottom = "5px";

          // Watch Episode Button
          const watchBtn = document.createElement("button");
          watchBtn.className = "episode-watch-btn";
          watchBtn.innerText = `S${seasonNumber}E${ep.number} - ${ep.name}`;
          watchBtn.onclick = function () {
            loadEpisodeSourceTVMaze(showID, seasonNumber, ep.number, title);
          };
          epDiv.appendChild(watchBtn);

          // Download Button (small circular button)
          const downloadBtn = document.createElement("button");
          downloadBtn.className = "download-btn";
          downloadBtn.innerText = "↓";
          downloadBtn.style.borderRadius = "50%";
          downloadBtn.style.width = "30px";
          downloadBtn.style.height = "30px";
          downloadBtn.style.marginLeft = "10px";
          downloadBtn.onclick = function () {
            downloadEpisode(showID, seasonNumber, ep.number, title);
          };
          epDiv.appendChild(downloadBtn);

          episodesContainer.appendChild(epDiv);
        });
      })
      .catch(error => console.error("Error fetching episodes:", error));
  }

  // -----------------------------
  // 6. Load Episode Source into the Video Player Iframe
  // -----------------------------
  function loadEpisodeSourceTVMaze(showID, season, episode, title) {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    const formattedSeason = season.toString().padStart(2, '0');
    const formattedEpisode = episode.toString().padStart(2, '0');
    // Replace with your streaming provider's URL template as needed
    const sourceURL = `https://vidapi.xyz/embed/tv/${formattedTitle}-s${formattedSeason}e${formattedEpisode}`;
    document.getElementById("videoPlayer").src = sourceURL;
  }

  // -----------------------------
  // 7. Download Episode Action
  // -----------------------------
  function downloadEpisode(showID, season, episode, title) {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    const formattedSeason = season.toString().padStart(2, '0');
    const formattedEpisode = episode.toString().padStart(2, '0');
    // Replace with your download provider's URL template as needed
    const downloadURL = `https://download.example.com/${formattedTitle}-s${formattedSeason}e${formattedEpisode}.mp4`;
    window.open(downloadURL, "_blank");
  }

  // -----------------------------
  // 8. Initialize: Update show details using stored data
  // -----------------------------
  let selectedMovie = localStorage.getItem("selectedMovie");
  if (selectedMovie) {
    try {
      selectedMovie = JSON.parse(selectedMovie);
      updateShowDetails(selectedMovie);
    } catch (e) {
      console.error("Error parsing selectedMovie:", e);
    }
  } else {
    console.error("No selected movie found in localStorage.");
    // Optionally, call loadMovieDetails("Some Title") for a default
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
  
const bookmarkIcon = document.querySelector(".poster-container .bi-bookmark-fill");
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
  const trailerIcon = document.querySelector(".poster-container .bi-play-circle-fill");
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

// Hide/Show bottom navigation based on scroll direction
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      let st = window.pageYOffset || document.documentElement.scrollTop;
      const nav = document.getElementById('bottom-nav');
      if (st > lastScrollTop) {
        // Scrolling down: hide nav
        nav.style.transform = 'translateY(100%)';
      } else {
        // Scrolling up: show nav
        nav.style.transform = 'translateY(0)';
      }
      lastScrollTop = st <= 0 ? 0 : st;
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
    


