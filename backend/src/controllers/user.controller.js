import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'

const options = {
    secure: process.env.NODE_ENV === "production" || config.cookieSameSite === "none",
    httpOnly: true,
    sameSite: config.cookieSameSite,
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating your tokens")
    }
}

const register = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body || {};

    if ([fullName, email, password, username].some((field) => typeof field !== "string" || field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim().toLowerCase()

    const existedUserByEmailOrUsername = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    })

    if (existedUserByEmailOrUsername) {
        if (existedUserByEmailOrUsername.email === normalizedEmail) {
            throw new ApiError(409, "User already exists with this email")
        }

        throw new ApiError(409, "Username is already taken")
    }


    const user = await User.create({
        username: normalizedUsername,
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
    })

    return res.status(201).json(
        new ApiResponse(201, user, "User registered successfully")
    )


})

const login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body || {}

    if (typeof identifier !== "string" || identifier.trim() === "") {
        throw new ApiError(400, "Username or email is required")
    }

    if (typeof password !== "string" || password.length === 0) {
        throw new ApiError(400, "Password is required")
    }

    const normalizedIdentifier = identifier.trim().toLowerCase()
    const user = await User.findOne({
        $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }]
    })

    if (!user) {
        throw new ApiError(401, "Invalid username/email or password")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid username/email or password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-refreshToken -password")

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                loggedInUser,
                "User logged in successfully"
            )
        );

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken
    if (!incomingRefreshToken) {
        return res
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .status(401)
            .json(new ApiResponse(401, null, "Refresh token required"))
    }

    let decodedToken
    try {
        decodedToken = jwt.verify(incomingRefreshToken, config.refreshTokenSecret)
    } catch {
        return res
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .status(401)
            .json(new ApiResponse(401, null, "Invalid refresh token"))
    }

    const user = await User.findById(decodedToken?._id)
    if (!user || user.refreshToken !== incomingRefreshToken) {
        return res
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .status(401)
            .json(new ApiResponse(401, null, "Invalid refresh token"))
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(200)
        .json(new ApiResponse(200, user, "Session refreshed successfully"))
})

const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken
    if (refreshToken) {
        try {
            const decodedToken = jwt.verify(refreshToken, config.refreshTokenSecret)
            await User.findOneAndUpdate(
                { _id: decodedToken._id, refreshToken },
                { $set: { refreshToken: null } }
            )
        } catch {}
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken")
    return res.status(200).json(
        new ApiResponse(200, user, "Current user fetched successfully")
    )
})

export {
    register,
    login,
    refreshAccessToken,
    logout,
    getCurrentUser
} 