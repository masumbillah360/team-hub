import dotenv from 'dotenv'
dotenv.config()

const config = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3005,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
}

export default config