import { Router } from "express";
import { register, login, logout, getCurrentUser, refreshAccessToken } from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(register)

router.route("/login").post(login)
router.route("/refresh").post(refreshAccessToken)
router.route("/logout").post(logout)
router.route("/me").get(verifyJWT,getCurrentUser)

export default router