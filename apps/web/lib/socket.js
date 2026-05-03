import { io } from 'socket.io-client';
import useStore from './store';

let socket = null;
let currentWorkspaceId = null;

export function getSocket() {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005', {
            withCredentials: true,
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            if (currentWorkspaceId) {
                socket.emit('join-workspace', currentWorkspaceId);
            }
        });

        socket.on('online-users', ({ users }) => {
            console.log('Received online users:', users);
            useStore.getState().setOnlineUsers(users);
        });

        socket.on('user-online', ({ userId }) => {
            console.log('User online:', userId);
            const { onlineUsers } = useStore.getState();
            if (!onlineUsers.includes(userId)) {
                useStore.getState().setOnlineUsers([...onlineUsers, userId]);
            }
        });

        socket.on('user-offline', ({ userId }) => {
            console.log('User offline:', userId);
            const { onlineUsers } = useStore.getState();
            useStore.getState().setOnlineUsers(onlineUsers.filter((id) => id !== userId));
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message, error.data);
        });
    }

    return socket;
}

export function joinWorkspace(workspaceId) {
    if (!workspaceId) return;

    currentWorkspaceId = workspaceId;
    const socketInstance = getSocket();

    if (!socketInstance.connected) {
        socketInstance.connect();
    } else {
        socketInstance.emit('join-workspace', workspaceId);
    }
}

export function leaveWorkspace(workspaceId) {
    if (!workspaceId || !socket) return;

    socket.emit('leave-workspace', workspaceId);
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        currentWorkspaceId = null;
    }
}
