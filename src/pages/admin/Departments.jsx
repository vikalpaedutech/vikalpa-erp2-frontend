import { useEffect, useState } from "react";

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
} from "../../services/department.service";

function Departments() {
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState(null);

  const [formData, setFormData] = useState({
    departmentName: "",
    departmentCode: "",
  });

  // -----------------------------------------
  // Fetch Departments
  // -----------------------------------------

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDepartments({
        page: 1,
        limit: 100,
      });

      setDepartments(response.data?.departments || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch departments"
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Initial Load
  // -----------------------------------------

  useEffect(() => {
    fetchDepartments();
  }, []);

  // -----------------------------------------
  // Open Create Modal
  // -----------------------------------------

  const handleCreate = () => {
    setEditingDepartment(null);

    setFormData({
      departmentName: "",
      departmentCode: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // -----------------------------------------
  // Open Edit Modal
  // -----------------------------------------

  const handleEdit = (department) => {
    setEditingDepartment(department);

    setFormData({
      departmentName: department.departmentName || "",
      departmentCode: department.departmentCode || "",
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
    setEditingDepartment(null);

    setFormData({
      departmentName: "",
      departmentCode: "",
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

    if (!formData.departmentName.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!formData.departmentCode.trim()) {
      setError("Department code is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingDepartment) {
        await updateDepartment(
          editingDepartment._id,
          {
            departmentName:
              formData.departmentName.trim(),
            departmentCode:
              formData.departmentCode.trim(),
          }
        );

        setSuccess(
          "Department updated successfully."
        );
      } else {
        await createDepartment({
          departmentName:
            formData.departmentName.trim(),
          departmentCode:
            formData.departmentCode.trim(),
        });

        setSuccess(
          "Department created successfully."
        );
      }

      await fetchDepartments();

      setShowModal(false);
      setEditingDepartment(null);

      setFormData({
        departmentName: "",
        departmentCode: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save department"
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // Toggle Status
  // -----------------------------------------

  const handleToggleStatus = async (department) => {
    const action = department.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this department?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await toggleDepartmentStatus(
        department._id
      );

      setDepartments((previous) =>
        previous.map((item) =>
          item._id === department._id
            ? {
                ...item,
                isActive: !item.isActive,
              }
            : item
        )
      );

      setSuccess(
        `Department ${action}d successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${action} department`
      );
    }
  };

  // -----------------------------------------
  // Delete Department
  // -----------------------------------------

  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${department.departmentName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteDepartment(
        department._id
      );

      setDepartments((previous) =>
        previous.filter(
          (item) => item._id !== department._id
        )
      );

      setSuccess(
        "Department deleted successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete department"
      );
    }
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
            Departments
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage organization departments
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Department
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


      {/* Departments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">

        <div className="px-5 py-4 border-b">

          <h2 className="font-semibold text-gray-800">
            Department List
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            {departments.length} departments
          </p>

        </div>


        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No departments found.
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
                    Department Name
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Department Code
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

                {departments.map(
                  (department, index) => (

                    <tr
                      key={department._id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-5 py-4 text-gray-500">
                        {index + 1}
                      </td>


                      <td className="px-5 py-4">

                        <span className="font-medium text-gray-800">
                          {department.departmentName ||
                            "-"}
                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {department.departmentCode ||
                            "-"}
                        </span>

                      </td>


                      <td className="px-5 py-4">

                        {department.isActive ? (
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
                                department
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
                                department
                              )
                            }
                            className={`px-3 py-1.5 text-xs rounded-lg border ${
                              department.isActive
                                ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                                : "text-green-600 border-green-200 hover:bg-green-50"
                            }`}
                          >
                            {department.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                department
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
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {editingDepartment
                    ? "Update department details"
                    : "Create a new department"}
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

              {/* Department Name */}
              <div className="mb-5">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name
                </label>

                <input
                  type="text"
                  name="departmentName"
                  value={
                    formData.departmentName
                  }
                  onChange={handleChange}
                  placeholder="Enter department name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>


              {/* Department Code */}
              <div className="mb-6">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Code
                </label>

                <input
                  type="text"
                  name="departmentCode"
                  value={
                    formData.departmentCode
                  }
                  onChange={handleChange}
                  placeholder="Enter department code"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    : editingDepartment
                    ? "Update Department"
                    : "Create Department"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Departments;