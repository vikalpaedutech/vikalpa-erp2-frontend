import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  bulkOnboardUsers,
  downloadBulkUserOnboardingTemplate,
} from "../../services/user.service";

function BulkOnboardUsers() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState(null);

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      setError("");

      const blob = await downloadBulkUserOnboardingTemplate();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "bulk-user-onboarding-template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to download onboarding template."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    setError("");
    setSuccess("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV, XLS or XLSX file.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setResult(null);

      const response = await bulkOnboardUsers(file);

      setSuccess(
        response?.message ||
          "Users onboarded successfully."
      );

      setResult(response?.data || null);
      setFile(null);

      const input = document.getElementById(
        "bulk-user-file"
      );

      if (input) {
        input.value = "";
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to bulk onboard users."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="mb-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            ← Users
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bulk User Onboarding
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Register users and assign role, department/designation,
                region access and optional program/batch access in one upload.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloading}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
            >
              {downloading
                ? "Downloading..."
                : "Download Template"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900">
              Upload Users
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Download the template, fill one row per user, then upload it.
            </p>

            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
              <input
                id="bulk-user-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-semibold file:text-white"
              />

              {file && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Selected file
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Onboarding Users..."
                : "Bulk Onboard Users"}
            </button>

            {result && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
                <h3 className="font-semibold text-green-900">
                  Onboarding Summary
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Total Records
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {result.totalRecords}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Users Created
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {result.usersCreated}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Roles Assigned
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {result.rolesAssigned}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Designations Assigned
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {result.designationsAssigned}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Region Access Assigned
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {result.regionAccessAssigned}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Program/Batch Access
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {result.programBatchAccessAssigned}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Template Fields
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              {[
                ["userId", "Unique login user ID"],
                ["name", "Employee name"],
                ["email", "Login email"],
                ["contact", "Contact number"],
                ["password", "Initial password"],
                ["roleCode", "Role code, e.g. cc / aci"],
                ["departmentCode", "Department code"],
                ["designationCode", "Designation code"],
                ["regionScope", "global / district / block / center"],
                ["districtId", "MongoDB District ObjectId"],
                ["blockId", "MongoDB Block ObjectId"],
                ["centerId", "MongoDB Center ObjectId"],
                ["programIds", "Comma-separated ObjectIds"],
                ["batchIds", "Comma-separated ObjectIds"],
                ["isActive", "true / false"],
              ].map(([field, description]) => (
                <div key={field}>
                  <p className="font-semibold text-gray-800">
                    {field}
                  </p>
                  <p className="text-xs text-gray-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-yellow-50 p-4 text-xs leading-5 text-yellow-800">
              The uploaded file is processed as one transaction.
              If any row is invalid or duplicated, the complete upload is
              rejected and no partial users are created.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default BulkOnboardUsers;
