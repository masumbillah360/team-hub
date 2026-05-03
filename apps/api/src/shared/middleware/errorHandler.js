import logger from '../utils/logger.js'

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
    })

    res.status(statusCode).json({
        success: false,
        message,
        errors: process.env.NODE_ENV === 'development' ? err.stack : null,
        timestamp: new Date().toISOString(),
    })
}

export default errorHandler
