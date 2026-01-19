import mongoose from "mongoose";

const EventFlowSchema = new mongoose.Schema({
  title: { type: String },
  desc: String,
  date: String,
}, { _id: false });

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: String,

  // CRITICAL: Ensure these field names match exactly what we set in controller
  posterUrl: { type: String, default: "" },
  paymentQRUrl: { type: String, default: "" },

  status: {
    type: String,
    enum: ["DRAFT", "LIVE", "PAUSED", "CLOSED"],
    default: "DRAFT",
  },

  isHidden: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },

  paid: { type: Boolean, default: false },

  basePrice: { type: Number, default: 0 },
  familyAllowed: { type: Boolean, default: false },
  addonPricePerMember: { type: Number, default: 0 },

  flow: [EventFlowSchema],

  gallery: [{
    url: String,
    public_id: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
}, { timestamps: true });

export default mongoose.model("Event", EventSchema);