import apiClient from "../api/apiClient";

export const getRoles = async (params = {}) => {
  const response = await apiClient.get(
    "/permissions-management/roles",
    { params }
  );

  return response.data;
};

export const createRole = async (roleData) => {
  const response = await apiClient.post(
    "/permissions-management/roles",
    roleData
  );

  return response.data;
};

export const getRoleById = async (roleId) => {
  const response = await apiClient.get(
    `/permissions-management/roles/${roleId}`
  );

  return response.data;
};

export const updateRole = async (roleId, roleData) => {
  const response = await apiClient.patch(
    `/permissions-management/roles/${roleId}`,
    roleData
  );

  return response.data;
};

export const deleteRole = async (roleId) => {
  const response = await apiClient.delete(
    `/permissions-management/roles/${roleId}`
  );

  return response.data;
};

export const searchRoles = async (query) => {
  const response = await apiClient.get(
    "/permissions-management/roles/search",
    {
      params: {
        q: query,
      },
    }
  );

  return response.data;
};

export const getActiveRoles = async () => {
  const response = await apiClient.get(
    "/permissions-management/roles/active"
  );

  return response.data;
};

export const toggleRoleStatus = async (roleId) => {
  const response = await apiClient.patch(
    `/permissions-management/roles/${roleId}/status`
  );

  return response.data;
};