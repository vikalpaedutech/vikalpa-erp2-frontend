import apiClient from "../api/apiClient";

export const getDepartments = async (params = {}) => {
  const response = await apiClient.get(
    "/department",
    { params }
  );

  return response.data;
};

export const createDepartment = async (departmentData) => {
  const response = await apiClient.post(
    "/department",
    departmentData
  );

  return response.data;
};

export const getDepartmentById = async (departmentId) => {
  const response = await apiClient.get(
    `/department/${departmentId}`
  );

  return response.data;
};

export const updateDepartment = async (
  departmentId,
  departmentData
) => {
  const response = await apiClient.patch(
    `/department/${departmentId}`,
    departmentData
  );

  return response.data;
};

export const deleteDepartment = async (departmentId) => {
  const response = await apiClient.delete(
    `/department/${departmentId}`
  );

  return response.data;
};

export const toggleDepartmentStatus = async (
  departmentId
) => {
  const response = await apiClient.patch(
    `/department/${departmentId}/status`
  );

  return response.data;
};

export const getActiveDepartments = async () => {
  const response = await apiClient.get(
    "/department/active"
  );

  return response.data;
};