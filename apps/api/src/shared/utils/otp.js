const otpStore = new Map()

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

export const storeOTP = (email, otp) => {
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 })
}

export const verifyOTP = (email, otp) => {
    const record = otpStore.get(email)
    if (!record) return false
    if (Date.now() > record.expiresAt) {
        otpStore.delete(email)
        return false
    }
    if (record.otp !== otp) return false
    otpStore.delete(email)
    return true
}
