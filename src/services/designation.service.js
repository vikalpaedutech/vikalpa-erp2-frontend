import apiClient from "../api/apiClient";

export const getDesignations = async (params = {}) => {
  const response = await apiClient.get(
    "/designation",
    { params }
  );

  return response.data;
};

export const createDesignation = async (
  designationData
) => {
  const response = await apiClient.post(
    "/designation",
    designationData
  );

  return response.data;
};

export const getDesignationById = async (
  designationId
) => {
  const response = await apiClient.get(
    `/designation/${designationId}`
  );

  return response.data;
};

export const updateDesignation = async (
  designationId,
  designationData
) => {
  const response = await apiClient.patch(
    `/designation/${designationId}`,
    designationData
  );

  return response.data;
};

export const deleteDesignation = async (
  designationId
) => {
  const response = await apiClient.delete(
    `/designation/${designationId}`
  );

  return response.data;
};

export const toggleDesignationStatus = async (
  designationId
) => {
  const response = await apiClient.patch(
    `/designation/${designationId}/status`
  );

  return response.data;
};

export const getActiveDesignations = async () => {
  const response = await apiClient.get(
    "/designation/active"
  );

  return response.data;
};