import apiClient from "../../../api/apiClient";
export const getBiometricUsers = (params = {}) => apiClient.get("/user-management/biometric/users", { params });
export const getBiometricAttendance = (params = {}) => apiClient.get("/user-management/biometric/attendance", { params });
export const getBiometricUserAttendanceByDate = (id, params = {}) => apiClient.get(`/user-management/biometric/attendance/users/${id}/days`, { params });
export const manageBiometricUserAttendanceDay = (id, date, payload) => apiClient.put(`/user-management/biometric/attendance/users/${id}/days/${date}`, payload);
export const updateBiometricLog = (id, eventTime) => apiClient.patch(`/user-management/biometric/attendance/logs/${id}`, { eventTime });
export const pushBiometricAttendance = (payload) => apiClient.post("/user-management/biometric/attendance/push", payload);
