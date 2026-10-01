import { Router } from "express";
import { changePassword, updateProfile, updateTheme, deleteAvatar } from "../controllers/userManagement.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/change-password").patch(verifyJWT, changePassword)
router.route("/update-profile").patch(verifyJWT, upload.single("avatar"), updateProfile)
router.route("/toggle-theme").patch(verifyJWT, updateTheme)
router.route("/delete-avatar").patch(verifyJWT, deleteAvatar)
export default router