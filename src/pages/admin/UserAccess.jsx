import { useEffect, useState } from "react";

import { getUsers } from "../../services/user.service";
import { getPrograms } from "../../services/program.service";
import { getBatches } from "../../services/batch.service";

import {
  getUserAccessByUserId,
  createUserAccess,
  updateUserAccess,
} from "../../services/userAccess.service";

function UserAccess() {
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  const [search, setSearch] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPrograms, setLoadingPrograms] =
    useState(true);
  const [loadingBatches, setLoadingBatches] =
    useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userAccessId, setUserAccessId] = useState(null);

  const [selectedPrograms, setSelectedPrograms] =
    useState([]);

  const [selectedBatches, setSelectedBatches] =
    useState([]);

  const [loadingAccess, setLoadingAccess] =
    useState(false);

  const [saving, setSaving] = useState(false);

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
  // Fetch Programs
  // -----------------------------------------

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);

      const response = await getPrograms({
        page: 1,
        limit: 100,
        isActive: "true",
      });

      setPrograms(response.data.programs || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch programs"
      );
    } finally {
      setLoadingPrograms(false);
    }
  };

  // -----------------------------------------
  // Fetch Batches
  // -----------------------------------------

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);

      const response = await getBatches({
        page: 1,
        limit: 100,
        isActive: "true",
      });

      setBatches(response.data.batches || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch batches"
      );
    } finally {
      setLoadingBatches(false);
    }
  };

  // -----------------------------------------
  // Initial Load
  // -----------------------------------------

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    fetchPrograms();
    fetchBatches();
  }, []);

  // -----------------------------------------
  // Search
  // -----------------------------------------

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // -----------------------------------------
  // Open Manage Access
  // -----------------------------------------

  const handleManageAccess = async (user) => {
    setSelectedUser(user);

    setSelectedPrograms([]);
    setSelectedBatches([]);
    setUserAccessId(null);

    setError("");

    try {
      setLoadingAccess(true);

      const response =
        await getUserAccessByUserId(user._id);

      const access = response.data;

      if (access) {
        setUserAccessId(access._id);

        setSelectedPrograms(
          (access.programIds || []).map(
            (program) =>
              program._id || program
          )
        );

        setSelectedBatches(
          (access.batchIds || []).map(
            (batch) => batch._id || batch
          )
        );
      }
    } catch (err) {
      // User without access is a valid state.
      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch user access"
        );
      }
    } finally {
      setLoadingAccess(false);
    }
  };

  // -----------------------------------------
  // Close Modal
  // -----------------------------------------

  const handleCloseModal = () => {
    setSelectedUser(null);
    setUserAccessId(null);

    setSelectedPrograms([]);
    setSelectedBatches([]);

    setError("");
  };

  // -----------------------------------------
  // Toggle Program
  // -----------------------------------------

  const handleProgramToggle = (programId) => {
    setSelectedPrograms((previous) => {
      if (previous.includes(programId)) {
        return previous.filter(
          (id) => id !== programId
        );
      }

      return [...previous, programId];
    });

    // Remove batches belonging to a deselected
    // program.
    setSelectedBatches((previous) => {
      const programBatchIds = batches
        .filter(
          (batch) =>
            String(
              batch.programId?._id ||
                batch.programId
            ) === String(programId)
        )
        .map((batch) => batch._id);

      return previous.filter(
        (batchId) =>
          !programBatchIds.includes(batchId)
      );
    });
  };

  // -----------------------------------------
  // Toggle Batch
  // -----------------------------------------

  const handleBatchToggle = (batchId) => {
    setSelectedBatches((previous) => {
      if (previous.includes(batchId)) {
        return previous.filter(
          (id) => id !== batchId
        );
      }

      return [...previous, batchId];
    });
  };

  // -----------------------------------------
  // Save Access
  // -----------------------------------------

  const handleSaveAccess = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (userAccessId) {
        await updateUserAccess(
          userAccessId,
          selectedPrograms,
          selectedBatches
        );
      } else {
        const response =
          await createUserAccess(
            selectedUser._id,
            selectedPrograms,
            selectedBatches
          );

        setUserAccessId(
          response.data?._id || null
        );
      }

      alert("User access updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save user access"
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // Get Batches for Selected Programs
  // -----------------------------------------

  const availableBatches = batches.filter(
    (batch) =>
      selectedPrograms.some(
        (programId) =>
          String(
            batch.programId?._id ||
              batch.programId
          ) === String(programId)
      )
  );

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          User Access
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage program and batch access for users
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


                    <td className="px-5 py-4 text-gray-600">
                      {user.email || "-"}
                    </td>


                    <td className="px-5 py-4 text-gray-600">
                      {user.contact || "-"}
                    </td>


                    <td className="px-5 py-4">

                      {user.userId ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {user.userId}
                        </span>
                      ) : (
                        "-"
                      )}

                    </td>


                    <td className="px-5 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          handleManageAccess(user)
                        }
                        className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                      >
                        Manage Access
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* Manage Access Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="px-6 py-5 border-b flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Manage User Access
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


            {/* Error */}
            {error && (
              <div className="mx-6 mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}


            {loadingAccess ? (
              <div className="p-10 text-center text-gray-500">
                Loading access...
              </div>
            ) : (
              <div className="p-6">

                {/* Programs */}
                <div className="mb-7">

                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Programs
                  </h3>

                  {loadingPrograms ? (
                    <div className="text-sm text-gray-500">
                      Loading programs...
                    </div>
                  ) : programs.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No active programs available.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      {programs.map((program) => {

                        const checked =
                          selectedPrograms.includes(
                            program._id
                          );

                        return (
                          <label
                            key={program._id}
                            className={`border rounded-lg p-4 cursor-pointer transition ${
                              checked
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >

                            <div className="flex items-start gap-3">

                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  handleProgramToggle(
                                    program._id
                                  )
                                }
                                className="mt-1 w-4 h-4"
                              />

                              <div>

                                <p className="font-medium text-gray-800">
                                  {
                                    program.programName
                                  }
                                </p>

                                <p className="text-xs text-gray-500 font-mono mt-1">
                                  {
                                    program.programCode
                                  }
                                </p>

                              </div>

                            </div>

                          </label>
                        );
                      })}

                    </div>
                  )}

                </div>


                {/* Batches */}
                <div className="mb-7">

                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Batches
                  </h3>

                  {loadingBatches ? (
                    <div className="text-sm text-gray-500">
                      Loading batches...
                    </div>
                  ) : selectedPrograms.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-6 text-center text-sm text-gray-500">
                      Select a program first to manage its batches.
                    </div>
                  ) : availableBatches.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-6 text-center text-sm text-gray-500">
                      No batches available for the selected programs.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      {availableBatches.map(
                        (batch) => {

                          const checked =
                            selectedBatches.includes(
                              batch._id
                            );

                          const program =
                            programs.find(
                              (item) =>
                                String(
                                  item._id
                                ) ===
                                String(
                                  batch.programId?._id ||
                                    batch.programId
                                )
                            );

                          return (
                            <label
                              key={batch._id}
                              className={`border rounded-lg p-4 cursor-pointer transition ${
                                checked
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >

                              <div className="flex items-start gap-3">

                                <input
                                  type="checkbox"
                                  checked={
                                    checked
                                  }
                                  onChange={() =>
                                    handleBatchToggle(
                                      batch._id
                                    )
                                  }
                                  className="mt-1 w-4 h-4"
                                />

                                <div>

                                  <p className="font-medium text-gray-800">
                                    {
                                      batch.batchName
                                    }
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {
                                      program?.programName ||
                                      "-"
                                    }
                                  </p>

                                  <p className="text-xs text-gray-400 mt-1">
                                    {
                                      batch.startYear
                                    }{" "}
                                    -{" "}
                                    {
                                      batch.endYear
                                    }
                                  </p>

                                </div>

                              </div>

                            </label>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>


                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">

                  <p className="text-sm font-medium text-gray-700">
                    Access Summary
                  </p>

                  <div className="flex gap-6 mt-2 text-sm text-gray-500">

                    <span>
                      Programs:{" "}
                      <strong className="text-gray-800">
                        {selectedPrograms.length}
                      </strong>
                    </span>

                    <span>
                      Batches:{" "}
                      <strong className="text-gray-800">
                        {selectedBatches.length}
                      </strong>
                    </span>

                  </div>

                </div>


                {/* Save */}
                <div className="flex justify-end gap-3">

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAccess}
                    disabled={saving}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Access"}
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default UserAccess;