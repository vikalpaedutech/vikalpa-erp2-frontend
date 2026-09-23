import apiClient from "../../../api/apiClient";

// ============================================================
// GET DAILY ATTENDANCE
// ============================================================

export const getAttendance = async (params = {}) => {
    const response = await apiClient.get(
        "/student-management/attendance",
        {
            params,
        }
    );

    return response.data;
};

// ============================================================
// MARK SINGLE STUDENT ATTENDANCE
// ============================================================

export const markAttendance = async (attendanceData) => {
    const response = await apiClient.post(
        "/student-management/attendance",
        attendanceData
    );

    return response.data;
};

// ============================================================
// BULK MARK STUDENTS PRESENT
// ============================================================

export const bulkMarkAttendance = async (attendanceData) => {
    const response = await apiClient.post(
        "/student-management/attendance/bulk",
        attendanceData
    );

    return response.data;
};

// ============================================================
// GET INDIVIDUAL STUDENT DATE-WISE ATTENDANCE
// ============================================================

export const getStudentAttendance = async (
    studentId,
    params = {}
) => {
    const response = await apiClient.get(
        `/student-management/attendance/student/${studentId}`,
        {
            params,
        }
    );

    return response.data;
};

// ============================================================
// GET INDIVIDUAL STUDENT ATTENDANCE SUMMARY
// ============================================================

export const getStudentAttendanceSummary = async (
    studentId,
    params = {}
) => {
    const response = await apiClient.get(
        `/student-management/attendance/student/${studentId}/summary`,
        {
            params,
        }
    );

    return response.data;
};

// ============================================================
// GET CONTINUOUSLY ABSENT STUDENTS
// ============================================================

export const getContinuousAbsentStudents = async (
    params = {}
) => {
    const response = await apiClient.get(
        "/student-management/attendance/continuous-absent",
        {
            params,
        }
    );

    return response.data;
};