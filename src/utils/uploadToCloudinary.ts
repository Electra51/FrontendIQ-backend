import { UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary";
import { AppError } from "./AppError";
import { StatusCodes } from "http-status-codes";

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder = "frontendiq/avatars"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary Upload Error:", error);
          return reject(
            new AppError(
              "Failed to upload image.",
              StatusCodes.INTERNAL_SERVER_ERROR
            )
          );
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};