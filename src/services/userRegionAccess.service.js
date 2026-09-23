import apiClient from "../api/apiClient";

// Get all user region access records
export const getUserRegionAccess = async (params = {}) => {
  const response = await apiClient.get(
    "/user-management/user-region-access",
    { params }
  );

  return response.data;
};

// Create user region access
export const createUserRegionAccess = async (accessData) => {
  const response = await apiClient.post(
    "/user-management/user-region-access",
    accessData
  );

  return response.data;
};

// Get current logged-in user's region access
export const getMyRegionAccess = async () => {
  const response = await apiClient.get(
    "/user-management/user-region-access/me"
  );

  return response.data;
};

// Get region access of a particular user
export const getUserRegionAccessByUserId = async (
  userId
) => {
  const response = await apiClient.get(
    `/user-management/user-region-access/user/${userId}`
  );

  return response.data;
};

// Update user region access
export const updateUserRegionAccess = async (
  userRegionAccessId,
  accessData
) => {
  const response = await apiClient.patch(
    `/user-management/user-region-access/${userRegionAccessId}`,
    accessData
  );

  return response.data;
};

// Delete user region access
export const deleteUserRegionAccess = async (
  userRegionAccessId
) => {
  const response = await apiClient.delete(
    `/user-management/user-region-access/${userRegionAccessId}`
  );

  return response.data;
};



// Get merged effective region access of current logged-in user
export const getMyMergedRegionAccess = async () => {
  const response = await apiClient.get(
    "/user-management/user-region-access/me/regions"
  );

  return response.data;
};