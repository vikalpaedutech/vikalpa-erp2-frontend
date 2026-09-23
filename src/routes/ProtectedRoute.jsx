import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RegionAccessProvider } from "../context/RegionAccessContext";
import { administrationItems, navigationItems } from "../config/navigation";

function ProtectedRoute() {
  const { isAuthenticated, loading, isAdmin, can } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    const item = [...navigationItems, ...administrationItems]
      .filter((x) => x.permission)
      .sort((a,b) => b.path.length - a.path.length)
      .find((x) => location.pathname === x.path || location.pathname.startsWith(`${x.path}/`));
    if (item && !can(item.permission)) return <Navigate to="/dashboard" replace />;
  }

  return <RegionAccessProvider><Outlet /></RegionAccessProvider>;
}
export default ProtectedRoute;
