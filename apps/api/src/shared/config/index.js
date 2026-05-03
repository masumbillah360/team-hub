import dotenv from 'dotenv'
dotenv.config()

const config = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3005
}

export default config;