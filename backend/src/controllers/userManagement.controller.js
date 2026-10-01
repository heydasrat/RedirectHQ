import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import User from '../models/user.model.js'
import uploadOnCloudinary, { deleteFromCloudinary } from '../utils/uploadOnCloudinary.js'
import config from '../config/config.js'

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none"
}

const updateProfile = asyncHandler(async (req, res) => {
    const { username, fullName } = req.body || {}

    const user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (username !== undefined) {
        if (typeof username !== "string") {
            throw new ApiError(400, "Username must be a string")
        }
        const newUsername = username.trim().toLowerCase()

        if (!newUsername) {
            throw new ApiError(400, "Username cannot be empty")
        }

        if (newUsername !== user.username) {
            const existingUser = await User.findOne({
                username: newUsername,
                _id: { $ne: user._id }
            })

            if (existingUser) {
                throw new ApiError(409, "Username is already taken")
            }

            user.username = newUsername
        }
    }

    if (fullName !== undefined) {
        if (typeof fullName !== "string") {
            throw new ApiError(400, "Full name must be a string")
        }
        const newFullName = fullName.trim()

        if (!newFullName) {
            throw new ApiError(400, "Full name cannot be empty")
        }

        user.fullName = newFullName
    }

    const previousAvatarId = user.avatar?.public_id
    if (req.file) {
        const uploadedAvatar = await uploadOnCloudinary(req.file.path)
        if (!uploadedAvatar) {
            throw new ApiError(502, "Profile photo upload failed")
        }
        user.avatar = {
            url: uploadedAvatar.secure_url,
            public_id: uploadedAvatar.public_id,
        }
    }

    const updatedUser = await user.save()

    if (previousAvatarId && previousAvatarId !== user.avatar?.public_id) {
        try {
            await deleteFromCloudinary(previousAvatarId)
        } catch (error) {
            console.error("Failed to remove replaced profile photo:", error)
        }
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            "Profile updated successfully"
        )
    )
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body || {}

    if (typeof oldPassword !== "string" || oldPassword.length === 0) {
        throw new ApiError(400, "Invalid current password")
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
        throw new ApiError(400, "Invalid new password")
    }

    const user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect current password")
    }

    user.password = newPassword
    user.refreshToken = null

    await user.save()

    return res
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .status(200).json(
        new ApiResponse(
            200,
            null,
            "User password changed successfully"
        )
    )
})

const updateTheme = asyncHandler(async (req, res) => {
    const { theme } = req.body || {}
    if (!["light", "dark"].includes(theme)) {
        throw new ApiError(400, "Theme must be light or dark")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { "preferences.theme": theme } },
        { new: true, runValidators: true }
    )

    return res.status(200).json(
        new ApiResponse(200, user, "Appearance updated successfully")
    )
})

const deleteAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (!user) throw new ApiError(404, "User not found")

    const avatarId = user.avatar?.public_id
    user.avatar = { url: null, public_id: null }
    const updatedUser = await user.save()

    if (avatarId) {
        try {
            await deleteFromCloudinary(avatarId)
        } catch (error) {
            console.error("Failed to remove profile photo:", error)
        }
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile photo removed")
    )
})

export {
    changePassword,
    updateProfile,
    updateTheme,
    deleteAvatar,
}