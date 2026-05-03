import apiClient from './client';

export const authAPI = {
    login: async ({ email, password }) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },

    register: async ({ name, email, password }) => {
        const response = await apiClient.post('/auth/register', { name, email, password });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    verifyOTP: async ({ email, otp }) => {
        const response = await apiClient.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    resetPassword: async ({ token, password }) => {
        const response = await apiClient.post('/auth/reset-password', { token, password });
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },
};
