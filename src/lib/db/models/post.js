import mongoose from 'mongoose';

// Delete the existing model if it exists
if (mongoose.models.Post) {
  delete mongoose.models.Post;
}

const postSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  date: { type: Date, required: true },
  platform: { 
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin'],
    required: true 
  },
  idea: { type: String, required: true },
  imagePrompt: { type: String, required: true },
  imageUrl: { type: String },
  status: { 
    type: String, 
    enum: ['draft', 'generated', 'scheduled', 'published'],
    default: 'draft'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Post = mongoose.model('Post', postSchema);
