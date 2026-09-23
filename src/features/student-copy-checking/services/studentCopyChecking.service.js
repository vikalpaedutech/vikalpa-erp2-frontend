import apiClient from "../../../api/apiClient";


// const BASE_URL = "/student-management/copy-checking";

// // Create single copy checking
// export const createStudentCopyChecking = async (
//   copyCheckingData
// ) => {
//   const response = await apiClient.post(
//     BASE_URL,
//     copyCheckingData
//   );

//   return response.data;
// };

// // Get copy checking records
// export const getStudentCopyCheckings = async (
//   params = {}
// ) => {
//   const response = await apiClient.get(
//     BASE_URL,
//     {
//       params,
//     }
//   );

//   return response.data;
// };

// // Get single copy checking
// export const getStudentCopyCheckingById =
//   async (checkingId) => {
//     const response = await apiClient.get(
//       `${BASE_URL}/${checkingId}`
//     );

//     return response.data;
//   };

// // Update copy checking
// export const updateStudentCopyChecking =
//   async (
//     checkingId,
//     copyCheckingData
//   ) => {
//     const response = await apiClient.patch(
//       `${BASE_URL}/${checkingId}`,
//       copyCheckingData
//     );

//     return response.data;
//   };

// // Delete copy checking
// export const deleteStudentCopyChecking =
//   async (checkingId) => {
//     const response = await apiClient.delete(
//       `${BASE_URL}/${checkingId}`
//     );

//     return response.data;
//   };





//   // Create / update bulk copy checking
// export const createBulkStudentCopyChecking =
//   async (copyCheckingData) => {
//     const response = await apiClient.post(
//       `${BASE_URL}/bulk`,
//       copyCheckingData
//     );

//     return response.data;
//   };



//   export const getStudents = async (params = {}) => {
//   const response = await apiClient.get(
//     "/student-management/students",
//     {
//       params,
//     }
//   );

//   return response.data;
// };













const BASE_URL =
  "/student-management/copy-checking";

// ============================================================
// GET STUDENTS FOR COPY CHECKING
// ============================================================

export const getStudentCopyCheckingStudents =
  async (params = {}) => {
    const response = await apiClient.get(
      `${BASE_URL}/students`,
      {
        params,
      }
    );

    return response.data;
  };


// ============================================================
// GET COPY CHECKING RECORDS
// ============================================================

export const getStudentCopyCheckings =
  async (params = {}) => {
    const response = await apiClient.get(
      BASE_URL,
      {
        params,
      }
    );

    return response.data;
  };


// ============================================================
// CREATE SINGLE COPY CHECKING
// ============================================================

export const createStudentCopyChecking =
  async (data) => {
    const response = await apiClient.post(
      BASE_URL,
      data
    );

    return response.data;
  };


// ============================================================
// CREATE / UPDATE BULK COPY CHECKING
// ============================================================

export const createBulkStudentCopyChecking =
  async (data) => {
    const response = await apiClient.post(
      `${BASE_URL}/bulk`,
      data
    );

    return response.data;
  };


// ============================================================
// GET COPY CHECKING BY ID
// ============================================================

export const getStudentCopyCheckingById =
  async (checkingId) => {
    const response = await apiClient.get(
      `${BASE_URL}/${checkingId}`
    );

    return response.data;
  };


// ============================================================
// UPDATE COPY CHECKING
// ============================================================

export const updateStudentCopyChecking =
  async (
    checkingId,
    data
  ) => {
    const response = await apiClient.patch(
      `${BASE_URL}/${checkingId}`,
      data
    );

    return response.data;
  };


// ============================================================
// DELETE COPY CHECKING
// ============================================================

export const deleteStudentCopyChecking =
  async (checkingId) => {
    const response = await apiClient.delete(
      `${BASE_URL}/${checkingId}`
    );

    return response.data;
  };