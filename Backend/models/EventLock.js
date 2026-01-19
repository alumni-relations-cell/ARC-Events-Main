import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const EventLockSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4(),
        index: true,
    },

    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },

    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },

    isRevoked: {
        type: Boolean,
        default: false,
    },

    usageCount: {
        type: Number,
        default: 0,
    },

    maxUsage: {
        type: Number,
        default: null, // null means unlimited
    },

    lastAccessedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

// Method to check if lock is valid
EventLockSchema.methods.isValid = function () {
    const now = new Date();

    // Check if revoked
    if (this.isRevoked) return false;

    // Check if expired
    if (this.expiresAt < now) return false;

    // Check if usage limit exceeded
    if (this.maxUsage !== null && this.usageCount >= this.maxUsage) return false;

    return true;
};

// Method to increment usage
EventLockSchema.methods.incrementUsage = async function () {
    this.usageCount += 1;
    this.lastAccessedAt = new Date();
    await this.save();
};

export default mongoose.model("EventLock", EventLockSchema);
