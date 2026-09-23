
import apiClient from "../../../api/apiClient";


export const getExams = async (params = {}) => {
  const response = await apiClient.get(
    "/academic-management/exams",
    { params }
  );

  return response.data;
};

export const getExamById = async (examId) => {
  const response = await apiClient.get(
    `/academic-management/exams/${examId}`
  );

  return response.data;
};

export const getExamStudents = async (examId, params = {}) => {
  const response = await apiClient.get(
    `/academic-management/exams/${examId}/students`,
    { params }
  );

  return response.data;
};

export const createExam = async (examData) => {
  const response = await apiClient.post(
    "/academic-management/exams",
    examData
  );

  return response.data;
};

export const updateExam = async (examId, examData) => {
  const response = await apiClient.patch(
    `/academic-management/exams/${examId}`,
    examData
  );

  return response.data;
};

export const deleteExam = async (examId) => {
  const response = await apiClient.delete(
    `/academic-management/exams/${examId}`
  );

  return response.data;
};