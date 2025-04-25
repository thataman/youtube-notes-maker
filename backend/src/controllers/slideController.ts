import { Request, Response } from 'express';
import Slide, { ISlide } from '../models/Slide';
import Video from '../models/Video'; // Import Video model

// Create a new slide (and potentially update/create the associated Video document)
export const createSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId, videoTitle, videoUrl, timestamp, currentTimeSeconds, screenshotDataUrl, notes } = req.body;

    if (!videoId || !timestamp || !currentTimeSeconds || !screenshotDataUrl) {
      res.status(400).json({ message: 'Missing required slide data' });
      return;
    }

    // 1. Create the new slide
    const newSlide = new Slide({
      videoId,
      // Note: storing title/url on slide might be redundant if Video model is used reliably
      // videoTitle, videoUrl, // <-- Consider removing if Video model is source of truth
      timestamp,
      currentTimeSeconds,
      screenshotDataUrl,
      notes: notes || '', // Ensure notes is at least an empty string
    });
    const savedSlide = await newSlide.save();

    // 2. Upsert (update or insert) the Video document
    // This ensures we have a record of the video and its latest title/URL/access time
    await Video.findOneAndUpdate(
      { videoId: videoId },
      {
        $set: {
            title: videoTitle || 'YouTube Video', // Use provided title or a default
            url: videoUrl || `https://www.youtube.com/watch?v=${videoId}`,
            lastAccessed: new Date(), // Update last accessed time
        },
        $setOnInsert: { // Fields to set only when creating a new Video doc
            videoId: videoId,
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true } // Create if doesn't exist
    );

    res.status(201).json(savedSlide);
  } catch (error: any) {
     console.error("Error creating slide:", error); // Log detailed error
     // Handle potential large payload error (like base64 image)
     if (error.name === 'MongoError' && error.code === 16) { // Example error code check
         res.status(413).json({ message: 'Error creating slide: Payload too large. Image might be too big.', error: error.message });
     } else {
        res.status(500).json({ message: 'Error creating slide', error: error.message });
     }
  }
};

// Get all slides for a specific video
export const getSlidesByVideoId = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = req.params.videoId;
    if (!videoId) {
        res.status(400).json({ message: 'Video ID is required' });
        return;
    }
    // Sort by time in video
    const slides = await Slide.find({ videoId }).sort({ currentTimeSeconds: 1 });
    res.status(200).json(slides);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching slides', error: error.message });
  }
};

// Update notes for a specific slide
export const updateSlideNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const slideId = req.params.slideId;
    const { notes } = req.body;

    if (notes === undefined) {
        res.status(400).json({ message: 'Notes field is required for update' });
        return;
    }

    const updatedSlide = await Slide.findByIdAndUpdate(
      slideId,
      { $set: { notes: notes } },
      { new: true } // Return the updated document
    );

    if (!updatedSlide) {
      res.status(404).json({ message: 'Slide not found' });
      return;
    }

    res.status(200).json(updatedSlide);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating slide notes', error: error.message });
  }
};

// Delete a specific slide
export const deleteSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    const slideId = req.params.slideId;
    const deletedSlide = await Slide.findByIdAndDelete(slideId);

    if (!deletedSlide) {
      res.status(404).json({ message: 'Slide not found' });
      return;
    }

    // Optional: Check if this was the last slide for a video and delete the video doc?
    // const remainingSlides = await Slide.countDocuments({ videoId: deletedSlide.videoId });
    // if (remainingSlides === 0) {
    //   await Video.deleteOne({ videoId: deletedSlide.videoId });
    // }

    res.status(200).json({ message: 'Slide deleted successfully', slideId: slideId });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting slide', error: error.message });
  }
};