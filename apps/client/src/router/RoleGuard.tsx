import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROLE_VIEWS } from '../config/roleViews';

interface RoleGuardProps {
    children?: ReactNode;
    roles: string[];
}

export const RoleGuard = ({ children, roles }: RoleGuardProps) => {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        if (!user) {
            return <Navigate to="/login" replace />;
        }

        let role = user.role || (user.user?.tenures?.[0]?.office?.tier === 'TIER_0_SYSTEM' ? 'ADMIN' : 'RO');

        // Normalize role - if it's generic 'USER', treat as 'RO' (Reviewing Officer)
        if (role === 'USER') {
            role = 'RO';
        }

        if (!roles.includes(role)) {
            const defaultRoute = ROLE_VIEWS[role]?.defaultRoute || '/login';

            // Prevent infinite redirect loop if defaultRoute is the same protected path
            if (defaultRoute === '/' || defaultRoute === window.location.pathname) {
                return <Navigate to="/login" replace />;
            }

            return <Navigate to={defaultRoute} replace />;
        }

        return children ? <>{children}</> : <Outlet />;
    } catch (e) {
        return <Navigate to="/login" replace />;
    }
};
