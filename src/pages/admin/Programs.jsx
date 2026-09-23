import { useEffect, useState } from "react";
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  toggleProgramStatus,
} from "../../services/program.service";

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    programName: "",
    programCode: "",
    description: "",
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingProgram, setEditingProgram] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPrograms({
        page: 1,
        limit: 100,
      });

      setPrograms(response.data.programs);
    } catch (error) {
      console.error("Failed to fetch programs:", error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch programs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateProgram = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setCreateError("");

      await createProgram(formData);

      setFormData({
        programName: "",
        programCode: "",
        description: "",
      });

      setShowCreateModal(false);

      await fetchPrograms();
    } catch (error) {
      console.error("Failed to create program:", error);

      setCreateError(
        error.response?.data?.message ||
          "Failed to create program"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    if (creating) return;

    setShowCreateModal(false);

    setFormData({
      programName: "",
      programCode: "",
      description: "",
    });

    setCreateError("");
  };

  const handleEditClick = (program) => {
    setEditingProgram(program);

    setFormData({
      programName: program.programName || "",
      programCode: program.programCode || "",
      description: program.description || "",
    });

    setUpdateError("");
  };

  const handleCloseEditModal = () => {
    if (updating) return;

    setEditingProgram(null);

    setFormData({
      programName: "",
      programCode: "",
      description: "",
    });

    setUpdateError("");
  };

  const handleUpdateProgram = async (event) => {
    event.preventDefault();

    try {
      setUpdating(true);
      setUpdateError("");

      await updateProgram(
        editingProgram._id,
        formData
      );

      setEditingProgram(null);

      setFormData({
        programName: "",
        programCode: "",
        description: "",
      });

      await fetchPrograms();
    } catch (error) {
      console.error("Failed to update program:", error);

      setUpdateError(
        error.response?.data?.message ||
          "Failed to update program"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (program) => {
    const action = program.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${program.programName}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(program._id);

      await toggleProgramStatus(program._id);

      await fetchPrograms();
    } catch (error) {
      console.error(
        "Failed to update program status:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update program status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProgram = async (program) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${program.programName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(program._id);

      await deleteProgram(program._id);

      await fetchPrograms();
    } catch (error) {
      console.error("Failed to delete program:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete program"
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
            Programs
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all programs
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError("");
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          + Create Program
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-500">
            Loading programs...
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
            onClick={fetchPrograms}
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
                  Program Name
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Code
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Description
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
              {programs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No programs found
                  </td>
                </tr>
              ) : (
                programs.map((program) => (
                  <tr
                    key={program._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {program.programName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {program.programCode}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {program.description || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          program.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {program.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleEditClick(program)
                          }
                          disabled={
                            actionLoading === program._id
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleToggleStatus(program)
                          }
                          disabled={
                            actionLoading === program._id
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
                            program.isActive
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {actionLoading === program._id
                            ? "Processing..."
                            : program.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteProgram(program)
                          }
                          disabled={
                            actionLoading === program._id
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

      {/* Create Program Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create Program
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Add a new program
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

            {/* Form */}
            <form
              onSubmit={handleCreateProgram}
              className="p-6"
            >
              {createError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {createError}
                  </p>
                </div>
              )}

              {/* Program Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Name
                </label>

                <input
                  type="text"
                  name="programName"
                  value={formData.programName}
                  onChange={handleInputChange}
                  placeholder="Enter program name"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Program Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Code
                </label>

                <input
                  type="text"
                  name="programCode"
                  value={formData.programCode}
                  onChange={handleInputChange}
                  placeholder="Enter program code"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter program description"
                  rows="4"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
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
                    : "Create Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {editingProgram && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Program
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update program details
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

            {/* Form */}
            <form
              onSubmit={handleUpdateProgram}
              className="p-6"
            >
              {updateError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {updateError}
                  </p>
                </div>
              )}

              {/* Program Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Name
                </label>

                <input
                  type="text"
                  name="programName"
                  value={formData.programName}
                  onChange={handleInputChange}
                  placeholder="Enter program name"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Program Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Code
                </label>

                <input
                  type="text"
                  name="programCode"
                  value={formData.programCode}
                  onChange={handleInputChange}
                  placeholder="Enter program code"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter program description"
                  rows="4"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
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

export default Programs;