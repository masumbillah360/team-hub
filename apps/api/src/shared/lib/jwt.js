import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const { JWT_SECRET, JWT_REFRESH_SECRET } = config;

export function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}
