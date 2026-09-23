import apiClient from "../../../api/apiClient";

// ============================================================
// LEAVE TYPES
// ============================================================

export const getLeaveTypes = async (params = {}) => {
  const response = await apiClient.get(
    "/user-management/leave-types",
    { params }
  );

  return response.data;
};

export const createLeaveType = async (payload) => {
  const response = await apiClient.post(
    "/user-management/leave-types",
    payload
  );

  return response.data;
};

export const updateLeaveType = async (leaveTypeId, payload) => {
  const response = await apiClient.patch(
    `/user-management/leave-types/${leaveTypeId}`,
    payload
  );

  return response.data;
};

export const deactivateLeaveType = async (leaveTypeId) => {
  const response = await apiClient.delete(
    `/user-management/leave-types/${leaveTypeId}`
  );

  return response.data;
};

// ============================================================
// APPLY LEAVE
// ============================================================

export const applyLeave = async (payload) => {
  let requestBody = payload;
  let config = {};

  if (payload instanceof FormData) {
    config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
  }

  const response = await apiClient.post(
    "/user-management/user-leaves",
    requestBody,
    config
  );

  return response.data;
};

// ============================================================
// MY LEAVES
// ============================================================

export const getMyLeaves = async (params = {}) => {
  const response = await apiClient.get(
    "/user-management/user-leaves",
    { params }
  );

  return response.data;
};

// ============================================================
// LEAVE BY ID
// ============================================================

export const getMyLeaveById = async (leaveId) => {
  const response = await apiClient.get(
    `/user-management/user-leaves/${leaveId}`
  );

  return response.data;
};

// ============================================================
// WITHDRAW
// ============================================================

export const withdrawLeave = async (
  leaveId,
  withdrawalReason
) => {
  const response = await apiClient.patch(
    `/user-management/user-leaves/${leaveId}/withdraw`,
    { withdrawalReason }
  );

  return response.data;
};

// ============================================================
// CANCEL FUTURE APPROVED LEAVE
// ============================================================

export const cancelLeave = async (
  leaveId,
  cancellationReason
) => {
  const response = await apiClient.patch(
    `/user-management/user-leaves/${leaveId}/cancel`,
    { cancellationReason }
  );

  return response.data;
};

// ============================================================
// PENDING APPROVALS
// ============================================================

export const getPendingLeaveApprovals = async (params = {}) => {
  const response = await apiClient.get(
    "/user-management/leave-approvals",
    { params }
  );

  return response.data;
};

// ============================================================
// APPROVE
// ============================================================

export const approveLeave = async (
  leaveId,
  payload = {}
) => {
  const response = await apiClient.patch(
    `/user-management/leave-approvals/${leaveId}/approve`,
    payload
  );

  return response.data;
};

// ============================================================
// REJECT
// ============================================================

export const rejectLeave = async (
  leaveId,
  payload = {}
) => {
  const response = await apiClient.patch(
    `/user-management/leave-approvals/${leaveId}/reject`,
    payload
  );

  return response.data;
};

// ============================================================
// LEAVE APPROVAL RULES
// ============================================================

export const getLeaveApprovalRules = async (params = {}) => {
  const response = await apiClient.get(
    "/user-management/leave-approval-rules",
    { params }
  );

  return response.data;
};

export const createLeaveApprovalRule = async (payload) => {
  const response = await apiClient.post(
    "/user-management/leave-approval-rules",
    payload
  );

  return response.data;
};

export const updateLeaveApprovalRule = async (
  ruleId,
  payload
) => {
  const response = await apiClient.patch(
    `/user-management/leave-approval-rules/${ruleId}`,
    payload
  );

  return response.data;
};

export const deactivateLeaveApprovalRule = async (ruleId) => {
  const response = await apiClient.delete(
    `/user-management/leave-approval-rules/${ruleId}`
  );

  return response.data;
};


// ============================================================
// ACTIVE USERS FOR LEAVE BALANCE ADMIN
// ============================================================

export const getActiveLeaveBalanceUsers = async () => {
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
// MY LEAVE BALANCES
// ============================================================

export const getMyLeaveBalances = async (leaveYear) => {
  const response = await apiClient.get(
    "/user-management/leave-balances/my",
    {
      params: {
        leaveYear,
      },
    }
  );

  return response.data;
};

// ============================================================
// ADMIN LEAVE BALANCES
// ============================================================

export const getLeaveBalances = async (params = {}) => {
  const response = await apiClient.get(
    "/user-management/leave-balances",
    { params }
  );

  return response.data;
};

export const configureLeaveBalance = async (payload) => {
  const response = await apiClient.post(
    "/user-management/leave-balances",
    payload
  );

  return response.data;
};

export const bulkConfigureLeaveBalances = async (payload) => {
  const response = await apiClient.post(
    "/user-management/leave-balances/bulk",
    payload
  );

  return response.data;
};



export const getLeaveApprovalById = async (leaveId) => {
  const response = await apiClient.get(
    `/user-management/leave-approvals/${leaveId}`
  );

  return response.data;
};
