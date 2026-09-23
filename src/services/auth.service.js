import apiClient from "../api/apiClient";

export const loginUser = async (loginData) => {
  const response = await apiClient.post("/auth/login", loginData);

  return response.data;
};


export const getCurrentUser = async () => {
  const response = await apiClient.post("/auth/current-user");

  return response.data;
};


export const logoutUser = async () => {
  const response = await apiClient.post("/auth/logout");

  return response.data;
};


export const forgotPassword = async (email) => {
  const response = await apiClient.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};


export const changePassword = async (passwordData) => {
  const response = await apiClient.post(
    "/auth/change-password",
    passwordData
  );

  return response.data;
};



export const getMyAccess = async () => {
  const response = await apiClient.get("/auth/my-access");
  return response.data;
};

export const getMyAccessScope = async () => {
  const response = await apiClient.get("/auth/my-access-scope");
  return response.data;
};