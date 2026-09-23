import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../../services/user.service";

function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    contact: "",
    password: "",
    isActive: true,
  });

  // -----------------------------------------
  // Fetch Users
  // -----------------------------------------

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: 10,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter !== "") {
        params.isActive = statusFilter;
      }

      const response = await getUsers(params);

      setUsers(response.data.users || []);

      setPagination(
        response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
          limit: 10,
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch users"
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Initial / Filter / Pagination Load
  // -----------------------------------------

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter]);

  // -----------------------------------------
  // Search
  // -----------------------------------------

  const handleSearch = (e) => {
    e.preventDefault();

    setCurrentPage(1);
    fetchUsers();
  };

  // -----------------------------------------
  // Open Create Modal
  // -----------------------------------------

  const openCreateModal = () => {
    setEditingUser(null);

    setFormData({
      userId: "",
      name: "",
      email: "",
      contact: "",
      password: "",
      isActive: true,
    });

    setError("");
    setShowModal(true);
  };

  // -----------------------------------------
  // Open Edit Modal
  // -----------------------------------------

  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      userId: user.userId || "",
      name: user.name || "",
      email: user.email || "",
      contact: user.contact || "",
      password: "",
      isActive: user.isActive !== false,
    });

    setError("");
    setShowModal(true);
  };

  // -----------------------------------------
  // Close Modal
  // -----------------------------------------

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
  };

  // -----------------------------------------
  // Form Change
  // -----------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // -----------------------------------------
  // Create / Update
  // -----------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingUser) {
        await updateUser(
          editingUser._id,
          {
            userId: formData.userId,
            name: formData.name,
            email: formData.email,
            contact: formData.contact,
            isActive: formData.isActive,
          }
        );
      } else {
        await createUser({
          userId: formData.userId,
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          password: formData.password,
          isActive: formData.isActive,
        });
      }

      setShowModal(false);
      setEditingUser(null);

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // Toggle Status
  // -----------------------------------------

  const handleToggleStatus = async (user) => {
    const action = user.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirmed) return;

    try {
      await toggleUserStatus(user._id);

      await fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update user status"
      );
    }
  };

  // -----------------------------------------
  // Delete
  // -----------------------------------------

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteUser(user._id);

      await fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete user"
      );
    }
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Users
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage system users
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              navigate("/admin/users/bulk-onboard")
            }
            className="px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            Bulk Onboard Users
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create User
          </button>
        </div>

      </div>


      {/* Error */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}


      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">

        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-3"
        >

          <input
            type="text"
            placeholder="Search name, email, user ID or contact..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              All Status
            </option>

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>
          </select>

          <button
            type="submit"
            className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Search
          </button>

        </form>

      </div>


      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    User
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Contact
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Email Verified
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {users.map((user) => (

                  <tr
                    key={user._id}
                    className="hover:bg-gray-50"
                  >

                    {/* User */}
                    <td className="px-4 py-4">

                      <div className="flex items-center gap-3">

                        <img
                          src={
                            user.profileimage?.url ||
                            "https://placehold.co/200x200"
                          }
                          alt={user.name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />

                        <div>

                          <p className="font-medium text-gray-800">
                            {user.name || "-"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {user.userId || "-"}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* Email */}
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {user.email}
                    </td>


                    {/* Contact */}
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {user.contact || "-"}
                    </td>


                    {/* Status */}
                    <td className="px-4 py-4">

                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>


                    {/* Email Verified */}
                    <td className="px-4 py-4">

                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.isEmailVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.isEmailVerified
                          ? "Verified"
                          : "Not Verified"}
                      </span>

                    </td>


                    {/* Actions */}
                    <td className="px-4 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditModal(user)
                          }
                          className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleToggleStatus(user)
                          }
                          className={`px-3 py-1.5 text-sm border rounded-lg ${
                            user.isActive
                              ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                              : "text-green-600 border-green-200 hover:bg-green-50"
                          }`}
                        >
                          {user.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(user)
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


      {/* Pagination */}
      {!loading &&
        users.length > 0 && (
          <div className="flex items-center justify-between mt-5">

            <p className="text-sm text-gray-500">
              Total Users:{" "}
              <span className="font-medium text-gray-700">
                {pagination.totalUsers}
              </span>
            </p>


            <div className="flex items-center gap-2">

              <button
                disabled={
                  currentPage <= 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) => page - 1
                  )
                }
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {pagination.currentPage}{" "}
                of {pagination.totalPages}
              </span>

              <button
                disabled={
                  currentPage >=
                  pagination.totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) => page + 1
                  )
                }
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>

            </div>

          </div>
        )}


      {/* Create / Edit Modal */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-gray-800">
                  {editingUser
                    ? "Edit User"
                    : "Create User"}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {editingUser
                    ? "Update user information"
                    : "Create a new system user"}
                </p>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
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

              {/* User ID */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>

                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Name */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Email */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Contact */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>

                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Password */}
              {!editingUser && (

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>

                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

              )}


              {/* Active Status */}
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-700">
                    Active User
                  </span>
                  <span className="block text-xs text-gray-500">
                    Inactive users cannot log in.
                  </span>
                </span>
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;