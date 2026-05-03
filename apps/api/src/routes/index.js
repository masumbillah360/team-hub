import { Router } from 'express'
import authRoutes from './auth.routes.js'
import workspaceRoutes from './workspace.routes.js'
import goalsRoutes from './goals.routes.js'

const router = Router()

router.get('/', (req, res) => {
    res.send({
        success: true,
        message: 'routes are available',
    })
})

router.get('/health', (req, res) => {
    res.send({
        success: true,
        message: 'routes are healthy',
    })
})

router.use('/auth', authRoutes)
router.use('/workspaces', workspaceRoutes)
router.use('/goals', goalsRoutes)

export default router
