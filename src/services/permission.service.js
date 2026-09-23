import apiClient from "../api/apiClient";

export const getPermissions = async (params = {}) => {
  const response = await apiClient.get(
    "/permissions-management/permissions",
    { params }
  );

  return response.data;
};

export const createPermission = async (permissionData) => {
  const response = await apiClient.post(
    "/permissions-management/permissions",
    permissionData
  );

  return response.data;
};

export const getPermissionById = async (permissionId) => {
  const response = await apiClient.get(
    `/permissions-management/permissions/${permissionId}`
  );

  return response.data;
};

export const updatePermission = async (
  permissionId,
  permissionData
) => {
  const response = await apiClient.patch(
    `/permissions-management/permissions/${permissionId}`,
    permissionData
  );

  return response.data;
};

export const deletePermission = async (permissionId) => {
  const response = await apiClient.delete(
    `/permissions-management/permissions/${permissionId}`
  );

  return response.data;
};

export const searchPermissions = async (query, limit = 20) => {
  const response = await apiClient.get(
    "/permissions-management/permissions/search",
    {
      params: {
        q: query,
        limit,
      },
    }
  );

  return response.data;
};

export const getPermissionsByModule = async (module) => {
  const response = await apiClient.get(
    `/permissions-management/permissions/module/${module}`
  );

  return response.data;
};

export const getActivePermissions = async () => {
  const response = await apiClient.get(
    "/permissions-management/permissions/active"
  );

  return response.data;
};

export const togglePermissionStatus = async (permissionId) => {
  const response = await apiClient.patch(
    `/permissions-management/permissions/${permissionId}/status`
  );

  return response.data;
};