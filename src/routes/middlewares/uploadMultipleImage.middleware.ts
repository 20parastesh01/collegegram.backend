import multer, { FileFilterCallback } from 'multer'
import { NextFunction, Request, Response } from 'express'

const multerStorage = multer.memoryStorage()

const multerFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith('image')) {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'))
    }
    cb(null, true)
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
})

export const uploadPostImages = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 },
])
