import multer from 'multer'
import { Router } from 'express'

import validate from '../../shared/middleware/validate.js'
import { protect } from '../../shared/middleware/protect.js'
import *  as authController from '../../controllers/auth.controller.js'

import * as validationSchema from '../../validators/auth.validator.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/register', validate(validationSchema.registerSchema), authController.register)
router.post('/login', validate(validationSchema.loginSchema), authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)

router.get('/profile', protect(), authController.getProfile)
router.put('/profile', protect(), upload.single('avatar'), validate(validationSchema.updateProfileSchema), authController.updateProfile)

router.post('/forgot-password', validate(validationSchema.forgotPasswordSchema), authController.forgotPassword)
router.post('/verify-otp', validate(validationSchema.verifyOtpSchema), authController.verifyForgotPasswordOTP)
router.post('/reset-password', validate(validationSchema.resetPasswordSchema), authController.resetPassword)

export default router
