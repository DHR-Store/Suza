document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const showID = urlParams.get("id");
    const title = decodeURIComponent(urlParams.get("title"));
    const type = urlParams.get("type");
    const poster = decodeURIComponent(urlParams.get("poster"));

    document.getElementById("show-title").innerText = title;
    document.getElementById("poster").src = poster && poster !== "null" ? poster : "placeholder.jpg";

    if (!showID) {
        console.error("No valid ID found!");
        return;
    }

    if (type === "movie") {
        loadMovieSources(showID, title);
        document.getElementById("play-movie-btn").style.display = "block";
    } else if (type === "anime") {
        loadAnimeSources(showID, title);
    } else {
        fetchSeasons(showID, title);
    }

    document.getElementById("fullscreen-btn").addEventListener("click", function () {
        const videoPlayer = document.getElementById("videoPlayer");
        if (videoPlayer.requestFullscreen) {
            videoPlayer.requestFullscreen();
        } else if (videoPlayer.mozRequestFullScreen) {
            videoPlayer.mozRequestFullScreen();
        } else if (videoPlayer.webkitRequestFullscreen) {
            videoPlayer.webkitRequestFullscreen();
        } else if (videoPlayer.msRequestFullscreen) {
            videoPlayer.msRequestFullscreen();
        }
    });

    document.getElementById("play-movie-btn").addEventListener("click", function () {
        document.getElementById("videoPlayer").src = document.querySelector("#sources button").getAttribute("data-url");
    });
});

// 🎬 Load Movies
function loadMovieSources(movieID, title) {
    const sources = [
        { name: `VidAPI - ${title}`, url: `https://vidapi.xyz/embed/movie/${movieID}` },
        { name: `VidSrc - ${title}`, url: `https://vidsrc.me/embed/${movieID}` },
        { name: `2Embed - ${title}`, url: `https://www.2embed.to/embed/imdb/${movieID}` },
        { name: `KM Movies - ${title}`, url: `https://kmmovies.biz/movie/${movieID}` }
    ];
    createSourceButtons(sources);
}

// 📺 Load TV Shows Seasons
function fetchSeasons(showID, title) {
    fetch(`https://api.tvmaze.com/lookup/shows?imdb=${showID}`)
        .then(response => response.json())
        .then(data => {
            fetch(`https://api.tvmaze.com/shows/${data.id}/seasons`)
                .then(response => response.json())
                .then(seasons => {
                    const seasonsDiv = document.getElementById("seasons");
                    seasonsDiv.innerHTML = "<h3>Select Season</h3>";
                    seasons.forEach(season => {
                        const button = document.createElement("button");
                        button.innerText = `S${season.number}`;
                        button.onclick = () => fetchEpisodes(data.id, season.id, season.number, title);
                        seasonsDiv.appendChild(button);
                    });
                })
                .catch(error => console.error("Error fetching seasons:", error));
        })
        .catch(error => console.error("Error fetching show data:", error));
}

// 📺 Load TV Show Episodes
function fetchEpisodes(showID, seasonID, seasonNumber, title) {
    fetch(`https://api.tvmaze.com/seasons/${seasonID}/episodes`)
        .then(response => response.json())
        .then(episodes => {
            const episodesDiv = document.getElementById("episodes");
            episodesDiv.innerHTML = "";
            episodes.forEach(ep => {
                const episodeCard = document.createElement("div");
                episodeCard.classList.add("episode-card");
                episodeCard.onclick = () => loadEpisodeSources(showID, seasonNumber, ep.number, title);

                const episodeImage = document.createElement("img");
                episodeImage.src = ep.image ? ep.image.medium : "https://via.placeholder.com/100x150";
                const episodeTitle = document.createElement("p");
                episodeTitle.innerText = `S${seasonNumber}E${ep.number}: ${ep.name}`;

                episodeCard.appendChild(episodeImage);
                episodeCard.appendChild(episodeTitle);
                episodesDiv.appendChild(episodeCard);
            });
        })
        .catch(error => console.error("Error fetching episodes:", error));
}

