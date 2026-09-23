import { useState } from "react";

import {
  bulkOnboardStudents,
  downloadBulkOnboardingTemplate,
} from "../../services/student.service";

function BulkOnboardStudents() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);

  // ============================================================
  // FILE SELECT
  // ============================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setFile(selectedFile || null);
    setResult(null);
  };

  // ============================================================
  // DOWNLOAD TEMPLATE
  // ============================================================

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);

      const blob =
        await downloadBulkOnboardingTemplate();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "student-bulk-onboarding-template.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Failed to download template:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to download template"
      );
    } finally {
      setDownloading(false);
    }
  };

  // ============================================================
  // UPLOAD
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please select an Excel or CSV file");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response =
        await bulkOnboardStudents(file);

      setResult(response);

      alert(
        response.message ||
          "Students onboarded successfully"
      );

      setFile(null);

      event.target.reset();
    } catch (error) {
      console.error(
        "Bulk onboarding failed:",
        error
      );

      const errorData =
        error.response?.data;

      setResult(errorData || null);

      alert(
        errorData?.message ||
          "Bulk onboarding failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESULT HELPERS
  // ============================================================

  const getResultValue = (key) => {
    return (
      result?.data?.[key] ??
      result?.[key] ??
      0
    );
  };

  return (
    <div className="p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Bulk Onboard Students
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Upload an Excel or CSV file to onboard
          multiple students
        </p>
      </div>

      {/* ======================================================
          TEMPLATE
      ====================================================== */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Step 1 — Download Template
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Use the official template before
              uploading student data.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloading}
            className="rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading
              ? "Downloading..."
              : "Download Template"}
          </button>
        </div>
      </div>

      {/* ======================================================
          UPLOAD
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-2 text-lg font-semibold text-gray-800">
          Step 2 — Upload Student File
        </h2>

        <p className="mb-5 text-sm text-gray-500">
          Supported formats: Excel (.xlsx, .xls) and
          CSV
        </p>

        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="mx-auto block w-full max-w-md text-sm"
          />

          {file && (
            <div className="mt-4 text-sm text-gray-700">
              Selected file:{" "}
              <span className="font-semibold">
                {file.name}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!file || loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Uploading..."
              : "Upload & Onboard"}
          </button>
        </div>
      </form>

      {/* ======================================================
          RESULT
      ====================================================== */}

      {/* ======================================================
    RESULT
====================================================== */}

{result && (
  <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="mb-5 text-lg font-semibold text-gray-800">
      Upload Result
    </h2>

    {result.message && (
      <p className="mb-5 text-sm text-gray-600">
        {result.message}
      </p>
    )}

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-xs text-gray-500">
          Total Records
        </p>

        <p className="mt-1 text-xl font-bold text-gray-800">
          {result.data?.totalRecords ?? 0}
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-xs text-gray-500">
          Students Created
        </p>

        <p className="mt-1 text-xl font-bold text-green-600">
          {result.data?.studentsCreated ?? 0}
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-xs text-gray-500">
          Enrollments Created
        </p>

        <p className="mt-1 text-xl font-bold text-blue-600">
          {result.data?.enrollmentsCreated ?? 0}
        </p>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default BulkOnboardStudents;