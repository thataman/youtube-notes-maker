import express from 'express';
import {
  createSlide,
  getSlidesByVideoId,
  updateSlideNotes,
  deleteSlide,
} from '../controllers/slideController';

const router = express.Router();

router.post('/', createSlide);
router.get('/video/:videoId', getSlidesByVideoId);
router.patch('/:slideId/notes', updateSlideNotes); // Use PATCH for partial updates
router.delete('/:slideId', deleteSlide);

export default router;