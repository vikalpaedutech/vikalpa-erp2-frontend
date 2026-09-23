import { useEffect, useState } from "react";
import {
  getDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "../../services/district.service";

function Districts() {
  const [districts, setDistricts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    districtId: "",
    districtName: "",
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingDistrict, setEditingDistrict] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDistricts({
        page: 1,
        limit: 100,
      });

      setDistricts(response.data.districts);
    } catch (error) {
      console.error(
        "Failed to fetch districts:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch districts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateDistrict = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setCreateError("");

      await createDistrict({
        districtId: formData.districtId,
        districtName: formData.districtName,
      });

      setFormData({
        districtId: "",
        districtName: "",
      });

      setShowCreateModal(false);

      await fetchDistricts();
    } catch (error) {
      console.error(
        "Failed to create district:",
        error
      );

      setCreateError(
        error.response?.data?.message ||
          "Failed to create district"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCloseCreateModal = () => {
    if (creating) return;

    setShowCreateModal(false);

    setFormData({
      districtId: "",
      districtName: "",
    });

    setCreateError("");
  };

  const handleEditClick = (district) => {
    setEditingDistrict(district);

    setFormData({
      districtId: district.districtId || "",
      districtName: district.districtName || "",
    });

    setUpdateError("");
  };

  const handleCloseEditModal = () => {
    if (updating) return;

    setEditingDistrict(null);

    setFormData({
      districtId: "",
      districtName: "",
    });

    setUpdateError("");
  };

  const handleUpdateDistrict = async (event) => {
    event.preventDefault();

    try {
      setUpdating(true);
      setUpdateError("");

      await updateDistrict(
        editingDistrict._id,
        {
          districtId: formData.districtId,
          districtName: formData.districtName,
        }
      );

      setEditingDistrict(null);

      setFormData({
        districtId: "",
        districtName: "",
      });

      await fetchDistricts();
    } catch (error) {
      console.error(
        "Failed to update district:",
        error
      );

      setUpdateError(
        error.response?.data?.message ||
          "Failed to update district"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteDistrict = async (district) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${district.districtName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(district._id);

      await deleteDistrict(district._id);

      await fetchDistricts();
    } catch (error) {
      console.error(
        "Failed to delete district:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete district"
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
            Districts
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all districts
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError("");
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          + Create District
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-500">
            Loading districts...
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
            onClick={fetchDistricts}
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
                  District ID
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  District Name
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {districts.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No districts found
                  </td>
                </tr>
              ) : (
                districts.map((district) => (
                  <tr
                    key={district._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-gray-700">
                      {district.districtId || "-"}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {district.districtName}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleEditClick(district)
                          }
                          disabled={
                            actionLoading === district._id
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteDistrict(district)
                          }
                          disabled={
                            actionLoading === district._id
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                        >
                          {actionLoading === district._id
                            ? "Deleting..."
                            : "Delete"}
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

      {/* Create District Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create District
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Add a new district
                </p>
              </div>

              <button
                onClick={handleCloseCreateModal}
                disabled={creating}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateDistrict}
              className="p-6"
            >
              {createError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {createError}
                  </p>
                </div>
              )}

              {/* District ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District ID
                </label>

                <input
                  type="text"
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleInputChange}
                  placeholder="Example: 01"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* District Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District Name
                </label>

                <input
                  type="text"
                  name="districtName"
                  value={formData.districtName}
                  onChange={handleInputChange}
                  placeholder="Example: Ambala"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
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
                    : "Create District"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit District Modal */}
      {editingDistrict && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit District
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update district details
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
              onSubmit={handleUpdateDistrict}
              className="p-6"
            >
              {updateError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {updateError}
                  </p>
                </div>
              )}

              {/* District ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District ID
                </label>

                <input
                  type="text"
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* District Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District Name
                </label>

                <input
                  type="text"
                  name="districtName"
                  value={formData.districtName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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

export default Districts;