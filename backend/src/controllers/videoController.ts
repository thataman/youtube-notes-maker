import { Request, Response } from 'express';
import Video, { IVideo } from '../models/Video';
import Slide from '../models/Slide'; // Import Slide model if needed for deletion cascade etc.

// Get all unique videos that have associated notes
export const getVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find all unique videoIds present in the Slides collection
    const distinctVideoIds = await Slide.distinct('videoId');

    // Fetch the corresponding video details (could be optimized)
    // This assumes you store video details *somewhere*. If not stored in a separate
    // Video collection, you might need to fetch details from Slides based on latest entry.

     // Alternative: Fetch latest slide for each videoId to get title/url
     const videosData = await Promise.all(distinctVideoIds.map(async (videoId) => {
         const latestSlide = await Slide.findOne({ videoId }).sort({ createdAt: -1 }).limit(1);
         // Attempt to find Video doc, fallback to slide info if needed
         const videoDoc = await Video.findOne({ videoId });
         return {
             videoId: videoId,
             // Use title/url from Video doc if available, otherwise from latest slide
             title: videoDoc?.title || latestSlide?.get('videoTitle') || 'Unknown Title', // Assuming slide schema might store title temporarily
             url: videoDoc?.url || latestSlide?.get('videoUrl') || `https://www.youtube.com/watch?v=${videoId}`, // Assuming slide schema might store url temporarily
             slideCount: await Slide.countDocuments({ videoId }),
             // Use lastAccessed from Video doc if available, otherwise from latest slide's creation time
             lastAccessed: videoDoc?.lastAccessed || latestSlide?.createdAt || new Date()
         };
     }));


    // Sort videos by last access time (most recent first)
    videosData.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());

    res.status(200).json(videosData);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

// Get a specific video's details (might not be needed if using the above approach)
export const getVideoById = async (req: Request, res: Response): Promise<void> => {
    try {
        const videoId = req.params.videoId;
        // Fetch the latest slide for this video to get current title/url if Video doc doesn't exist
        const latestSlide = await Slide.findOne({ videoId }).sort({ createdAt: -1 }).limit(1);
        if (!latestSlide) {
            res.status(404).json({ message: 'Video not found (no slides exist)' });
            return;
        }
         // Attempt to find Video doc
         const videoDoc = await Video.findOne({ videoId });

         const videoData = {
             videoId: videoId,
             title: videoDoc?.title || latestSlide?.get('videoTitle') || 'Unknown Title',
             url: videoDoc?.url || latestSlide?.get('videoUrl') || `https://www.youtube.com/watch?v=${videoId}`,
             slideCount: await Slide.countDocuments({ videoId }),
             lastAccessed: videoDoc?.lastAccessed || latestSlide?.createdAt || new Date()
         };

        res.status(200).json(videoData);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching video details', error: error.message });
    }
};