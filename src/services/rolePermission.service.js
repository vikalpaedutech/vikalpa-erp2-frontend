import apiClient from "../api/apiClient";

export const getPermissionsByRole = async (roleId) =>
  (await apiClient.get(`/permissions-management/role-permissions/role/${roleId}`)).data;

export const assignPermissionToRole = async (roleId, permissionId) =>
  (await apiClient.post("/permissions-management/role-permissions", { roleId, permissionId })).data;

export const removePermissionFromRole = async (rolePermissionId) =>
  (await apiClient.delete(`/permissions-management/role-permissions/${rolePermissionId}`)).data;

export const replacePermissionsForRole = async (roleId, permissionIds) =>
  (await apiClient.put(`/permissions-management/role-permissions/role/${roleId}`, { permissionIds })).data;
