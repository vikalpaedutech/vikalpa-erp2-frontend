import apiClient from "../../../api/apiClient";


// ==========================================
// CALLING TYPE APIs
// ==========================================

// Create Calling Type
export const createCallingType = async (callingTypeData) => {
    const response = await apiClient.post(
        "/calling-management/calling-types",
        callingTypeData
    );

    return response.data;
};


// Get Calling Types
export const getCallingTypes = async (params = {}) => {
    const response = await apiClient.get(
        "/calling-management/calling-types",
        {
            params,
        }
    );

    return response.data;
};


// Get Calling Type By ID
export const getCallingTypeById = async (callingTypeId) => {
    const response = await apiClient.get(
        `/calling-management/calling-types/${callingTypeId}`
    );

    return response.data;
};


// Update Calling Type
export const updateCallingType = async (
    callingTypeId,
    callingTypeData
) => {
    const response = await apiClient.patch(
        `/calling-management/calling-types/${callingTypeId}`,
        callingTypeData
    );

    return response.data;
};


// Delete Calling Type
export const deleteCallingType = async (callingTypeId) => {
    const response = await apiClient.delete(
        `/calling-management/calling-types/${callingTypeId}`
    );

    return response.data;
};



// ==========================================
// CALLING DETAILS APIs
// ==========================================

// Create Calling Details
export const createCallingDetails = async (
    callingDetailsData
) => {
    const response = await apiClient.post(
        "/calling-management/calling-details",
        callingDetailsData
    );

    return response.data;
};


// Get Calling Details
export const getCallingDetails = async (params = {}) => {
    const response = await apiClient.get(
        "/calling-management/calling-details",
        {
            params,
        }
    );

    return response.data;
};


// Get Calling Details By ID
export const getCallingDetailsById = async (
    callingDetailsId
) => {
    const response = await apiClient.get(
        `/calling-management/calling-details/${callingDetailsId}`
    );

    return response.data;
};


// Update Calling Details
export const updateCallingDetails = async (
    callingDetailsId,
    callingDetailsData
) => {
    const response = await apiClient.patch(
        `/calling-management/calling-details/${callingDetailsId}`,
        callingDetailsData
    );

    return response.data;
};


// Delete Calling Details
export const deleteCallingDetails = async (
    callingDetailsId
) => {
    const response = await apiClient.delete(
        `/calling-management/calling-details/${callingDetailsId}`
    );

    return response.data;
};



// ==========================================
// CALL LOG APIs
// ==========================================

// Create Call Log
export const createCallLog = async (callLogData) => {
    const response = await apiClient.post(
        "/calling-management/call-logs",
        callLogData
    );

    return response.data;
};


// Get Call Logs
export const getCallLogs = async (params = {}) => {
    const response = await apiClient.get(
        "/calling-management/call-logs",
        {
            params,
        }
    );

    return response.data;
};


// Get Call Log By ID
export const getCallLogById = async (callLogId) => {
    const response = await apiClient.get(
        `/calling-management/call-logs/${callLogId}`
    );

    return response.data;
};


// Update Call Log
export const updateCallLog = async (
    callLogId,
    callLogData
) => {
    const response = await apiClient.patch(
        `/calling-management/call-logs/${callLogId}`,
        callLogData
    );

    return response.data;
};


// Delete Call Log
export const deleteCallLog = async (callLogId) => {
    const response = await apiClient.delete(
        `/calling-management/call-logs/${callLogId}`
    );

    return response.data;
};



// Download Calling Details Template
export const downloadCallingDetailsTemplate = async (
    callingTypeId
) => {
    const response = await apiClient.get(
        "/calling-management/calling-details/template",
        {
            params: {
                callingTypeId,
            },
            responseType: "blob",
        }
    );

    return response;
};





export const bulkUploadCallingDetails = async (
    file,
    callingTypeId
) => {
    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "callingTypeId",
        callingTypeId
    );

    const response = await apiClient.post(
        "/calling-management/calling-details/bulk-upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};




// ==========================================
// EXPORT CALLING DETAILS
// ==========================================

export const exportCallingDetails = async (
    params = {}
) => {
    const response = await apiClient.get(
        "/calling-management/calling-details/export",
        {
            params,
            responseType: "blob",
        }
    );

    return response;
};



// Get My Calling Type Summary
export const getMyCallingTypeSummary = async () => {
    const response = await apiClient.get(
        "/calling-management/calling-details/my-call-types"
    );

    return response.data;
};


// Create Call Attempt
export const createCallAttempt = async (
    callAttemptData
) => {
    const response = await apiClient.post(
        "/calling-management/call-logs/attempt",
        callAttemptData
    );

    return response.data;
};






