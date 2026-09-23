import apiClient from "../../../api/apiClient";

// ============================================================
// GET CENTER-WISE ATTENDANCE RECORDS
// ============================================================

export const getCenterWiseAttendances = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/student-management/center-wise-attendance",
    {
      params,
    }
  );

  return response.data;
};

// ============================================================
// GET SINGLE ATTENDANCE RECORD
// ============================================================

export const getCenterWiseAttendanceById = async (
  attendanceId
) => {
  const response = await apiClient.get(
    `/student-management/center-wise-attendance/${attendanceId}`
  );

  return response.data;
};

// ============================================================
// UPLOAD ATTENDANCE FILE
// PDF / JPG / JPEG / PNG
// ============================================================

export const createCenterWiseAttendance = async (
  formData
) => {
  const response = await apiClient.post(
    "/student-management/center-wise-attendance",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ============================================================
// GET SIGNED FILE URL
// ============================================================

export const getCenterWiseAttendanceFileUrl =
  async (attendanceId) => {
    const response = await apiClient.get(
      `/student-management/center-wise-attendance/${attendanceId}/file`
    );

    return response.data;
  };

// ============================================================
// DELETE ATTENDANCE
// ============================================================

export const deleteCenterWiseAttendance = async (
  attendanceId
) => {
  const response = await apiClient.delete(
    `/student-management/center-wise-attendance/${attendanceId}`
  );

  return response.data;
};

// ============================================================
// DOWNLOAD ATTENDANCE FORMAT
// ============================================================

export const downloadCenterWiseAttendanceTemplate =
  async (
    programId,
    batchId,
    centerId
  ) => {
    const response = await apiClient.get(
      `/student-management/center-wise-attendance/download-template/${programId}/${batchId}/${centerId}`,
      {
        responseType: "blob",
      }
    );

    return response;
  };