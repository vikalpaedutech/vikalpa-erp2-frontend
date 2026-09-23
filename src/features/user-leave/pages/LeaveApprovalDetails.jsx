import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  approveLeave,
  getLeaveApprovalById,
  rejectLeave,
} from "../services/userLeave.service";

const statusClasses = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-700",
  Withdrawn: "bg-gray-100 text-gray-700",
  Skipped: "bg-gray-100 text-gray-600",
};

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function LeaveApprovalDetails() {
  const navigate = useNavigate();
  const { leaveId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionRemarks, setActionRemarks] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLeaveApprovalById(leaveId);
      setData(response?.data || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load leave approval details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [leaveId]);

  const leave = data?.leave;
  const approvals = data?.approvals || [];
  const currentApproval = data?.currentApproval;
  const balanceAtApplication = data?.balanceAtApplication;

  const attachments = useMemo(() => {
    if (
      Array.isArray(leave?.attachments) &&
      leave.attachments.length
    ) {
      return leave.attachments;
    }

    return leave?.attachment ? [leave.attachment] : [];
  }, [leave]);

  const canAct =
    leave?.status === "Pending" &&
    currentApproval?.status === "Pending" &&
    currentApproval?.isActive === true;

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await approveLeave(leaveId, {
        approvalReason:
          actionRemarks.trim() || "Approved.",
        remarks:
          actionRemarks.trim() || "Approved.",
      });

      setSuccess("Leave approval processed successfully.");
      setActionRemarks("");
      await loadDetail();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to approve leave."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionRemarks.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await rejectLeave(leaveId, {
        rejectionReason: actionRemarks.trim(),
        remarks: actionRemarks.trim(),
      });

      setSuccess("Leave rejected successfully.");
      setActionRemarks("");
      await loadDetail();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reject leave."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          Loading approval details...
        </div>
      </div>
    );
  }

  if (error && !leave) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate("/leave/approvals")}
            className="mb-4 text-sm font-medium text-indigo-600"
          >
            ← Leave Approvals
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <button
            onClick={() => navigate("/leave/approvals")}
            className="mb-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            ← Leave Approvals
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Review Leave Application
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review the employee's complete application before approving or rejecting it.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Employee
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {leave?.userId?.name || "-"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {leave?.userId?.userId || "-"} •{" "}
                    {leave?.userId?.email || "-"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusClasses[leave?.status] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {leave?.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Leave Type</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {leave?.leaveTypeId?.name || "-"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {leave?.leaveTypeId?.code || "-"} •{" "}
                    {leave?.leaveTypeId?.isPaid
                      ? "Paid"
                      : "Unpaid"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Requested Days</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {leave?.numberOfDays ?? "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">From Date</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatDate(leave?.fromDate)}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">To Date</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatDate(leave?.toDate)}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {leave?.durationType}
                    {leave?.halfDayType
                      ? ` (${leave.halfDayType})`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700">
                  Employee Reason
                </p>

                <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-800 whitespace-pre-wrap">
                  {leave?.reason || "-"}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-gray-700">
                  Employee Remarks
                </p>

                <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-800 whitespace-pre-wrap">
                  {leave?.remarks || "No remarks."}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Attachments
              </h2>

              {attachments.length === 0 ? (
                <div className="mt-4 rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
                  No attachments were submitted.
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {attachments.map((file, index) => (
                    <button
                      key={`${file.url}-${index}`}
                      type="button"
                      onClick={() => setSelectedAttachment(file)}
                      className="flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {file.fileName || `Attachment ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.mimeType === "application/pdf" ||
                          String(file.fileName || "").toLowerCase().endsWith(".pdf")
                            ? "PDF"
                            : "Image"}
                        </p>
                      </div>

                      <span className="ml-3 text-xs font-semibold text-indigo-600">
                        View
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Approval History
              </h2>

              <div className="mt-5 space-y-4">
                {approvals.map((approval) => (
                  <div
                    key={approval._id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Level {approval.approvalLevel}
                        </p>

                        <p className="text-sm text-gray-500">
                          {approval.approverId?.name || "-"}{" "}
                          •{" "}
                          {approval.approverId?.email || ""}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClasses[approval.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {approval.status}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-gray-400">
                          Assigned
                        </p>
                        <p className="text-sm text-gray-700">
                          {formatDateTime(approval.assignedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Action
                        </p>
                        <p className="text-sm text-gray-700">
                          {formatDateTime(approval.actionAt)}
                        </p>
                      </div>
                    </div>

                    {approval.approvalReason && (
                      <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                        <strong>Approval:</strong>{" "}
                        {approval.approvalReason}
                      </div>
                    )}

                    {approval.rejectionReason && (
                      <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                        <strong>Rejection:</strong>{" "}
                        {approval.rejectionReason}
                      </div>
                    )}

                    {approval.remarks && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                        <strong>Remarks:</strong>{" "}
                        {approval.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
              <h2 className="font-bold text-indigo-900">
                Balance at Application
              </h2>

              {balanceAtApplication ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-indigo-700">
                      Available before request
                    </span>
                    <strong className="text-indigo-900">
                      {balanceAtApplication.balanceBefore}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-indigo-700">
                      Requested
                    </span>
                    <strong className="text-indigo-900">
                      {balanceAtApplication.amount}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4 border-t border-indigo-200 pt-3">
                    <span className="font-semibold text-indigo-800">
                      Leave Year
                    </span>
                    <strong className="text-indigo-900">
                      {balanceAtApplication.leaveYear}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-indigo-700">
                  Balance transaction information is unavailable.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-gray-900">
                Your Current Approval
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Level</span>
                  <strong>
                    {currentApproval?.approvalLevel || "-"}
                  </strong>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Status</span>
                  <strong>
                    {currentApproval?.status || "-"}
                  </strong>
                </div>
              </div>
            </section>

            {canAct && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-gray-900">
                  Take Action
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Add approval remarks or enter the rejection reason.
                </p>

                <textarea
                  value={actionRemarks}
                  onChange={(event) =>
                    setActionRemarks(event.target.value)
                  }
                  rows={5}
                  placeholder="Approval remarks / rejection reason"
                  disabled={actionLoading}
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleApprove}
                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Approve Leave"}
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleReject}
                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject Leave
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {selectedAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="truncate font-semibold text-gray-900">
                {selectedAttachment.fileName || "Attachment"}
              </h3>

              <button
                type="button"
                onClick={() => setSelectedAttachment(null)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[calc(90vh-72px)] overflow-auto p-4">
              {selectedAttachment.mimeType === "application/pdf" ||
              String(selectedAttachment.fileName || "")
                .toLowerCase()
                .endsWith(".pdf") ? (
                <iframe
                  title="Leave attachment"
                  src={selectedAttachment.url}
                  className="h-[75vh] w-full rounded-xl border"
                />
              ) : (
                <img
                  src={selectedAttachment.url}
                  alt={selectedAttachment.fileName || "Leave attachment"}
                  className="mx-auto max-h-[75vh] max-w-full rounded-xl object-contain"
                />
              )}

              <div className="mt-4 text-center">
                <a
                  href={selectedAttachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-indigo-600"
                >
                  Open attachment in new tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveApprovalDetails;
