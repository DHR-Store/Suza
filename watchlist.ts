interface Movie {
  title: string;
  poster?: string;
  releaseYear?: string;
}

function loadWatchlist(): void {
  const watchlist: Movie[] = JSON.parse(localStorage.getItem("watchlist") || "[]");
  const container = document.querySelector("#watchlist-container") as HTMLElement;
  container.innerHTML = "";

  if (watchlist.length === 0) {
    container.innerHTML = `<p class='text-center text-warning fs-4'>Your watchlist is empty! 📭</p>`;
    return;
  }

  watchlist.forEach((item: Movie) => {
    const card = document.createElement("div");
    card.classList.add("col");

    // Shorten title if necessary
    const shortTitle = item.title.length > 15 ? `${item.title.substring(0, 15)}...` : item.title;

    card.innerHTML = `
      <div class="card shadow-sm">
        <img src="${item.poster || 'no-image.jpg'}" 
             alt="${item.title}" 
             class="movie-poster">
        <div class="card-body">
          <h6 class="card-title">${shortTitle} (${item.releaseYear || "N/A"})</h6>
          <button class="remove-btn">❌ Remove</button>
        </div>
      </div>
    `;

    // Click event to open watch page with full movie data
    const posterElement = card.querySelector(".movie-poster") as HTMLElement;
    posterElement.addEventListener("click", () => openWatchPage(item));

    // Click event to remove item from watchlist
    const removeBtn = card.querySelector(".remove-btn") as HTMLElement;
    removeBtn.addEventListener("click", () => removeItem(item.title));

    container.appendChild(card);
  });
}

// Remove the selected movie from the watchlist
function removeItem(title: string): void {
  let watchlist: Movie[] = JSON.parse(localStorage.getItem("watchlist") || "[]");
  watchlist = watchlist.filter(item => item.title !== title);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  loadWatchlist();
}

// Function to open the watch page and update the stored movie
function openWatchPage(movie: Movie): void {
  localStorage.setItem("selectedMovie", JSON.stringify(movie));
  window.location.href = "watch.html";
}

// Load the watchlist when the page is ready
document.addEventListener("DOMContentLoaded", loadWatchlist);
