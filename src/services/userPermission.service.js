import apiClient from "../api/apiClient";

export const getUserPermissions = async (userId) =>
  (await apiClient.get(`/user-management/user-permissions/${userId}`)).data;

export const getEffectiveUserPermissions = async (userId) =>
  (await apiClient.get(`/user-management/user-permissions/${userId}/effective`)).data;

export const replaceUserPermissions = async (userId, permissionIds) =>
  (await apiClient.put(`/user-management/user-permissions/${userId}`, { permissionIds })).data;

export const getMyDirectPermissions = async () =>
  (await apiClient.get("/user-management/user-permissions/me")).data;
