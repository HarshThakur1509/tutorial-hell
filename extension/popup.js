// popup.js
document.addEventListener('DOMContentLoaded', async () => {
    const videoList = document.getElementById('videoList');

    try {
        const response = await fetch('https://tutorial.harshthakur.site/api/video');
        if (!response.ok) {
            throw new Error('Failed to fetch videos');
        }

        const videos = await response.json();
        console.log(videos);


        if (videos.length === 0) {
            videoList.innerHTML = `
                <div class="no-videos">
                    No saved timestamps yet. Watch a YouTube video and click the bookmark icon to save timestamps.
                </div>
            `;
            return;
        }

        // Sort videos by savedAt timestamp (most recent first)
        videos.sort((a, b) => new Date(b.UpdatedAt) - new Date(a.UpdatedAt));

        videoList.innerHTML = videos.map(video => {
            const savedDate = new Date(video.CreatedAt).toLocaleString();
            // Create URL with timestamp
            const videoUrl = `https://www.youtube.com/watch?v=${video.WatchID}`;

            return `
                <div class="video-item">
                <img id = "thumbnail" src = "https://img.youtube.com/vi/${video.WatchID}/default.jpg" alt = "${video.Title}" />
                    <a href='${videoUrl}' target='_blank'>
                        ${video.Title || 'Untitled Video'}
                    </a>
                    <div class="video-time">
                        <span class="saved-at">Saved on ${savedDate}</span>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        videoList.innerHTML = `
            <div class="error">
                Error loading saved videos. Please make sure the backend server is running.
            </div>
        `;
        console.error('Error:', error);
    }
});