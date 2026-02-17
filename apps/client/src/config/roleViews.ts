export const ROLE_VIEWS: Record<string, { groups: string[], defaultRoute: string }> = {
    ADMIN: {
        groups: ["decision", "governance", "org", "intelligence", "admin"],
        defaultRoute: "/decisions"
    },
    RO: {
        groups: ["decision", "governance", "intelligence"],
        defaultRoute: "/decisions"
    },
    RO_DEPT: {
        groups: ["decision", "governance"],
        defaultRoute: "/decisions"
    },
    BRANCH: {
        groups: ["decision"],
        defaultRoute: "/decisions"
    }
};
