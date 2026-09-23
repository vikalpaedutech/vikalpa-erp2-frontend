import apiClient from "../api/apiClient";

// Get students with filters and pagination
export const getStudents = async (params = {}) => {
  const response = await apiClient.get(
    "/student-management/students",
    {
      params,
    }
  );

  return response.data;
};

// Get single student
export const getStudentById = async (studentId) => {
  const response = await apiClient.get(
    `/student-management/students/${studentId}`
  );

  return response.data;
};

// Get student enrollments
export const getStudentEnrollments = async (
  studentId
) => {
  const response = await apiClient.get(
    `/student-management/students/${studentId}/enrollments`
  );

  return response.data;
};

// Onboard single student
export const onboardStudent = async (
  studentData
) => {
  const response = await apiClient.post(
    "/student-management/students/onboard",
    studentData
  );

  return response.data;
};

// Bulk onboard students
export const bulkOnboardStudents = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post(
    "/student-management/students/bulk-onboard",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Download bulk onboarding template
export const downloadBulkOnboardingTemplate =
  async () => {
    const response = await apiClient.get(
      "/student-management/students/bulk-onboard/template",
      {
        responseType: "blob",
      }
    );

    return response.data;
  };

// Request student add
export const requestStudentAdd = async (
  studentData
) => {
  const response = await apiClient.post(
    "/student-management/students/request-add",
    studentData
  );

  return response.data;
};

// Request student remove
export const requestStudentRemove = async (
  studentData
) => {
  const response = await apiClient.post(
    "/student-management/students/request-remove",
    studentData
  );

  return response.data;
};

// Request student SLC
export const requestStudentSLC = async (
  studentData
) => {
  const response = await apiClient.post(
    "/student-management/students/request-slc",
    studentData
  );

  return response.data;
};

// Request student transfer
export const requestStudentTransfer = async (
  studentData
) => {
  const response = await apiClient.post(
    "/student-management/students/request-transfer",
    studentData
  );

  return response.data;
};