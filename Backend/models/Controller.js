import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ControllerSchema = new mongoose.Schema({
  // Auth
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },

  // Role Management
  requestedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  approvedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],

  active: { type: Boolean, default: false }, // Pending approval by admin
  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "REJECTED"],
    default: "PENDING"
  },
  approvedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

// Hash password before saving
ControllerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
ControllerSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("Controller", ControllerSchema);