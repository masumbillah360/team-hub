'use client';

import { useState } from 'react';
import useStore from '@/lib/store';
import { authAPI } from '@/lib/api/auth';
import {
    Camera,
    Save,
    LogOut,
    Shield,
    Mail,
    User,
    Loader2,
} from 'lucide-react';

export default function ProfilePage() {
    const { currentUser, setCurrentUser, addToast } = useStore();
    console.log('currentUser', currentUser);
    const [name, setName] = useState(currentUser?.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const handleSave = async () => {
        const formData = new FormData();
        let hasChanges = false;

        if (name !== currentUser?.name) {
            formData.append('name', name);
            hasChanges = true;
        }
        if (avatarPreview?.file) {
            formData.append('avatar', avatarPreview.file);
            hasChanges = true;
        }

        if (!hasChanges) {
            addToast({
                title: 'No Changes',
                description: 'No changes were made to save',
                type: 'info',
            });
            return;
        }

        try {
            setIsLoading(true);
            const response = await authAPI.updateProfile(formData);

            // Handle the response based on your API structure
            const updatedUser = response.data?.data || response.data;

            setCurrentUser(updatedUser);
            setAvatarPreview(null); // Clear preview after successful upload

            addToast({
                title: 'Success',
                description: 'Profile updated successfully!',
                type: 'success',
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            addToast({
                title: 'Error',
                description:
                    error.response?.data?.message || 'Failed to update profile',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                addToast({
                    title: 'File Too Large',
                    description: 'Please select an image smaller than 5MB',
                    type: 'error',
                });
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                addToast({
                    title: 'Invalid File Type',
                    description: 'Please select an image file',
                    type: 'error',
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview({ url: reader.result, file });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = async () => {
        if (!confirm('Are you sure you want to sign out?')) {
            return;
        }

        try {
            await authAPI.logout();
            setCurrentUser(null);

            addToast({
                title: 'Signed Out',
                description: 'You have been successfully signed out',
                type: 'success',
            });

            // Clear any stored data
            localStorage.removeItem('currentWorkspaceId');

            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out:', error);
            // Even if logout fails, clear local state
            setCurrentUser(null);
            window.location.href = '/login';
        }
    };

    const resetChanges = () => {
        setName(currentUser?.name || '');
        setEmail(currentUser?.email || '');
        setAvatarPreview(null);
    };

    const hasChanges = name !== currentUser?.name || avatarPreview?.file;

    if (!currentUser) {
        return (
            <div className="p-6 max-w-2xl">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Not Signed In
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Please sign in to view your profile
                    </p>
                    <button
                        onClick={() => (window.location.href = '/login')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fadeIn max-w-2xl">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    My Profile
                </h1>
                {hasChanges && (
                    <button
                        onClick={resetChanges}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        Reset Changes
                    </button>
                )}
            </div>

            {/* Avatar Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {avatarPreview?.url || currentUser.avatar ? (
                            <img
                                src={avatarPreview?.url || currentUser.avatar}
                                alt={currentUser.name}
                                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {currentUser.name?.charAt(0)?.toUpperCase() ||
                                    'U'}
                            </div>
                        )}
                        <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition cursor-pointer">
                            <Camera className="w-4 h-4" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                disabled={isLoading}
                            />
                        </label>
                        {avatarPreview && (
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                                ✓
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {currentUser.name}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {currentUser.email}
                        </p>
                        {currentUser.online && (
                            <div className="flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600 dark:text-green-400">
                                    Online
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Edit Profile
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> Full Name
                        </label>
                        <input
                            type="text"
                            value={name || currentUser.name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> Email
                        </label>
                        <p className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                            {currentUser.email}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value="••••••••"
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Password change requires email verification
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isLoading || !hasChanges}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center gap-2">
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>

                        {hasChanges && !isLoading && (
                            <button
                                onClick={resetChanges}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Session Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Session
                </h3>
                <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Status
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            {currentUser.online ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Role
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {currentUser.role?.toLowerCase()}
                        </span>
                    </div>
                    {currentUser.lastActive && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Last Active
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {new Date(
                                    currentUser.lastActive,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm font-medium rounded-lg transition flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    );
}
