import { Router } from "express";
import {
    generateLockToken,
    verifyLockToken,
    getActiveLocks,
    revokeLockToken,
} from "../controllers/lockController.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

/* Public route - verify lock token */
router.get("/verify/:token", verifyLockToken);

/* Admin routes - require authentication */
router.post("/generate", requireAdmin, generateLockToken);
router.get("/", requireAdmin, getActiveLocks);
router.delete("/:tokenId", requireAdmin, revokeLockToken);

export default router;
