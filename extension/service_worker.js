console.log("YouTube Notes Service Worker Loaded!");

// --- Configuration ---
const BACKEND_URL = 'http://localhost:5001/api'; // Make sure this matches backend

// --- Listener for messages from content script ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Service Worker received message:", sender);
  if (request.action === "captureVisibleTab") {
    console.log("Service Worker received capture request for:", request.details.videoId);

    // Capture the visible tab (requires activeTab permission)
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId, // Use the windowId from the sender's tab
      { format: "png" }, // or "jpeg"
      async (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error("Screenshot failed:", chrome.runtime.lastError.message);
          sendResponse({ status: "error", error: `Screenshot failed: ${chrome.runtime.lastError.message}` });
          return;
        }

        if (!dataUrl) {
            console.error("Screenshot failed: No data URL returned.");
            sendResponse({ status: "error", error: "Screenshot failed: No data URL returned." });
            return;
        }

        console.log("Screenshot taken, size:", Math.round(dataUrl.length / 1024), "KB");

        // Prepare data payload for the backend
        const slideData = {
          videoId: request.details.videoId,
          videoTitle: request.details.videoTitle,
          videoUrl: request.details.videoUrl,
          timestamp: request.details.timestamp,
          currentTimeSeconds: request.details.currentTime,
          screenshotDataUrl: dataUrl, // Send base64 data URL
          notes: "" // Initial empty notes field
        };

        // Send data to the backend API
        try {
          const response = await fetch(`${BACKEND_URL}/slides`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(slideData),
          });

          const responseData = await response.json();

          if (!response.ok) {
            console.error("Backend error:", responseData);
            throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
          }

          console.log("Slide saved successfully via backend:", responseData);
          sendResponse({ status: "success", data: responseData });

        } catch (error) {
          console.error("Failed to send data to backend:", error);
          sendResponse({ status: "error", error: `Failed to save slide: ${error.message}` });
        }
      }
    );

    // Return true to indicate you wish to send a response asynchronously
    return true;
  }
  // Handle other actions if needed
});

// --- Optional: Action Button Click ---
// If you want the extension icon to open your React app
chrome.action.onClicked.addListener((tab) => {
    // Define the URL where your React app will be hosted or served
    // Option 1: If hosted externally (e.g., Netlify, Vercel, localhost:3000)
    const notesAppUrl = "http://localhost:5173"; // Adjust port if using Vite/CRA default

    // Option 2: If bundling React app inside the extension (more complex setup)
    // const notesAppUrl = chrome.runtime.getURL("react_app_build/index.html");

    // Check if a tab with the notes app is already open
    chrome.tabs.query({ url: notesAppUrl + "*" }, (tabs) => {
        if (tabs.length > 0) {
            // Focus existing tab
            chrome.tabs.update(tabs[0].id, { active: true });
            chrome.windows.update(tabs[0].windowId, { focused: true });
        } else {
            // Open a new tab
            chrome.tabs.create({ url: notesAppUrl });
        }
    });
});


// Example popup (optional)
// Create popup.html and popup.js if you want a popup interface
// popup.html
/*
<!DOCTYPE html>
<html>
<head>
  <title>YT Notes</title>
  <style> body { width: 150px; font-family: sans-serif; padding: 10px; } button { width: 100%; padding: 8px; margin-top: 5px; } </style>
</head>
<body>
  <h4>YT Notes</h4>
  <button id="openNotes">Open Notes App</button>
  <script src="popup.js"></script>
</body>
</html>
*/

// popup.js
/*
document.getElementById('openNotes').addEventListener('click', () => {
  const notesAppUrl = "http://localhost:5173"; // Or bundled URL
   chrome.tabs.query({ url: notesAppUrl + "*" }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { active: true });
            chrome.windows.update(tabs[0].windowId, { focused: true });
        } else {
            chrome.tabs.create({ url: notesAppUrl });
        }
        window.close(); // Close the popup
    });
});
*/