import apiClient from "../../../api/apiClient";

// ============================================================
// CREATE USER ATTENDANCE
// ============================================================

export const createUserAttendance = async ({
  attendanceType,
  status,
  date,
  photo,
  visitedLocation,
  latitude,
  longitude,
  manualAttendanceReason,
  remarks,
}) => {
  const formData = new FormData();

  formData.append("attendanceType", attendanceType);
  formData.append("status", status);
  formData.append("date", date);

  if (photo) {
    formData.append("photo", photo);
  }

  if (visitedLocation?.trim()) {
    formData.append("visitedLocation", visitedLocation.trim());
  }

  if (latitude !== undefined && latitude !== null) {
    formData.append("latitude", latitude);
  }

  if (longitude !== undefined && longitude !== null) {
    formData.append("longitude", longitude);
  }

  if (manualAttendanceReason?.trim()) {
    formData.append(
      "manualAttendanceReason",
      manualAttendanceReason.trim()
    );
  }

  if (remarks?.trim()) {
    formData.append("remarks", remarks.trim());
  }

  const response = await apiClient.post(
    "/user-management/user-attendance",
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
// GET MY ATTENDANCE
// ============================================================

export const getMyAttendance = async ({
  fromDate,
  toDate,
  attendanceType,
  status,
  attendanceSource,
  page = 1,
  limit = 100,
} = {}) => {
  const params = {
    page,
    limit,
  };

  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (attendanceType) params.attendanceType = attendanceType;
  if (status) params.status = status;
  if (attendanceSource) params.attendanceSource = attendanceSource;

  const response = await apiClient.get(
    "/user-management/user-attendance/me",
    { params }
  );

  return response.data;
};

// ============================================================
// GET ATTENDANCE BY ID
// ============================================================

export const getUserAttendanceById = async (attendanceId) => {
  const response = await apiClient.get(
    `/user-management/user-attendance/${attendanceId}`
  );

  return response.data;
};

// ============================================================
// UPDATE MY ATTENDANCE
// ============================================================

export const updateUserAttendance = async (
  attendanceId,
  payload
) => {
  const response = await apiClient.patch(
    `/user-management/user-attendance/${attendanceId}`,
    payload
  );

  return response.data;
};


export const checkoutUserAttendance = async (attendanceId) => {
  const response = await apiClient.patch(
    `/user-management/user-attendance/${attendanceId}/checkout`
  );

  return response.data;
};
