import logger from '../utils/logger.js'

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    error.statusCode = 404
    logger.warn(`404 - ${req.originalUrl} - ${req.method}`)
    next(error)
}

export default notFound
