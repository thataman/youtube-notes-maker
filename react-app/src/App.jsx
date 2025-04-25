import React, { useState, useEffect, useCallback } from 'react';
import VideoList from './components/VideoList';
import VideoDetail from './components/VideoDetail';
import { fetchVideos } from './services/api';
import './index.css'; // Include base styles

function App() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedVideos = await fetchVideos();
      setVideos(fetchedVideos);
      // Optional: Automatically select the first video or the previously selected one
      if (fetchedVideos.length > 0 && !selectedVideo) {
          // setSelectedVideo(fetchedVideos[0]); // Select first by default
      } else if (selectedVideo) {
          // Reselect if the video still exists after refresh
          const currentSelected = fetchedVideos.find(v => v.videoId === selectedVideo.videoId);
          setSelectedVideo(currentSelected || (fetchedVideos.length > 0 ? fetchedVideos[0] : null));
      }

    } catch (err) {
      setError(err.message || 'Failed to load video list.');
      setVideos([]); // Clear videos on error
    } finally {
      setIsLoading(false);
    }
  }, [selectedVideo]); // Reload if selectedVideo changes? Maybe not necessary.

  useEffect(() => {
    loadVideos();
    // Optionally poll for updates? Or rely on manual refresh / extension interaction.
    // const intervalId = setInterval(loadVideos, 30000); // Refresh every 30 seconds
    // return () => clearInterval(intervalId);
  }, [loadVideos]); // Rerun when loadVideos function identity changes (it won't often with useCallback unless deps change)

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleBackToList = () => {
      setSelectedVideo(null);
      // Optional: Reload video list in case counts changed
      loadVideos();
  }

  return (
    <div style={styles.appContainer}>
      {isLoading && <div style={styles.loading}>Loading videos...</div>}
      {error && <div style={styles.error}>Error loading videos: {error} <button onClick={loadVideos}>Retry</button></div>}
      {!isLoading && !error && (
          <>
              {/* Always show list, conditionally show detail */}
              <VideoList
                videos={videos}
                onSelectVideo={handleSelectVideo}
                selectedVideoId={selectedVideo?.videoId}
              />
              <div style={styles.detailView}>
                  {selectedVideo ? (
                      <VideoDetail
                          key={selectedVideo.videoId} // Force re-render on video change
                          video={selectedVideo}
                          onBack={handleBackToList}
                      />
                  ) : (
                      <div style={styles.placeholder}>Select a video from the list to view its notes.</div>
                  )}
               </div>
          </>
      )}
    </div>
  );
}

// --- Basic Styling ---
const styles = {
  appContainer: {
    display: 'flex',
    height: '100vh', // Full viewport height
    fontFamily: 'sans-serif',
  },
  detailView: {
      flexGrow: 1, // Takes up remaining space
      overflow: 'hidden', // Prevents content from overflowing app container
  },
  loading: {
      padding: '20px',
      textAlign: 'center',
      width: '100%',
  },
  error: {
      padding: '20px',
      color: 'red',
      textAlign: 'center',
      width: '100%',
  },
  placeholder: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: '#6c757d',
      fontSize: '1.1em',
      padding: '20px',
      textAlign: 'center',
  }
};

export default App;