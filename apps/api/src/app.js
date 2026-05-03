import express from 'express'
const app = express()

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send({
        success: true,
        message: 'Server is up and running...'
    })
})

export default app;