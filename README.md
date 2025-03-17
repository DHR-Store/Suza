<h2>Watch Streaming Web App</h2>

A simple web-based streaming app that allows users to
watch movies and TV shows (including web series, anime,
and cartoons) using IMDb IDs and API integration.

Features

✅ Watch movies with a single play button
✅ Browse TV show seasons & episodes dynamically
✅ Loads real images, names & details of episodes
✅ Hides video player until user clicks play
✅ Error handling for missing or incorrect data
✅ Fully responsive (works on mobile & desktop)

Project Structure

/watch-streaming-app
│── index.html             # Home page (Optional)
│── watch.html             # Main watch page for movies & TV shows
│── watch.js               # JavaScript logic for dynamic content
│── style.css              # (Optional) Add custom styling
│── README.md              # Documentation (this file)

Setup & Usage

1️⃣ Open watch.html with a Valid IMDb ID

Use the following URL formats:

➡️ For Movies

watch.html?id=tt0133093&type=movie&title=The+Matrix

id=tt0133093 → IMDb ID of The Matrix

type=movie → Movie mode

title=The+Matrix → Movie title


➡️ For TV Series / Anime / Cartoons

watch.html?id=tt0944947&type=series&title=Game+of+Thrones

id=tt0944947 → IMDb ID of Game of Thrones

type=series → Web series mode

title=Game+of+Thrones → Title


How It Works?

If it's a movie, it shows a "Play Movie" button.

If it's a TV show, it fetches seasons & episodes dynamically.

Clicking an episode starts streaming instantly.



---

Tech Stack

HTML5 (Structure)

CSS3 / Bootstrap 5 (Styling)

JavaScript (ES6+ Fetch API) (Logic)

TVMaze API (Fetch TV show details)

MultiEmbed API (For streaming videos)



Troubleshooting

🔴 Not Working? Try This:

✔️ Check Console (F12 → Console) for errors.
✔️ Make sure the IMDb ID is valid (Use real IDs).
✔️ Ensure watch.js is linked properly inside watch.html.
✔️ Check if APIs are working (TVMaze may sometimes be down).
✔️ Use a fresh browser session (Cache can cause issues).

Future Improvements

🔹 Add a search bar for automatic IMDb lookup.
🔹 Integrate more streaming providers.
🔹 Improve error handling & UI enhancements.
🔹 Add watch history & user preferences.

License

This project is open-source. Feel
free to use, modify, and improve it!

