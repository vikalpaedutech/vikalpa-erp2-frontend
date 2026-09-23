import apiClient from "../api/apiClient";

export const getCenters = async (params = {}) => {
  const response = await apiClient.get(
    "/region-management/centers",
    {
      params,
    }
  );

  return response.data;
};

export const createCenter = async (centerData) => {
  const response = await apiClient.post(
    "/region-management/centers",
    centerData
  );

  return response.data;
};

export const getCenterById = async (centerId) => {
  const response = await apiClient.get(
    `/region-management/centers/${centerId}`
  );

  return response.data;
};

export const updateCenter = async (
  centerId,
  centerData
) => {
  const response = await apiClient.patch(
    `/region-management/centers/${centerId}`,
    centerData
  );

  return response.data;
};

export const deleteCenter = async (centerId) => {
  const response = await apiClient.delete(
    `/region-management/centers/${centerId}`
  );

  return response.data;
};

export const getCentersByDistrict = async (districtId) => {
  const response = await apiClient.get(
    `/region-management/centers/district/${districtId}`
  );

  return response.data;
};

export const getCentersByBlock = async (blockId) => {
  const response = await apiClient.get(
    `/region-management/centers/block/${blockId}`
  );

  return response.data;
};

export const getAvailableCenters = async () => {
  const response = await apiClient.get(
    "/region-management/centers/available"
  );

  return response.data;
};