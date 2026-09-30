import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  bulkOnboardUsers,
  downloadBulkUserOnboardingRequirements,
  downloadBulkUserOnboardingTemplate,
} from "../../services/user.service";
import { getRoles } from "../../services/role.service";
import { getDesignations } from "../../services/designation.service";

const SCOPES = [
  { value: "global", label: "Global", help: "No region IDs are required." },
  { value: "district", label: "District", help: "Enter one or more district ObjectIds, comma-separated." },
  { value: "block", label: "Block", help: "Enter one or more block ObjectIds. District is derived automatically." },
  { value: "center", label: "Center", help: "Enter one or more center ObjectIds. District and block are derived automatically." },
];

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function BulkOnboardUsers() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roleCode, setRoleCode] = useState("");
  const [designationCode, setDesignationCode] = useState("");
  const [regionScope, setRegionScope] = useState("");
  const [userCount, setUserCount] = useState("");

  const [file, setFile] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadingRequirements, setDownloadingRequirements] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadMetadata = async () => {
      try {
        setLoadingMeta(true);
        const [rolesResponse, designationsResponse] = await Promise.all([
          getRoles({ page: 1, limit: 100, isActive: "true" }),
          getDesignations({ page: 1, limit: 100, isActive: "true" }),
        ]);

        if (!mounted) return;

        setRoles(rolesResponse?.data?.roles || []);
        setDesignations(designationsResponse?.data?.designations || []);
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || "Failed to load roles and designations.");
        }
      } finally {
        if (mounted) setLoadingMeta(false);
      }
    };

    loadMetadata();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedRole = useMemo(
    () => roles.find((role) => String(role.roleCode).toLowerCase() === String(roleCode).toLowerCase()),
    [roles, roleCode]
  );

  const selectedDesignation = useMemo(
    () => designations.find(
      (designation) =>
        String(designation.designationCode).toLowerCase() ===
        String(designationCode).toLowerCase()
    ),
    [designations, designationCode]
  );

  const selectedScope = SCOPES.find((scope) => scope.value === regionScope);
  const numericUserCount = Number(userCount);

  const canDownload =
    Boolean(roleCode) &&
    Boolean(designationCode) &&
    Boolean(regionScope) &&
    Number.isInteger(numericUserCount) &&
    numericUserCount >= 1 &&
    numericUserCount <= 500;

  const handleDownloadRequirements = async () => {
    try {
      setDownloadingRequirements(true);
      setError("");
      const blob = await downloadBulkUserOnboardingRequirements();
      downloadBlob(blob, "bulk-user-onboarding-requirements.xlsx");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to download requirements file.");
    } finally {
      setDownloadingRequirements(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!canDownload) return;

    try {
      setDownloading(true);
      setError("");
      setSuccess("");

      const blob = await downloadBulkUserOnboardingTemplate({
        roleCode,
        designationCode,
        regionScope,
        userCount: numericUserCount,
      });

      downloadBlob(
        blob,
        `bulk-user-onboarding-${regionScope}-${numericUserCount}.xlsx`
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to download onboarding template.");
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
      setSuccess(response?.message || "Users onboarded successfully.");
      setResult(response?.data || null);
      setFile(null);

      const input = document.getElementById("bulk-user-file");
      if (input) input.value = "";
    } catch (err) {
      setError(err.response?.data?.message || "Failed to bulk onboard users.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/admin/users")}
              className="mb-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              ← Users
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Bulk User Onboarding</h1>
            <p className="mt-1 max-w-3xl text-sm text-gray-500">
              Choose the fixed values first. The generated Excel contains exactly the selected number of rows and pre-fills role, designation and region scope.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadRequirements}
            disabled={downloadingRequirements || loadingMeta}
            className="rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingRequirements ? "Downloading..." : "Download Requirements"}
          </button>
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

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Step 1 — Prepare Template</h2>
            <p className="mt-1 text-sm text-gray-500">
              These four values control the template structure and its prefilled fields.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Select Role <span className="text-red-500">*</span></span>
              <select
                value={roleCode}
                onChange={(event) => setRoleCode(event.target.value)}
                disabled={loadingMeta}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role.roleCode}>
                    {role.roleName} ({role.roleCode})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Select Designation <span className="text-red-500">*</span></span>
              <select
                value={designationCode}
                onChange={(event) => setDesignationCode(event.target.value)}
                disabled={loadingMeta}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select designation</option>
                {designations.map((designation) => (
                  <option key={designation._id} value={designation.designationCode}>
                    {designation.designation} ({designation.designationCode})
                  </option>
                ))}
              </select>
              {selectedDesignation?.departmentId && (
                <p className="mt-1 text-xs text-gray-500">
                  Department: {selectedDesignation.departmentId.departmentName} ({selectedDesignation.departmentId.departmentCode})
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Region Scope <span className="text-red-500">*</span></span>
              <select
                value={regionScope}
                onChange={(event) => setRegionScope(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select scope</option>
                {SCOPES.map((scope) => (
                  <option key={scope.value} value={scope.value}>{scope.label}</option>
                ))}
              </select>
              {selectedScope && <p className="mt-1 text-xs text-gray-500">{selectedScope.help}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Number of Users <span className="text-red-500">*</span></span>
              <input
                type="number"
                min="1"
                max="500"
                value={userCount}
                onChange={(event) => setUserCount(event.target.value)}
                placeholder="e.g. 50"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">Maximum 500 users per upload.</p>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-xl bg-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-indigo-900">Template preview</p>
              <p className="mt-1 text-sm text-indigo-700">
                {canDownload
                  ? `${numericUserCount} rows • ${roleCode.toUpperCase()} • ${designationCode.toUpperCase()} • ${regionScope}`
                  : "Select all four values to generate the template."}
              </p>
              {selectedRole && <p className="mt-1 text-xs text-indigo-600">Role: {selectedRole.roleName}</p>}
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={!canDownload || downloading}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading ? "Downloading..." : "Download Template"}
            </button>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900">Step 2 — Upload Completed Template</h2>
            <p className="mt-1 text-sm text-gray-500">
              Fill user details, applicable region IDs and optional program/batch IDs, then upload the Excel file.
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
                  <p className="text-sm font-semibold text-gray-900">Selected file</p>
                  <p className="mt-1 text-sm text-gray-600">{file.name}</p>
                  <p className="mt-1 text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Onboarding Users..." : "Bulk Onboard Users"}
            </button>

            {result && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
                <h3 className="font-semibold text-green-900">Onboarding Summary</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Total Records", result.totalRecords],
                    ["Users Created", result.usersCreated],
                    ["Roles Assigned", result.rolesAssigned],
                    ["Designations Assigned", result.designationsAssigned],
                    ["Region Access Records", result.regionAccessAssigned],
                    ["Program/Batch Access", result.programBatchAccessAssigned],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="mt-1 text-xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">How the template works</h2>
            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-800">Department</p>
                <p className="mt-1">Not shown in the user template. Backend derives it from designation.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Primary designation</p>
                <p className="mt-1">Every bulk-onboarded user gets the selected designation as primary.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Multiple regions</p>
                <p className="mt-1">Use comma-separated ObjectIds in the applicable region column.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Parent regions</p>
                <p className="mt-1">Block access derives district. Center access derives district and block.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Global</p>
                <p className="mt-1">No district, block or center column is included.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Transaction safety</p>
                <p className="mt-1">If a row fails validation, the complete upload is rolled back.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default BulkOnboardUsers;
