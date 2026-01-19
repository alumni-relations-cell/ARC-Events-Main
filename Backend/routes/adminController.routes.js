import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import Controller from "../models/Controller.js";

const router = express.Router();

/* ----------------------------------------------------
   GET /api/admin/controllers
   Returns ACTIVE controllers
---------------------------------------------------- */
router.get("/", requireAdmin, async (req, res) => {
  try {
    const controllers = await Controller.find({
      $or: [
        { status: "ACTIVE" },
        { status: { $exists: false }, active: true }
      ]
    })
      .populate("approvedEvents", "name date slug");
    res.json(controllers);
  } catch (e) { res.status(500).json({ message: "Error fetching active controllers" }); }
});

/* ----------------------------------------------------
   GET /api/admin/controllers/pending
   Returns PENDING controllers
---------------------------------------------------- */
router.get("/pending", requireAdmin, async (req, res) => {
  try {
    const controllers = await Controller.find({
      $or: [
        { status: "PENDING" },
        { status: { $exists: false }, active: false }
      ]
    })
      .populate("requestedEvents", "name date")
      .sort({ createdAt: -1 });
    res.json(controllers);
  } catch (e) { res.status(500).json({ message: "Error fetching pending controllers" }); }
});

/* ----------------------------------------------------
   GET /api/admin/controllers/rejected
   Returns REJECTED controllers
---------------------------------------------------- */
router.get("/rejected", requireAdmin, async (req, res) => {
  try {
    const controllers = await Controller.find({ status: "REJECTED" })
      .populate("requestedEvents", "name date")
      .sort({ updatedAt: -1 });
    res.json(controllers);
  } catch (e) { res.status(500).json({ message: "Error fetching rejected controllers" }); }
});

/* ----------------------------------------------------
   POST /api/admin/controllers/:id/approve
   Body: { events: [eventId1, eventId2] }
---------------------------------------------------- */
router.post("/:id/approve", requireAdmin, async (req, res) => {
  const { events } = req.body; // Array of event IDs

  const ctrl = await Controller.findById(req.params.id);
  if (!ctrl) return res.status(404).json({ message: "Controller not found" });

  if (events && Array.isArray(events)) {
    if (req.body.replace) {
      ctrl.approvedEvents = events;
    } else {
      const newSet = new Set([
        ...ctrl.approvedEvents.map(e => e.toString()),
        ...events
      ]);
      ctrl.approvedEvents = Array.from(newSet);
    }
  }

  ctrl.active = true;
  ctrl.status = "ACTIVE";
  ctrl.approvedByAdmin = req.admin ? req.admin._id : null;

  await ctrl.save();
  res.json(ctrl);
});

/* ----------------------------------------------------
   POST /api/admin/controllers/:id/reject
   Mark as REJECTED
---------------------------------------------------- */
router.post("/:id/reject", requireAdmin, async (req, res) => {
  const ctrl = await Controller.findById(req.params.id);
  if (!ctrl) return res.status(404).json({ message: "Controller not found" });

  ctrl.active = false;
  ctrl.status = "REJECTED";
  await ctrl.save();
  res.json({ message: "Controller rejected" });
});

/* ----------------------------------------------------
   POST /api/admin/controllers/:id/revert
   Revert REJECTED to PENDING
---------------------------------------------------- */
router.post("/:id/revert", requireAdmin, async (req, res) => {
  const ctrl = await Controller.findById(req.params.id);
  if (!ctrl) return res.status(404).json({ message: "Controller not found" });

  ctrl.active = false;
  ctrl.status = "PENDING";
  await ctrl.save();
  res.json({ message: "Controller reverted to pending" });
});

/* ----------------------------------------------------
   POST /api/admin/controllers/:id/revoke
   Deactivate or remove events
---------------------------------------------------- */
router.post("/:id/revoke", requireAdmin, async (req, res) => {
  const ctrl = await Controller.findById(req.params.id);
  if (!ctrl) return res.status(404).json({ message: "Controller not found" });

  ctrl.active = false;
  ctrl.status = "PENDING"; // Move back to pending? Or a suspended state?
  // For now, PENDING implies they need approval again.
  ctrl.approvedEvents = [];
  await ctrl.save();
  res.json({ message: "Revoked access" });
});

export default router;
