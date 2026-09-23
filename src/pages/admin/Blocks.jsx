import { useEffect, useState } from "react";
import {
  getBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
} from "../../services/block.service";
import { getDistricts } from "../../services/district.service";

function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    districtId: "",
    blockId: "",
    blockName: "",
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingBlock, setEditingBlock] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [blockResponse, districtResponse] =
        await Promise.all([
          getBlocks({
            page: 1,
            limit: 100,
            ...(selectedDistrict
              ? { districtId: selectedDistrict }
              : {}),
          }),
          getDistricts({
            page: 1,
            limit: 100,
          }),
        ]);

      setBlocks(blockResponse.data.blocks);
      setDistricts(districtResponse.data.districts);
    } catch (error) {
      console.error(
        "Failed to fetch block data:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch blocks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDistrict]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateBlock = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setCreateError("");

      await createBlock({
        districtId: formData.districtId,
        blockId: formData.blockId,
        blockName: formData.blockName,
      });

      setFormData({
        districtId: "",
        blockId: "",
        blockName: "",
      });

      setShowCreateModal(false);

      await fetchData();
    } catch (error) {
      console.error(
        "Failed to create block:",
        error
      );

      setCreateError(
        error.response?.data?.message ||
          "Failed to create block"
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
      blockId: "",
      blockName: "",
    });

    setCreateError("");
  };

  const handleEditClick = (block) => {
    setEditingBlock(block);

    setFormData({
      districtId: block.districtId?._id || "",
      blockId: block.blockId || "",
      blockName: block.blockName || "",
    });

    setUpdateError("");
  };

  const handleCloseEditModal = () => {
    if (updating) return;

    setEditingBlock(null);

    setFormData({
      districtId: "",
      blockId: "",
      blockName: "",
    });

    setUpdateError("");
  };

  const handleUpdateBlock = async (event) => {
    event.preventDefault();

    try {
      setUpdating(true);
      setUpdateError("");

      await updateBlock(
        editingBlock._id,
        {
          districtId: formData.districtId,
          blockId: formData.blockId,
          blockName: formData.blockName,
        }
      );

      setEditingBlock(null);

      setFormData({
        districtId: "",
        blockId: "",
        blockName: "",
      });

      await fetchData();
    } catch (error) {
      console.error(
        "Failed to update block:",
        error
      );

      setUpdateError(
        error.response?.data?.message ||
          "Failed to update block"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBlock = async (block) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${block.blockName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(block._id);

      await deleteBlock(block._id);

      await fetchData();
    } catch (error) {
      console.error(
        "Failed to delete block:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete block"
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
            Blocks
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all blocks
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError("");
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          + Create Block
        </button>
      </div>

      {/* District Filter */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by District
          </label>

          <select
            value={selectedDistrict}
            onChange={(event) =>
              setSelectedDistrict(event.target.value)
            }
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
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-500">
            Loading blocks...
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
                  District
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Block ID
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Block Name
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {blocks.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No blocks found
                  </td>
                </tr>
              ) : (
                blocks.map((block) => (
                  <tr
                    key={block._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {block.districtId?.districtName ||
                        "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {block.blockId || "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-900">
                      {block.blockName}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleEditClick(block)
                          }
                          disabled={
                            actionLoading === block._id
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteBlock(block)
                          }
                          disabled={
                            actionLoading === block._id
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                        >
                          {actionLoading === block._id
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

      {/* Create Block Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create Block
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Add a new block
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
              onSubmit={handleCreateBlock}
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
                  onChange={handleInputChange}
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

              {/* Block ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block ID
                </label>

                <input
                  type="text"
                  name="blockId"
                  value={formData.blockId}
                  onChange={handleInputChange}
                  placeholder="Example: 01"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Block Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block Name
                </label>

                <input
                  type="text"
                  name="blockName"
                  value={formData.blockName}
                  onChange={handleInputChange}
                  placeholder="Example: Naraingarh"
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
                    : "Create Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Block Modal */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Block
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update block details
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
              onSubmit={handleUpdateBlock}
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
                  onChange={handleInputChange}
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

              {/* Block ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block ID
                </label>

                <input
                  type="text"
                  name="blockId"
                  value={formData.blockId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Block Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block Name
                </label>

                <input
                  type="text"
                  name="blockName"
                  value={formData.blockName}
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

export default Blocks;