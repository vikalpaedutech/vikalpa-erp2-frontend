import apiClient from "../../../api/apiClient";

export const createBillAuditor = async (auditorData) => {
    const response = await apiClient.post(
        "/finance-management/bill-auditors",
        auditorData
    );

    return response.data;
};

export const getBillAuditors = async (params = {}) => {
    const response = await apiClient.get(
        "/finance-management/bill-auditors",
        { params }
    );

    return response.data;
};

export const getBillAuditorById = async (billAuditorId) => {
    const response = await apiClient.get(
        `/finance-management/bill-auditors/${billAuditorId}`
    );

    return response.data;
};

export const updateBillAuditor = async (
    billAuditorId,
    auditorData
) => {
    const response = await apiClient.patch(
        `/finance-management/bill-auditors/${billAuditorId}`,
        auditorData
    );

    return response.data;
};

export const deleteBillAuditor = async (billAuditorId) => {
    const response = await apiClient.delete(
        `/finance-management/bill-auditors/${billAuditorId}`
    );

    return response.data;
};