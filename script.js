require('dotenv').config()
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const vidContainer = document.querySelector('.content-container');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchSuggestions = document.getElementById('searchSuggestions');
const API_KEY=process.env.API_KEY;

let debounceTimer;

// Debounce function to limit API calls
const debounce = (func, delay) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
};

// Fetch search suggestions
const fetchSuggestions = async (query) => {
    if (!query) {
        searchSuggestions.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/search?part=snippet&maxResults=5&q=${query}&type=video&key=${API_KEY}`
        );
        const data = await response.json();
        displaySuggestions(data.items);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
};

// Display search suggestions
const displaySuggestions = (suggestions) => {
    if (!suggestions || suggestions.length === 0) {
        searchSuggestions.style.display = 'none';
        return;
    }

    searchSuggestions.innerHTML = '';
    suggestions.forEach(item => {
        const suggestion = document.createElement('div');
        suggestion.classList.add('search-suggestion-item');
        suggestion.textContent = item.snippet.title;
        suggestion.addEventListener('click', () => {
            searchInput.value = item.snippet.title;
            searchVideos(item.snippet.title);
            searchSuggestions.style.display = 'none';
        });
        searchSuggestions.appendChild(suggestion);
    });
    searchSuggestions.style.display = 'block';
};

// Search videos function
const searchVideos = async (query) => {
    if (!query) return;

    try {
        const response = await fetch(
            `${BASE_URL}/search?part=snippet&maxResults=20&q=${query}&type=video&key=${API_KEY}`
        );
        const data = await response.json();
        displaySearchResults(data.items);
    } catch (error) {
        console.error('Error searching videos:', error);
    }
};

// Display search results
const displaySearchResults = (videos) => {
    vidContainer.innerHTML = "";

    videos.forEach(video => {
        const { thumbnails, title, channelTitle, publishedAt } = video.snippet;
        const videoId = video.id.videoId;

        const vidCard = document.createElement('div');
        vidCard.classList.add('vid-card');
        vidCard.innerHTML = `
            <img class="thumbnail" src="${thumbnails.medium.url}" alt="${title}">
            <div class="video-info">
                <h4>${title}</h4>
                <p>${channelTitle}</p>
                <p>${new Date(publishedAt).toLocaleDateString()}</p>
            </div>
        `;

        vidCard.addEventListener('click', () => {
            vidContainer.innerHTML = `
                <iframe width="100%" height="315"
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write;
                    encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen>
                </iframe>
            `;
        });

        vidContainer.appendChild(vidCard);
    });
};

// Event listeners
searchInput.addEventListener('input', () => {
    debounce(() => fetchSuggestions(searchInput.value), 300);
});

searchButton.addEventListener('click', () => {
    searchVideos(searchInput.value);
    searchSuggestions.style.display = 'none';
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchVideos(searchInput.value);
        searchSuggestions.style.display = 'none';
    }
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchSuggestions.style.display = 'none';
    }
});

// Initial load of popular videos
const fetchPopularVid = () => {
    fetch(`${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=IN&maxResults=20&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            // Modify items to match search result structure
            const modifiedItems = data.items.map(item => ({
                id: { videoId: item.id },
                snippet: item.snippet
            }));
            displaySearchResults(modifiedItems);
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
};

fetchPopularVid();