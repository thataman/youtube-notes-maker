const BACKEND_URL = 'http://localhost:5001/api';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === "captureVideoElement" ) {

    function dataURLtoBlob(dataUrl) {
      const [header, base64] = dataUrl.split(',');
      const mime = header.match(/:(.*?);/)[1];
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }

      return new Blob([array], { type: mime });
    }


    (async () => {
     const dataurl = request.details.image
      const blob = dataURLtoBlob(dataurl);
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", "my_preset"); // from Cloudinary settings

      const response = await fetch("https://api.cloudinary.com/v1_1/de3xhsq68/image/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      console.log("CDN URL:", result.secure_url);

      // Prepare data payload for the backend
      


      const slideData = {
        // videoId: request.details.videoId,
        // videoTitle: request.details.videoTitle,
        videoUrl: request.details.videoUrl,
        // timestamp: request.details.timestamp,
        // currentTimeSeconds: request.details.currentTime,
        screenshotDataUrl: result.secure_url,
        notes: ""
      };
console.log(slideData);

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
    })()

    return true;
  }

 
});

chrome.action.onClicked.addListener((tab) => {

  const notesAppUrl = "http://localhost:5173";




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





