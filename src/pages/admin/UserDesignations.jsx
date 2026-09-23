import { useEffect, useMemo, useState } from "react";

import { getUsers } from "../../services/user.service";

import {
  getActiveDepartments,
} from "../../services/department.service";

import {
  getDesignations,
} from "../../services/designation.service";

import {
  getDesignationsByUser,
  assignDesignationToUser,
  toggleUserDesignationStatus,
  removeDesignationFromUser,
} from "../../services/userDesignation.service";

function UserDesignations() {
  const [users, setUsers] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [assignedDesignations, setAssignedDesignations] =
    useState([]);

  const [search, setSearch] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDepartments, setLoadingDepartments] =
    useState(true);
  const [loadingDesignations, setLoadingDesignations] =
    useState(true);

  const [
    loadingAssignedDesignations,
    setLoadingAssignedDesignations,
  ] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [selectedDesignation, setSelectedDesignation] =
    useState("");

  const [isPrimary, setIsPrimary] = useState(false);

  const [assigningDesignation, setAssigningDesignation] =
    useState(false);

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
  // Fetch Departments
  // -----------------------------------------

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);

      const response = await getActiveDepartments();

      setDepartments(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch departments"
      );
    } finally {
      setLoadingDepartments(false);
    }
  };

  // -----------------------------------------
  // Fetch Designations
  // -----------------------------------------

  const fetchDesignations = async () => {
    try {
      setLoadingDesignations(true);

      const response = await getDesignations({
        page: 1,
        limit: 100,
        isActive: "true",
      });

      setDesignations(response.data.designations || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch designations"
      );
    } finally {
      setLoadingDesignations(false);
    }
  };

  // -----------------------------------------
  // Initial Load
  // -----------------------------------------

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  // -----------------------------------------
  // Search
  // -----------------------------------------

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // -----------------------------------------
  // Open Manage Designations
  // -----------------------------------------

  const handleManageDesignations = async (user) => {
    setSelectedUser(user);

    setSelectedDepartment("");
    setSelectedDesignation("");
    setIsPrimary(false);

    setAssignedDesignations([]);
    setError("");

    try {
      setLoadingAssignedDesignations(true);

      const response =
        await getDesignationsByUser(user._id);

      setAssignedDesignations(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch assigned designations"
      );
    } finally {
      setLoadingAssignedDesignations(false);
    }
  };

  // -----------------------------------------
  // Close Modal
  // -----------------------------------------

  const handleCloseModal = () => {
    setSelectedUser(null);

    setSelectedDepartment("");
    setSelectedDesignation("");
    setIsPrimary(false);

    setAssignedDesignations([]);
    setError("");
  };

  // -----------------------------------------
  // Department Change
  // -----------------------------------------

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedDesignation("");
  };

  // -----------------------------------------
  // Designations for Selected Department
  // -----------------------------------------

  const availableDesignations = useMemo(() => {
    if (!selectedDepartment) {
      return [];
    }

    const assignedDesignationIds = new Set(
      assignedDesignations
        .map((item) => item.designationId?._id)
        .filter(Boolean)
    );

    return designations.filter(
      (designation) =>
        String(
          designation.departmentId?._id ||
            designation.departmentId
        ) === String(selectedDepartment) &&
        !assignedDesignationIds.has(
          designation._id
        )
    );
  }, [
    selectedDepartment,
    designations,
    assignedDesignations,
  ]);

  // -----------------------------------------
  // Assign Designation
  // -----------------------------------------

  const handleAssignDesignation = async () => {
    if (
      !selectedUser ||
      !selectedDesignation
    ) {
      return;
    }

    try {
      setAssigningDesignation(true);
      setError("");

      await assignDesignationToUser(
        selectedUser._id,
        selectedDesignation,
        isPrimary
      );

      const response =
        await getDesignationsByUser(
          selectedUser._id
        );

      setAssignedDesignations(
        response.data || []
      );

      setSelectedDepartment("");
      setSelectedDesignation("");
      setIsPrimary(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to assign designation"
      );
    } finally {
      setAssigningDesignation(false);
    }
  };

  // -----------------------------------------
  // Toggle Designation Status
  // -----------------------------------------

  const handleToggleStatus = async (
    userDesignationId
  ) => {
    try {
      setError("");

      await toggleUserDesignationStatus(
        userDesignationId
      );

      const response =
        await getDesignationsByUser(
          selectedUser._id
        );

      setAssignedDesignations(
        response.data || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update designation status"
      );
    }
  };

  // -----------------------------------------
  // Remove Designation
  // -----------------------------------------

  const handleRemoveDesignation = async (
    userDesignationId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this designation from the user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await removeDesignationFromUser(
        userDesignationId
      );

      const response =
        await getDesignationsByUser(
          selectedUser._id
        );

      setAssignedDesignations(
        response.data || []
      );

      setSelectedDepartment("");
      setSelectedDesignation("");
      setIsPrimary(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to remove designation"
      );
    }
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          User Designations
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage designations assigned to users
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
                          handleManageDesignations(
                            user
                          )
                        }
                        className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                      >
                        Manage Designations
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* Manage Designations Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Manage Designations
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

              {/* Add Designation */}
              <div className="mb-7">

                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Add Designation
                </h3>


                {/* Department */}
                <div className="mb-4">

                  <label className="block text-sm text-gray-600 mb-2">
                    Department
                  </label>

                  <select
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                    disabled={loadingDepartments}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >

                    <option value="">
                      {loadingDepartments
                        ? "Loading departments..."
                        : "-- Select Department --"}
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department._id}
                          value={department._id}
                        >
                          {
                            department.departmentName
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>


                {/* Designation */}
                <div className="mb-4">

                  <label className="block text-sm text-gray-600 mb-2">
                    Designation
                  </label>

                  <select
                    value={selectedDesignation}
                    onChange={(e) =>
                      setSelectedDesignation(
                        e.target.value
                      )
                    }
                    disabled={
                      !selectedDepartment ||
                      loadingDesignations
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >

                    <option value="">
                      {!selectedDepartment
                        ? "-- Select Department First --"
                        : loadingDesignations
                        ? "Loading designations..."
                        : availableDesignations.length ===
                          0
                        ? "No available designations"
                        : "-- Select Designation --"}
                    </option>

                    {availableDesignations.map(
                      (designation) => (
                        <option
                          key={designation._id}
                          value={designation._id}
                        >
                          {
                            designation.designation
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>


                {/* Primary */}
                <label className="flex items-center gap-2 mb-4 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) =>
                      setIsPrimary(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4"
                  />

                  <span className="text-sm text-gray-700">
                    Make this the primary designation
                  </span>

                </label>


                {/* Assign Button */}
                <button
                  type="button"
                  onClick={handleAssignDesignation}
                  disabled={
                    !selectedDesignation ||
                    assigningDesignation
                  }
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningDesignation
                    ? "Assigning..."
                    : "Assign Designation"}
                </button>

              </div>


              {/* Assigned Designations */}
              <div>

                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Assigned Designations
                </h3>


                {loadingAssignedDesignations ? (
                  <div className="border rounded-lg p-8 text-center text-gray-500">
                    Loading designations...
                  </div>
                ) : assignedDesignations.length ===
                  0 ? (
                  <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                    No designations assigned to this user.
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y">

                    {assignedDesignations.map(
                      (item) => {

                        const designation =
                          item.designationId;

                        const department =
                          designation?.departmentId;

                        return (
                          <div
                            key={item._id}
                            className="p-4 flex items-center justify-between gap-4"
                          >

                            <div>

                              <p className="font-medium text-gray-800">
                                {
                                  designation?.designation ||
                                  "-"
                                }
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                {
                                  department?.departmentName ||
                                  "-"
                                }
                              </p>

                              <div className="flex gap-2 mt-2">

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

                                {item.isPrimary && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    Primary
                                  </span>
                                )}

                              </div>

                            </div>


                            <div className="flex items-center gap-2">

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
                                  handleRemoveDesignation(
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
                      }
                    )}

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

export default UserDesignations;