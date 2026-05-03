import { Router } from "express";

const router = Router()


router.get('/health', (req, res) => {
    res.send({
        success: true,
        message: "V1 routes are healthy"
    })
})

export default router;