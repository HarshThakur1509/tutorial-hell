// background.js

let savedTimestamps = 0;

chrome.runtime.onInstalled.addListener(() => {
    console.log('YouTube Timestamp Saver installed');
    chrome.storage.local.set({ savedTimestamps: 0 });
});



async function sendDataToBackend(data) {
    try {
        const cookieName = '_gothic_session';
        const backendUrl = 'http://localhost:3000';
        const frontendUrl = 'http://localhost';

        // Retrieve the session cookie
        const cookie = await new Promise((resolve, reject) => {
            chrome.cookies.get({ url: frontendUrl, name: cookieName }, (cookie) => {
                cookie ? resolve(cookie.value) : reject(new Error('Cookie not found'));
            });
        });

        // Send a POST request to the backend
        const response = await fetch(`${backendUrl}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `${cookieName}=${cookie}`
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error sending data to backend:', error);
        throw error;
    }
}
const getCookie = async () => {
    return new Promise((resolve) => {
        chrome.cookies.get({ url: 'http://localhost', name: '_gothic_session' }, (cookie) => {
            resolve(cookie ? { success: true, cookie: cookie.value } : { success: false, error: 'No auth cookie found' });
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handleAsync = async () => {
        const cookie = await getCookie();
        switch (message.type) {
            case 'GET_COOKIE':

                sendResponse(cookie);
                break;

            case 'GET_USER_DATA':
                try {
                    const userData = await fetchUserData();
                    sendResponse({ success: true, data: userData });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
                break;

            case 'SEND_DATA':
                try {
                    const responseData = await sendDataToBackend(message.data);
                    sendResponse({ success: true, data: responseData });
                } catch (error) {
                    sendResponse({ success: false, error: error.message });
                }
                break;

            case 'TIMESTAMP_SAVED':
                savedTimestamps++;
                chrome.action.setBadgeText({ text: savedTimestamps.toString(), tabId: sender.tab.id });
                chrome.action.setBadgeBackgroundColor({ color: '#2ecc71' });
                chrome.storage.local.set({ savedTimestamps });
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon128.png',
                    title: 'Timestamp Saved!',
                    message: `Saved at ${message.data.formattedTime} - ${message.data.title}`
                });
                break;
        }
    };

    handleAsync();
    return true; // Indicates that the response will be sent asynchronously
});

// Reset badge when navigating away from YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.url?.includes('youtube.com')) {
        chrome.action.setBadgeText({ text: '', tabId });
    }
});