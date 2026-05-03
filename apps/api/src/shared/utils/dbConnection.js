import prisma from '@repo/database'

const dbConnection = async () => {
    try {
        await prisma.$connect();
        console.info("DB connected")
    } catch (error) {
        console.error("DB connect failed ->", error)
        process.exit(1)
    }
}

export default dbConnection