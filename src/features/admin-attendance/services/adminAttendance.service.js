
import apiClient from "../../../api/apiClient";

// ============================================================
// GET ACTIVE USERS
// ============================================================

export const getActiveUsers = async () => {
  const response = await apiClient.get(
    "/user-management/users",
    {
      params: {
        page: 1,
        limit: 100,
        isActive: true,
      },
    }
  );

  return response.data;
};

// ============================================================
// GET ACTIVE ROLES
// ============================================================

export const getActiveRoles = async () => {
  const response = await apiClient.get(
    "/permissions-management/roles",
    {
      params: {
        isActive: true,
        page: 1,
        limit: 100,
      },
    }
  );

  return response.data;
};


// ============================================================
// GET ACTIVE DEPARTMENTS
// ============================================================

export const getActiveDepartments = async () => {
  const response = await apiClient.get(
    "/department",
    {
      params: {
        isActive: true,
        page: 1,
        limit: 100,
      },
    }
  );

  return response.data;
};


// ============================================================
// GET ACTIVE DESIGNATIONS
// ============================================================

export const getActiveDesignations = async () => {
  const response = await apiClient.get(
    "/designation",
    {
      params: {
        isActive: true,
        page: 1,
        limit: 100,
      },
    }
  );

  return response.data;
};

// ============================================================
// GET USER ROLE MAPPINGS
// ============================================================

export const getUserRoles = async () => {
  const response = await apiClient.get(
    "/user-management/user-roles",
    {
      params: {
        page: 1,
        limit: 100,
        isActive: true,
      },
    }
  );

  return response.data;
};


// ============================================================
// GET USER DESIGNATION MAPPINGS
// ============================================================

export const getUserDesignations = async () => {
  const response = await apiClient.get(
    "/user-management/user-designations",
    {
      params: {
        page: 1,
        limit: 100,
      },
    }
  );

  return response.data;
};


// ============================================================
// GET ATTENDANCE
// ============================================================

export const getAttendance = async ({
  date,
  userId,
  attendanceType,
  status,
  attendanceSource,
} = {}) => {
  const params = {
    page: 1,
    limit: 100,
  };

  if (date) {
    params.fromDate = date;
    params.toDate = date;
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
// GET USER REGION ACCESS
// ============================================================

export const getUserRegionAccess = async () => {
  const response = await apiClient.get(
    "/user-management/user-region-access",
    {
      params: {
        page: 1,
        limit: 100,
      },
    }
  );

  return response.data?.data;
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

