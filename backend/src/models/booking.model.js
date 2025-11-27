import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedSeats: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired', 'completed'],
      default: 'pending',
    },
    holdExpiresAt: Date,
    notes: String,
  },
  { timestamps: true }
);

BookingSchema.index({ ride: 1 });
BookingSchema.index({ passenger: 1 });
BookingSchema.index({ status: 1 });

export const Booking = mongoose.model('Booking', BookingSchema);
