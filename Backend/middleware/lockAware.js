import EventLock from "../models/EventLock.js";

/* ----------------------------------------------------
   LOCK-AWARE MIDDLEWARE
   Extracts and validates lock token from request headers
   Attaches lockedEventId to request if valid
---------------------------------------------------- */
export default async function lockAware(req, res, next) {
    try {
        // Extract lock token from header
        const token = req.headers["x-event-lock-token"];

        // If no token, continue without lock
        if (!token) {
            req.isLocked = false;
            req.lockedEventId = null;
            return next();
        }

        // Find and validate lock
        const lock = await EventLock.findOne({ token }).populate("eventId");

        // If lock not found or invalid, continue without lock
        if (!lock || !lock.isValid()) {
            req.isLocked = false;
            req.lockedEventId = null;
            return next();
        }

        // Attach lock info to request
        req.isLocked = true;
        req.lockedEventId = lock.eventId._id;
        req.lockedEventSlug = lock.eventId.slug;

        next();
    } catch (err) {
        console.error("Lock Aware Middleware Error:", err);
        // On error, continue without lock rather than blocking request
        req.isLocked = false;
        req.lockedEventId = null;
        next();
    }
}
