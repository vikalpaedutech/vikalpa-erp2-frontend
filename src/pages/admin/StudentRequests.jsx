import { useEffect, useState } from "react";

import {
  getStudentLogs,
  approveStudentRequest,
  rejectStudentRequest,
} from "../../services/studentApproval.service";

function StudentRequests() {
  const [logs, setLogs] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [requestType, setRequestType] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);

  // ============================================================
  // REVIEW MODAL
  // ============================================================

  const [selectedLog, setSelectedLog] = useState(null);

  // ============================================================
  // ACTION STATES
  // ============================================================

  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ============================================================
  // LOAD REQUEST LOGS
  // ============================================================

  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pagination.limit,
      };

      if (requestType) {
        params.requestType = requestType;
      }

      if (status) {
        params.status = status;
      }

      if (fromDate) {
        params.fromDate = fromDate;
      }

      if (toDate) {
        params.toDate = toDate;
      }

      const response =
        await getStudentLogs(params);

      setLogs(response.data?.logs || []);

      setPagination(
        response.data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      console.error(
        "Failed to load student requests:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load student requests"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadLogs(1);
  }, [
    requestType,
    status,
    fromDate,
    toDate,
  ]);

  // ============================================================
  // RESET FILTERS
  // ============================================================

  const handleReset = () => {
    setRequestType("");
    setStatus("");
    setFromDate("");
    setToDate("");
  };

  // ============================================================
  // OPEN REVIEW MODAL
  // ============================================================

  const handleReview = (log) => {
    setSelectedLog(log);
    setRejectReason("");
  };

  // ============================================================
  // CLOSE REVIEW MODAL
  // ============================================================

  const handleCloseModal = () => {
    if (processing) return;

    setSelectedLog(null);
    setRejectReason("");
  };

  // ============================================================
  // APPROVE REQUEST
  // ============================================================

  const handleApprove = async () => {
    if (!selectedLog?._id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to approve this student request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);

      await approveStudentRequest(
        selectedLog._id
      );

      alert(
        "Student request approved successfully"
      );

      setSelectedLog(null);
      setRejectReason("");

      await loadLogs(pagination.page);
    } catch (error) {
      console.error(
        "Failed to approve student request:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to approve student request"
      );
    } finally {
      setProcessing(false);
    }
  };

  // ============================================================
  // REJECT REQUEST
  // ============================================================

  const handleReject = async () => {
    if (!selectedLog?._id) {
      return;
    }

    if (!rejectReason.trim()) {
      alert(
        "Please enter a reason for rejecting this request"
      );

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reject this student request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);

      await rejectStudentRequest(
        selectedLog._id,
        rejectReason.trim()
      );

      alert(
        "Student request rejected successfully"
      );

      setSelectedLog(null);
      setRejectReason("");

      await loadLogs(pagination.page);
    } catch (error) {
      console.error(
        "Failed to reject student request:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to reject student request"
      );
    } finally {
      setProcessing(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatRequestType = (type) => {
    const types = {
      "add-student": "Add Student",
      "remove-student": "Remove Student",
      "slc-request": "SLC Request",
      "transfer-student": "Transfer Student",
    };

    return types[type] || type || "-";
  };

  const formatStatus = (value) => {
    if (!value) return "-";

    return value
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClass = (value) => {
    if (value === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (value === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (value === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (value === "cancelled") {
      return "bg-gray-100 text-gray-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Student Requests
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage student requests
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Total:{" "}
          <span className="font-semibold text-gray-800">
            {pagination.total || 0}
          </span>
        </div>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Filters
          </h2>

          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-blue-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Request Type */}

          <select
            value={requestType}
            onChange={(event) =>
              setRequestType(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          >
            <option value="">
              All Request Types
            </option>

            <option value="add-student">
              Add Student
            </option>

            <option value="remove-student">
              Remove Student
            </option>

            <option value="slc-request">
              SLC Request
            </option>

            <option value="transfer-student">
              Transfer Student
            </option>
          </select>

          {/* Status */}

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          >
            <option value="">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>

            <option value="completed">
              Completed
            </option>
          </select>

          {/* From Date */}

          <input
            type="date"
            value={fromDate}
            onChange={(event) =>
              setFromDate(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />

          {/* To Date */}

          <input
            type="date"
            value={toDate}
            onChange={(event) =>
              setToDate(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  #
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Student
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  SRN
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Request Type
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Requested By
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Requested At
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Loading requests...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No student requests found.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {(pagination.page - 1) *
                        pagination.limit +
                        index +
                        1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {log.studentId?.name ||
                          "-"}
                      </div>

                      <div className="text-xs text-gray-500">
                        {log.studentId
                          ?.fatherName || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {log.studentId
                        ?.studentSrn || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {formatRequestType(
                        log.requestType
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-gray-800">
                        {log.requestedBy?.name ||
                          "-"}
                      </div>

                      <div className="text-xs text-gray-500">
                        {log.requestedBy?.email ||
                          "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(
                        log.requestedAt
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          log.status
                        )}`}
                      >
                        {formatStatus(
                          log.status
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {log.status ===
                      "pending" ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleReview(log)
                          }
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No Action
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-500">
            Page {pagination.page || 1} of{" "}
            {pagination.totalPages || 1}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                !pagination.hasPreviousPage ||
                loading
              }
              onClick={() =>
                loadLogs(
                  pagination.page - 1
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                !pagination.hasNextPage ||
                loading
              }
              onClick={() =>
                loadLogs(
                  pagination.page + 1
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          REVIEW MODAL
      ====================================================== */}

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Review Student Request
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Request ID: {selectedLog._id}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={processing}
                className="text-2xl leading-none text-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}

            <div className="space-y-6 p-6">
              {/* Request Information */}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Request Information
                </h3>

                <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      Request Type
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {formatRequestType(
                        selectedLog.requestType
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Status
                    </p>

                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        selectedLog.status
                      )}`}
                    >
                      {formatStatus(
                        selectedLog.status
                      )}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Requested At
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {formatDate(
                        selectedLog.requestedAt
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Request ID
                    </p>

                    <p className="mt-1 break-all font-medium text-gray-800">
                      {selectedLog._id || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Information */}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Student Information
                </h3>

                <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      Student Name
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.studentId
                        ?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Student SRN
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.studentId
                        ?.studentSrn || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Father Name
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.studentId
                        ?.fatherName || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Enrollment */}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Enrollment Information
                </h3>

                <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      Program
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.enrollmentId
                        ?.programId?.programName ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Batch
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.enrollmentId
                        ?.batchId?.batchName ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      District
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.enrollmentId
                        ?.districtId?.districtName ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Block
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.enrollmentId
                        ?.blockId?.blockName ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Center
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.enrollmentId
                        ?.centerId?.centerName ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Class
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.enrollmentId
                        ?.class || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Board
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {selectedLog.enrollmentId
                        ?.board || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Enrollment Status
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {formatStatus(
                        selectedLog.enrollmentId
                          ?.status
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transfer Destination */}

              {selectedLog.requestType ===
                "transfer-student" &&
                selectedLog.transferTo && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">
                      Transfer Destination
                    </h3>

                    <div className="grid grid-cols-1 gap-3 rounded-lg bg-blue-50 p-4 md:grid-cols-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          District
                        </p>

                        <p className="mt-1 font-medium text-gray-800">
                          {selectedLog
                            .transferTo
                            ?.districtId
                            ?.districtName ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Block
                        </p>

                        <p className="mt-1 font-medium text-gray-800">
                          {selectedLog
                            .transferTo
                            ?.blockId
                            ?.blockName ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Center
                        </p>

                        <p className="mt-1 font-medium text-gray-800">
                          {selectedLog
                            .transferTo
                            ?.centerId
                            ?.centerName ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Requested By */}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Requested By
                </h3>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-800">
                    {selectedLog.requestedBy
                      ?.name || "-"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedLog.requestedBy
                      ?.email || "-"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedLog.requestedBy
                      ?.contact || "-"}
                  </p>
                </div>
              </div>

              {/* Reject Reason */}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Rejection Reason
                </h3>

                <textarea
                  value={rejectReason}
                  onChange={(event) =>
                    setRejectReason(
                      event.target.value
                    )
                  }
                  disabled={processing}
                  rows="3"
                  placeholder="Enter reason only if you want to reject this request..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Modal Footer */}

            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={processing}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={processing}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing
                    ? "Processing..."
                    : "Reject"}
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processing}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing
                    ? "Processing..."
                    : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentRequests;