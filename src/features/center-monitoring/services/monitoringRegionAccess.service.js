import apiClient from "../../../api/apiClient";

const BASE_URL =
  "/academic-management/monitoring-region-access";


// ============================================================
// GET MONITORING ROLES
// ============================================================

export const getMonitoringRoles = async () => {
  const response = await apiClient.get(
    `${BASE_URL}/roles`
  );

  return response.data;
};


// ============================================================
// GET ACTIVE USERS BY ROLE
// ============================================================

export const getMonitoringUsersByRole = async ({
  roleId,
  roleCode,
}) => {
  const params = {};

  if (roleId) {
    params.roleId = roleId;
  }

  if (roleCode) {
    params.roleCode = roleCode;
  }

  const response = await apiClient.get(
    `${BASE_URL}/users`,
    {
      params,
    }
  );

  return response.data;
};


// ============================================================
// GET CURRENT LOGGED-IN USER MONITORING ACCESS
// ============================================================

export const getMyMonitoringAccess = async () => {
  const response = await apiClient.get(
    `${BASE_URL}/me`
  );

  return response.data;
};


// ============================================================
// GET USER MONITORING ACCESS
// ============================================================

export const getUserMonitoringAccess = async (
  userId
) => {
  const response = await apiClient.get(
    `${BASE_URL}/user/${userId}`
  );

  return response.data;
};


// ============================================================
// GET AVAILABLE CENTERS
// ============================================================

export const getAvailableMonitoringCenters = async ({
  districtId,
  districtIds,
  blockId,
  blockIds,
  search,
} = {}) => {
  const params = {};

  /*
   * Keep single-value support
   * for existing management flow.
   */

  if (districtId) {
    params.districtId = districtId;
  }

  /*
   * Multi-district support.
   */

  if (
    Array.isArray(districtIds) &&
    districtIds.length > 0
  ) {
    params.districtIds =
      districtIds.join(",");
  }

  if (blockId) {
    params.blockId = blockId;
  }

  if (
    Array.isArray(blockIds) &&
    blockIds.length > 0
  ) {
    params.blockIds =
      blockIds.join(",");
  }

  if (search) {
    params.search = search;
  }

  const response = await apiClient.get(
    `${BASE_URL}/available-centers`,
    {
      params,
    }
  );

  return response.data;
};


// ============================================================
// ASSIGN MONITORING CENTERS
// ============================================================

export const assignMonitoringCenters = async (
  payload
) => {
  const response = await apiClient.post(
    `${BASE_URL}/assign`,
    payload
  );

  return response.data;
};


// ============================================================
// REVOKE SINGLE ACCESS
// ============================================================

export const revokeMonitoringAccess = async (
  accessId
) => {
  const response = await apiClient.patch(
    `${BASE_URL}/revoke/${accessId}`
  );

  return response.data;
};


// ============================================================
// REVOKE USER PROGRAM + BATCH ACCESS
// ============================================================

export const revokeUserMonitoringAccess = async (
  payload
) => {
  const response = await apiClient.patch(
    `${BASE_URL}/revoke-user`,
    payload
  );

  return response.data;
};


// ============================================================
// REVOKE ACCESS BY ASSIGNMENT LEVEL
// ============================================================

export const revokeMonitoringAccessByLevel = async (
  payload
) => {
  const response = await apiClient.patch(
    `${BASE_URL}/revoke-level`,
    payload
  );

  return response.data;
};