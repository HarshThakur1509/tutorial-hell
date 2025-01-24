document.addEventListener('DOMContentLoaded', async () => {
    const videoList = document.getElementById('videoList');
    const loginButton = document.getElementById('loginButton');

    // Check if the user is authenticated
    const isAuthenticated = await checkAuthentication();

    if (!isAuthenticated) {
        videoList.innerHTML = `<div class="no-videos">Please login to view saved timestamps.</div>`;
        loginButton.style.display = 'block';
    } else {
        loginButton.style.display = 'none';
        loadVideos();
    }

    loginButton.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost/login' });
    });

    async function checkAuthentication() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'GET_COOKIE' }, (response) => {
                resolve(response.cookie);
            });
        });
    }

    async function loadVideos() {
        try {
            const response = await fetch('http://localhost:3000/video', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch videos');

            const videos = await response.json();
            if (videos.length === 0) {
                videoList.innerHTML = `<div class="no-videos">No saved timestamps yet.</div>`;
                return;
            }

            videos.sort((a, b) => new Date(b.UpdatedAt) - new Date(a.UpdatedAt));

            videoList.innerHTML = videos.map(video => `
                <div class="video-item">
                    <img id="thumbnail" src="https://img.youtube.com/vi/${video.WatchID}/mqdefault.jpg" alt="${video.Title}" />
                    <a href='https://www.youtube.com/watch?v=${video.WatchID}' target='_blank'>
                        ${video.Title || 'Untitled Video'}
                    </a>
                    <div class="video-time">
                        <span class="saved-at">Saved on ${new Date(video.CreatedAt).toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            videoList.innerHTML = `<div class="error">Error loading saved videos.</div>`;
            console.error('Error:', error);
        }
    }
});