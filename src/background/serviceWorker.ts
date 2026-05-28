import { sendRequest } from '../api/httpClient';

// Check if chrome.runtime is available (standard in extension service worker environment)
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'SEND_REQUEST') {
      const { method, url, headers, body } = message.payload;

      sendRequest(method, url, headers, body)
        .then((response) => {
          sendResponse({ success: true, response });
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error: error.message || 'Background network thread error',
          });
        });

      // Returning true is required to indicate that the response will be sent asynchronously
      return true;
    }
  });
}
