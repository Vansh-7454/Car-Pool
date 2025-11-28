import mongoose from 'mongoose';

const DriverDetailsSchema = new mongoose.Schema({
  vehicleModel: String,
  vehicleNumber: String,
  vehicleSeats: Number,
  licenseImage: String, // URL/path to driving licence photo
  aadhaarImage: String, // URL/path to Aadhaar card photo
  rcImage: String,
  isVerified: { type: Boolean, default: false },
  verificationNotes: String,
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    phone: String,
    role: {
      type: String,
      enum: ['passenger', 'driver', 'admin'],
      default: 'passenger',
    },
    profilePic: String,
    driverDetails: DriverDetailsSchema,
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
