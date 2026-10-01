import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";
import URL from "../models/url.model.js";

export const validateDestinationUrl = (value) => {
    if (typeof value !== "string" || value.trim().length === 0 || value.length > 2048) {
        throw new ApiError(400, "Enter a valid destination URL");
    }

    try {
        const parsedUrl = new globalThis.URL(value.trim());
        if (
            !["http:", "https:"].includes(parsedUrl.protocol) ||
            !parsedUrl.hostname ||
            parsedUrl.username ||
            parsedUrl.password
        ) {
            throw new ApiError(400, "Enter a valid HTTP or HTTPS destination URL");
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, "Enter a valid HTTP or HTTPS destination URL");
    }

    return value.trim();
};

export const createShortUrl = asyncHandler(async (req, res) => {
    const { originalUrl } = req.body || {};
    const destinationUrl = validateDestinationUrl(originalUrl);

    const shortCode = crypto.randomBytes(6).toString("base64url");

    const urlDoc = await URL.create({
        originalUrl: destinationUrl,
        shortCode,
        user: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            urlDoc,
            "URL created successfully"
        )
    );
});

export const redirectToUrl = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;

    if (!shortCode || shortCode.trim() === "") {
        throw new ApiError(400, "Invalid short code");
    }

    const urlDoc = await URL.findOneAndUpdate(
        {
            shortCode,
            isActive: true
        },
        {
            $inc: {
                clicks: 1
            }
        },
        {
            new: true
        }
    );

    if (!urlDoc) {
        throw new ApiError(404, "URL not found");
    }

    validateDestinationUrl(urlDoc.originalUrl);
    return res.redirect(urlDoc.originalUrl);
});

export const getUrlDetails = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;

    if (!shortCode || shortCode.trim() === "") {
        throw new ApiError(400, "Invalid short code");
    }

    const urlDoc = await URL.findOne({
        shortCode,
        user: req.user._id
    });

    if (!urlDoc) {
        throw new ApiError(404, "URL not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            urlDoc,
            "URL details fetched successfully"
        )
    );
});

export const updateUrl = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const { originalUrl } = req.body || {};

    if (!shortCode || shortCode.trim() === "") {
        throw new ApiError(400, "Invalid short code");
    }

    const destinationUrl = validateDestinationUrl(originalUrl);

    const urlDoc = await URL.findOneAndUpdate(
        {
            shortCode,
            user: req.user._id
        },
        {
            $set: {
                originalUrl: destinationUrl
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!urlDoc) {
        throw new ApiError(404, "URL not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            urlDoc,
            "URL updated successfully"
        )
    );
});

export const deleteUrl = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;

    if (!shortCode || shortCode.trim() === "") {
        throw new ApiError(400, "Invalid short code");
    }

    const urlDoc = await URL.findOneAndDelete({
        shortCode,
        user: req.user._id
    });

    if (!urlDoc) {
        throw new ApiError(404, "URL not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "URL deleted successfully"
        )
    );
});

export const getMyUrls = asyncHandler(async (req, res) => {
    const urls = await URL.find({
        user: req.user._id
    }).sort({
        createdAt: -1
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            urls,
            "URLs fetched successfully"
        )
    );
});

