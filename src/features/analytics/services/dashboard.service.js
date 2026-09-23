import apiClient from "../../../api/apiClient";
export const getDashboardAnalytics=async(params={})=>(await apiClient.get("/dashboard-management/analytics",{params})).data;
export const exportDashboardAnalytics=async(params={})=>(await apiClient.get("/dashboard-management/export",{params,responseType:"blob"})).data;
