import apiClient from "../../../api/apiClient";

const get = async (path, params = {}) => (await apiClient.get(path, { params })).data;

const download = async (path, params = {}, filename) => {
  const response = await apiClient.get(path, { params, responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const getDashboardOptions = () => get("/dashboard-management/options");

export const getStudentsDashboard = (params) => get("/dashboard-management/students", params);
export const exportStudentsDashboard = (params) => download("/dashboard-management/students/export", params, `students-dashboard-${Date.now()}.xlsx`);

export const getAttendanceDashboard = (params) => get("/dashboard-management/attendance", params);
export const exportAttendanceDashboard = (params) => download("/dashboard-management/attendance/export", params, `attendance-dashboard-${Date.now()}.xlsx`);

export const getStudentAttendanceDashboard = (params) => get("/dashboard-management/student-attendance", params);
export const exportStudentAttendanceDashboard = (params) => download("/dashboard-management/student-attendance/export", params, `student-attendance-dashboard-${Date.now()}.xlsx`);
export const exportAttendanceStudentData = (params) => download("/dashboard-management/student-attendance/export-students", params, `attendance-student-data-${Date.now()}.xlsx`);

export const getAbsenteeCallingOverviewDashboard = (params) => get("/dashboard-management/absentee-calling-overview", params);
export const exportAbsenteeCallingOverviewDashboard = (params) => download("/dashboard-management/absentee-calling-overview/export", params, `absentee-calling-overview-${Date.now()}.xlsx`);
export const getAbsenteeCallingDashboard = (params) => get("/dashboard-management/absentee-calling", params);
export const exportAbsenteeCallingDashboard = (params) => download("/dashboard-management/absentee-calling/export", params, `absentee-calling-dashboard-${Date.now()}.xlsx`);
export const exportCallingStudentData = (params) => download("/dashboard-management/absentee-calling/export-students", params, `absentee-calling-student-data-${Date.now()}.xlsx`);

export const getCenterAttendanceUploadDashboard = (params) => get("/dashboard-management/center-attendance-upload", params);
export const exportCenterAttendanceUploadDashboard = (params) => download("/dashboard-management/center-attendance-upload/export", params, `center-attendance-upload-dashboard-${Date.now()}.xlsx`);

export const getDownloadStudentsOptions = () => get("/dashboard-management/download-students/options");
export const downloadStudentsDashboard = (params) => download("/dashboard-management/download-students/export", params, `students-${params.type || "details"}-${Date.now()}.xlsx`);

export const getExamsMarksDashboard = (params) => get("/dashboard-management/exams-marks", params);
export const getExamMarksReport = (params) => get("/dashboard-management/exams-marks/report", params);
export const exportExamMarksReport = (params) => download("/dashboard-management/exams-marks/export", params, `exam-marks-report-${Date.now()}.xlsx`);
export const exportExamStudentsData = (params) => download("/dashboard-management/exams-marks/export-students", params, `exam-students-${Date.now()}.xlsx`);


export const getCopyCheckingDashboard = (params) => get("/dashboard-management/copy-checking", params);
export const exportCopyCheckingDashboard = (params) => download("/dashboard-management/copy-checking/export", params, `copy-checking-dashboard-${Date.now()}.xlsx`);
export const exportCopyCheckingStudentData = (params) => download("/dashboard-management/copy-checking/export-students", params, `copy-checking-student-data-${Date.now()}.xlsx`);
