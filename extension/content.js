// Constants
const SELECTORS = {
    VIDEO_PLAYER_CONTROLS: '.ytp-right-controls',
    VIDEO_STREAM: '.video-stream',
    VIDEO_TITLE: '.ytp-title-link',
    CUSTOM_BUTTON: '#customButton'
};

class YouTubeTimestampManager {
    constructor() {
        this.isLoading = false;
        this.buttonContainer = null;
        this.button = null;
        this.observer = null;
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

        this.button.style.backgroundColor = color;

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
            const { success, cookie, error } = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ type: 'GET_COOKIE' }, (response) => {
                    resolve(response);
                });
            });

            if (!success) throw new Error(error || 'User is not authenticated.');

            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ type: 'SEND_DATA', data: data }, (response) => {
                    resolve(response);
                });
            });

            if (!response.success) throw new Error(response.error || 'Failed to send data to backend');
            return response.data;
        } catch (error) {
            console.error('Error saving timestamp:', error);
            if (attempts > 1) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.saveTimestamp(data, attempts - 1);
            }
            throw error;
        }
    }

    async handleButtonClick() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.button.classList.add('loading');

        try {
            const videoInfo = await this.getCurrentVideoInfo();
            await this.saveTimestamp(videoInfo);
            this.showFeedback(true);

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

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    this.addCustomButton();
                }
            }
        });

        this.observer.observe(document.body, { childList: true, subtree: true });

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