import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router from './routes/v1/index.js'
import logger from './shared/utils/logger.js'
import swaggerDocs from './shared/lib/swagger.js'
import notFound from './shared/middleware/notFound.js'
import errorHandler from './shared/middleware/errorHandler.js'

const app = express()

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`)
    next()
})

// Swagger docs
swaggerDocs(app)

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Server is up and running...',
        timestamp: new Date().toISOString(),
    })
})

// API routes
app.use('/api/v1', router)

// 404 handler
app.use(notFound)

// Global error handler
app.use(errorHandler)

export default app