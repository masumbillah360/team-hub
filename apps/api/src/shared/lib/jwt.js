import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const { JWT_SECRET, JWT_REFRESH_SECRET } = config;

export function generateAccessToken(payload, expiresIn = '15m') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('JWT verification failed:', error.message, 'Token:', token?.substring(0, 20) + '...');
        throw error;
    }
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}
