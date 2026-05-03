import { v2 as cloudinary } from 'cloudinary'
import config from '../config/index.js'

cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error)
            else resolve(result)
        })
        stream.end(buffer)
    })
}

export default cloudinary
