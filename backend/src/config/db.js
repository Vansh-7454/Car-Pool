import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
}
