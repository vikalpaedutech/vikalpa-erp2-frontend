import apiClient from "../api/apiClient";

export const getUsers = async (params = {}) => {
  const response = await apiClient.get(
    "/user-management/users",
    { params }
  );

  return response.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post(
    "/user-management/users",
    userData
  );

  return response.data;
};

export const getUserById = async (userId) => {
  const response = await apiClient.get(
    `/user-management/users/${userId}`
  );

  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await apiClient.patch(
    `/user-management/users/${userId}`,
    userData
  );

  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await apiClient.delete(
    `/user-management/users/${userId}`
  );

  return response.data;
};

export const searchUsers = async (query) => {
  const response = await apiClient.get(
    "/user-management/users/search",
    {
      params: {
        q: query,
      },
    }
  );

  return response.data;
};

export const toggleUserStatus = async (userId) => {
  const response = await apiClient.patch(
    `/user-management/users/${userId}/status`
  );

  return response.data;
};

export const downloadBulkUserOnboardingTemplate = async () => {
  const response = await apiClient.get(
    "/user-management/users/bulk-onboard/template",
    {
      responseType: "blob",
    }
  );

  return response.data;
};

export const bulkOnboardUsers = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    "/user-management/users/bulk-onboard",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
