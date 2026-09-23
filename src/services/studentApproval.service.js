import apiClient from "../api/apiClient";

// ============================================================
// GET STUDENT REQUEST LOGS
// ============================================================

export const getStudentLogs = async (params = {}) => {
  const response = await apiClient.get(
    "/student-management/student-logs",
    {
      params,
    }
  );

  return response.data;
};

// ============================================================
// APPROVE STUDENT REQUEST
// ============================================================

export const approveStudentRequest = async (
  logId,
  actionReason = ""
) => {
  const response = await apiClient.patch(
    `/student-management/student-logs/${logId}/approve`,
    {
      actionReason,
    }
  );

  return response.data;
};

// ============================================================
// REJECT STUDENT REQUEST
// ============================================================
export const rejectStudentRequest = async (
  logId,
  reason
) => {
  const response = await apiClient.patch(
    `/student-management/student-logs/${logId}/reject`,
    { reason }
  );

  return response.data;
};