// 🎥 Load TV Show Episode Sources
function loadEpisodeSources(showID, season, episode, title) {
    const sources = [
        { name: `VidAPI - ${title} S${season}E${episode}`, url: `https://vidapi.xyz/embed/tv/${showID}&s=${season}&e=${episode}` },
        { name: `VidSrc - ${title} S${season}E${episode}`, url: `https://vidsrc.me/embed/tv/${showID}/${season}/${episode}` },
        { name: `2Embed - ${title} S${season}E${episode}`, url: `https://www.2embed.to/embed/imdb/${showID}/${season}/${episode}` },
        { name: `KM Movies - ${title} S${season}E${episode}`, url: `https://kmmovies.biz/tv/${showID}/${season}/${episode}` }
    ];
    createSourceButtons(sources);
}

// 🎌 Load Anime
function loadAnimeSources(animeLink, episode) {
    const sources = [
        { name: `VidAPI - Anime Episode ${episode}`, url: `https://vidapi.xyz/embed/anime/${animeLink}-${episode}` }
    ];
    createSourceButtons(sources);
}

// 🎌 Fetch Anime List
function fetchAnimeList(page) {
    fetch(`https://vidapi.xyz/ani-api/new?page=${page}`)
        .then(response => response.json())
        .then(data => {
            const animeDiv = document.getElementById("anime-list");
            animeDiv.innerHTML = "<h3>Latest Anime</h3>";
            data.forEach(anime => {
                const animeCard = document.createElement("div");
                animeCard.classList.add("anime-card");
                animeCard.onclick = () => loadAnimeSources(anime.link, 1);

                const animeImage = document.createElement("img");
                animeImage.src = anime.image || "https://via.placeholder.com/150x200";
                const animeTitle = document.createElement("p");
                animeTitle.innerText = anime.title;

                animeCard.appendChild(animeImage);
                animeCard.appendChild(animeTitle);
                animeDiv.appendChild(animeCard);
            });
        })
        .catch(error => console.error("Error fetching anime list:", error));
}

// 🔘 Create Source Buttons
function createSourceButtons(sources) {
    const videoPlayer = document.getElementById("videoPlayer");
    const sourcesDiv = document.getElementById("sources");
    sourcesDiv.innerHTML = "<h3>Select Source</h3>";

    sources.forEach(source => {
        const button = document.createElement("button");
        button.innerText = source.name;
        button.setAttribute("data-url", source.url);
        button.onclick = () => {
            videoPlayer.src = source.url;
        };
        sourcesDiv.appendChild(button);
    });
}

// Function to get URL parameters
function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Extract necessary parameters
const showTitle = getParameterByName("title") || "Unknown Show";
const showID = getParameterByName("id");
const showType = getParameterByName("type") || "Movie";
const posterURL = getParameterByName("poster") || "placeholder.jpg";

// Update page elements
document.querySelector("#show-title").innerText = showTitle;
document.querySelector("#poster").src = posterURL;

// Set default embed URL (first episode or main movie)
let embedKey = encodeURIComponent(showTitle.replace(/\s+/g, "+"));
let embedURL = `https://player4u.xyz/embed?key=${embedKey}`;
document.querySelector("#videoPlayer").src = embedURL;

// Fullscreen button functionality
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

// Load episodes dynamically
function loadEpisodes(episodes) {
    const episodeContainer = document.querySelector("#episodes");
    episodeContainer.innerHTML = ""; // Clear previous episodes

    episodes.forEach((episode, index) => {
        const episodeButton = document.createElement("button");
        episodeButton.classList.add("episode-btn");
        episodeButton.innerText = `Episode ${index + 1}`;
        
        episodeButton.addEventListener("click", function () {
            // Show loading text
            document.querySelector("#videoPlayer").src = "";
            document.querySelector("#videoPlayer").insertAdjacentHTML("afterend", "<p id='loading-text'>Loading...</p>");

            // Construct embed URL for selected episode
            let episodeKey = `${showTitle.replace(/\s+/g, "+")}+E${index + 1}`;
            let episodeURL = `https://player4u.xyz/embed?key=${episodeKey}`;

            // Load episode after a short delay
            setTimeout(() => {
                document.querySelector("#videoPlayer").src = episodeURL;
                document.querySelector("#loading-text").remove(); // Remove loading text
            }, 1500); // 1.5 seconds delay for smooth transition
        });

        episodeContainer.appendChild(episodeButton);
    });
}

// Sample episodes for testing
const sampleEpisodes = Array.from({ length: 12 }, (_, i) => `Episode ${i + 1}`);
loadEpisodes(sampleEpisodes);
