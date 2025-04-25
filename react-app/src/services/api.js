import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api'; // Match backend port

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Video Endpoints ---
export const fetchVideos = async () => {
  try {
    const response = await apiClient.get('/videos');
    return response.data;
  } catch (error) {
    console.error("Error fetching videos:", error.response?.data || error.message);
    throw error; // Re-throw to be handled by the component
  }
};

// --- Slide Endpoints ---
export const fetchSlidesForVideo = async (videoId) => {
  try {
    const response = await apiClient.get(`/slides/video/${videoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching slides for video ${videoId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const updateSlideNotes = async (slideId, notes) => {
   try {
     const response = await apiClient.patch(`/slides/${slideId}/notes`, { notes });
     return response.data;
   } catch (error) {
     console.error(`Error updating notes for slide ${slideId}:`, error.response?.data || error.message);
     throw error;
   }
 };

export const deleteSlide = async (slideId) => {
  try {
    const response = await apiClient.delete(`/slides/${slideId}`);
    return response.data; // Contains success message and slideId
  } catch (error) {
    console.error(`Error deleting slide ${slideId}:`, error.response?.data || error.message);
    throw error;
  }
};

export default apiClient; // Can be used for other custom requests