import { useEffect, useState } from "react";
import {
  getCenters,
  createCenter,
  updateCenter,
  deleteCenter,
} from "../../services/center.service";
import { getDistricts } from "../../services/district.service";
import { getBlocks } from "../../services/block.service";

function Centers() {
  const [centers, setCenters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    districtId: "",
    blockId: "",
    centerCode: "",
    centerName: "",
    isCenterAvailable: true,
    availableClasses: "",
    availableBoard: "",
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingCenter, setEditingCenter] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  // Fetch districts
  const fetchDistricts = async () => {
    try {
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
    }
  };

  // Fetch blocks based on district
  const fetchBlocks = async (districtId) => {
    if (!districtId) {
      setBlocks([]);
      return;
    }

    try {
      const response = await getBlocks({
        page: 1,
        limit: 100,
        districtId,
      });

      setBlocks(response.data.blocks);
    } catch (error) {
      console.error(
        "Failed to fetch blocks:",
        error
      );

      setBlocks([]);
    }
  };

  // Fetch centers
  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCenters({
        page: 1,
        limit: 100,
        ...(selectedDistrict
          ? { districtId: selectedDistrict }
          : {}),
        ...(selectedBlock
          ? { blockId: selectedBlock }
          : {}),
      });

      setCenters(response.data.centers);
    } catch (error) {
      console.error(
        "Failed to fetch centers:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch centers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    fetchBlocks(selectedDistrict);
  }, [selectedDistrict]);

  useEffect(() => {
    fetchCenters();
  }, [selectedDistrict, selectedBlock]);

  // Handle filter district
  const handleDistrictFilterChange = (event) => {
    const districtId = event.target.value;

    setSelectedDistrict(districtId);
    setSelectedBlock("");
  };

  // Handle filter block
  const handleBlockFilterChange = (event) => {
    setSelectedBlock(event.target.value);
  };

  // Handle form inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle form district
  const handleFormDistrictChange = async (event) => {
    const districtId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      districtId,
      blockId: "",
    }));

    await fetchBlocks(districtId);
  };

  // Convert classes string into number array
  const parseClasses = (value) => {
    if (!value.trim()) {
      return [];
    }

    return value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => !Number.isNaN(item));
  };

  // Convert board string into array
  const parseBoards = (value) => {
    if (!value.trim()) {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  // Create center
  const handleCreateCenter = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setCreateError("");

      await createCenter({
        districtId: formData.districtId,
        blockId: formData.blockId,
        centerCode: formData.centerCode,
        centerName: formData.centerName,
        isCenterAvailable: formData.isCenterAvailable,
        availableClasses: parseClasses(
          formData.availableClasses
        ),
        availableBoard: parseBoards(
          formData.availableBoard
        ),
      });

      setFormData({
        districtId: "",
        blockId: "",
        centerCode: "",
        centerName: "",
        isCenterAvailable: true,
        availableClasses: "",
        availableBoard: "",
      });

      setBlocks([]);
      setShowCreateModal(false);

      await fetchCenters();
    } catch (error) {
      console.error(
        "Failed to create center:",
        error
      );

      setCreateError(
        error.response?.data?.message ||
          "Failed to create center"
      );
    } finally {
      setCreating(false);
    }
  };

  // Close create modal
  const handleCloseCreateModal = () => {
    if (creating) return;

    setShowCreateModal(false);

    setFormData({
      districtId: "",
      blockId: "",
      centerCode: "",
      centerName: "",
      isCenterAvailable: true,
      availableClasses: "",
      availableBoard: "",
    });

    setBlocks([]);
    setCreateError("");
  };

  // Open edit modal
  const handleEditClick = async (center) => {
    setEditingCenter(center);

    const districtId =
      center.districtId?._id || "";

    await fetchBlocks(districtId);

    setFormData({
      districtId,
      blockId: center.blockId?._id || "",
      centerCode: center.centerCode || "",
      centerName: center.centerName || "",
      isCenterAvailable:
        center.isCenterAvailable ?? true,
      availableClasses:
        center.availableClasses?.join(", ") || "",
      availableBoard:
        center.availableBoard?.join(", ") || "",
    });

    setUpdateError("");
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    if (updating) return;

    setEditingCenter(null);

    setFormData({
      districtId: "",
      blockId: "",
      centerCode: "",
      centerName: "",
      isCenterAvailable: true,
      availableClasses: "",
      availableBoard: "",
    });

    setBlocks([]);
    setUpdateError("");
  };

  // Update center
  const handleUpdateCenter = async (event) => {
    event.preventDefault();

    try {
      setUpdating(true);
      setUpdateError("");

      await updateCenter(
        editingCenter._id,
        {
          districtId: formData.districtId,
          blockId: formData.blockId,
          centerCode: formData.centerCode,
          centerName: formData.centerName,
          isCenterAvailable:
            formData.isCenterAvailable,
          availableClasses: parseClasses(
            formData.availableClasses
          ),
          availableBoard: parseBoards(
            formData.availableBoard
          ),
        }
      );

      setEditingCenter(null);

      setFormData({
        districtId: "",
        blockId: "",
        centerCode: "",
        centerName: "",
        isCenterAvailable: true,
        availableClasses: "",
        availableBoard: "",
      });

      setBlocks([]);

      await fetchCenters();
    } catch (error) {
      console.error(
        "Failed to update center:",
        error
      );

      setUpdateError(
        error.response?.data?.message ||
          "Failed to update center"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Delete center
  const handleDeleteCenter = async (center) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${center.centerName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(center._id);

      await deleteCenter(center._id);

      await fetchCenters();
    } catch (error) {
      console.error(
        "Failed to delete center:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete center"
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
            Centers
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all centers
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError("");
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          + Create Center
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* District Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by District
            </label>

            <select
              value={selectedDistrict}
              onChange={handleDistrictFilterChange}
              className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">
                All Districts
              </option>

              {districts.map((district) => (
                <option
                  key={district._id}
                  value={district._id}
                >
                  {district.districtName}
                  {district.districtId
                    ? ` (${district.districtId})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Block Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Block
            </label>

            <select
              value={selectedBlock}
              onChange={handleBlockFilterChange}
              disabled={!selectedDistrict}
              className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="">
                All Blocks
              </option>

              {blocks.map((block) => (
                <option
                  key={block._id}
                  value={block._id}
                >
                  {block.blockName}
                  {block.blockId
                    ? ` (${block.blockId})`
                    : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-500">
            Loading centers...
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
            onClick={fetchCenters}
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
                  District
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Block
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Center Code
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Center Name
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Availability
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {centers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No centers found
                  </td>
                </tr>
              ) : (
                centers.map((center) => (
                  <tr
                    key={center._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {center.districtId
                        ?.districtName || "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {center.blockId?.blockName ||
                        "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {center.centerCode}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {center.centerName}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          center.isCenterAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {center.isCenterAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleEditClick(center)
                          }
                          disabled={
                            actionLoading === center._id
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteCenter(center)
                          }
                          disabled={
                            actionLoading === center._id
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                        >
                          {actionLoading === center._id
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

      {/* Create Center Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create Center
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Add a new center
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
              onSubmit={handleCreateCenter}
              className="p-6"
            >
              {createError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {createError}
                  </p>
                </div>
              )}

              {/* District */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>

                <select
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleFormDistrictChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">
                    Select District
                  </option>

                  {districts.map((district) => (
                    <option
                      key={district._id}
                      value={district._id}
                    >
                      {district.districtName}
                      {district.districtId
                        ? ` (${district.districtId})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block
                </label>

                <select
                  name="blockId"
                  value={formData.blockId}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.districtId}
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
                >
                  <option value="">
                    {formData.districtId
                      ? "Select Block"
                      : "Select District First"}
                  </option>

                  {blocks.map((block) => (
                    <option
                      key={block._id}
                      value={block._id}
                    >
                      {block.blockName}
                      {block.blockId
                        ? ` (${block.blockId})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Center Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center Code
                </label>

                <input
                  type="text"
                  name="centerCode"
                  value={formData.centerCode}
                  onChange={handleInputChange}
                  placeholder="Example: C001"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Center Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center Name
                </label>

                <input
                  type="text"
                  name="centerName"
                  value={formData.centerName}
                  onChange={handleInputChange}
                  placeholder="Example: Government School"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Availability */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center Availability
                </label>

                <select
                  name="isCenterAvailable"
                  value={
                    formData.isCenterAvailable
                      ? "true"
                      : "false"
                  }
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      isCenterAvailable:
                        event.target.value === "true",
                    }))
                  }
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="true">
                    Available
                  </option>

                  <option value="false">
                    Unavailable
                  </option>
                </select>
              </div>

              {/* Available Classes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Classes
                </label>

                <input
                  type="text"
                  name="availableClasses"
                  value={formData.availableClasses}
                  onChange={handleInputChange}
                  placeholder="Example: 9, 10, 11, 12"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Enter class numbers separated by commas.
                </p>
              </div>

              {/* Available Board */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Board
                </label>

                <input
                  type="text"
                  name="availableBoard"
                  value={formData.availableBoard}
                  onChange={handleInputChange}
                  placeholder="Example: HBSE, CBSE"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Enter boards separated by commas.
                </p>
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
                    : "Create Center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Center Modal */}
      {editingCenter && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Center
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update center details
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
              onSubmit={handleUpdateCenter}
              className="p-6"
            >
              {updateError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {updateError}
                  </p>
                </div>
              )}

              {/* District */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>

                <select
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleFormDistrictChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">
                    Select District
                  </option>

                  {districts.map((district) => (
                    <option
                      key={district._id}
                      value={district._id}
                    >
                      {district.districtName}
                      {district.districtId
                        ? ` (${district.districtId})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block
                </label>

                <select
                  name="blockId"
                  value={formData.blockId}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.districtId}
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
                >
                  <option value="">
                    {formData.districtId
                      ? "Select Block"
                      : "Select District First"}
                  </option>

                  {blocks.map((block) => (
                    <option
                      key={block._id}
                      value={block._id}
                    >
                      {block.blockName}
                      {block.blockId
                        ? ` (${block.blockId})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Center Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center Code
                </label>

                <input
                  type="text"
                  name="centerCode"
                  value={formData.centerCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Center Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center Name
                </label>

                <input
                  type="text"
                  name="centerName"
                  value={formData.centerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Availability */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center Availability
                </label>

                <select
                  value={
                    formData.isCenterAvailable
                      ? "true"
                      : "false"
                  }
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      isCenterAvailable:
                        event.target.value === "true",
                    }))
                  }
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="true">
                    Available
                  </option>

                  <option value="false">
                    Unavailable
                  </option>
                </select>
              </div>

              {/* Available Classes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Classes
                </label>

                <input
                  type="text"
                  name="availableClasses"
                  value={formData.availableClasses}
                  onChange={handleInputChange}
                  placeholder="Example: 9, 10, 11, 12"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Enter class numbers separated by commas.
                </p>
              </div>

              {/* Available Board */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Board
                </label>

                <input
                  type="text"
                  name="availableBoard"
                  value={formData.availableBoard}
                  onChange={handleInputChange}
                  placeholder="Example: HBSE, CBSE"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Enter boards separated by commas.
                </p>
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

export default Centers;