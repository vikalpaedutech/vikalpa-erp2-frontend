import { useEffect, useMemo, useState } from "react";

import {
  bulkConfigureLeaveBalances,
  configureLeaveBalance,
  getActiveLeaveBalanceUsers,
  getLeaveBalances,
  getLeaveTypes,
} from "../services/userLeave.service";

const getCurrentYear = () => new Date().getFullYear();

const getUsersFromResponse = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;

  return [];
};

const getLeaveTypesFromResponse = (response) => {
  return Array.isArray(response?.data)
    ? response.data
    : [];
};

const emptyForm = {
  userId: "",
  leaveTypeId: "",
  leaveYear: getCurrentYear(),
  openingBalance: 0,
  accruedBalance: 0,
  carryForwardBalance: 0,
  adjustmentBalance: 0,
  expiredBalance: 0,
};

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function LeaveBalanceManagement() {
  const [users, setUsers] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [bulkForm, setBulkForm] = useState({
    leaveTypeId: "",
    leaveYear: getCurrentYear(),
    openingBalance: 0,
    accruedBalance: 0,
    carryForwardBalance: 0,
    adjustmentBalance: 0,
    expiredBalance: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    leaveTypeId: "",
    leaveYear: getCurrentYear(),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    const response =
      await getActiveLeaveBalanceUsers();

    const usersData =
      response?.data?.users ||
      response?.data ||
      [];

    setUsers(
      Array.isArray(usersData)
        ? usersData
        : []
    );
  };

  const loadLeaveTypes = async () => {
    const response = await getLeaveTypes({
      isActive: true,
    });

    setLeaveTypes(
      getLeaveTypesFromResponse(response)
    );
  };

  const loadBalances = async (customFilters = filters) => {
    const response = await getLeaveBalances({
      page: 1,
      limit: 500,
      search: customFilters.search || undefined,
      leaveTypeId:
        customFilters.leaveTypeId || undefined,
      leaveYear: customFilters.leaveYear,
      isActive: true,
    });

    setBalances(
      Array.isArray(response?.data)
        ? response.data
        : []
    );
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadUsers(),
        loadLeaveTypes(),
      ]);

      await loadBalances();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load leave balance management."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "leaveYear"
          ? Number(value)
          : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleBulkChange = (event) => {
    const { name, value } = event.target;

    setBulkForm((previous) => ({
      ...previous,
      [name]:
        name === "leaveYear"
          ? Number(value)
          : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]:
        name === "leaveYear"
          ? Number(value)
          : value,
    }));
  };

  const handleSearch = async (event) => {
    event?.preventDefault();

    try {
      setError("");
      await loadBalances(filters);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load leave balances."
      );
    }
  };

  const handleResetFilters = async () => {
    const resetFilters = {
      search: "",
      leaveTypeId: "",
      leaveYear: getCurrentYear(),
    };

    setFilters(resetFilters);

    try {
      setError("");
      await loadBalances(resetFilters);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load leave balances."
      );
    }
  };

  const openBalanceForEdit = (balance) => {
    setForm({
      userId: balance.userId?._id || "",
      leaveTypeId: balance.leaveTypeId?._id || "",
      leaveYear: Number(balance.leaveYear),
      openingBalance: Number(balance.openingBalance || 0),
      accruedBalance: Number(balance.accruedBalance || 0),
      carryForwardBalance: Number(
        balance.carryForwardBalance || 0
      ),
      adjustmentBalance: Number(
        balance.adjustmentBalance || 0
      ),
      expiredBalance: Number(
        balance.expiredBalance || 0
      ),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleConfigure = async (event) => {
    event.preventDefault();

    if (!form.userId) {
      setError("Please select an employee.");
      return;
    }

    if (!form.leaveTypeId) {
      setError("Please select a leave type.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await configureLeaveBalance({
          userId: form.userId,
          leaveTypeId: form.leaveTypeId,
          leaveYear: Number(form.leaveYear),
          openingBalance: numberValue(
            form.openingBalance
          ),
          accruedBalance: numberValue(
            form.accruedBalance
          ),
          carryForwardBalance: numberValue(
            form.carryForwardBalance
          ),
          adjustmentBalance: numberValue(
            form.adjustmentBalance
          ),
          expiredBalance: numberValue(
            form.expiredBalance
          ),
          isActive: true,
        });

      setSuccess(
        response?.message ||
          "Leave balance configured successfully."
      );

      await loadBalances(filters);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to configure leave balance."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBulkConfigure = async (event) => {
    event.preventDefault();

    if (!bulkForm.leaveTypeId) {
      setError("Please select a leave type for bulk configuration.");
      return;
    }

    const confirmed = window.confirm(
      "This will create or update the selected leave balance for ALL active employees. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setBulkSaving(true);
      setError("");
      setSuccess("");

      const response =
        await bulkConfigureLeaveBalances({
          leaveTypeId: bulkForm.leaveTypeId,
          leaveYear: Number(bulkForm.leaveYear),
          openingBalance: numberValue(
            bulkForm.openingBalance
          ),
          accruedBalance: numberValue(
            bulkForm.accruedBalance
          ),
          carryForwardBalance: numberValue(
            bulkForm.carryForwardBalance
          ),
          adjustmentBalance: numberValue(
            bulkForm.adjustmentBalance
          ),
          expiredBalance: numberValue(
            bulkForm.expiredBalance
          ),
        });

      setSuccess(
        response?.message ||
          "Leave balances configured successfully."
      );

      await loadBalances(filters);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to bulk configure leave balances."
      );
    } finally {
      setBulkSaving(false);
    }
  };

  const selectedBalancePreview = useMemo(() => {
    return (
      numberValue(form.openingBalance) +
      numberValue(form.accruedBalance) +
      numberValue(form.carryForwardBalance) +
      numberValue(form.adjustmentBalance) -
      numberValue(form.expiredBalance)
    );
  }, [
    form.openingBalance,
    form.accruedBalance,
    form.carryForwardBalance,
    form.adjustmentBalance,
    form.expiredBalance,
  ]);

  const bulkPreview = useMemo(() => {
    return (
      numberValue(bulkForm.openingBalance) +
      numberValue(bulkForm.accruedBalance) +
      numberValue(bulkForm.carryForwardBalance) +
      numberValue(bulkForm.adjustmentBalance) -
      numberValue(bulkForm.expiredBalance)
    );
  }, [
    bulkForm.openingBalance,
    bulkForm.accruedBalance,
    bulkForm.carryForwardBalance,
    bulkForm.adjustmentBalance,
    bulkForm.expiredBalance,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">
            Loading leave balance management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Leave Balance Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure employee leave balances year-wise and leave-type-wise.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleConfigure}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Configure Individual Balance
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Create or update one employee's balance.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Employee
                </label>
                <select
                  name="userId"
                  value={form.userId}
                  onChange={handleFormChange}
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="">Select Employee</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name || user.userId}{" "}
                      {user.userId ? `(${user.userId})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Leave Type
                </label>
                <select
                  name="leaveTypeId"
                  value={form.leaveTypeId}
                  onChange={handleFormChange}
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((leaveType) => (
                    <option
                      key={leaveType._id}
                      value={leaveType._id}
                    >
                      {leaveType.name} ({leaveType.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Leave Year
                </label>
                <input
                  type="number"
                  name="leaveYear"
                  min="2000"
                  max="3000"
                  value={form.leaveYear}
                  onChange={handleFormChange}
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["openingBalance", "Opening Balance"],
                  ["accruedBalance", "Accrued Balance"],
                  ["carryForwardBalance", "Carry Forward"],
                  ["adjustmentBalance", "Adjustment"],
                  ["expiredBalance", "Expired Balance"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      {label}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      name={name}
                      value={form[name]}
                      onChange={handleFormChange}
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-indigo-50 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-700">
                    Calculated Available Balance
                  </span>
                  <span className="text-xl font-bold text-indigo-900">
                    {selectedBalancePreview}
                  </span>
                </div>
                <p className="mt-1 text-xs text-indigo-600">
                  Used and pending balances are preserved when updating an
                  existing record.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Configure / Update Balance"}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleBulkConfigure}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Configure All Active Employees
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Create or update the selected leave type for every active
                employee.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Leave Type
                </label>
                <select
                  name="leaveTypeId"
                  value={bulkForm.leaveTypeId}
                  onChange={handleBulkChange}
                  disabled={bulkSaving}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((leaveType) => (
                    <option
                      key={leaveType._id}
                      value={leaveType._id}
                    >
                      {leaveType.name} ({leaveType.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Leave Year
                </label>
                <input
                  type="number"
                  name="leaveYear"
                  min="2000"
                  max="3000"
                  value={bulkForm.leaveYear}
                  onChange={handleBulkChange}
                  disabled={bulkSaving}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["openingBalance", "Opening Balance"],
                  ["accruedBalance", "Accrued Balance"],
                  ["carryForwardBalance", "Carry Forward"],
                  ["adjustmentBalance", "Adjustment"],
                  ["expiredBalance", "Expired Balance"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      {label}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      name={name}
                      value={bulkForm[name]}
                      onChange={handleBulkChange}
                      disabled={bulkSaving}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-green-50 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">
                    Calculated Available Balance
                  </span>
                  <span className="text-xl font-bold text-green-900">
                    {bulkPreview}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={bulkSaving}
                className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {bulkSaving
                  ? "Configuring..."
                  : "Apply to All Active Employees"}
              </button>
            </div>
          </form>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Configured Leave Balances
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Search and edit existing employee balances.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search employee..."
              className="rounded-xl border border-gray-300 px-4 py-3"
            />

            <select
              name="leaveTypeId"
              value={filters.leaveTypeId}
              onChange={handleFilterChange}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3"
            >
              <option value="">All Leave Types</option>
              {leaveTypes.map((leaveType) => (
                <option
                  key={leaveType._id}
                  value={leaveType._id}
                >
                  {leaveType.name} ({leaveType.code})
                </option>
              ))}
            </select>

            <input
              type="number"
              name="leaveYear"
              value={filters.leaveYear}
              onChange={handleFilterChange}
              min="2000"
              max="3000"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Balance Records
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {balances.length} configured balance record(s).
            </p>
          </div>

          {balances.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No leave balances configured for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left">Employee</th>
                    <th className="px-5 py-3 text-left">Leave Type</th>
                    <th className="px-5 py-3 text-left">Year</th>
                    <th className="px-5 py-3 text-right">Opening</th>
                    <th className="px-5 py-3 text-right">Accrued</th>
                    <th className="px-5 py-3 text-right">Used</th>
                    <th className="px-5 py-3 text-right">Pending</th>
                    <th className="px-5 py-3 text-right">Available</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {balances.map((balance) => (
                    <tr
                      key={balance._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {balance.userId?.name ||
                            balance.userId?.userId ||
                            "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {balance.userId?.userId || ""}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {balance.leaveTypeId?.name || "-"}
                        <div className="text-xs text-gray-500">
                          {balance.leaveTypeId?.code || ""}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {balance.leaveYear}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {balance.openingBalance}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {balance.accruedBalance}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {balance.usedBalance}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {balance.pendingBalance}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-indigo-700">
                        {balance.availableBalance}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            openBalanceForEdit(balance)
                          }
                          className="font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Edit
                        </button>
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

export default LeaveBalanceManagement;
