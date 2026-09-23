import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyLeaves,
  getPendingLeaveApprovals,
  getMyLeaveBalances,
} from "../services/userLeave.service";

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getToday = () => {
  const date = new Date();
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

const statusClass = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-700",
  Withdrawn: "bg-gray-100 text-gray-700",
};

function LeaveDashboard() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [myLeavesResult, approvalsResult, balancesResult] =
        await Promise.allSettled([
          getMyLeaves({ page: 1, limit: 100 }),
          getPendingLeaveApprovals({ page: 1, limit: 100 }),
          getMyLeaveBalances(new Date().getFullYear()),
        ]);

      if (myLeavesResult.status === "fulfilled") {
        setLeaves(
          Array.isArray(myLeavesResult.value?.data)
            ? myLeavesResult.value.data
            : []
        );
      } else {
        setLeaves([]);
        setError(
          myLeavesResult.reason?.response?.data?.message ||
            "Failed to load your leave applications."
        );
      }

      if (approvalsResult.status === "fulfilled") {
        setPendingApprovals(
          Array.isArray(approvalsResult.value?.data)
            ? approvalsResult.value.data
            : []
        );
      } else {
        // Non-approvers are allowed to use the dashboard.
        setPendingApprovals([]);
      }

      if (balancesResult.status === "fulfilled") {
        setLeaveBalances(
          Array.isArray(balancesResult.value?.data)
            ? balancesResult.value.data
            : []
        );
      } else {
        setLeaveBalances([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load leave dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = useMemo(() => {
    const today = getToday();

    const pending = leaves.filter(
      (leave) => leave.status === "Pending"
    ).length;

    const approved = leaves.filter(
      (leave) => leave.status === "Approved"
    ).length;

    const rejected = leaves.filter(
      (leave) => leave.status === "Rejected"
    ).length;

    const cancelled = leaves.filter(
      (leave) =>
        leave.status === "Cancelled" ||
        leave.status === "Withdrawn"
    ).length;

    const upcoming = leaves
      .filter((leave) => {
        if (!leave?.fromDate) return false;
        if (!["Pending", "Approved"].includes(leave.status)) return false;

        return new Date(leave.fromDate) >= today;
      })
      .sort(
        (a, b) =>
          new Date(a.fromDate).getTime() -
          new Date(b.fromDate).getTime()
      )
      .slice(0, 5);

    return {
      total: leaves.length,
      pending,
      approved,
      rejected,
      cancelled,
      upcoming,
    };
  }, [leaves]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Loading leave dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Leave Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your leave applications and approval workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/leave/apply")}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Apply Leave
            </button>
            <button
              onClick={() => navigate("/attendance/my")}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Attendance Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="mb-3">
            <h2 className="font-semibold text-gray-900">
              Current Leave Balance
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Leave balances for {new Date().getFullYear()}.
            </p>
          </div>

          {leaveBalances.length === 0 ? (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-800">
              No leave balance has been configured for you yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {leaveBalances.map((balance) => (
                <div
                  key={balance._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {balance.leaveTypeId?.name || "-"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {balance.leaveTypeId?.code || ""} • {balance.leaveYear}
                  </p>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-indigo-700">
                        {Number(balance.availableBalance || 0) -
                          Number(balance.pendingBalance || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Available to apply
                      </p>
                    </div>

                    <div className="text-right text-xs text-gray-500">
                      <p>Used: {balance.usedBalance || 0}</p>
                      <p>Pending: {balance.pendingBalance || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Total Applications", summary.total, "text-gray-900"],
            ["Pending", summary.pending, "text-yellow-600"],
            ["Approved", summary.approved, "text-green-600"],
            ["Rejected", summary.rejected, "text-red-600"],
            ["Cancelled / Withdrawn", summary.cancelled, "text-gray-600"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <button
            onClick={() => navigate("/leave/my")}
            className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-indigo-300"
          >
            <p className="font-semibold text-gray-900">My Leaves</p>
            <p className="mt-1 text-sm text-gray-500">
              View, withdraw and cancel your leave applications.
            </p>
          </button>

          <button
            onClick={() => navigate("/leave/approvals")}
            className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-indigo-300"
          >
            <p className="font-semibold text-gray-900">Approval Dashboard</p>
            <p className="mt-1 text-sm text-gray-500">
              {pendingApprovals.length} pending approval(s) assigned to you.
            </p>
          </button>

          <button
            onClick={() => navigate("/attendance/my")}
            className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-indigo-300"
          >
            <p className="font-semibold text-gray-900">
              Attendance & Reports
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Open attendance history and download an Excel-compatible report.
            </p>
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Upcoming Leaves</h2>
            <p className="mt-1 text-xs text-gray-500">
              Pending and approved leaves starting from today.
            </p>
          </div>

          {summary.upcoming.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No upcoming leaves.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left">Leave Type</th>
                    <th className="px-5 py-3 text-left">Dates</th>
                    <th className="px-5 py-3 text-left">Days</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {summary.upcoming.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {leave.leaveTypeId?.name || "-"}
                      </td>
                      <td className="px-5 py-4">
                        {formatDate(leave.fromDate)} → {formatDate(leave.toDate)}
                      </td>
                      <td className="px-5 py-4">
                        {leave.numberOfDays}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusClass[leave.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaveDashboard;
