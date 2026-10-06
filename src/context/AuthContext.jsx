import { createContext, useContext, useEffect, useState } from "react";
import {
    getCurrentUser, logoutUser,
    getMyAccess,
    getMyAccessScope,
} from "../services/auth.service";
import { hasPermission } from "../utils/authorization";
import { getActivePrograms } from "../services/program.service";
import { getActiveBatches } from "../services/batch.service";

const AuthContext = createContext(null);

// API responses in this project are wrapped by ApiResponse, while the
// service functions return response.data. Keep the normalization here so
// authentication/authorization never depends on a response nesting detail.
const unwrapApiData = (response) =>
    response?.data?.data ?? response?.data ?? response ?? null;

const getRoleCode = (role) =>
    String(
        role?.roleCode ??
        role?.code ??
        role?.roleName ??
        role?.name ??
        role ??
        ""
    )
        .trim()
        .toLowerCase();

const isAdministrator = (access, user) => {
    if (user?.isAdmin === true) return true;

    const userRoleCodes = [
        ...(Array.isArray(access?.roles) ? access.roles : []),
        ...(Array.isArray(user?.roles) ? user.roles : []),
        user?.role,
    ]
        .filter(Boolean)
        .map(getRoleCode);

    const directRoleCodes = [
        user?.roleCode,
        user?.roleName,
    ]
        .filter(Boolean)
        .map(getRoleCode);

    return [...userRoleCodes, ...directRoleCodes].some(
        (code) => code === "admin" || code === "administrator"
    );
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [access, setAccess] = useState(null);
    const [accessScope, setAccessScope] = useState(null);

    const loadAuthorization = async (currentUser = user) => {
        const [accessResponse, accessScopeResponse] = await Promise.all([
            getMyAccess(),
            getMyAccessScope(),
        ]);

        const resolvedAccess = unwrapApiData(accessResponse);
        const resolvedScope = unwrapApiData(accessScopeResponse);

        setAccess(resolvedAccess);

        // Admins intentionally do not need explicit Program/Batch assignments.
        // Populate their effective academic access from the active master lists
        // so every existing consumer of accessScope.programAccess behaves
        // consistently (dropdowns, filters, reports, etc.). Non-admin access
        // remains exactly as assigned by UserAccess.
        const resolvedIsAdmin = isAdministrator(resolvedAccess, currentUser);

        if (resolvedIsAdmin) {
            try {
                const [programResponse, batchResponse] = await Promise.all([
                    getActivePrograms(),
                    getActiveBatches(),
                ]);

                const programs = unwrapApiData(programResponse);
                const batches = unwrapApiData(batchResponse);

                setAccessScope({
                    ...(resolvedScope || {}),
                    programAccess: {
                        programs: Array.isArray(programs) ? programs : [],
                        batches: Array.isArray(batches) ? batches : [],
                    },
                });
            } catch (error) {
                // Do not fail authentication if the optional Admin master-list
                // hydration fails. Preserve the original authorization response.
                console.error("Failed to load Admin Program/Batch access:", error);
                setAccessScope(resolvedScope);
            }
        } else {
            setAccessScope(resolvedScope);
        }
    };

    const login = async (userData) => {
        setUser(userData);
        await loadAuthorization(userData);
    };

    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
            setAccess(null);
            setAccessScope(null);
        }
    };

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await getCurrentUser();
                const currentUser = unwrapApiData(response);
                setUser(currentUser);
                await loadAuthorization(currentUser);
            } catch (error) {
                setUser(null);
                setAccess(null);
                setAccessScope(null);
            } finally {
                setLoading(false);
            }
        };

        const handleSessionExpired = () => {
            setUser(null);
            setAccess(null);
            setAccessScope(null);
        };

        window.addEventListener("auth:session-expired", handleSessionExpired);
        restoreSession();

        return () => {
            window.removeEventListener("auth:session-expired", handleSessionExpired);
        };
    }, []);

    const isAdmin = isAdministrator(access, user);

    const can = (permissionCode) => {
        if (isAdmin) return true;
        return hasPermission(access, permissionCode);
    };

    const value = {
        user,
        access,
        accessScope,
        isAuthenticated: !!user,
        isAdmin,
        loading,
        login,
        logout,
        can,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
