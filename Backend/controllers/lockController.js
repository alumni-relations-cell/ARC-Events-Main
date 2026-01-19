import EventLock from "../models/EventLock.js";
import Event from "../models/Event.js";

/* ----------------------------------------------------
   1. GENERATE LOCK TOKEN (Admin Only)
   Creates a new lock token for an event
---------------------------------------------------- */
export async function generateLockToken(req, res) {
    try {
        const { eventId, expiresInDays = 30, maxUsage = null } = req.body;

        // Validate event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));

        // Create lock token
        const lock = await EventLock.create({
            eventId,
            createdBy: req.admin.id, // JWT payload has 'id' not '_id'
            expiresAt,
            maxUsage: maxUsage ? parseInt(maxUsage) : null,
        });

        // Populate event details for response
        await lock.populate("eventId", "name slug");

        res.status(201).json({
            success: true,
            lock: {
                id: lock._id,
                token: lock.token,
                eventName: lock.eventId.name,
                eventSlug: lock.eventId.slug,
                expiresAt: lock.expiresAt,
                maxUsage: lock.maxUsage,
                usageCount: lock.usageCount,
            },
            url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/lock/${lock.token}`,
        });
    } catch (err) {
        console.error("Generate Lock Error:", err);
        console.error("Full error details:", JSON.stringify(err, null, 2));
        console.error("Request body:", req.body);
        console.error("Admin from JWT:", req.admin);
        res.status(500).json({ message: "Failed to generate lock token" });
    }
}

/* ----------------------------------------------------
   2. VERIFY LOCK TOKEN (Public)
   Validates token and returns event data
---------------------------------------------------- */
export async function verifyLockToken(req, res) {
    try {
        const { token } = req.params;
        console.log("🔍 Verifying lock token:", token);

        // Find lock and populate event
        const lock = await EventLock.findOne({ token })
            .populate("eventId", "name slug description posterUrl");

        console.log("📦 Lock found:", lock ? "Yes" : "No");

        if (!lock) {
            console.log("❌ Lock not found in database");
            return res.status(404).json({
                success: false,
                message: "Invalid lock token"
            });
        }

        console.log("🔒 Lock details:", {
            id: lock._id,
            eventId: lock.eventId?._id,
            eventSlug: lock.eventId?.slug,
            expiresAt: lock.expiresAt,
            isRevoked: lock.isRevoked,
            usageCount: lock.usageCount,
            maxUsage: lock.maxUsage,
        });

        // Check if lock is valid
        const isLockValid = lock.isValid();
        console.log("✅ Lock valid:", isLockValid);

        if (!isLockValid) {
            const reason = lock.isRevoked
                ? "This link has been revoked"
                : lock.expiresAt < new Date()
                    ? "This link has expired"
                    : "Usage limit exceeded";

            console.log("❌ Lock invalid. Reason:", reason);

            return res.status(403).json({
                success: false,
                message: reason
            });
        }

        // Increment usage counter
        await lock.incrementUsage();
        console.log("✅ Usage incremented");

        // Return event data
        const response = {
            success: true,
            event: {
                id: lock.eventId._id,
                name: lock.eventId.name,
                slug: lock.eventId.slug,
                description: lock.eventId.description,
                posterUrl: lock.eventId.posterUrl,
            },
            token: lock.token,
        };

        console.log("✅ Sending success response for event:", lock.eventId.slug);
        res.json(response);
    } catch (err) {
        console.error("❌ Verify Lock Error:", err);
        console.error("Full error:", err.stack);
        res.status(500).json({
            success: false,
            message: "Failed to verify lock token"
        });
    }
}

/* ----------------------------------------------------
   3. GET ALL ACTIVE LOCKS (Admin Only)
   Lists all lock tokens
---------------------------------------------------- */
export async function getActiveLocks(req, res) {
    try {
        const locks = await EventLock.find({ isRevoked: false })
            .populate("eventId", "name slug")
            .populate("createdBy", "username")
            .sort({ createdAt: -1 });

        const formattedLocks = locks.map(lock => ({
            id: lock._id,
            token: lock.token,
            eventName: lock.eventId?.name || "Unknown",
            eventSlug: lock.eventId?.slug || "unknown",
            createdBy: lock.createdBy?.username || "Unknown",
            createdAt: lock.createdAt,
            expiresAt: lock.expiresAt,
            usageCount: lock.usageCount,
            maxUsage: lock.maxUsage,
            lastAccessedAt: lock.lastAccessedAt,
            isValid: lock.isValid(),
        }));

        res.json(formattedLocks);
    } catch (err) {
        console.error("Get Locks Error:", err);
        res.status(500).json({ message: "Failed to retrieve locks" });
    }
}

/* ----------------------------------------------------
   4. REVOKE LOCK TOKEN (Admin Only)
   Revokes an existing lock
---------------------------------------------------- */
export async function revokeLockToken(req, res) {
    try {
        const { tokenId } = req.params;

        const lock = await EventLock.findByIdAndUpdate(
            tokenId,
            { isRevoked: true },
            { new: true }
        );

        if (!lock) {
            return res.status(404).json({ message: "Lock not found" });
        }

        res.json({
            success: true,
            message: "Lock revoked successfully",
        });
    } catch (err) {
        console.error("Revoke Lock Error:", err);
        res.status(500).json({ message: "Failed to revoke lock" });
    }
}
