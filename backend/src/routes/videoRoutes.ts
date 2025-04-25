import express from 'express';
import { getVideos, getVideoById } from '../controllers/videoController';

const router = express.Router();

router.get('/', getVideos);
router.get('/:videoId', getVideoById); // Might not be strictly necessary

export default router;