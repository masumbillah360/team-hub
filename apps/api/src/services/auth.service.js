import bcrypt from 'bcryptjs'
import prisma from '@repo/database'

import { generateOTP, storeOTP, verifyOTP } from '../shared/utils/otp.js'
import { generateAccessToken, generateRefreshToken } from '../shared/lib/jwt.js'

import { sendEmail } from '../shared/utils/mail.js'
import { getWorkspaces } from './workspaces.service.js'
import cloudinary from '../shared/lib/cloudinary.js'

export const register = async ({ name, email, password }) => {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) throw new Error('User already exists')

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
        select: { id: true, name: true, email: true, role: true, avatar: true },
    })

    const accessToken = generateAccessToken({ userId: user.id, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id })

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
    })

    return { user, accessToken, refreshToken }
}

export const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Invalid credentials')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('Invalid credentials')

    const workspaces = await getWorkspaces({ userId: user.id, page: 1, limit: 10 })
    const accessToken = generateAccessToken({ userId: user.id, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id })

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken, online: true },
    })

    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        workspaces: workspaces.data, 
        accessToken,
        refreshToken,
    }
}

export const refresh = async (token) => {
    const decoded = (await import('../shared/lib/jwt.js')).verifyRefreshToken(token)
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })

    if (!user || user.refreshToken !== token) throw new Error('Invalid refresh token')

    const accessToken = generateAccessToken({ userId: user.id, role: user.role })
    return { accessToken }
}

export const logout = async (token) => {
    if (token) {
        const user = await prisma.user.findFirst({ where: { refreshToken: token } })
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: null, online: false },
            })
        }
    }
}

export const getProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, avatar: true, online: true },
    })
    const workspaces = await getWorkspaces({ userId: user.id, page: 1, limit: 10 })
    if (!user) throw new Error('User not found')
    return { user, workspaces: workspaces.data }
}

export const updateProfile = async (userId, data, file) => {
    const updateData = {}

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email

    if (file) {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'teamhub/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
                (error, result) => (error ? reject(error) : resolve(result))
            );
            stream.end(file.buffer);
        });
        updateData.avatar = result.secure_url;
    }

    return prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, avatar: true, online: true },
    })
}

export const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('User not found')

    const otp = generateOTP()
    storeOTP(email, otp)

    await sendEmail({
        to: email,
        subject: 'Password Reset OTP',
        html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This OTP expires in 10 minutes.</p>`,
    })
}

export const verifyForgotPasswordOTP = async (email, otp) => {
    const isValid = verifyOTP(email, otp)
    if (!isValid) throw new Error('Invalid or expired OTP')

    // Generate a temporary reset token (valid for 10 minutes)
    const { generateAccessToken } = await import('../shared/lib/jwt.js')
    const resetToken = generateAccessToken({ email, purpose: 'password-reset' }, '10m')

    return { verified: true, resetToken }
}

export const resetPassword = async ({ token, password }) => {
    const { verifyAccessToken } = await import('../shared/lib/jwt.js')
    
    let decoded;
    try {
        decoded = verifyAccessToken(token)
    } catch (error) {
        throw new Error('Invalid or expired reset token')
    }

    if (decoded.purpose !== 'password-reset') {
        throw new Error('Invalid reset token')
    }

    const user = await prisma.user.findUnique({ where: { email: decoded.email } })
    if (!user) throw new Error('User not found')

    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, refreshToken: null },
    })
}
