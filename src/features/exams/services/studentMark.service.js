
import apiClient from "../../../api/apiClient";


const BASE_URL = "/student-management/marks";

export const createStudentMark = async (markData) => {
  const response = await apiClient.post(
    BASE_URL,
    markData
  );

  return response.data;
};

export const getStudentMarks = async (params = {}) => {
  const response = await apiClient.get(
    BASE_URL,
    { params }
  );

  return response.data;
};

export const getStudentMarkById = async (
  markId
) => {
  const response = await apiClient.get(
    `${BASE_URL}/${markId}`
  );

  return response.data;
};

export const updateStudentMark = async (
  markId,
  markData
) => {
  const response = await apiClient.patch(
    `${BASE_URL}/${markId}`,
    markData
  );

  return response.data;
};

export const deleteStudentMark = async (
  markId
) => {
  const response = await apiClient.delete(
    `${BASE_URL}/${markId}`
  );

  return response.data;
};