
const API_ENDPOINT = 'http://localhost:5001/api';


let captureButton = null;



function getVideoElement() {

  return document.querySelector("video")
}

function getVideoDetails(videoElement, currentUrl) {
  if (!videoElement) return null;

  const currentTime = videoElement.currentTime;

  
  const partUrl = Math.round(currentTime);

     
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/png");
    
  



  return {
    // videoId,
    // videoTitle,
    image:image,
    
    videoUrl: `${currentUrl}&t=${partUrl}s`
  };
}

async function captureScreenshotAndSend() {
  const videoElement = getVideoElement();
  const currentUrl = window.location.href;
console.log(videoElement);

  if (!videoElement) {
    console.error("YouTube video element not found.");
    alert("Could not find the YouTube video player on this page.");
    return;
  }

  const details = getVideoDetails(videoElement, currentUrl);
 
  
  if (!details) {
     console.error("Could not get video details.");
     alert("Could not get video details.");
     return;
  }

  // Send message to service worker to capture the visible tab
  try {
    const response = await chrome.runtime.sendMessage({
      action: "captureVideoElement",
      details: details
    });

    console.log("Response from service worker:", response);
    

    if (response.status === 'success') {
        console.log('Screenshot captured and sent to backend.', response.data);
      
        showConfirmation(`Slide saved at ${details}`);
    } else {
        console.error('Failed to capture or save:', response.error);
        alert(`Error saving slide: ${response.error} ,${response.status}`);
    }
  } catch (error) {
      console.error("Error sending message to service worker:", error);
      // Check if the extension context was invalidated (common in MV3)
      if (error.message.includes("Extension context invalidated")) {
           alert("Extension context invalidated. Please try reloading the page or the extension.");
      } else {
           alert(`Communication error: ${error.message}`);
      }
  }
}

function showConfirmation(message) {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.textContent = message;
    confirmationDiv.style.position = 'fixed';
    confirmationDiv.style.bottom = '20px';
    confirmationDiv.style.right = '20px';
    confirmationDiv.style.padding = '10px 20px';
    confirmationDiv.style.backgroundColor = 'rgba(0, 200, 0, 0.8)';
    confirmationDiv.style.color = 'white';
    confirmationDiv.style.borderRadius = '5px';
    confirmationDiv.style.zIndex = '9999';
    confirmationDiv.style.fontSize = '14px';
    document.body.appendChild(confirmationDiv);

    setTimeout(() => {
        confirmationDiv.remove();
    }, 3000); // Remove after 3 seconds
}

function addCaptureButton() {
  if (document.getElementById('yt-notes-capture-btn')) return; // Already exists

  const playerControls = document.querySelector('.ytp-right-controls');
  if (playerControls) {
    console.log("button found");
    
    captureButton = document.createElement('button');
    captureButton.id = 'yt-notes-capture-btn';
    captureButton.textContent = '📸 Save Slide'; // Or use an icon
    captureButton.title = 'Save Screenshot with Timestamp';
    // Basic styling (add more in content_style.css if needed)
    captureButton.style.padding = '0 10px';
    captureButton.style.marginLeft = '8px';
    captureButton.style.cursor = 'pointer';
    captureButton.style.fontSize = '12px'; // Adjust as needed
    captureButton.style.height = '100%'; // Match other controls
    captureButton.style.border = 'none';
    captureButton.style.background = '#f00'; // Make it visible
    captureButton.style.color = 'white';
    captureButton.style.borderRadius = '2px';

    captureButton.onclick = (e) => {
        e.stopPropagation(); 
        captureScreenshotAndSend();
    };

    // Insert before the fullscreen button for better placement
    const fullscreenButton = playerControls.querySelector('.ytp-fullscreen-button');
    if (fullscreenButton) {
        playerControls.insertBefore(captureButton, fullscreenButton);
    } else {
        playerControls.appendChild(captureButton); // Fallback
    }
    console.log("Capture button added.");
  } else {
    console.warn("YouTube player controls not found yet. Retrying...");
    // Retry adding the button shortly - YouTube player loads dynamically
    setTimeout(addCaptureButton, 1000);
  }
}

// --- Initialization ---
// Use MutationObserver to reliably add the button when controls are ready
const observer = new MutationObserver((mutationsList, observer) => {
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
           if (document.querySelector('.ytp-right-controls') && !document.getElementById('yt-notes-capture-btn')) {
                addCaptureButton();
                // Optionally disconnect observer once button is added if not needed anymore
                // observer.disconnect();
           }
        }
    }
});

// Start observing the body for changes - adjust target node if needed
observer.observe(document.body, { childList: true, subtree: true });

// Initial attempt in case controls are already present
addCaptureButton();

// --- Optional: Add a keyboard shortcut ---
document.addEventListener('keydown', (event) => {
    // Example: Ctrl+Shift+S
    if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault(); // Prevent browser's default save action
        captureScreenshotAndSend();
    }
});