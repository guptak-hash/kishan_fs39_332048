// 📌 JavaScript
const API_KEY = 'AIzaSyCnx_K8EkKFprUOnUwnLFg5z5tbultjyck';
const BASE_URL = 'https://www.googleapis.com/youtube/v3/videos';
const vidContainer = document.querySelector('.content-container');

const fetchPopularVid = () => {
  fetch(`${BASE_URL}?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=IN&maxResults=20&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      displayYtVid(data.items);
    })
    .catch(error => {
      console.error('Error fetching videos:', error);
    });
};

const displayYtVid = (videos) => {
  vidContainer.innerHTML = ""; // Clear previous content

  videos.forEach(video => {
    const { thumbnails, title, channelTitle, publishedAt } = video.snippet;
    const { viewCount } = video.statistics;
    const videoId = video.id;

    const vidCard = document.createElement('div');
    vidCard.classList.add('vid-card');
    vidCard.innerHTML = `
      <img class="thumbnail" src="${thumbnails.high.url}" alt="${title}">
      <div class="video-info">
        <h4>${title}</h4>
        <p>${channelTitle}</p>
        <p>${Number(viewCount).toLocaleString()} views • ${new Date(publishedAt).toLocaleDateString()}</p>
      </div>
    `;

    // Add click event to open iframe
    vidCard.addEventListener('click', () => {
      vidCard.innerHTML = `
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

fetchPopularVid();
