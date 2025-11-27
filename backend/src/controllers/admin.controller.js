import { User } from '../models/user.model.js';
import { AdminLog } from '../models/other.models.js';
import { Ride } from '../models/ride.model.js';
import { Booking } from '../models/booking.model.js';

export async function listPendingDriverVerifications(req, res, next) {
  try {
    const drivers = await User.find({
      role: 'driver',
      'driverDetails.isVerified': false,
    }).select('name email driverDetails');
    res.json(drivers);
  } catch (err) {
    next(err);
  }
}

export async function approveDriver(req, res, next) {
  try {
    const driver = await User.findById(req.params.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }
    driver.driverDetails.isVerified = true;
    driver.driverDetails.verificationNotes = req.body.notes || '';
    await driver.save();

    await AdminLog.create({
      entityType: 'driver',
      entityId: driver._id,
      action: 'approve_driver',
      admin: req.user._id,
      notes: req.body.notes,
    });

    res.json({ message: 'Driver approved', driver });
  } catch (err) {
    next(err);
  }
}

export async function rejectDriver(req, res, next) {
  try {
    const driver = await User.findById(req.params.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }
    driver.driverDetails.isVerified = false;
    driver.driverDetails.verificationNotes = req.body.notes || '';
    await driver.save();

    await AdminLog.create({
      entityType: 'driver',
      entityId: driver._id,
      action: 'reject_driver',
      admin: req.user._id,
      notes: req.body.notes,
    });

    res.json({ message: 'Driver rejected', driver });
  } catch (err) {
    next(err);
  }
}

export async function analyticsSummary(req, res, next) {
  try {
    const [totalUsers, totalDrivers, totalRides, totalBookings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'driver' }),
      Ride.countDocuments(),
      Booking.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalDrivers,
      totalRides,
      totalBookings,
    });
  } catch (err) {
    next(err);
  }
}
