import React from 'react';

const VideoList = ({ videos, onSelectVideo, selectedVideoId }) => {
  return (
    <div style={styles.listContainer}>
      <h2 style={styles.header}>My Video Notes</h2>
      {videos.length === 0 && <p>No video notes found yet.</p>}
      <ul style={styles.ul}>
        {videos.map((video) => (
          <li
            key={video.videoId}
            onClick={() => onSelectVideo(video)}
            style={{
              ...styles.listItem,
              ...(selectedVideoId === video.videoId ? styles.selectedItem : {}), // Highlight selected
            }}
          >
            <span style={styles.title}>{video.title}</span>
            <span style={styles.count}>{video.slideCount} slide(s)</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Basic Styling ---
const styles = {
  listContainer: {
    width: '300px', // Fixed width for the list
    borderRight: '1px solid #eee',
    padding: '20px',
    height: 'calc(100vh - 40px)', // Example: Adjust based on overall layout
    overflowY: 'auto', // Allow scrolling if list is long
    backgroundColor: '#f8f9fa'
  },
  header: {
    marginTop: '0',
    marginBottom: '15px',
    fontSize: '1.4em',
    color: '#333',
  },
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '12px 10px',
    marginBottom: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedItem: {
      backgroundColor: '#e0e0e0', // Highlight selected item
      borderColor: '#007bff'
  },
  title: {
    fontWeight: '500',
    fontSize: '0.95em',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: '10px', // Space before count
  },
  count: {
    fontSize: '0.8em',
    color: '#6c757d',
    backgroundColor: '#e9ecef',
    padding: '2px 6px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
};

export default VideoList;