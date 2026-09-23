export const hasPermission = (access, permissionCode) => {
  if (!permissionCode) return false;

  const required = String(permissionCode).trim().toLowerCase();

  return (access?.permissions || []).some((permission) =>
    String(permission?.permissionCode || "").trim().toLowerCase() === required
  );
};
