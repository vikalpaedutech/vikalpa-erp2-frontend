import { useEffect, useState } from "react";

import {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  toggleDesignationStatus,
} from "../../services/designation.service";

import { getDepartments } from "../../services/department.service";

function Designations() {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingDesignation, setEditingDesignation] =
    useState(null);

  const [formData, setFormData] = useState({
    departmentId: "",
    designation: "",
    designationCode: "",
  });

  // -----------------------------------------
  // Fetch Designations
  // -----------------------------------------

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDesignations({
        page: 1,
        limit: 100,
      });

      setDesignations(
        response.data?.designations || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch designations"
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Fetch Departments
  // -----------------------------------------

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);

      const response = await getDepartments({
        page: 1,
        limit: 100,
      });

      setDepartments(
        response.data?.departments || []
      );
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
  // Initial Load
  // -----------------------------------------

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, []);

  // -----------------------------------------
  // Open Create Modal
  // -----------------------------------------

  const handleCreate = () => {
    setEditingDesignation(null);

    setFormData({
      departmentId: "",
      designation: "",
      designationCode: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // -----------------------------------------
  // Open Edit Modal
  // -----------------------------------------

  const handleEdit = (designation) => {
    setEditingDesignation(designation);

    setFormData({
      departmentId:
        designation.departmentId?._id ||
        designation.departmentId ||
        "",
      designation:
        designation.designation || "",
      designationCode:
        designation.designationCode || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // -----------------------------------------
  // Close Modal
  // -----------------------------------------

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingDesignation(null);

    setFormData({
      departmentId: "",
      designation: "",
      designationCode: "",
    });

    setError("");
  };

  // -----------------------------------------
  // Form Change
  // -----------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -----------------------------------------
  // Submit Form
  // -----------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!formData.designation.trim()) {
      setError("Designation name is required.");
      return;
    }

    if (!formData.designationCode.trim()) {
      setError("Designation code is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const designationData = {
        departmentId: formData.departmentId,
        designation: formData.designation.trim(),
        designationCode:
          formData.designationCode.trim(),
      };

      if (editingDesignation) {
        await updateDesignation(
          editingDesignation._id,
          designationData
        );

        setSuccess(
          "Designation updated successfully."
        );
      } else {
        await createDesignation(
          designationData
        );

        setSuccess(
          "Designation created successfully."
        );
      }

      await fetchDesignations();

      setShowModal(false);
      setEditingDesignation(null);

      setFormData({
        departmentId: "",
        designation: "",
        designationCode: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save designation"
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // Toggle Status
  // -----------------------------------------

  const handleToggleStatus = async (
    designation
  ) => {
    const action = designation.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this designation?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await toggleDesignationStatus(
        designation._id
      );

      setDesignations((previous) =>
        previous.map((item) =>
          item._id === designation._id
            ? {
                ...item,
                isActive: !item.isActive,
              }
            : item
        )
      );

      setSuccess(
        `Designation ${action}d successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${action} designation`
      );
    }
  };

  // -----------------------------------------
  // Delete Designation
  // -----------------------------------------

  const handleDelete = async (
    designation
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${designation.designation}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteDesignation(
        designation._id
      );

      setDesignations((previous) =>
        previous.filter(
          (item) =>
            item._id !== designation._id
        )
      );

      setSuccess(
        "Designation deleted successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete designation"
      );
    }
  };

  // -----------------------------------------
  // Get Department Name
  // -----------------------------------------

  const getDepartmentName = (
    designation
  ) => {
    if (
      designation.departmentId &&
      typeof designation.departmentId ===
        "object"
    ) {
      return (
        designation.departmentId.departmentName ||
        "-"
      );
    }

    const department = departments.find(
      (item) =>
        item._id === designation.departmentId
    );

    return department?.departmentName || "-";
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Designations
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage employee designations
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Designation
        </button>

      </div>


      {/* Error */}
      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-5">
          {error}
        </div>
      )}


      {/* Success */}
      {success && !showModal && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-5">
          {success}
        </div>
      )}


      {/* Designations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">

        <div className="px-5 py-4 border-b">

          <h2 className="font-semibold text-gray-800">
            Designation List
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            {designations.length} designations
          </p>

        </div>


        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading designations...
          </div>
        ) : designations.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No designations found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    #
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Designation
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Code
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Department
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="text-right px-5 py-3 font-semibold text-gray-600">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {designations.map(
                  (designation, index) => (

                    <tr
                      key={designation._id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-5 py-4 text-gray-500">
                        {index + 1}
                      </td>


                      <td className="px-5 py-4">

                        <span className="font-medium text-gray-800">
                          {designation.designation ||
                            "-"}
                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {designation.designationCode ||
                            "-"}
                        </span>

                      </td>


                      <td className="px-5 py-4 text-gray-600">
                        {getDepartmentName(
                          designation
                        )}
                      </td>


                      <td className="px-5 py-4">

                        {designation.isActive ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Inactive
                          </span>
                        )}

                      </td>


                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                designation
                              )
                            }
                            className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                designation
                              )
                            }
                            className={`px-3 py-1.5 text-xs rounded-lg border ${
                              designation.isActive
                                ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                                : "text-green-600 border-green-200 hover:bg-green-50"
                            }`}
                          >
                            {designation.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                designation
                              )
                            }
                            className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  {editingDesignation
                    ? "Edit Designation"
                    : "Add Designation"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {editingDesignation
                    ? "Update designation details"
                    : "Create a new designation"}
                </p>

              </div>


              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none disabled:opacity-50"
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


            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              {/* Department */}
              <div className="mb-5">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>

                <select
                  name="departmentId"
                  value={
                    formData.departmentId
                  }
                  onChange={handleChange}
                  disabled={
                    loadingDepartments ||
                    saving
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >

                  <option value="">
                    {loadingDepartments
                      ? "Loading departments..."
                      : "-- Select Department --"}
                  </option>

                  {departments
                    .filter(
                      (department) =>
                        department.isActive
                    )
                    .map((department) => (

                      <option
                        key={department._id}
                        value={department._id}
                      >
                        {department.departmentName}
                      </option>

                    ))}

                </select>

              </div>


              {/* Designation */}
              <div className="mb-5">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>

                <input
                  type="text"
                  name="designation"
                  value={
                    formData.designation
                  }
                  onChange={handleChange}
                  placeholder="Enter designation"
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />

              </div>


              {/* Designation Code */}
              <div className="mb-6">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation Code
                </label>

                <input
                  type="text"
                  name="designationCode"
                  value={
                    formData.designationCode
                  }
                  onChange={handleChange}
                  placeholder="Enter designation code"
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />

              </div>


              {/* Actions */}
              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : editingDesignation
                    ? "Update Designation"
                    : "Create Designation"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Designations;