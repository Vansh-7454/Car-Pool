import { Ride } from '../models/ride.model.js';

export async function createRide(req, res, next) {
  try {
    const { startLocation, endLocation, waypoints, startDateTime, totalSeats, pricePerSeat, notes } = req.body;

    if (!startLocation || !startLocation.text) {
      return res.status(400).json({ message: 'startLocation.text is required' });
    }
    if (!endLocation || !endLocation.text) {
      return res.status(400).json({ message: 'endLocation.text is required' });
    }

    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can create rides' });
    }

    if (!req.user.driverDetails || !req.user.driverDetails.isVerified) {
      return res.status(400).json({ message: 'Driver is not verified' });
    }

    if (totalSeats > req.user.driverDetails.vehicleSeats) {
      return res.status(400).json({ message: 'totalSeats exceeds vehicle capacity' });
    }

    const ride = await Ride.create({
      driver: req.user._id,
      startLocation,
      endLocation,
      waypoints,
      startDateTime,
      totalSeats,
      remainingSeats: totalSeats,
      pricePerSeat,
      notes,
    });

    res.status(201).json(ride);
  } catch (err) {
    next(err);
  }
}

export async function listRides(req, res, next) {
  try {
    const { origin, destination, date, seatsNeeded, maxPrice, originLat, originLng, radiusKm } = req.query;
    const filter = { status: 'open' };

    if (origin) filter['startLocation.text'] = new RegExp(origin, 'i');
    if (destination) filter['endLocation.text'] = new RegExp(destination, 'i');
    if (date) {
      const d = new Date(date);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      filter.startDateTime = { $gte: d, $lt: next };
    }
    if (seatsNeeded) {
      filter.remainingSeats = { $gte: Number(seatsNeeded) };
    }
    if (maxPrice) {
      filter.pricePerSeat = { $lte: Number(maxPrice) };
    }

    // Simple coordinate-based filter (approximate circle using bounding box)
    if (originLat && originLng && radiusKm) {
      const lat = Number(originLat);
      const lng = Number(originLng);
      const radius = Number(radiusKm);
      const latDelta = radius / 111; // ~111km per degree latitude
      const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

      filter['startLocation.lat'] = { $gte: lat - latDelta, $lte: lat + latDelta };
      filter['startLocation.lng'] = { $gte: lng - lngDelta, $lte: lng + lngDelta };
    }

    const rides = await Ride.find(filter)
      .populate('driver', 'name driverDetails.role driverDetails.isVerified')
      .sort({ startDateTime: 1 });

    res.json(rides);
  } catch (err) {
    next(err);
  }
}

// List rides owned by the authenticated driver
export async function listMyRides(req, res, next) {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can view their rides' });
    }

    const rides = await Ride.find({ driver: req.user._id })
      .sort({ startDateTime: 1 })
      .exec();

    res.json(rides);
  } catch (err) {
    next(err);
  }
}

export async function getRideById(req, res, next) {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver', 'name driverDetails');
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.json(ride);
  } catch (err) {
    next(err);
  }
}

export async function cancelRide(req, res, next) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const isOwner = ride.driver.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this ride' });
    }

    ride.status = 'cancelled';
    await ride.save();

    // TODO: notify passengers and trigger refund hook

    res.json({ message: 'Ride cancelled' });
  } catch (err) {
    next(err);
  }
}
