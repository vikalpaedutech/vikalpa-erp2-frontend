import apiClient from "../../../api/apiClient";

const ABSENTEE_CALLING_URL =
  "/calling-management/calling-details";

export const getAbsenteeCallingStudents =
  async (params = {}) => {
    const response =
      await apiClient.get(
        `${ABSENTEE_CALLING_URL}/absentee-students`,
        {
          params,
        }
      );

    return response.data;
  };

export const saveAbsenteeCalling =
  async (payload) => {
    const response =
      await apiClient.post(
        `${ABSENTEE_CALLING_URL}/absentee-call`,
        payload
      );

    return response.data;
  };