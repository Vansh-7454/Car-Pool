import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const WaypointSchema = new mongoose.Schema(
  {
    text: String,
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const RideSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startLocation: { type: LocationSchema, required: true },
    endLocation: { type: LocationSchema, required: true },
    waypoints: [WaypointSchema],
    startDateTime: { type: Date, required: true },
    totalSeats: { type: Number, required: true },
    remainingSeats: { type: Number, required: true },
    pricePerSeat: { type: Number, required: true },
    status: {
      type: String,
      enum: ['open', 'full', 'cancelled'],
      default: 'open',
    },
    notes: String,
  },
  { timestamps: true }
);

RideSchema.index({ 'startLocation.text': 1, 'endLocation.text': 1, startDateTime: 1 });

export const Ride = mongoose.model('Ride', RideSchema);
