import { createContext, useContext, useEffect, useState } from "react";
import {
    getCurrentUser, logoutUser,
    getMyAccess,
    getMyAccessScope,
} from "../services/auth.service";
import { hasPermission } from "../utils/authorization";

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

    const loadAuthorization = async () => {
        const [accessResponse, accessScopeResponse] = await Promise.all([
            getMyAccess(),
            getMyAccessScope(),
        ]);

        setAccess(unwrapApiData(accessResponse));
        setAccessScope(unwrapApiData(accessScopeResponse));
    };

    const login = async (userData) => {
        setUser(userData);
        await loadAuthorization();
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
                await loadAuthorization();
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
