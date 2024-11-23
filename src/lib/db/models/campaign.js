import mongoose from 'mongoose';

// Delete the existing model if it exists
if (mongoose.models.Campaign) {
  delete mongoose.models.Campaign;
}

const postSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  platform: { 
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin'],
    required: true 
  },
  idea: { type: String, required: true },
  imagePrompt: { type: String, required: true }
});

const campaignSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  connection: { type: String, required: true },
  platforms: [{
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin'],
    required: true
  }],
  generatedPosts: [postSchema], 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Campaign = mongoose.model('Campaign', campaignSchema);
