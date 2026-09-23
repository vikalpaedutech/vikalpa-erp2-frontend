import apiClient from "../api/apiClient";

// Get all user access records
export const getUserAccess = async () => {
  const response = await apiClient.get(
    "/user-management/user-access"
  );

  return response.data;
};

// Create user access
export const createUserAccess = async (
  userId,
  programIds = [],
  batchIds = []
) => {
  const response = await apiClient.post(
    "/user-management/user-access",
    {
      userId,
      programIds,
      batchIds,
    }
  );

  return response.data;
};

// Get access of a particular user
export const getUserAccessByUserId = async (
  userId
) => {
  const response = await apiClient.get(
    `/user-management/user-access/user/${userId}`
  );

  return response.data;
};

// Update user access
export const updateUserAccess = async (
  userAccessId,
  programIds,
  batchIds
) => {
  const response = await apiClient.patch(
    `/user-management/user-access/${userAccessId}`,
    {
      programIds,
      batchIds,
    }
  );

  return response.data;
};

// Delete user access
export const deleteUserAccess = async (
  userAccessId
) => {
  const response = await apiClient.delete(
    `/user-management/user-access/${userAccessId}`
  );

  return response.data;
};