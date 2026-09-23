import { useAuth } from "../../context/AuthContext";

function PermissionGate({
  permission,
  children,
  fallback = null,
}) {
  const { can } = useAuth();

  if (!can(permission)) {
    return fallback;
  }

  return children;
}

export default PermissionGate;