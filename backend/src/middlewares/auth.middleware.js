import  ApiError  from "../utils/ApiError.js";
import  asyncHandler  from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
import config from "../config/config.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    const authorization = req.header("Authorization");
    const token = req.cookies?.accessToken ||
        (authorization?.startsWith("Bearer ") ? authorization.slice(7) : null);

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, config.accessTokenSecret);
    } catch {
        throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
})

export default verifyJWT
