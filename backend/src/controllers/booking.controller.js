import { Booking } from '../models/booking.model.js';
import { Ride } from '../models/ride.model.js';

export async function createBookingRequest(req, res, next) {
  try {
    const { rideId, requestedSeats, notes } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride || ride.status !== 'open') {
      return res.status(400).json({ message: 'Ride is not available' });
    }

    if (requestedSeats < 1) {
      return res.status(400).json({ message: 'requestedSeats must be at least 1' });
    }

    if (requestedSeats > ride.remainingSeats) {
      return res.status(400).json({ message: 'Not enough seats remaining' });
    }

    const booking = await Booking.create({
      ride: rideId,
      passenger: req.user._id,
      requestedSeats,
      notes,
    });

    // TODO: create notification to driver about new booking request

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

export async function listMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ passenger: req.user._id }).populate('ride');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

export async function listBookingsForRide(req, res, next) {
  try {
    const rideId = req.params.rideId;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view bookings for this ride' });
    }

    const bookings = await Booking.find({ ride: rideId }).populate('passenger', 'name phone');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

export async function acceptBooking(req, res, next) {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'accepted') {
      return res.json(booking);
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot accept booking in status ${booking.status}` });
    }

    const ride = await Ride.findById(booking.ride).exec();
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept booking for this ride' });
    }

    if (ride.status !== 'open') {
      return res.status(400).json({ message: 'Ride is not open for bookings' });
    }

    if (ride.remainingSeats < booking.requestedSeats) {
      return res.status(400).json({ message: 'Insufficient seats to accept this booking' });
    }

    ride.remainingSeats -= booking.requestedSeats;
    if (ride.remainingSeats === 0) {
      ride.status = 'full';
    }

    booking.status = 'accepted';

    await Promise.all([ride.save(), booking.save()]);

    // TODO: notify passenger that booking was accepted

    res.json({ message: 'Booking accepted', booking, ride });
  } catch (err) {
    next(err);
  }
}

export async function rejectBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject booking in status ${booking.status}` });
    }

    booking.status = 'rejected';
    await booking.save();

    // TODO: notify passenger

    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isPassenger = booking.passenger.toString() === req.user._id.toString();
    const isDriver = booking.ride?.driver?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPassenger && !isDriver && !isAdmin) {
      return res.status(403).json({ message: 'Only passenger or driver can cancel this booking' });
    }

    if (booking.status !== 'pending' && booking.status !== 'accepted') {
      return res.status(400).json({ message: `Cannot cancel booking in status ${booking.status}` });
    }

    // If already accepted, free seats
    if (booking.status === 'accepted' && booking.ride) {
      const ride = booking.ride;
      ride.remainingSeats += booking.requestedSeats;
      if (ride.status === 'full') {
        ride.status = 'open';
      }
      await ride.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    // TODO: notify other party

    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    next(err);
  }
}
