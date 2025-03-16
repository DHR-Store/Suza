const API_KEY = "245f8617"; // अपनी OMDb API Key डालें
const BASE_URL = "https://www.omdbapi.com/";
let query = "";
let page = 1;
let isLoading = false;

document.querySelector("#q_field").addEventListener("input", () => {
    page = 1; // हर नए सर्च के साथ पेज नंबर रीसेट करें
});

function search() {
    query = document.querySelector("#q_field").value.trim();
    const results_list = document.querySelector("#search-results");

    if (query.length === 0) {      
        results_list.innerHTML = "<p class='text-center text-danger'>Please enter a search term.</p>";      
        return;      
    }

    results_list.innerHTML = "<p class='text-center text-warning'><span class='spinner'></span> Searching...</p>";
    page = 1; // नई सर्च के लिए पेज नंबर रीसेट करें
    results_list.innerHTML = ""; // पहले से मौजूद परिणाम हटाएँ

    fetchMovies();
}

function fetchMovies() {
    if (isLoading) return;
    isLoading = true;

    fetch(`${BASE_URL}?s=${query}&page=${page}&apikey=${API_KEY}`)  
        .then(response => response.json())  
        .then(results => {  
            if (results.Response === "True") {  
                results.Search.forEach(item => add_result(item));
                page++; // अगले पेज के लिए इनक्रीमेंट करें
                isLoading = false;
            } else {  
                if (page === 1) {
                    document.querySelector("#search-results").innerHTML = "<p class='text-center text-danger'>No results found.</p>";
                }
                isLoading = false;
            }
        })  
        .catch(() => {  
            isLoading = false;
        });
}

function add_result(item) {
    const results = document.querySelector("#search-results");

    const card = document.createElement("div");    
    card.classList.add("card", "m-3", "p-3", "col-md-4", "text-dark");    
    card.style.cursor = "pointer";    

    const card_body = document.createElement("div");    
    card_body.classList.add("card-body");    

    const card_image = document.createElement("img");    
    card_image.classList.add("card-img-top");    
    card_image.src = item.Poster !== "N/A" ? item.Poster : "placeholder.jpg";    
    card_image.style.height = "300px";    
    card_image.alt = item.Title;  

    const card_title = document.createElement("h5");    
    card_title.classList.add("card-title");    
    card_title.innerHTML = `${item.Title} (${item.Year})`;    

    card.appendChild(card_image);    
    card_body.appendChild(card_title);    
    card.appendChild(card_body);    

    card.addEventListener("click", () => {    
        window.location.href = `watch.html?id=${item.imdbID}&title=${encodeURIComponent(item.Title)}&poster=${encodeURIComponent(item.Poster !== "N/A" ? item.Poster : "placeholder.jpg")}`;    
    });    

    results.appendChild(card);
}

// **Infinite Scroll Listener**
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        fetchMovies(); // नए डेटा को लोड करें जब यूज़र नीचे स्क्रॉल करे
    }
});
