import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  cancelLeave,
  getMyLeaves,
  withdrawLeave,
} from "../services/userLeave.service";

const statusClasses = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-700",
  Withdrawn: "bg-gray-100 text-gray-700",
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

function MyLeaves() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyLeaves({
        page: 1,
        limit: 100,
        ...(statusFilter ? { status: statusFilter } : {}),
      });

      setLeaves(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load leaves."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const visibleLeaves = useMemo(() => {
    return [...leaves].sort(
      (a, b) =>
        new Date(b.fromDate).getTime() -
        new Date(a.fromDate).getTime()
    );
  }, [leaves]);

  const canCancelFutureApproved = (leave) => {
    if (leave.status !== "Approved") return false;
    if (!leave.fromDate) return false;

    const fromDate = new Date(leave.fromDate);
    const today = getToday();

    return fromDate > today;
  };

  const handleWithdraw = async (leave) => {
    const reason = window.prompt(
      "Enter withdrawal reason:",
      "Withdrawn by employee."
    );

    if (!reason?.trim()) return;

    try {
      setActionLoading(leave._id);
      await withdrawLeave(leave._id, reason.trim());
      await fetchLeaves();
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
          "Failed to withdraw leave."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleCancel = async (leave) => {
    const reason = window.prompt(
      "Enter cancellation reason:",
      "Cancelled by employee."
    );

    if (!reason?.trim()) return;

    try {
      setActionLoading(leave._id);
      await cancelLeave(leave._id, reason.trim());
      await fetchLeaves();
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
          "Failed to cancel leave."
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/leave/dashboard")}
              className="mb-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              ← Leave Dashboard
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              My Leave Applications
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Track your leave applications, attachments and approval history.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/leave/apply")}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Apply Leave
            </button>

            <button
              onClick={() => navigate("/attendance/my")}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700"
            >
              Attendance
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Filter Applications
              </h2>
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading leaves...
            </div>
          ) : visibleLeaves.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No leave applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left">Leave Type</th>
                    <th className="px-5 py-3 text-left">Dates</th>
                    <th className="px-5 py-3 text-left">Days</th>
                    <th className="px-5 py-3 text-left">Duration</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Attachments</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {visibleLeaves.map((leave) => {
                    const attachmentCount =
                      Array.isArray(leave.attachments) &&
                      leave.attachments.length
                        ? leave.attachments.length
                        : leave.attachment
                          ? 1
                          : 0;

                    return (
                      <tr
                        key={leave._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900">
                            {leave.leaveTypeId?.name || "-"}
                          </div>

                          <div className="text-xs text-gray-500">
                            {leave.leaveTypeId?.code || "-"}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          {formatDate(leave.fromDate)} →{" "}
                          {formatDate(leave.toDate)}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {leave.numberOfDays}
                        </td>

                        <td className="px-5 py-4">
                          {leave.durationType}
                          {leave.durationType === "Half Day" &&
                          leave.halfDayType
                            ? ` (${leave.halfDayType})`
                            : ""}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusClasses[leave.status] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {attachmentCount > 0 ? (
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                              {attachmentCount} file
                              {attachmentCount > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              None
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/leave/my/${leave._id}`
                                )
                              }
                              className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                            >
                              View
                            </button>

                            {leave.status === "Pending" && (
                              <button
                                disabled={
                                  actionLoading === leave._id
                                }
                                onClick={() =>
                                  handleWithdraw(leave)
                                }
                                className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-50"
                              >
                                Withdraw
                              </button>
                            )}

                            {canCancelFutureApproved(leave) && (
                              <button
                                disabled={
                                  actionLoading === leave._id
                                }
                                onClick={() =>
                                  handleCancel(leave)
                                }
                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}

                            {actionLoading === leave._id && (
                              <span className="text-xs text-indigo-600">
                                Processing...
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyLeaves;
