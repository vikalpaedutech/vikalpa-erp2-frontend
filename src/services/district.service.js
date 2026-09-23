import apiClient from "../api/apiClient";

export const getDistricts = async (params = {}) => {
  const response = await apiClient.get(
    "/region-management/districts",
    {
      params,
    }
  );

  return response.data;
};

export const createDistrict = async (districtData) => {
  const response = await apiClient.post(
    "/region-management/districts",
    districtData
  );

  return response.data;
};

export const getDistrictById = async (districtId) => {
  const response = await apiClient.get(
    `/region-management/districts/${districtId}`
  );

  return response.data;
};

export const updateDistrict = async (
  districtId,
  districtData
) => {
  const response = await apiClient.patch(
    `/region-management/districts/${districtId}`,
    districtData
  );

  return response.data;
};

export const deleteDistrict = async (districtId) => {
  const response = await apiClient.delete(
    `/region-management/districts/${districtId}`
  );

  return response.data;
};