import apiClient from "../api/apiClient";

export const getBlocks = async (params = {}) => {
  const response = await apiClient.get(
    "/region-management/blocks",
    {
      params,
    }
  );

  return response.data;
};

export const createBlock = async (blockData) => {
  const response = await apiClient.post(
    "/region-management/blocks",
    blockData
  );

  return response.data;
};

export const getBlockById = async (blockId) => {
  const response = await apiClient.get(
    `/region-management/blocks/${blockId}`
  );

  return response.data;
};

export const updateBlock = async (
  blockId,
  blockData
) => {
  const response = await apiClient.patch(
    `/region-management/blocks/${blockId}`,
    blockData
  );

  return response.data;
};

export const deleteBlock = async (blockId) => {
  const response = await apiClient.delete(
    `/region-management/blocks/${blockId}`
  );

  return response.data;
};

export const getBlocksByDistrict = async (districtId) => {
  const response = await apiClient.get(
    `/region-management/blocks/district/${districtId}`
  );

  return response.data;
};