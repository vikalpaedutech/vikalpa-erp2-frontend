import apiClient from "../../../api/apiClient";

const BASE_URL =
  "/academic-management/center-monitoring";

// ============================================================
// GET MY MONITORING ACCESS
// ============================================================

export const getMyMonitoringAccess = async () => {
  const response = await apiClient.get(
    `${BASE_URL}/my-access`
  );

  return response.data;
};


// ============================================================
// GET MONITORING CENTERS
// ============================================================

export const getMonitoringCenters = async ({
  programId,
  batchId,
  districtId,
  date,
  search,
} = {}) => {
  const params = {};

  if (programId) {
    params.programId = programId;
  }

  if (batchId) {
    params.batchId = batchId;
  }

  if (districtId) {
    params.districtId = districtId;
  }

  if (date) {
    params.date = date;
  }

  if (search) {
    params.search = search;
  }

  const response = await apiClient.get(
    `${BASE_URL}/centers`,
    {
      params,
    }
  );

  return response.data;
};


// ============================================================
// CREATE CENTER MONITORING
// ============================================================

export const createCenterMonitoring = async (
  payload
) => {
  const response = await apiClient.post(
    `${BASE_URL}/`,
    payload
  );

  return response.data;
};


// ============================================================
// GET MONITORING RECORDS / REPORT
// ============================================================

export const getCenterMonitoringRecords = async ({
  programId,
  batchId,
  districtId,
  blockId,
  centerId,
  fromDate,
  toDate,
  search,
  page,
  limit,
} = {}) => {
  const params = {};

  if (programId) {
    params.programId = programId;
  }

  if (batchId) {
    params.batchId = batchId;
  }

  if (districtId) {
    params.districtId = districtId;
  }

  if (blockId) {
    params.blockId = blockId;
  }

  if (centerId) {
    params.centerId = centerId;
  }

  if (fromDate) {
    params.fromDate = fromDate;
  }

  if (toDate) {
    params.toDate = toDate;
  }

  if (search) {
    params.search = search;
  }

  if (page) {
    params.page = page;
  }

  if (limit) {
    params.limit = limit;
  }

  const response = await apiClient.get(
    `${BASE_URL}/records`,
    {
      params,
    }
  );

  return response.data;
};


// ============================================================
// GET MONITORING SUMMARY
// ============================================================

export const getCenterMonitoringSummary = async ({
  programId,
  batchId,
  districtId,
  blockId,
  centerId,
  fromDate,
  toDate,
} = {}) => {
  const params = {};

  if (programId) {
    params.programId = programId;
  }

  if (batchId) {
    params.batchId = batchId;
  }

  if (districtId) {
    params.districtId = districtId;
  }

  if (blockId) {
    params.blockId = blockId;
  }

  if (centerId) {
    params.centerId = centerId;
  }

  if (fromDate) {
    params.fromDate = fromDate;
  }

  if (toDate) {
    params.toDate = toDate;
  }

  const response = await apiClient.get(
    `${BASE_URL}/summary`,
    {
      params,
    }
  );

  return response.data;
};








// ============================================================
// GET CENTER MONITORING REPORT
// ============================================================

export const getCenterMonitoringReport = async ({
  programId,
  batchId,
  districtId,
  fromDate,
  toDate,
} = {}) => {
  const params = {};

  if (programId) {
    params.programId = programId;
  }

  if (batchId) {
    params.batchId = batchId;
  }

  if (districtId) {
    params.districtId = districtId;
  }

  if (fromDate) {
    params.fromDate = fromDate;
  }

  if (toDate) {
    params.toDate = toDate;
  }

  const response =
    await apiClient.get(
      "/academic-management/center-monitoring/report",
      {
        params,
      }
    );

  return response.data;
};



  // ============================================================
// GET FULL MONITORING REPORT OPTIONS
// ============================================================

export const getMonitoringReportOptions =
  async () => {

    const response =
      await apiClient.get(
        `${BASE_URL}/report-options`
      );

    return response.data;

  };




  export const getCenterMonitoringIndividualReport =
  async ({
    programId,
    batchId,
    fromDate,
    toDate,
  } = {}) => {
    const params = {};

    if (programId) {
      params.programId =
        programId;
    }

    if (batchId) {
      params.batchId =
        batchId;
    }

    if (fromDate) {
      params.fromDate =
        fromDate;
    }

    if (toDate) {
      params.toDate =
        toDate;
    }

    const response =
      await apiClient.get(
        "/academic-management/center-monitoring/individual-report",
        {
          params,
        }
      );

    return response.data;
  };