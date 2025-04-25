import React, { useState, useCallback } from 'react';
import { updateSlideNotes, deleteSlide } from '../services/api'; // Import API functions

const Slide = ({ slide, onSlideUpdate, onSlideDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(slide.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveNotes = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const updatedSlide = await updateSlideNotes(slide._id, currentNotes);
      setIsEditing(false);
      // Notify parent component about the update
      if (onSlideUpdate) {
          onSlideUpdate(updatedSlide);
      }
    } catch (err) {
      setError(err.message || 'Failed to save notes.');
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, [slide._id, currentNotes, isSaving, onSlideUpdate]);

  const handleDelete = useCallback(async () => {
     if (isDeleting) return;
     if (window.confirm('Are you sure you want to delete this slide?')) {
         setIsDeleting(true);
         setError(null);
         try {
            await deleteSlide(slide._id);
            // Notify parent component about the deletion
            if (onSlideDelete) {
                onSlideDelete(slide._id);
            }
         } catch (err) {
             setError(err.message || 'Failed to delete slide.');
             console.error("Delete failed:", err);
         } finally {
             setIsDeleting(false); // Keep component mounted until parent removes it
         }
     }
  }, [slide._id, isDeleting, onSlideDelete]);


  return (
    <div style={styles.slideContainer}>
      <div style={styles.timestamp}>{slide.timestamp}</div>
      <img
        src={slide.screenshotDataUrl}
        alt={`Screenshot at ${slide.timestamp}`}
        style={styles.image}
      />
      <div style={styles.notesSection}>
        {isEditing ? (
          <>
            <textarea
              style={styles.textarea}
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              rows={4}
              placeholder="Add your notes here..."
            />
            <div style={styles.buttonGroup}>
              <button onClick={handleSaveNotes} disabled={isSaving} style={styles.button}>
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
              <button onClick={() => setIsEditing(false)} disabled={isSaving} style={styles.buttonSecondary}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={styles.notesText}>{currentNotes || <i>No notes added yet.</i>}</p>
            <div style={styles.buttonGroup}>
                <button onClick={() => setIsEditing(true)} style={styles.button}>
                    Edit Notes
                </button>
                <button onClick={handleDelete} disabled={isDeleting} style={styles.buttonDelete}>
                    {isDeleting ? 'Deleting...' : 'Delete Slide'}
                </button>
            </div>
          </>
        )}
        {error && <p style={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
};

// --- Basic Styling ---
const styles = {
  slideContainer: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  timestamp: {
    fontWeight: 'bold',
    fontSize: '1.1em',
    color: '#333',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '4px',
    border: '1px solid #eee',
    objectFit: 'contain', // Ensure image fits well
  },
  notesSection: {
    marginTop: '10px',
  },
  notesText: {
    whiteSpace: 'pre-wrap', // Preserve line breaks
    fontSize: '0.95em',
    color: '#555',
    minHeight: '40px', // Ensure space even when empty
  },
  textarea: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.95em',
    boxSizing: 'border-box', // Include padding in width
  },
  buttonGroup: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
  },
  buttonSecondary: {
    padding: '8px 15px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
  },
   buttonDelete: {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
    marginLeft: 'auto', // Push delete button to the right
  },
  errorText: {
      color: 'red',
      fontSize: '0.9em',
      marginTop: '5px',
  },
};

export default Slide;