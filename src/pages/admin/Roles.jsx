import { useEffect, useState } from "react";

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
} from "../../services/role.service";

function Roles() {
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [formData, setFormData] = useState({
    roleName: "",
    roleCode: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchRoles = async () => {
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

      if (statusFilter) {
        params.isActive = statusFilter;
      }

      const response = await getRoles(params);

      setRoles(response.data.roles || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch roles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [search, statusFilter]);

  const openCreateModal = () => {
    setEditingRole(null);

    setFormData({
      roleName: "",
      roleCode: "",
      description: "",
    });

    setShowModal(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);

    setFormData({
      roleName: role.roleName || "",
      roleCode: role.roleCode || "",
      description: role.description || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingRole(null);
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
      !formData.roleName.trim() ||
      !formData.roleCode.trim()
    ) {
      alert("Role name and role code are required");
      return;
    }

    try {
      setSubmitting(true);

      if (editingRole) {
        await updateRole(
          editingRole._id,
          formData
        );
      } else {
        await createRole(formData);
      }

      closeModal();
      await fetchRoles();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${role.roleName}"?`
    );

    if (!confirmed) return;

    try {
      await deleteRole(role._id);

      await fetchRoles();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete role"
      );
    }
  };

  const handleToggleStatus = async (role) => {
    try {
      await toggleRoleStatus(role._id);

      await fetchRoles();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update role status"
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Roles
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage system roles
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Role
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
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
              onClick={fetchRoles}
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
            Loading roles...
          </div>
        ) : roles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No roles found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Role Name
                  </th>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Role Code
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
                {roles.map((role) => (
                  <tr
                    key={role._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {role.roleName}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {role.roleCode}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {role.description || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleStatus(role)
                        }
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          role.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {role.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openEditModal(role)
                          }
                          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(role)
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
                {editingRole
                  ? "Edit Role"
                  : "Create Role"}
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
                  Role Name
                </label>

                <input
                  type="text"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                  placeholder="Example: Community Manager"
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Code
                </label>

                <input
                  type="text"
                  name="roleCode"
                  value={formData.roleCode}
                  onChange={handleChange}
                  placeholder="Example: COMMUNITY_MANAGER"
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <p className="text-xs text-gray-500 mt-1">
                  Role code will be stored in uppercase.
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
                  placeholder="Role description"
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
                    : editingRole
                    ? "Update Role"
                    : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roles;