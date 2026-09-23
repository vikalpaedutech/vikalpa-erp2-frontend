import apiClient from "../../../api/apiClient";

export const getMyGamificationDashboard = async () => {
  const response = await apiClient.get("/gamification-management/me/dashboard");
  return response.data;
};

export const getGamificationRoles = async () => {
  const response = await apiClient.get("/gamification-management/roles");
  return response.data;
};

export const updateGamificationRole = async (roleId, isAllowed) => {
  const response = await apiClient.patch(`/gamification-management/roles/${roleId}`, { isAllowed });
  return response.data;
};

export const getGamificationParticipants = async () => {
  const response = await apiClient.get("/gamification-management/participants");
  return response.data;
};

export const saveGamificationParticipant = async (payload) => {
  const response = await apiClient.post("/gamification-management/participants", payload);
  return response.data;
};

export const deleteGamificationParticipant = async (id) => {
  const response = await apiClient.delete(`/gamification-management/participants/${id}`);
  return response.data;
};

export const getGamificationCriteria = async () => {
  const response = await apiClient.get("/gamification-management/criteria");
  return response.data;
};

export const updateGamificationCriteria = async (payload) => {
  const response = await apiClient.put("/gamification-management/criteria", payload);
  return response.data;
};

export const updateGamificationMonthlyRanking = async (month) => {
  const response = await apiClient.post("/gamification-management/update-ranking", { month });
  return response.data;
};

export const initiateGamification = async (month) => {
  const response = await apiClient.post("/gamification-management/initiate", { month });
  return response.data;
};

export const getGamificationLeaderboard = async (params = {}) => {
  const response = await apiClient.get("/gamification-management/leaderboard", { params });
  return response.data;
};

export const downloadGamificationReport = async (month, format = "xlsx") => {
  const response = await apiClient.get("/gamification-management/report/download", {
    params: { month, format },
    responseType: "blob",
  });
  return response.data;
};
