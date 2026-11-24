
import apiClient from "../../../api/apiClient";

// Fetch every page because several backend list endpoints cap page size at 100.
const getAllPages = async (url, extraParams = {}) => {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await apiClient.get(url, {
      params: { ...extraParams, page, limit: 100 },
    });
    const payload = response.data?.data;
    const list = Array.isArray(payload) ? payload :
      payload?.users || payload?.roles || payload?.departments ||
      payload?.designations || payload?.userRoles ||
      payload?.userDesignations || payload?.userRegionAccess ||
      payload?.regionAccess || [];
    all.push(...list);
    const pagination = payload?.pagination || response.data?.pagination;
    totalPages = Number(pagination?.totalPages) || (list.length === 100 ? page + 1 : page);
    page += 1;
  } while (page <= totalPages && page <= 100);
  return { data: all };
};

export const getActiveUsers = () =>
  getAllPages("/user-management/users", { isActive: true });

export const getActiveRoles = () =>
  getAllPages("/permissions-management/roles", { isActive: true });

export const getActiveDepartments = () =>
  getAllPages("/department", { isActive: true });

export const getActiveDesignations = () =>
  getAllPages("/designation", { isActive: true });

export const getUserRoles = () =>
  getAllPages("/user-management/user-roles", { isActive: true });

export const getUserDesignations = () =>
  getAllPages("/user-management/user-designations");

export const getUserRegionAccess = () =>
  getAllPages("/user-management/user-region-access");

// ============================================================
// GET ATTENDANCE
// ============================================================

export const getAttendance = async ({
  date,
  fromDate,
  toDate,
  userId,
  attendanceType,
  status,
  attendanceSource,
} = {}) => {
  const params = {
    page: 1,
    limit: 5000,
  };

  if (date) {
    params.fromDate = date;
    params.toDate = date;
  } else {
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
  }

  if (userId) {
    params.userId = userId;
  }

  if (attendanceType) {
    params.attendanceType = attendanceType;
  }

  if (status) {
    params.status = status;
  }

  if (attendanceSource) {
    params.attendanceSource = attendanceSource;
  }

  const response = await apiClient.get(
    "/user-management/user-attendance",
    {
      params,
    }
  );

  console.log(
    "USER ATTENDANCE API RESPONSE:",
    response.data
  );

  return response.data?.data;
};

// ============================================================
// MARK USER ATTENDANCE
// ============================================================

export const markUserAttendance = async ({
  userId,
  attendanceType,
  status,
  date,
  checkIn,
  checkOut,
  visitedLocation,
  manualAttendanceReason,
  remarks,
}) => {

  const response = await apiClient.post(
    "/user-management/user-attendance",
    {
      userId,
      attendanceType,
      status,
      date,
      checkIn,
      checkOut,
      visitedLocation,
      manualAttendanceReason,
      remarks,
    }
  );

  return response.data;
};


// ============================================================
// UPDATE ATTENDANCE
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










// ============================================================
// GET ACCESS BASED ATTENDANCE
// ============================================================

export const getAccessBasedAttendance = async (params = {}) => {
  const response = await apiClient.get(
    "/user-management/user-attendance/access-based",
    {
      params,
    }
  );

  return response.data;
};


// Fetch holiday calendar overlays for every active employee in the selected date range.
export const getAttendanceHolidayOverlay = async ({ fromDate, toDate } = {}) => {
  const response = await apiClient.get("/hrms/holidays/attendance-overlay", {
    params: { fromDate, toDate },
  });
  return response.data?.data?.holidays || [];
};


/**
 * Fetch the selected employee's active leave buckets for the attendance date year.
 */
export const getAttendanceLeaveOptions = async (userId, year, currentAttendanceId = "") => {
  const response = await apiClient.get(
    `/user-management/user-attendance/leave-options/${userId}`,
    { params: { year, currentAttendanceId } }
  );
  return response.data?.data || [];
};

/**
 * Mark a one-day approved leave directly from Admin Attendance.
 * The backend creates the leave record, ledger deduction and attendance row atomically.
 */
export const markAttendanceLeave = async (payload) => {
  const response = await apiClient.post(
    "/user-management/user-attendance/mark-leave",
    payload
  );
  return response.data;
};

/** Remove an HR/Admin-marked leave from attendance and restore its leave bucket. */
export const removeAdminMarkedLeaveAttendance = async (attendanceId) => {
  const response = await apiClient.delete(
    `/user-management/user-attendance/${attendanceId}/admin-leave`
  );
  return response.data;
};
