import bcrypt from 'bcryptjs'
import prisma from '@repo/database'

import { generateOTP, storeOTP, verifyOTP } from '../shared/utils/otp.js'
import { generateAccessToken, generateRefreshToken } from '../shared/lib/jwt.js'

import { sendEmail } from '../shared/utils/mail.js'

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

    const accessToken = generateAccessToken({ userId: user.id, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id })

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken, online: true },
    })

    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
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
    if (!user) throw new Error('User not found')
    return user
}

export const updateProfile = async (userId, data, file) => {
    const updateData = {}

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email

    if (file) {
        const { uploadToCloudinary } = await import('../shared/lib/cloudinary.js')
        const result = await uploadToCloudinary(file.buffer, {
            folder: 'teamhub/avatars',
            transformation: [{ width: 200, height: 200, crop: 'fill' }],
        })
        updateData.avatar = result.secure_url
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
    return { verified: true }
}

export const resetPassword = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('User not found')

    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, refreshToken: null },
    })
}
