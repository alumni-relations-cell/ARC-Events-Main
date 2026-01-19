/* ================== ENV SETUP ================== */
import dotenv from "dotenv";
dotenv.config();

/* ================== CORE IMPORTS ================== */
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";

/* ================== MODELS (REGISTER SCHEMAS) ================== */
import "./models/Event.js";
import "./models/Registration.js";
import "./models/Controller.js";
import "./models/Admin.js";
import "./models/User.js";
import "./models/Memory.js";
import "./models/EventLock.js";

/* ================== ROUTES ================== */
import googleAuthRoutes from "./routes/googleAuth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import publicImagesRoutes from "./routes/publicImages.routes.js";
import controllerAuthRoutes from "./routes/controllerAuth.routes.js"; // NEW
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import adminEventRoutes from "./routes/adminEvent.routes.js";
import adminControllerRoutes from "./routes/adminController.routes.js";
import adminEventScopedRoutes from "./routes/adminEventScoped.routes.js";
import adminGlobalGalleryRoutes from "./routes/adminGlobalGallery.routes.js";
import controllerDashboardRoutes from "./routes/controllerDashboard.routes.js";
import lockRoutes from "./routes/lock.routes.js";

/* ================== APP INIT ================== */
const app = express();
const PORT = process.env.PORT || 5000;

/* ================== GLOBAL MIDDLEWARE ================== */
app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ================== ROUTE MOUNTS ================== */

// Public / User
app.use("/api/auth", googleAuthRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/images", publicImagesRoutes);
app.use("/api/locks", lockRoutes);

// Controller Auth
app.use("/api/controller/auth", controllerAuthRoutes); // MOUNTED HERE

// Admin
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/events", adminEventRoutes);
app.use("/api/admin/controllers", adminControllerRoutes);
app.use("/api/admin/images", adminGlobalGalleryRoutes);
app.use("/api/admin", adminEventScopedRoutes);

// Controller
app.use("/api/controller", controllerDashboardRoutes);

/* ================== HEALTH CHECK ================== */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

/* ================== DATABASE CONNECTION ================== */
async function connectDB(retries = 5) {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB connected");

    // 🛠️ AUTO-FIX: Drop legacy unique index on 'user' if it exists
    try {
      const collections = await mongoose.connection.db.listCollections({ name: 'controllers' }).toArray();
      if (collections.length > 0) {
        // Check if index exists
        const indexes = await mongoose.connection.db.collection('controllers').indexes();
        const userIndex = indexes.find(i => i.name === 'user_1');
        if (userIndex) {
          console.log("⚠️ Found legacy 'user_1' index. Dropping...");
          await mongoose.connection.db.collection('controllers').dropIndex('user_1');
          console.log("✅ Dropped 'user_1' index.");
        }
      }
    } catch (e) {
      console.warn("⚠️ Warning: Could not check/drop legacy index:", e.message);
    }
  } catch (err) {
    console.error(
      `❌ MongoDB connection failed (retries left ${retries}):`,
      err.message
    );

    if (retries <= 0) {
      console.error("❌ MongoDB unreachable. Exiting process.");
      process.exit(1);
    }

    // wait 3 seconds before retry
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return connectDB(retries - 1);
  }
}

/* ================== SERVER START ================== */
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();

/* ================== GRACEFUL SHUTDOWN ================== */
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});
