import { useEffect, useState } from "react";

import { getUsers } from "../../services/user.service";
import { getRoles } from "../../services/role.service";

import {
  getRolesByUser,
  assignRoleToUser,
  toggleUserRoleStatus,
  removeRoleFromUser,
} from "../../services/userRole.service";

function UserRoles() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [assignedRoles, setAssignedRoles] = useState([]);

  const [search, setSearch] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingAssignedRoles, setLoadingAssignedRoles] =
    useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const [assigningRole, setAssigningRole] = useState(false);

  const [error, setError] = useState("");

  // -----------------------------------------
  // Fetch Users
  // -----------------------------------------

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError("");

      const response = await getUsers({
        page: 1,
        limit: 100,
        search: search.trim(),
        isActive: "true",
      });

      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch users"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // -----------------------------------------
  // Fetch Roles
  // -----------------------------------------

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);

      const response = await getRoles({
        page: 1,
        limit: 100,
        isActive: "true",
      });

      setRoles(response.data.roles || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch roles"
      );
    } finally {
      setLoadingRoles(false);
    }
  };

  // -----------------------------------------
  // Initial Load
  // -----------------------------------------

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    fetchRoles();
  }, []);

  // -----------------------------------------
  // Search
  // -----------------------------------------

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // -----------------------------------------
  // Open Manage Roles
  // -----------------------------------------

  const handleManageRoles = async (user) => {
    setSelectedUser(user);
    setSelectedRole("");
    setAssignedRoles([]);
    setError("");

    try {
      setLoadingAssignedRoles(true);

      const response = await getRolesByUser(user._id);

      setAssignedRoles(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch assigned roles"
      );
    } finally {
      setLoadingAssignedRoles(false);
    }
  };

  // -----------------------------------------
  // Close Modal
  // -----------------------------------------

  const handleCloseModal = () => {
    setSelectedUser(null);
    setSelectedRole("");
    setAssignedRoles([]);
    setError("");
  };

  // -----------------------------------------
  // Assign Role
  // -----------------------------------------

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      return;
    }

    try {
      setAssigningRole(true);
      setError("");

      await assignRoleToUser(
        selectedUser._id,
        selectedRole
      );

      const response = await getRolesByUser(
        selectedUser._id
      );

      setAssignedRoles(response.data || []);
      setSelectedRole("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to assign role"
      );
    } finally {
      setAssigningRole(false);
    }
  };

  // -----------------------------------------
  // Toggle Role Status
  // -----------------------------------------

  const handleToggleStatus = async (
    userRoleId
  ) => {
    try {
      setError("");

      await toggleUserRoleStatus(userRoleId);

      const response = await getRolesByUser(
        selectedUser._id
      );

      setAssignedRoles(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update role status"
      );
    }
  };

  // -----------------------------------------
  // Remove Role
  // -----------------------------------------

  const handleRemoveRole = async (
    userRoleId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this role from the user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await removeRoleFromUser(userRoleId);

      const response = await getRolesByUser(
        selectedUser._id
      );

      setAssignedRoles(response.data || []);
      setSelectedRole("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to remove role"
      );
    }
  };

  // -----------------------------------------
  // Available Roles
  // -----------------------------------------

  const assignedRoleIds = new Set(
    assignedRoles
      .map((item) => item.roleId?._id)
      .filter(Boolean)
  );

  const availableRoles = roles.filter(
    (role) => !assignedRoleIds.has(role._id)
  );

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          User Roles
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage roles assigned to users
        </p>
      </div>


      {/* Search */}
      <div className="bg-white rounded-lg shadow p-5 mb-5">

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Users
        </label>

        <div className="relative max-w-xl">

          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email or contact..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          )}

        </div>

      </div>


      {/* Error */}
      {error && !selectedUser && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-5">
          {error}
        </div>
      )}


      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">

        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-800">
            Users
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            {users.length} users found
          </p>
        </div>


        {loadingUsers ? (
          <div className="p-10 text-center text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    User
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Email
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Contact
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    User ID
                  </th>

                  <th className="text-right px-5 py-3 font-semibold text-gray-600">
                    Action
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
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <img
                          src={
                            user.profileimage?.url ||
                            "https://placehold.co/40x40"
                          }
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border"
                        />

                        <span className="font-medium text-gray-800">
                          {user.name || "-"}
                        </span>

                      </div>

                    </td>


                    {/* Email */}
                    <td className="px-5 py-4 text-gray-600">
                      {user.email || "-"}
                    </td>


                    {/* Contact */}
                    <td className="px-5 py-4 text-gray-600">
                      {user.contact || "-"}
                    </td>


                    {/* User ID */}
                    <td className="px-5 py-4">

                      {user.userId ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {user.userId}
                        </span>
                      ) : (
                        "-"
                      )}

                    </td>


                    {/* Action */}
                    <td className="px-5 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          handleManageRoles(user)
                        }
                        className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                      >
                        Manage Roles
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* Manage Roles Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Manage Roles
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  {selectedUser.name || "-"}
                </p>

                <p className="text-xs text-gray-400">
                  {selectedUser.email || "-"}
                </p>

              </div>


              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>

            </div>


            {/* Modal Error */}
            {error && (
              <div className="mx-6 mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}


            <div className="p-6">

              {/* Add Role */}
              <div className="mb-7">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Role
                </label>

                <div className="flex gap-3">

                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value)
                    }
                    disabled={loadingRoles}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >

                    <option value="">
                      {loadingRoles
                        ? "Loading roles..."
                        : "-- Select Role --"}
                    </option>

                    {availableRoles.map((role) => (

                      <option
                        key={role._id}
                        value={role._id}
                      >
                        {role.roleName}
                        {role.roleCode
                          ? ` (${role.roleCode})`
                          : ""}
                      </option>

                    ))}

                  </select>


                  <button
                    type="button"
                    onClick={handleAssignRole}
                    disabled={
                      !selectedRole ||
                      assigningRole
                    }
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigningRole
                      ? "Assigning..."
                      : "Assign"}
                  </button>

                </div>

              </div>


              {/* Assigned Roles */}
              <div>

                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Assigned Roles
                </h3>


                {loadingAssignedRoles ? (
                  <div className="border rounded-lg p-8 text-center text-gray-500">
                    Loading assigned roles...
                  </div>
                ) : assignedRoles.length === 0 ? (
                  <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                    No roles assigned to this user.
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y">

                    {assignedRoles.map((item) => {

                      const role = item.roleId;

                      return (
                        <div
                          key={item._id}
                          className="p-4 flex items-center justify-between gap-4"
                        >

                          <div>

                            <p className="font-medium text-gray-800">
                              {role?.roleName || "-"}
                            </p>

                            <p className="text-xs text-gray-500 font-mono mt-1">
                              {role?.roleCode || "-"}
                            </p>

                          </div>


                          <div className="flex items-center gap-2">

                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                item.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>


                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(
                                  item._id
                                )
                              }
                              className={`px-3 py-1.5 text-xs border rounded-lg ${
                                item.isActive
                                  ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                                  : "text-green-600 border-green-200 hover:bg-green-50"
                              }`}
                            >
                              {item.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRole(
                                  item._id
                                )
                              }
                              className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                              Remove
                            </button>

                          </div>

                        </div>
                      );
                    })}

                  </div>
                )}

              </div>

            </div>


            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-end">

              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default UserRoles;