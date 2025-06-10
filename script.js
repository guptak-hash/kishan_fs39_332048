import {API_KEY} from './config.js'
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const vidContainer = document.querySelector('.content-container');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchSuggestions = document.getElementById('searchSuggestions');

let nextPageToken = '';
let isLoading = false;


let debounceTimer;
// console.log('API_KEY >> ',API_KEY)
// Debounce function to limit API calls
const debounce = (func, delay) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
};

function throttle(func, delay) {
  let lastCall = 0;
  return function() {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      func();
      lastCall = now;
    }
  };
}

const checkScroll = throttle(() => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight - 300; // 300px buffer
  
  if (scrollPosition >= pageHeight && !isLoading && nextPageToken) {
    fetchPopularVid();
  }
}, 500); // Check at most every 500ms

window.addEventListener('scroll', checkScroll);

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


const displaySearchResults = (videos, shouldAppend = false) => {
  if (!shouldAppend) {
    vidContainer.innerHTML = "";
  }

  videos.forEach(video => {
    // Your existing video card creation code
    const { thumbnails, title, channelTitle, publishedAt } = video.snippet;
        const videoId = video.id.videoId || video.id; // Fixed ID access

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
                <div class="video-player">
                    <iframe width="100%" height="315"
                        src="https://www.youtube.com/embed/${videoId}?enablejsapi=1"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
                <button id="back-button">Back</button>
            `;
            
            document.getElementById('back-button').addEventListener('click', () => {
                displaySearchResults(videos);
            });
        });

    vidContainer.appendChild(vidCard);
  });
  
  // Show/hide loading indicator
  document.getElementById('loading').style.display = 
    nextPageToken ? 'block' : 'none';
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



const fetchPopularVid = async () => {
  if (isLoading) return;
  console.log('nextPageToken >> ',nextPageToken)
  isLoading = true;
  
  try {
    const url = `${BASE_URL}/videos?part=snippet&chart=mostPopular&maxResults=20${
      nextPageToken ? `&pageToken=${nextPageToken}` : ''
    }&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    nextPageToken = data.nextPageToken || '';
    const modifiedItems = data.items.map(item => ({
      id: { videoId: item.id },
      snippet: item.snippet
    }));
    
    displaySearchResults(modifiedItems, !!nextPageToken);
  } catch (error) {
    console.error('Error loading more videos:', error);
  } finally {
    isLoading = false;
  }
};


// Load first batch of videos when page loads
window.addEventListener('DOMContentLoaded', fetchPopularVid);
// fetchPopularVid();