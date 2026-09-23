import { useEffect, useMemo, useState } from "react";

import {
  getLeaveApprovalRules,
  createLeaveApprovalRule,
  updateLeaveApprovalRule,
  deactivateLeaveApprovalRule,
} from "../services/userLeave.service";

import apiClient from "../../../api/apiClient";

const emptyForm = {
  departmentId: "",
  designationId: "",
  approverId: "",
  approvalLevel: 1,
  isActive: true,
};

const getList = (response, keys = []) => {
  if (Array.isArray(response?.data)) return response.data;

  for (const key of keys) {
    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }
  }

  return [];
};

function LeaveApprovalRules() {
  const [rules, setRules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMasterData = async () => {
    const [departmentResponse, designationResponse, userResponse] =
      await Promise.all([
        apiClient.get("/department", {
          params: { isActive: true, page: 1, limit: 100 },
        }),
        apiClient.get("/designation", {
          params: { isActive: true, page: 1, limit: 100 },
        }),
        apiClient.get("/user-management/users", {
          params: { isActive: true, page: 1, limit: 100 },
        }),
      ]);

    setDepartments(
      getList(departmentResponse.data, ["departments"])
    );

    setDesignations(
      getList(designationResponse.data, ["designations"])
    );

    setUsers(
      getList(userResponse.data, ["users"])
    );
  };

  const loadRules = async () => {
    const response = await getLeaveApprovalRules({ isActive: true });
    setRules(Array.isArray(response?.data) ? response.data : []);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([loadMasterData(), loadRules()]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load leave approval configuration."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredDesignations = useMemo(() => {
    if (!form.departmentId) return designations;

    return designations.filter(
      (designation) =>
        String(
          designation.departmentId?._id ||
            designation.departmentId
        ) === String(form.departmentId)
    );
  }, [designations, form.departmentId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "departmentId") {
      setForm((previous) => ({
        ...previous,
        departmentId: value,
        designationId: "",
      }));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (rule) => {
    setEditingId(rule._id);
    setForm({
      departmentId:
        rule.departmentId?._id || rule.departmentId || "",
      designationId:
        rule.designationId?._id || rule.designationId || "",
      approverId:
        rule.approverId?._id || rule.approverId || "",
      approvalLevel: rule.approvalLevel || 1,
      isActive: rule.isActive !== false,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.departmentId || !form.designationId || !form.approverId) {
      setError(
        "Department, designation and approver are required."
      );
      return;
    }

    const level = Number(form.approvalLevel);

    if (!Number.isInteger(level) || level < 1) {
      setError("Approval level must be a positive integer.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        departmentId: form.departmentId,
        designationId: form.designationId,
        approverId: form.approverId,
        approvalLevel: level,
        isActive: Boolean(form.isActive),
      };

      if (editingId) {
        await updateLeaveApprovalRule(editingId, payload);
        setSuccess("Leave approval rule updated successfully.");
      } else {
        await createLeaveApprovalRule(payload);
        setSuccess("Leave approval rule created successfully.");
      }

      resetForm();
      await loadRules();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save leave approval rule."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (rule) => {
    if (!window.confirm("Deactivate this approval rule?")) return;

    try {
      setError("");
      setSuccess("");
      await deactivateLeaveApprovalRule(rule._id);
      setSuccess("Leave approval rule deactivated successfully.");
      await loadRules();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to deactivate approval rule."
      );
    }
  };

  const departmentName = (value) =>
    value?.departmentName || "-";

  const designationName = (value) =>
    value?.designation || "-";

  const approverName = (value) =>
    value?.name || value?.userId || value?.email || "-";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Leave Approval Rules
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure who approves each employee designation and at which level.
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

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">
            {editingId ? "Edit Approval Rule" : "Create Approval Rule"}
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
              >
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.departmentName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Employee Designation
              </label>
              <select
                name="designationId"
                value={form.designationId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
              >
                <option value="">Select Designation</option>
                {filteredDesignations.map((designation) => (
                  <option key={designation._id} value={designation._id}>
                    {designation.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Approver
              </label>
              <select
                name="approverId"
                value={form.approverId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
              >
                <option value="">Select Approver</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} {user.userId ? `(${user.userId})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Approval Level
              </label>
              <input
                type="number"
                min="1"
                name="approvalLevel"
                value={form.approvalLevel}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <label className="flex items-center gap-3 pt-8 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Active
            </label>

            <div className="flex gap-3 lg:col-span-5">
              <button
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Rule"
                    : "Create Rule"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Active Approval Workflow
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading approval rules...
            </div>
          ) : rules.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No active approval rules configured.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left">Department</th>
                    <th className="px-5 py-3 text-left">Designation</th>
                    <th className="px-5 py-3 text-left">Level</th>
                    <th className="px-5 py-3 text-left">Approver</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rules.map((rule) => (
                    <tr key={rule._id}>
                      <td className="px-5 py-4">
                        {departmentName(rule.departmentId)}
                      </td>
                      <td className="px-5 py-4">
                        {designationName(rule.designationId)}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        Level {rule.approvalLevel}
                      </td>
                      <td className="px-5 py-4">
                        {approverName(rule.approverId)}
                      </td>
                      <td className="px-5 py-4">
                        {rule.isActive ? "Active" : "Inactive"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="font-semibold text-indigo-600"
                          >
                            Edit
                          </button>
                          {rule.isActive && (
                            <button
                              onClick={() => handleDeactivate(rule)}
                              className="font-semibold text-red-600"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
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

export default LeaveApprovalRules;
