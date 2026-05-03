import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '@repo/database';
import config from '../config/index.js';

// Track active connections per user per workspace (for multiple tabs)
const workspaceUsers = new Map(); // workspaceId -> Set of userIds
const userConnectionCounts = new Map(); // userId -> connection count across all workspaces

function getWorkspaceOnlineUsers(workspaceId) {
    const users = workspaceUsers.get(workspaceId);
    if (!users) return [];
    return Array.from(users);
}

export function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        // Try to get token from cookie or auth
        const cookieHeader = socket.handshake.headers?.cookie || '';
        const cookies = Object.fromEntries(
            cookieHeader.split('; ').map(c => c.split('='))
        );
        const token = 
            socket.handshake.auth?.token || 
            cookies['accessToken'] ||
            socket.handshake.headers?.authorization?.replace('Bearer ', '');
        
        if (!token) {
            console.log('Socket auth failed: No token found in handshake. Cookies:', cookieHeader);
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.role = decoded.role;
            next();
        } catch {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);

        // Initialize connection count for this user
        const currentCount = userConnectionCounts.get(socket.userId) || 0;
        userConnectionCounts.set(socket.userId, currentCount + 1);

        // Mark user as online in DB if first connection
        if (currentCount === 0) {
            prisma.user.update({
                where: { id: socket.userId },
                data: { online: true },
            }).catch(err => console.error('Failed to update user online status:', err));
        }

        socket.on('join-workspace', (workspaceId) => {
            const room = `workspace-${workspaceId}`;
            socket.join(room);
            socket.currentWorkspace = workspaceId;

            // Add user to workspace's online users
            if (!workspaceUsers.has(workspaceId)) {
                workspaceUsers.set(workspaceId, new Set());
            }
            workspaceUsers.get(workspaceId).add(socket.userId);

            // Send current online users to the joining client
            const onlineUsers = getWorkspaceOnlineUsers(workspaceId);
            socket.emit('online-users', { users: onlineUsers });
            
            // Notify others in the workspace that this user is online
            socket.to(room).emit('user-online', { userId: socket.userId });
            
            console.log(`User ${socket.userId} joined workspace ${workspaceId}. Online users:`, onlineUsers);
        });

        socket.on('leave-workspace', (workspaceId) => {
            const room = `workspace-${workspaceId}`;
            socket.leave(room);
            
            // Remove user from workspace's online users
            const users = workspaceUsers.get(workspaceId);
            if (users) {
                users.delete(socket.userId);
                if (users.size === 0) {
                    workspaceUsers.delete(workspaceId);
                }
            }
        });

        socket.on('disconnect', async () => {
            console.log(`User ${socket.userId} disconnected`);
            
            // Decrement connection count
            const count = userConnectionCounts.get(socket.userId) || 0;
            const newCount = Math.max(0, count - 1);
            
            if (newCount === 0) {
                userConnectionCounts.delete(socket.userId);
                
                // Remove user from all workspace rooms
                for (const [workspaceId, users] of workspaceUsers.entries()) {
                    if (users.has(socket.userId)) {
                        users.delete(socket.userId);
                        if (users.size === 0) {
                            workspaceUsers.delete(workspaceId);
                        }
                        // Notify workspace that user is offline
                        io.to(`workspace-${workspaceId}`).emit('user-offline', { userId: socket.userId });
                    }
                }
                
                // Mark user as offline in DB
                try {
                    await prisma.user.update({
                        where: { id: socket.userId },
                        data: { online: false },
                    });
                } catch (err) {
                    console.error('Failed to update user offline status:', err);
                }
            } else {
                userConnectionCounts.set(socket.userId, newCount);
            }
        });
    });

    return io;
}
