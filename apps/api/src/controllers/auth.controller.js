import * as authService from '../services/auth.service.js'
import { asyncHandler } from '../shared/utils/asyncHandler.js'

export const register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body)

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
    })

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(201).json({ user })
})

export const login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body)

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
    })

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({ user })
})

export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ message: 'No refresh token' })

    const { accessToken } = await authService.refresh(token)

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
    })

    res.json({ message: 'Token refreshed' })
})

export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken
    await authService.logout(token)

    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out' })
})

export const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.userId)
    res.json(user)
})

export const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.userId, req.body, req.file)
    res.json(user)
})

export const forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email)
    res.json({ message: 'OTP sent to email' })
})

export const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
    await authService.verifyForgotPasswordOTP(req.body.email, req.body.otp)
    res.json({ message: 'OTP verified' })
})

export const resetPassword = asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.email, req.body.password)
    res.json({ message: 'Password reset successful' })
})
