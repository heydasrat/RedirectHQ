import { Router } from "express";

import {
    getMyUrls,
    deleteUrl,
    updateUrl,
    getUrlDetails,
    redirectToUrl,
    createShortUrl
} from "../controllers/url.controller.js";

import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
router.get("/r/:shortCode", redirectToUrl);

router.use(verifyJWT);

router.post("/", createShortUrl);
router.get("/my", getMyUrls);
router
    .route("/:shortCode")
    .get(getUrlDetails)
    .patch(updateUrl)
    .delete(deleteUrl);





export default router;
