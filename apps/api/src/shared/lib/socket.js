import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '@repo/database';
import config from '../config/index.js';

export function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.match(/accessToken=([^;]+)/)?.[1];
        if (!token) return next(new Error('Authentication error'));

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.role = decoded.role;

            await prisma.user.update({
                where: { id: decoded.userId },
                data: { online: true },
            });

            next();
        } catch {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);

        socket.on('join-workspace', (workspaceId) => {
            socket.join(`workspace-${workspaceId}`);
            io.to(`workspace-${workspaceId}`).emit('user-online', { userId: socket.userId });
        });

        socket.on('leave-workspace', (workspaceId) => {
            socket.leave(`workspace-${workspaceId}`);
        });

        socket.on('disconnect', async () => {
            console.log(`User ${socket.userId} disconnected`);
            await prisma.user.update({
                where: { id: socket.userId },
                data: { online: false },
            });
            socket.broadcast.emit('user-offline', { userId: socket.userId });
        });
    });

    return io;
}
