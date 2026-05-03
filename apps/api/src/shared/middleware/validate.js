import { ZodError } from 'zod'
import logger from '../utils/logger.js'

const validate = (schema) => (req, res, next) => {
    try {
        if (schema.body) req.body = schema.body.parse(req.body)
        if (schema.query) req.query = schema.query.parse(req.query)
        if (schema.params) req.params = schema.params.parse(req.params)
        next()
    } catch (error) {
        if (error instanceof ZodError) {
            logger.warn(`Validation error: ${error.message}`)
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
                timestamp: new Date().toISOString(),
            })
        }
        next(error)
    }
}

export default validate
