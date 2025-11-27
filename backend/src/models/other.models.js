import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    metadata: {},
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AdminLogSchema = new mongoose.Schema(
  {
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    action: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

export const Rating = mongoose.model('Rating', RatingSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const AdminLog = mongoose.model('AdminLog', AdminLogSchema);
