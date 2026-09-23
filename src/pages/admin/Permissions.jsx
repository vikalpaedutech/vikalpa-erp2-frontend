import { useEffect, useState } from "react";

import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  togglePermissionStatus,
} from "../../services/permission.service";

function Permissions() {
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);

  const [formData, setFormData] = useState({
    permissionName: "",
    module: "",
    action: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: 1,
        limit: 100,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (moduleFilter) {
        params.module = moduleFilter;
      }

      if (actionFilter) {
        params.action = actionFilter;
      }

      const response = await getPermissions(params);

      setPermissions(response.data.permissions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch permissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [search, moduleFilter, actionFilter]);

  const openCreateModal = () => {
    setEditingPermission(null);

    setFormData({
      permissionName: "",
      module: "",
      action: "",
      description: "",
    });

    setShowModal(true);
  };

  const openEditModal = (permission) => {
    setEditingPermission(permission);

    setFormData({
      permissionName: permission.permissionName || "",
      module: permission.module || "",
      action: permission.action || "",
      description: permission.description || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingPermission(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.permissionName.trim() ||
      !formData.module.trim() ||
      !formData.action.trim()
    ) {
      alert(
        "Permission name, module and action are required"
      );
      return;
    }

    try {
      setSubmitting(true);

      if (editingPermission) {
        await updatePermission(
          editingPermission._id,
          formData
        );
      } else {
        await createPermission(formData);
      }

      closeModal();
      await fetchPermissions();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (permission) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${permission.permissionName}"?`
    );

    if (!confirmed) return;

    try {
      await deletePermission(permission._id);

      await fetchPermissions();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete permission"
      );
    }
  };

  const handleToggleStatus = async (permission) => {
    try {
      await togglePermissionStatus(permission._id);

      await fetchPermissions();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update permission status"
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setModuleFilter("");
    setActionFilter("");
  };

  const modules = [
    ...new Set(
      permissions
        .map((permission) => permission.module)
        .filter(Boolean)
    ),
  ].sort();

  const actions = [
    ...new Set(
      permissions
        .map((permission) => permission.action)
        .filter(Boolean)
    ),
  ].sort();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Permissions
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage system permissions
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Permission
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={moduleFilter}
            onChange={(e) =>
              setModuleFilter(e.target.value)
            }
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Modules</option>

            {modules.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(e.target.value)
            }
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>

            {actions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span>{error}</span>

            <button
              onClick={fetchPermissions}
              className="font-medium underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading permissions...
          </div>
        ) : permissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No permissions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Permission Name
                  </th>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Permission Code
                  </th>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Module
                  </th>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Action
                  </th>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Description
                  </th>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {permissions.map((permission) => (
                  <tr
                    key={permission._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {permission.permissionName}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {permission.permissionCode}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {permission.module}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {permission.action}
                    </td>

                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      {permission.description || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleStatus(permission)
                        }
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          permission.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {permission.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openEditModal(permission)
                          }
                          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(permission)
                          }
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingPermission
                  ? "Edit Permission"
                  : "Create Permission"}
              </h2>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Name
                </label>

                <input
                  type="text"
                  name="permissionName"
                  value={formData.permissionName}
                  onChange={handleChange}
                  placeholder="Example: View Students"
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module
                </label>

                <input
                  type="text"
                  name="module"
                  value={formData.module}
                  onChange={handleChange}
                  placeholder="Example: student"
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>

                <input
                  type="text"
                  name="action"
                  value={formData.action}
                  onChange={handleChange}
                  placeholder="Example: read"
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <p className="text-xs text-gray-500 mt-1">
                  Permission code will be generated as
                  module.action
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Permission description"
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingPermission
                    ? "Update Permission"
                    : "Create Permission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Permissions;