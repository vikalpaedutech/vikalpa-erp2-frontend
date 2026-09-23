import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getPendingLeaveApprovals,
} from "../services/userLeave.service";

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function LeaveApprovals() {
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPendingLeaveApprovals({
        page: 1,
        limit: 100,
      });

      setApprovals(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setApprovals([]);
      setError(
        err.response?.data?.message ||
          "Failed to load pending approvals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/leave/dashboard")}
              className="mb-2 text-sm font-medium text-indigo-600"
            >
              ← Leave Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Leave Approval Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review leave applications assigned to you at the current approval level.
            </p>
          </div>

          <button
            onClick={fetchApprovals}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending approvals</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">
            {approvals.length}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading approvals...
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No pending leave approvals assigned to you.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left">Employee</th>
                    <th className="px-5 py-3 text-left">Leave Type</th>
                    <th className="px-5 py-3 text-left">Dates</th>
                    <th className="px-5 py-3 text-left">Days</th>
                    <th className="px-5 py-3 text-left">Reason</th>
                    <th className="px-5 py-3 text-left">Level</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {approvals.map((approval) => {
                    const leave = approval.leaveId;
                    const employee = leave?.userId;

                    return (
                      <tr key={approval._id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900">
                            {employee?.name || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee?.userId || employee?.email || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {leave?.leaveTypeId?.name || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {leave?.leaveTypeId?.code || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {formatDate(leave?.fromDate)} → {formatDate(leave?.toDate)}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {leave?.numberOfDays ?? "-"}
                        </td>

                        <td className="max-w-xs px-5 py-4">
                          <p className="line-clamp-3">
                            {leave?.reason || "-"}
                          </p>
                          {leave?.remarks && (
                            <p className="mt-1 text-xs text-gray-500">
                              {leave.remarks}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          Level {approval.approvalLevel}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              navigate(
                                `/leave/approvals/${leave?._id}`
                              )
                            }
                            className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            View & Review
                          </button>
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

export default LeaveApprovals;
