import mongoose, { Document, Schema } from 'mongoose';

export interface ISlide extends Document {
  video: mongoose.Schema.Types.ObjectId | string; // Reference to Video model or just store videoId string
  videoId: string; // Denormalized for easier querying if not populating often
  timestamp: string; // Formatted timestamp (e.g., "01:23")
  currentTimeSeconds: number; // Precise time in seconds
  screenshotDataUrl: string; // Base64 encoded image data
  notes: string; // User's text notes for this slide
  createdAt: Date;
}

const SlideSchema: Schema = new Schema({
  // If you want strict references (requires ensuring Video exists first):
  // video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  // If simpler approach is ok (easier to insert slides without checking video first):
  videoId: { type: String, required: true, index: true },
  timestamp: { type: String, required: true },
  currentTimeSeconds: { type: Number, required: true },
  screenshotDataUrl: { type: String, required: true }, // Can be large! Consider alternatives for production (like storing in S3 and saving URL).
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISlide>('Slide', SlideSchema);