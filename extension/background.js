// background.js



let savedTimestamps = 0;

chrome.runtime.onInstalled.addListener(() => {
    console.log('YouTube Timestamp Saver installed');
    chrome.storage.local.set({ savedTimestamps: 0 });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TIMESTAMP_SAVED') {
        savedTimestamps++;

        // Update extension badge
        chrome.action.setBadgeText({
            text: savedTimestamps.toString(),
            tabId: sender.tab.id
        });
        chrome.action.setBadgeBackgroundColor({ color: '#2ecc71' });

        // Store count in local storage
        chrome.storage.local.set({ savedTimestamps });

        // Show notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon128.png',
            title: 'Timestamp Saved!',
            message: `Saved at ${message.data.formattedTime} - ${message.data.title}`
        });
    }
});

// Reset badge when navigating away from YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.url?.includes('youtube.com')) {
        chrome.action.setBadgeText({ text: '', tabId });
    }
});



