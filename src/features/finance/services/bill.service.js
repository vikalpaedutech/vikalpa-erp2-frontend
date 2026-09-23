import apiClient from "../../../api/apiClient";

/*
|--------------------------------------------------------------------------
| CREATE BILL
|--------------------------------------------------------------------------
*/

export const createBill = async (formData) => {
    const response = await apiClient.post(
        "/finance-management/bills",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| GET BILLS
|--------------------------------------------------------------------------
*/

export const getBills = async (params = {}) => {
    const response = await apiClient.get(
        "/finance-management/bills",
        {
            params,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| GET BILL BY ID
|--------------------------------------------------------------------------
*/

export const getBillById = async (billId) => {
    const response = await apiClient.get(
        `/finance-management/bills/${billId}`
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| UPDATE BILL
|--------------------------------------------------------------------------
*/

export const updateBill = async (
    billId,
    formData
) => {
    const response = await apiClient.patch(
        `/finance-management/bills/${billId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| GET BILL HISTORY
|--------------------------------------------------------------------------
*/

export const getBillHistory = async (billId) => {
    const response = await apiClient.get(
        `/finance-management/bills/${billId}/history`
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| SUBMIT / RESUBMIT BILL
|--------------------------------------------------------------------------
*/

export const submitBill = async (billId) => {
    const response = await apiClient.patch(
        `/finance-management/bills/${billId}/submit`
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| VERIFY BILL
|--------------------------------------------------------------------------
*/

export const verifyBill = async (
    billId,
    data = {}
) => {
    const response = await apiClient.patch(
        `/finance-management/bills/${billId}/verify`,
        data
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| REJECT BILL
|--------------------------------------------------------------------------
*/

export const rejectBill = async (
    billId,
    data
) => {
    const response = await apiClient.patch(
        `/finance-management/bills/${billId}/reject`,
        data
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| APPROVE BILL
|--------------------------------------------------------------------------
*/

export const approveBill = async (
    billId,
    data = {}
) => {
    const response = await apiClient.patch(
        `/finance-management/bills/${billId}/approve`,
        data
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| MARK PAYMENT PENDING
|--------------------------------------------------------------------------
*/

export const markPaymentPending = async (
    billId,
    data = {}
) => {
    const response = await apiClient.patch(
        `/finance-management/bills/${billId}/payment-pending`,
        data
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| MARK BILL PAID
|--------------------------------------------------------------------------
*/

export const markBillPaid = async (
    billId,
    data
) => {
    const response = await apiClient.patch(
        `/finance-management/bills/${billId}/paid`,
        data
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| BULK VERIFY BILLS
|--------------------------------------------------------------------------
|
| Body:
| {
|   billIds: [],
|   remarks: ""
| }
|
*/

export const bulkVerifyBills = async (
    billIds,
    remarks = ""
) => {
    const response = await apiClient.patch(
        "/finance-management/bills/bulk-verify",
        {
            billIds,
            remarks,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| BULK APPROVE BILLS
|--------------------------------------------------------------------------
|
| Body:
| {
|   billIds: [],
|   remarks: ""
| }
|
*/

export const bulkApproveBills = async (
    billIds,
    remarks = ""
) => {
    const response = await apiClient.patch(
        "/finance-management/bills/bulk-approve",
        {
            billIds,
            remarks,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| BULK REJECT BILLS
|--------------------------------------------------------------------------
|
| Body:
| {
|   billIds: [],
|   remarks: ""
| }
|
*/

export const bulkRejectBills = async (
    billIds,
    remarks = ""
) => {
    const response = await apiClient.patch(
        "/finance-management/bills/bulk-reject",
        {
            billIds,
            remarks,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| BULK MARK PAYMENT PENDING
|--------------------------------------------------------------------------
|
| Body:
| {
|   billIds: [],
|   remarks: ""
| }
|
*/

export const bulkMarkPaymentPending = async (
    billIds,
    remarks = ""
) => {
    const response = await apiClient.patch(
        "/finance-management/bills/bulk-payment-pending",
        {
            billIds,
            remarks,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| BULK MARK BILLS PAID
|--------------------------------------------------------------------------
|
| Body:
| {
|   billIds: [],
|   paymentReference: "",
|   paymentMode: "",
|   remarks: ""
| }
|
*/

export const bulkMarkBillsPaid = async (
    billIds,
    data = {}
) => {
    const response = await apiClient.patch(
        "/finance-management/bills/bulk-paid",
        {
            billIds,
            paymentReference:
                data.paymentReference || "",
            paymentMode:
                data.paymentMode || "",
            remarks:
                data.remarks || "",
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| GET BILLS FOR VERIFICATION
|--------------------------------------------------------------------------
*/

export const getBillsForVerification = async (
    params = {}
) => {
    const response = await apiClient.get(
        "/finance-management/bills/verification",
        {
            params,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| GET BILLS FOR APPROVAL
|--------------------------------------------------------------------------
*/

export const getBillsForApproval = async (
    params = {}
) => {
    const response = await apiClient.get(
        "/finance-management/bills/approval",
        {
            params,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| GET BILL DASHBOARD
|--------------------------------------------------------------------------
*/

export const getBillDashboard = async (
    params = {}
) => {
    const response = await apiClient.get(
        "/finance-management/bills/dashboard",
        {
            params,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| EXPORT BILL DASHBOARD
|--------------------------------------------------------------------------
|
| Returns CSV file as blob.
|
*/

export const exportBillDashboard = async (
    params = {}
) => {
    const response = await apiClient.get(
        "/finance-management/bills/dashboard/export",
        {
            params,
            responseType: "blob",
        }
    );

    return response;
};