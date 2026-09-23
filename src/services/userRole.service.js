import apiClient from "../api/apiClient";

export const getUserRoles = async (params = {}) => {
  const response = await apiClient.get(
    "/user-management/user-roles",
    { params }
  );

  return response.data;
};

export const assignRoleToUser = async (
  userId,
  roleId
) => {
  const response = await apiClient.post(
    "/user-management/user-roles",
    {
      userId,
      roleId,
    }
  );

  return response.data;
};

export const getUserRoleById = async (userRoleId) => {
  const response = await apiClient.get(
    `/user-management/user-roles/${userRoleId}`
  );

  return response.data;
};

export const getRolesByUser = async (userId) => {
  const response = await apiClient.get(
    `/user-management/user-roles/user/${userId}`
  );

  return response.data;
};

export const getUsersByRole = async (roleId) => {
  const response = await apiClient.get(
    `/user-management/user-roles/role/${roleId}`
  );

  return response.data;
};

export const toggleUserRoleStatus = async (
  userRoleId
) => {
  const response = await apiClient.patch(
    `/user-management/user-roles/${userRoleId}/status`
  );

  return response.data;
};

export const removeRoleFromUser = async (
  userRoleId
) => {
  const response = await apiClient.delete(
    `/user-management/user-roles/${userRoleId}`
  );

  return response.data;
};