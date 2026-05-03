import app from "./app.js";
import config from "./shared/config/index.js";
import { setupSocket } from "./shared/lib/socket.js";
import dbConnection from "./shared/utils/dbConnection.js";
import prisma from "@repo/database";

const port = config.PORT

const server = app.listen(port, async () => {
    console.log('Server is running on port:', port)
    await dbConnection()
})
setupSocket(server)

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`)

    server.close(async () => {
        console.log('HTTP server closed.')

        try {
            await prisma.$disconnect()
            console.log('Database connection closed.')
        } catch (error) {
            console.error('Error disconnecting from database:', error)
        }

        process.exit(0)
    })

    // Force close server after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down')
        process.exit(1)
    }, 10000)
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))