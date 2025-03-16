function search() {
let q = document.querySelector("#q_field").value.trim().replaceAll(" ", "_");
const results_list = document.querySelector("#search-results");

if (q.length === 0) {    
    results_list.innerHTML = "<p class='text-center text-danger'>Please enter a search term.</p>";    
    return;    
}    

// Add loading spinner  
results_list.innerHTML = "<p class='text-center text-warning'><span class='spinner'></span> Searching...</p>";  

jQuery.ajax({  
    url: `https://sg.media-imdb.com/suggests/${q[0]}/${q}.json`,  
    dataType: "jsonp",  
    cache: true,  
    jsonp: false,  
    jsonpCallback: `imdb$${q}`,  
}).then((results) => {  
    results_list.innerHTML = "";  
    results.d.forEach((item) => {  
        if (item.id.startsWith("tt")) {  
            add_result(item);  
        }  
    });  
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
card_image.src = item.i;  
card_image.style.height = "200px";  

const card_title = document.createElement("h5");  
card_title.classList.add("card-title");  
card_title.innerHTML = `${item.l} (${item.y})`;  

card.appendChild(card_image);  
card_body.appendChild(card_title);  
card.appendChild(card_body);  

card.addEventListener("click", () => {  
    window.location.href = `watch.html?id=${item.id}&title=${encodeURIComponent(item.l)}&type=${item.q}`;  
});  

results.appendChild(card);  

// Adding animation effect  
setTimeout(() => {  
    card.classList.add("show");  
}, 100);

}


