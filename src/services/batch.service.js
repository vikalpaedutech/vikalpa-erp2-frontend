import apiClient from "../api/apiClient";

export const getBatches = async (params = {}) => {
  const response = await apiClient.get("/batch", {
    params,
  });

  return response.data;
};

export const createBatch = async (batchData) => {
  const response = await apiClient.post("/batch", batchData);

  return response.data;
};

export const updateBatch = async (batchId, batchData) => {
  const response = await apiClient.patch(
    `/batch/${batchId}`,
    batchData
  );

  return response.data;
};

export const deleteBatch = async (batchId) => {
  const response = await apiClient.delete(
    `/batch/${batchId}`
  );

  return response.data;
};

export const toggleBatchStatus = async (batchId) => {
  const response = await apiClient.patch(
    `/batch/${batchId}/status`
  );

  return response.data;
};

export const getActiveBatches = async () => {
  const response = await apiClient.get("/batch/active");

  return response.data;
};