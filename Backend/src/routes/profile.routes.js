// routes/user.routes.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateProfile, getMyProfile } from "../controllers/profile.controller.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 3 * 1024 * 1024 } });

router.use(protectRoute); 
router.get("/me", getMyProfile);          
router.put("/update", upload.single("avatar"), updateProfile);    

export default router;