import { verifyAccessToken } from '../lib/jwt.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const protect = () =>
    asyncHandler(async (req, res, next) => {
        const token = req.cookies?.accessToken
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }

        try {
            const decoded = verifyAccessToken(token)
            req.user = decoded
            next()
        } catch {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' })
        }
    })
