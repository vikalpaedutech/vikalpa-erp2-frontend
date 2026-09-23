import apiClient from "../../../api/apiClient";

export const getStudents = async (params = {}) => {
    const response = await apiClient.get(
        "/student-management/students",
        { params }
    );

    return response.data;
};

export const getStudentById = async (studentId) => {
    const response = await apiClient.get(
        `/student-management/students/${studentId}`
    );

    return response.data;
};

export const getStudentEnrollments = async (studentId) => {
    const response = await apiClient.get(
        `/student-management/students/${studentId}/enrollments`
    );

    return response.data;
};

export const onboardStudent = async (studentData) => {
    const response = await apiClient.post(
        "/student-management/students/onboard",
        studentData
    );

    return response.data;
};

export const bulkOnboardStudents = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await apiClient.post(
        "/student-management/students/bulk-onboard",
        formData
    );

    return response.data;
};

export const downloadBulkOnboardingTemplate = async () => {
    const response = await apiClient.get(
        "/student-management/students/bulk-onboard/template",
        {
            responseType: "blob",
        }
    );

    return response;
};

export const requestStudentAdd = async (studentData) => {
    const response = await apiClient.post(
        "/student-management/students/request-add",
        studentData
    );

    return response.data;
};

export const requestStudentRemove = async (requestData) => {
    const response = await apiClient.post(
        "/student-management/students/request-remove",
        requestData
    );

    return response.data;
};

export const requestStudentSLC = async (requestData) => {
    const response = await apiClient.post(
        "/student-management/students/request-slc",
        requestData
    );

    return response.data;
};

export const requestStudentTransfer = async (requestData) => {
    const response = await apiClient.post(
        "/student-management/students/request-transfer",
        requestData
    );

    return response.data;
};