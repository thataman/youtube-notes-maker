import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  videoId: string; // YouTube's video ID
  title: string;
  url: string;
  lastAccessed: Date;
}

const VideoSchema: Schema = new Schema({
  videoId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  lastAccessed: { type: Date, default: Date.now },
});

export default mongoose.model<IVideo>('Video', VideoSchema);