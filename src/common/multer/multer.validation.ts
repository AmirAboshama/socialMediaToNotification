import type { FileFilterCallback } from "multer";
import { badRequestError } from "../exeption/domain.exeption.js";
import express from "express";
export const allowedFileFormat = {
    img: ["image/png", "image/jpg", "image/jpeg"],
    video: ["video/mp4", "video/mkv"],
    pdf: ["application/pdf"]
}



 export const fileFilter = (allowedFormat: string[]) => {
    return (  req: express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback) => {
        if (!allowedFormat.includes(file.mimetype)) {
            return cb(new badRequestError("Invalid format" ))
        }

        return cb(null, true)
    }
}
