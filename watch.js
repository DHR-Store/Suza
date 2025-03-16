document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const showID = urlParams.get("id");
    const title = decodeURIComponent(urlParams.get("title"));
    const type = urlParams.get("type");
    const poster = decodeURIComponent(urlParams.get("poster"));

    document.getElementById("show-title").innerText = title;

    if (poster && poster !== "null") {
        document.getElementById("poster").src = poster;
    } else {
        document.getElementById("poster").src = "placeholder.jpg";
    }

    if (!showID) {
        console.error("No valid ID found!");
        return;
    }

    if (type === "movie") {
        loadMovieSources(showID, title);
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
});

function loadMovieSources(movieID, title) {
    const sourcesDiv = document.getElementById("sources");
    sourcesDiv.innerHTML = "<h3>Select Source</h3>";

    const sources = [
        { name: `VidAPI - ${title}`, url: `https://vidapi.xyz/embed/movie/${movieID}` },
        { name: `VidSrc - ${title}`, url: `https://vidsrc.me/embed/${movieID}` },
        { name: `2Embed - ${title}`, url: `https://www.2embed.to/embed/imdb/${movieID}` }
    ];

    createSourceButtons(sources);
}

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

function loadEpisodeSources(showID, season, episode, title) {
    const sourcesDiv = document.getElementById("sources");
    sourcesDiv.innerHTML = "<h3>Select Source</h3>";

    const sources = [
        { name: `VidAPI - ${title} S${season}E${episode}`, url: `https://vidapi.xyz/embed/tv/${showID}/${season}/${episode}` },
        { name: `VidSrc - ${title} S${season}E${episode}`, url: `https://vidsrc.me/embed/tv/${showID}/${season}/${episode}` },
        { name: `2Embed - ${title} S${season}E${episode}`, url: `https://www.2embed.to/embed/imdb/${showID}/${season}/${episode}` }
    ];

    createSourceButtons(sources);
}

function createSourceButtons(sources) {
    const videoPlayer = document.getElementById("videoPlayer");
    const sourcesDiv = document.getElementById("sources");

    sources.forEach(source => {
        const button = document.createElement("button");
        button.innerText = source.name;
        button.onclick = () => {
            videoPlayer.src = source.url;
        };
        sourcesDiv.appendChild(button);
    });

    videoPlayer.src = sources[0].url;
}