import apiClient from "../api/apiClient";

export const getUserDesignations = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/user-management/user-designations",
    { params }
  );

  return response.data;
};

export const assignDesignationToUser = async (
  userId,
  designationId,
  isPrimary = false
) => {
  const response = await apiClient.post(
    "/user-management/user-designations",
    {
      userId,
      designationId,
      isPrimary,
    }
  );

  return response.data;
};

export const getUserDesignationById = async (
  userDesignationId
) => {
  const response = await apiClient.get(
    `/user-management/user-designations/${userDesignationId}`
  );

  return response.data;
};

export const getDesignationsByUser = async (
  userId
) => {
  const response = await apiClient.get(
    `/user-management/user-designations/user/${userId}`
  );

  return response.data;
};

export const getUsersByDesignation = async (
  designationId
) => {
  const response = await apiClient.get(
    `/user-management/user-designations/designation/${designationId}`
  );

  return response.data;
};

export const toggleUserDesignationStatus = async (
  userDesignationId
) => {
  const response = await apiClient.patch(
    `/user-management/user-designations/${userDesignationId}/status`
  );

  return response.data;
};

export const removeDesignationFromUser = async (
  userDesignationId
) => {
  const response = await apiClient.delete(
    `/user-management/user-designations/${userDesignationId}`
  );

  return response.data;
};