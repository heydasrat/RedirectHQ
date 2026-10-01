import { v2 as cloudinary } from "cloudinary"
import fs from "fs/promises"
import config from "../config/config.js";

cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg"],
        })
        return response;
    } catch (error) {
        return null;
    } finally {
        if (localFilePath) await fs.rm(localFilePath, { force: true }).catch(() => {});
    }
}

export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

export default uploadOnCloudinary
