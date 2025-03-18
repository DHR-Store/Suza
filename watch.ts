document.addEventListener("DOMContentLoaded", () => {
  interface Movie {
    title: string;
    poster: string;
    releaseYear: string;
    duration: string;
    genres: string[];
    cast: string[];
    synopsis: string;
    Type: string;
    imdbID: string;
  }

  const OMDB_API_KEY = "245f8617";
  
  // -----------------------------
  // 1. Load Movie/Show Details
  // -----------------------------
  function loadMovieDetails(title: string): void {
    fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`)
      .then(response => response.json())
      .then((data: any) => {
        if (data.Response === "True") {
          const movie: Movie = {
            title: data.Title,
            poster: data.Poster !== "N/A" ? data.Poster : "",
            releaseYear: data.Year,
            duration: data.Runtime,
            genres: data.Genre ? data.Genre.split(",").map((g: string) => g.trim()) : [],
            cast: data.Actors ? data.Actors.split(",").map((a: string) => a.trim()) : [],
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
  // 2. Update Show Details on Page
  // -----------------------------
  function updateShowDetails(movie: Movie): void {
    document.getElementById("show-title")!.innerText = movie.title || "N/A";
    (document.getElementById("poster") as HTMLImageElement).src = movie.poster || "";
    document.getElementById("release-year")!.innerText = movie.releaseYear || "N/A";
    document.getElementById("duration")!.innerText = movie.duration || "N/A";
    document.getElementById("genre1")!.innerText = movie.genres[0] || "";
    document.getElementById("genre2")!.innerText = movie.genres[1] || "";
    document.getElementById("cast-list")!.innerText = movie.cast.join(", ");
    document.getElementById("synopsis")!.innerText = movie.synopsis || "Synopsis not available.";

    // If it's a TV series, fetch seasons
    if (movie.Type.toLowerCase() === "series" && movie.imdbID) {
      fetchSeasonsTVMaze(movie.imdbID, movie.title);
    } else {
      // Add a "Watch Now" button for movies
      const detailsContainer = document.getElementById("details-container")!;
      detailsContainer.innerHTML += `<button class="watch-btn" onclick="watchMovie('${movie.title}')">▶️ Watch Now</button>`;
    }
  }

  // -----------------------------
  // 3. Watch Movie
  // -----------------------------
  (window as any).watchMovie = (title: string) => {
    window.open(`https://www.google.com/search?q=watch+${encodeURIComponent(title)}+online`, "_blank");
  };

  // -----------------------------
  // 4. Fetch Seasons for TV Series
  // -----------------------------
  function fetchSeasonsTVMaze(imdbID: string, title: string): void {
    fetch(`https://api.tvmaze.com/lookup/shows?imdb=${imdbID}`)
      .then(response => response.json())
      .then((data: any) => {
        if (!data.id) return;
        fetch(`https://api.tvmaze.com/shows/${data.id}/seasons`)
          .then(response => response.json())
          .then((seasons: any[]) => {
            const seasonListDiv = document.getElementById("season-list")!;
            seasonListDiv.innerHTML = "";
            seasons.forEach(season => {
              const seasonBtn = document.createElement("button");
              seasonBtn.innerText = `Season ${season.number}`;
              seasonBtn.onclick = () => fetchEpisodesTVMaze(data.id, season.id, season.number, title);
              seasonListDiv.appendChild(seasonBtn);
            });
          });
      });
  }

  // -----------------------------
  // 5. Fetch Episodes for a Season
  // -----------------------------
  function fetchEpisodesTVMaze(showID: number, seasonID: number, seasonNumber: number, title: string): void {
    fetch(`https://api.tvmaze.com/seasons/${seasonID}/episodes`)
      .then(response => response.json())
      .then((episodes: any[]) => {
        const episodesContainer = document.getElementById("episodes-container")!;
        episodesContainer.innerHTML = "";
        episodes.forEach(ep => {
          const epDiv = document.createElement("div");
          epDiv.style.display = "flex";
          epDiv.style.alignItems = "center";

          const watchBtn = document.createElement("button");
          watchBtn.innerText = `S${seasonNumber}E${ep.number} - ${ep.name}`;
          watchBtn.onclick = () => loadEpisodeSourceTVMaze(showID, seasonNumber, ep.number, title);
          epDiv.appendChild(watchBtn);

          const downloadBtn = document.createElement("button");
          downloadBtn.innerText = "↓";
          downloadBtn.style.borderRadius = "50%";
          downloadBtn.style.width = "30px";
          downloadBtn.style.height = "30px";
          downloadBtn.style.marginLeft = "10px";
          downloadBtn.onclick = () => downloadEpisode(showID, seasonNumber, ep.number, title);
          epDiv.appendChild(downloadBtn);

          episodesContainer.appendChild(epDiv);
        });
      });
  }

  // -----------------------------
  // 6. Load Episode into Player
  // -----------------------------
  function loadEpisodeSourceTVMaze(showID: number, season: number, episode: number, title: string): void {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    const src = `https://vidapi.xyz/embed/tv/${formattedTitle}-s${season.toString().padStart(2, '0')}e${episode.toString().padStart(2, '0')}`;
    (document.getElementById("videoPlayer") as HTMLIFrameElement).src = src;
  }

  // -----------------------------
  // 7. Download Episode
  // -----------------------------
  function downloadEpisode(showID: number, season: number, episode: number, title: string): void {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    window.open(`https://download.example.com/${formattedTitle}-s${season}e${episode}.mp4`, "_blank");
  }

  // -----------------------------
  // 8. Initialize
  // -----------------------------
  const selectedMovie = localStorage.getItem("selectedMovie");
  if (selectedMovie) updateShowDetails(JSON.parse(selectedMovie));
});
