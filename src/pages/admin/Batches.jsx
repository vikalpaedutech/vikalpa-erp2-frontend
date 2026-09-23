import { useEffect, useState } from "react";
import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  toggleBatchStatus,
} from "../../services/batch.service";
import { getPrograms } from "../../services/program.service";

function Batches() {
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    programId: "",
    batchName: "",
    startYear: "",
    endYear: "",
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingBatch, setEditingBatch] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [batchResponse, programResponse] = await Promise.all([
        getBatches({
          page: 1,
          limit: 100,
        }),
        getPrograms({
          page: 1,
          limit: 100,
          isActive: true,
        }),
      ]);

      setBatches(batchResponse.data.batches);
      setPrograms(programResponse.data.programs);
    } catch (error) {
      console.error("Failed to fetch batch data:", error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch batches"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateBatch = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setCreateError("");

      await createBatch({
        programId: formData.programId,
        batchName: formData.batchName,
        startYear: Number(formData.startYear),
        endYear: Number(formData.endYear),
      });

      setFormData({
        programId: "",
        batchName: "",
        startYear: "",
        endYear: "",
      });

      setShowCreateModal(false);

      await fetchData();
    } catch (error) {
      console.error("Failed to create batch:", error);

      setCreateError(
        error.response?.data?.message ||
          "Failed to create batch"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    if (creating) return;

    setShowCreateModal(false);

    setFormData({
      programId: "",
      batchName: "",
      startYear: "",
      endYear: "",
    });

    setCreateError("");
  };

  const handleEditClick = (batch) => {
    setEditingBatch(batch);

    setFormData({
      programId: batch.programId?._id || batch.programId || "",
      batchName: batch.batchName || "",
      startYear: batch.startYear || "",
      endYear: batch.endYear || "",
    });

    setUpdateError("");
  };

  const handleCloseEditModal = () => {
    if (updating) return;

    setEditingBatch(null);

    setFormData({
      programId: "",
      batchName: "",
      startYear: "",
      endYear: "",
    });

    setUpdateError("");
  };

  const handleUpdateBatch = async (event) => {
    event.preventDefault();

    try {
      setUpdating(true);
      setUpdateError("");

      await updateBatch(
        editingBatch._id,
        {
          programId: formData.programId,
          batchName: formData.batchName,
          startYear: Number(formData.startYear),
          endYear: Number(formData.endYear),
        }
      );

      setEditingBatch(null);

      setFormData({
        programId: "",
        batchName: "",
        startYear: "",
        endYear: "",
      });

      await fetchData();
    } catch (error) {
      console.error("Failed to update batch:", error);

      setUpdateError(
        error.response?.data?.message ||
          "Failed to update batch"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (batch) => {
    const action = batch.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${batch.batchName}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(batch._id);

      await toggleBatchStatus(batch._id);

      await fetchData();
    } catch (error) {
      console.error(
        "Failed to update batch status:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update batch status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBatch = async (batch) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${batch.batchName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(batch._id);

      await deleteBatch(batch._id);

      await fetchData();
    } catch (error) {
      console.error("Failed to delete batch:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete batch"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Batches
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all batches
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError("");
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          + Create Batch
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-500">
            Loading batches...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <p className="text-red-600">
            {error}
          </p>

          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Program
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Batch
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Start Year
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  End Year
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {batches.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No batches found
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr
                    key={batch._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {batch.programId?.programName || "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {batch.batchName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {batch.startYear}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {batch.endYear}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          batch.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {batch.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleEditClick(batch)
                          }
                          disabled={
                            actionLoading === batch._id
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleToggleStatus(batch)
                          }
                          disabled={
                            actionLoading === batch._id
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
                            batch.isActive
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {actionLoading === batch._id
                            ? "Processing..."
                            : batch.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteBatch(batch)
                          }
                          disabled={
                            actionLoading === batch._id
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create Batch
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Add a new batch
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                disabled={creating}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateBatch}
              className="p-6"
            >
              {createError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {createError}
                  </p>
                </div>
              )}

              {/* Program */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>

                <select
                  name="programId"
                  value={formData.programId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">
                    Select Program
                  </option>

                  {programs.map((program) => (
                    <option
                      key={program._id}
                      value={program._id}
                    >
                      {program.programName} (
                      {program.programCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name
                </label>

                <input
                  type="text"
                  name="batchName"
                  value={formData.batchName}
                  onChange={handleInputChange}
                  placeholder="Example: 2026-28"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Years */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Year
                  </label>

                  <input
                    type="number"
                    name="startYear"
                    value={formData.startYear}
                    onChange={handleInputChange}
                    placeholder="2026"
                    min="2000"
                    max="2100"
                    required
                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Year
                  </label>

                  <input
                    type="number"
                    name="endYear"
                    value={formData.endYear}
                    onChange={handleInputChange}
                    placeholder="2028"
                    min="2000"
                    max="2100"
                    required
                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Batch
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update batch details
                </p>
              </div>

              <button
                onClick={handleCloseEditModal}
                disabled={updating}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateBatch}
              className="p-6"
            >
              {updateError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {updateError}
                  </p>
                </div>
              )}

              {/* Program */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>

                <select
                  name="programId"
                  value={formData.programId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">
                    Select Program
                  </option>

                  {programs.map((program) => (
                    <option
                      key={program._id}
                      value={program._id}
                    >
                      {program.programName} (
                      {program.programCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name
                </label>

                <input
                  type="text"
                  name="batchName"
                  value={formData.batchName}
                  onChange={handleInputChange}
                  placeholder="Example: 2026-28"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Years */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Year
                  </label>

                  <input
                    type="number"
                    name="startYear"
                    value={formData.startYear}
                    onChange={handleInputChange}
                    min="2000"
                    max="2100"
                    required
                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Year
                  </label>

                  <input
                    type="number"
                    name="endYear"
                    value={formData.endYear}
                    onChange={handleInputChange}
                    min="2000"
                    max="2100"
                    required
                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={updating}
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating
                    ? "Updating..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Batches;