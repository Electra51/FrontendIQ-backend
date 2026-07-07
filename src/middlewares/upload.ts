import multer from "multer";
import { AppError } from "../utils/AppError";
import { StatusCodes } from "http-status-codes";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new AppError(
      "Only JPG, JPEG, PNG and WEBP images are allowed.",
      StatusCodes.BAD_REQUEST
    )
  );
};

export const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});