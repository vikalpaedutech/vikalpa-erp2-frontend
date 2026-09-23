import { useEffect, useState } from "react";

import {
  createLeaveType,
  deactivateLeaveType,
  getLeaveTypes,
  updateLeaveType,
} from "../services/userLeave.service";

const emptyForm = {
  name: "",
  code: "",
  isPaid: false,
  isActive: true,
};

function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await getLeaveTypes({});
      setLeaveTypes(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load leave types."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (leaveType) => {
    setEditingId(leaveType._id);
    setForm({
      name: leaveType.name || "",
      code: leaveType.code || "",
      isPaid: Boolean(leaveType.isPaid),
      isActive: leaveType.isActive !== false,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.code.trim()) {
      setError("Leave name and code are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        isPaid: Boolean(form.isPaid),
        isActive: Boolean(form.isActive),
      };

      if (editingId) {
        await updateLeaveType(editingId, payload);
        setSuccess("Leave type updated successfully.");
      } else {
        await createLeaveType(payload);
        setSuccess("Leave type created successfully.");
      }

      resetForm();
      await loadLeaveTypes();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save leave type."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (leaveType) => {
    if (!window.confirm(`Deactivate ${leaveType.name}?`)) return;

    try {
      setError("");
      setSuccess("");
      await deactivateLeaveType(leaveType._id);
      setSuccess("Leave type deactivated successfully.");
      await loadLeaveTypes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to deactivate leave type."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leave Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage the leave types employees can apply for.
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
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">
              {editingId ? "Edit Leave Type" : "Create Leave Type"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Casual Leave"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Code
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="CL"
                maxLength={20}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 uppercase"
              />
            </div>

            <label className="flex items-center gap-3 pt-8 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="isPaid"
                checked={form.isPaid}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Paid Leave
            </label>

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

            <div className="flex gap-3 md:col-span-4">
              <button
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Leave Type"
                    : "Create Leave Type"}
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
            <h2 className="font-semibold text-gray-900">Configured Leave Types</h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading leave types...
            </div>
          ) : leaveTypes.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No leave types configured.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Code</th>
                    <th className="px-5 py-3 text-left">Paid</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leaveTypes.map((leaveType) => (
                    <tr key={leaveType._id}>
                      <td className="px-5 py-4 font-medium">
                        {leaveType.name}
                      </td>
                      <td className="px-5 py-4">{leaveType.code}</td>
                      <td className="px-5 py-4">
                        {leaveType.isPaid ? "Yes" : "No"}
                      </td>
                      <td className="px-5 py-4">
                        {leaveType.isActive ? "Active" : "Inactive"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(leaveType)}
                            className="font-semibold text-indigo-600"
                          >
                            Edit
                          </button>
                          {leaveType.isActive && (
                            <button
                              onClick={() => handleDeactivate(leaveType)}
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

export default LeaveTypes;
