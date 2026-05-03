import { Router } from 'express'
import authRoutes from './auth.routes.js'
import workspaceRoutes from './workspace.routes.js'

const router = Router()

router.get('/', (req, res) => {
    res.send({
        success: true,
        message: 'V1 routes are available',
    })
})

router.get('/health', (req, res) => {
    res.send({
        success: true,
        message: 'V1 routes are healthy',
    })
})

router.use('/auth', authRoutes)
router.use('/workspace', workspaceRoutes)

export default router
