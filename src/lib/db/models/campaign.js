import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  platforms: [{
    type: String,
    enum: ['facebook', 'instagram'],
    required: true
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Prevent duplicate model creation
export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
