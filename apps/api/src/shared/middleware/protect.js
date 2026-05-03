import prisma from "@repo/database";
import { verifyAccessToken } from '../lib/jwt.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { hasPermission } from "../utils/permissions.js";

export const protect = () =>
    asyncHandler(async (req, res, next) => {
        const token = req.cookies?.accessToken
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }

        try {
            const decoded = verifyAccessToken(token)
            req.user = decoded
            next()
        } catch {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' })
        }
    })


/**
* Middleware to check workspace-level permissions
* Fetches the user's role in the workspace and checks against permission matrix
*/
export function requireWorkspacePermission(permission) {
    return async (req, res, next) => {
        const workspaceId = req.params.id || req.body.workspaceId || req.query.id;
        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID required' });
        }

        try {
            const membership = await prisma.workspaceMember.findFirst({
                where: {

                    userId: req.user.userId,
                    workspaceId: workspaceId

                },
            });

            if (!membership) {
                return res.status(403).json({ message: 'Not a member of this workspace' });
            }

            if (!hasPermission(membership.role, permission)) {
                return res.status(403).json({
                    message: 'Insufficient permissions',
                    required: permission,
                });
            }

            req.workspaceRole = membership.role;
            next();
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Error checking permissions' });
        }
    };
}
