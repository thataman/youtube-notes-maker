import React, { useState, useEffect, useCallback } from 'react';
import { fetchSlidesForVideo } from '../services/api';
import { generatePdfFromSlides } from '../utils/pdfGenerator'; // Import PDF generator
import Slide from './Slide'; // Import Slide component

const VideoDetail = ({ video, onBack }) => {
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const loadSlides = useCallback(async () => {
    if (!video?.videoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSlides = await fetchSlidesForVideo(video.videoId);
      setSlides(fetchedSlides);
    } catch (err) {
      setError(err.message || `Failed to load slides for ${video.title}`);
    } finally {
      setIsLoading(false);
    }
  }, [video?.videoId]); // Depend on videoId

  useEffect(() => {
    loadSlides();
  }, [loadSlides]); // Run loadSlides when it changes (i.e., when videoId changes)

  const handlePdfGeneration = async () => {
      if (isGeneratingPdf) return;
      setIsGeneratingPdf(true);
      try {
          await generatePdfFromSlides(slides, video.title || 'YouTube Video Notes');
      } catch (err) {
          console.error("PDF Generation failed:", err);
          alert("Failed to generate PDF. See console for details.");
      } finally {
          setIsGeneratingPdf(false);
      }
  };

  // Callback to update a slide in the local state after save
  const handleSlideUpdate = useCallback((updatedSlide) => {
      setSlides(currentSlides =>
          currentSlides.map(s => s._id === updatedSlide._id ? updatedSlide : s)
      );
  }, []);

   // Callback to remove a slide from the local state after delete
   const handleSlideDelete = useCallback((deletedSlideId) => {
       setSlides(currentSlides =>
           currentSlides.filter(s => s._id !== deletedSlideId)
       );
   }, []);

  if (!video) {
    return <div>Select a video from the list.</div>; // Should ideally not happen if managed by App.jsx
  }

  return (
    <div style={styles.detailContainer}>
      <button onClick={onBack} style={styles.backButton}>← Back to List</button>
      <h2 style={styles.title}>{video.title}</h2>
      <a href={video.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
        Watch on YouTube
      </a>

      {isLoading && <p>Loading slides...</p>}
      {error && <p style={styles.error}>Error: {error}</p>}

      {!isLoading && !error && (
        <>
          <button
            onClick={handlePdfGeneration}
            disabled={slides.length === 0 || isGeneratingPdf}
            style={styles.pdfButton}
          >
            {isGeneratingPdf ? 'Generating PDF...' : 'Download Slides as PDF'}
          </button>

          {slides.length > 0 ? (
            <div style={styles.slidesGrid}>
              {slides.map((slide) => (
                <Slide
                    key={slide._id}
                    slide={slide}
                    onSlideUpdate={handleSlideUpdate}
                    onSlideDelete={handleSlideDelete}
                />
              ))}
            </div>
          ) : (
            <p>No slides captured for this video yet.</p>
          )}
        </>
      )}
    </div>
  );
};

// --- Basic Styling ---
const styles = {
    detailContainer: {
        padding: '20px',
        borderLeft: '1px solid #eee', // Separate from list
        flexGrow: 1, // Take remaining space
        overflowY: 'auto', // Allow scrolling of details
        height: 'calc(100vh - 40px)', // Example height adjustment
    },
    backButton: {
        marginBottom: '15px',
        padding: '8px 12px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        background: '#f0f0f0',
        borderRadius: '4px',
    },
    title: {
        marginTop: '0',
        marginBottom: '5px',
        color: '#333',
    },
    link: {
        display: 'inline-block',
        marginBottom: '20px',
        color: '#007bff',
        textDecoration: 'none',
        fontSize: '0.9em',
    },
    pdfButton: {
        padding: '10px 15px',
        marginBottom: '20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1em',
        display: 'block', // Make it block level
    },
    slidesGrid: {
        // Optional: Use CSS Grid for better layout if needed
        // display: 'grid',
        // gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Responsive grid
        // gap: '20px',
    },
    error: {
        color: 'red',
    }
};


export default VideoDetail;