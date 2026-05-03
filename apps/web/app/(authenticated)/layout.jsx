'use client';

import { useEffect, useState } from 'react';

import Sidebar from '@/app/components/dashboard/Sidebar';
import Header from '@/app/components/dashboard/Header';
import WorkspaceSelector from '@/app/components/dashboard/WorkspaceSelector';
import CommandPalette from '@/app/components/dashboard/CommandPalette';
import ToastContainer from '@/app/components/dashboard/ToastContainer';
import useStore from '@/lib/store';
import { workspacesAPI } from '@/lib/api/workspaces';

export default function AuthenticatedLayout({ children }) {
    const { currentWorkspaceId, setCurrentWorkspace, showWorkspaceSelector, setShowWorkspaceSelector, workspacesVersion } = useStore();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch workspaces
    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const res = await workspacesAPI.list();
            const data = res.data || [];
            setWorkspaces(data);

            // Handle workspace selection
            if (data.length > 0 && !currentWorkspaceId) {
                const lastWorkspaceId = localStorage.getItem('lastWorkspaceId');
                if (lastWorkspaceId && data.some(w => w.id === lastWorkspaceId)) {
                    setCurrentWorkspace(lastWorkspaceId);
                } else {
                    // Default to first workspace if no last used workspace found
                    setCurrentWorkspace(data[0].id);
                }
            }
            // If no workspaces exist, the modal will open automatically due to the condition below
        } catch (err) {
            console.error('Failed to fetch workspaces:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, [currentWorkspaceId, setCurrentWorkspace, setShowWorkspaceSelector, workspacesVersion]);



    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    {children}
                </main>
            </div>

            {/* Global Components */}
            <CommandPalette />
            <ToastContainer />

            {/* Workspace Selector Modal */}
            <WorkspaceSelector
                isOpen={showWorkspaceSelector || (!loading && workspaces.length === 0)}
                onClose={() => setShowWorkspaceSelector(false)}
            />
        </div>
    );
}
