// Constants
const SELECTORS = {
    VIDEO_PLAYER_CONTROLS: '.ytp-right-controls',
    VIDEO_STREAM: '.video-stream',
    VIDEO_TITLE: '.ytp-title-link',
    CUSTOM_BUTTON: '#customButton'
};

const API_ENDPOINTS = {
    SAVE_TIMESTAMP: 'http://localhost:8080/api/send'
};

class YouTubeTimestampManager {
    constructor() {
        this.isLoading = false;
        this.buttonContainer = null;
        this.button = null;
        this.observer = null;
        this.lastKnownTime = 0;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    createButtonSVG() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("height", "100%");
        svg.setAttribute("version", "1.1");
        svg.setAttribute("viewBox", "0 0 36 36");
        svg.setAttribute("width", "100%");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M8 4v20l10-6 10 6V4H8z");
        path.setAttribute("fill", "#fff");

        svg.appendChild(path);
        return svg;
    }

    createButton() {
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.className = 'ytp-button';

        this.button = document.createElement('button');
        this.button.id = 'customButton';
        this.button.className = 'ytp-button';
        this.button.setAttribute('aria-label', 'Save timestamp');
        this.button.setAttribute('title', 'Save current timestamp');

        this.button.appendChild(this.createButtonSVG());
        this.buttonContainer.appendChild(this.button);

        this.button.addEventListener('click', this.handleButtonClick.bind(this));
        return this.buttonContainer;
    }

    showFeedback(success) {
        const color = success ? '#2ecc71' : '#e74c3c';
        const message = success ? 'Timestamp saved!' : 'Error saving timestamp';

        // Visual feedback on button
        this.button.style.backgroundColor = color;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'timestamp-tooltip';
        tooltip.textContent = message;
        tooltip.style.cssText = `
        position: absolute;
        background: ${color};
        color: white;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        bottom: 45px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s;
      `;

        this.buttonContainer.appendChild(tooltip);
        requestAnimationFrame(() => tooltip.style.opacity = '1');

        setTimeout(() => {
            this.button.style.backgroundColor = '';
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.remove(), 300);
        }, 2000);
    }

    async getCurrentVideoInfo() {
        const video = document.querySelector(SELECTORS.VIDEO_STREAM);
        if (!video) throw new Error('Video element not found');

        const videoUrl = window.location.href;
        const currentTime = video.currentTime;
        const videoTitle = document.querySelector(SELECTORS.VIDEO_TITLE)?.textContent || '';
        const thumbnailUrl = `https://img.youtube.com/vi/${this.getVideoId(videoUrl)}/mqdefault.jpg`;

        return {
            url: videoUrl,
            timestamp: currentTime,
            title: videoTitle,
            formattedTime: this.formatTime(currentTime),
            thumbnailUrl
        };
    }

    getVideoId(url) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('v');
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    async saveTimestamp(data, attempts = this.retryAttempts) {
        try {
            const response = await fetch(API_ENDPOINTS.SAVE_TIMESTAMP, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (attempts > 1) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.saveTimestamp(data, attempts - 1);
            }
            throw error;
        }
    }

    async handleButtonClick() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.button.classList.add('loading');

            const videoInfo = await this.getCurrentVideoInfo();

            // Save current time in case of error
            this.lastKnownTime = videoInfo.timestamp;

            await this.saveTimestamp(videoInfo);
            this.showFeedback(true);

            // Notify background script for badge update
            chrome.runtime.sendMessage({ type: 'TIMESTAMP_SAVED', data: videoInfo });

        } catch (error) {
            console.error('Error saving timestamp:', error);
            this.showFeedback(false);
        } finally {
            this.isLoading = false;
            this.button.classList.remove('loading');
        }
    }

    addCustomButton() {
        const videoPlayerControls = document.querySelector(SELECTORS.VIDEO_PLAYER_CONTROLS);
        if (!videoPlayerControls || document.querySelector(SELECTORS.CUSTOM_BUTTON)) return;

        videoPlayerControls.insertBefore(this.createButton(), videoPlayerControls.firstChild);
    }

    init() {
        this.addCustomButton();

        // Create observer for dynamic content changes
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    this.addCustomButton();
                }
            }
        });

        // Start observing with a more specific target
        this.observer.observe(document.body, { childList: true, subtree: true });

        // Clean up on navigation
        window.addEventListener('beforeunload', () => {
            this.observer?.disconnect();
        });
    }
}

// Initialize the manager
const timestampManager = new YouTubeTimestampManager();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => timestampManager.init());
} else {
    timestampManager.init();
}