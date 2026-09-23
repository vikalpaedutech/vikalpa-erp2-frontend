// C:\Users\shubh\OneDrive\Desktop\vikalpaerpv2\frontend\src\features\centerwise-attendance\components\CenterWiseAttendanceUpload.jsx

import React, { useRef, useState } from "react";
import {
  createCenterWiseAttendance,
} from "../services/centerWiseAttendance.service";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const CenterWiseAttendanceUpload = ({
  isOpen,
  onClose,
  onSuccess,

  programId,
  batchId,
  districtId,
  blockId,
  centerId,
  date,

  programName = "",
  batchName = "",
  districtName = "",
  blockName = "",
  centerName = "",
}) => {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setSelectedFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const handleClose = () => {
    if (uploading) return;

    resetForm();
    onClose?.();
  };

  // ============================================================
  // FILE VALIDATION
  // ============================================================

  const validateFile = (file) => {
    if (!file) {
      return "Please select a file.";
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Only PDF, JPG, JPEG and PNG files are allowed.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be 10 MB or less.";
    }

    return "";
  };

  // ============================================================
  // FILE SELECT
  // ============================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError = validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedFile(file);
  };

  // ============================================================
  // OPEN FILE PICKER
  // ============================================================

  const handleChooseFile = () => {
    if (uploading) return;

    fileInputRef.current?.click();
  };

  // ============================================================
  // UPLOAD
  // ============================================================

  const handleUpload = async () => {
    setError("");

    // ----------------------------------------------------------
    // Required field validation
    // ----------------------------------------------------------

    if (!programId) {
      setError("Program is required.");
      return;
    }

    if (!batchId) {
      setError("Batch is required.");
      return;
    }

    if (!districtId) {
      setError("District is required.");
      return;
    }

    if (!blockId) {
      setError("Block is required.");
      return;
    }

    if (!centerId) {
      setError("Center is required.");
      return;
    }

    if (!date) {
      setError("Date is required.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    // ----------------------------------------------------------
    // File validation
    // ----------------------------------------------------------

    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("programId", programId);
      formData.append("batchId", batchId);
      formData.append("districtId", districtId);
      formData.append("blockId", blockId);
      formData.append("centerId", centerId);
      formData.append("date", date);
      formData.append("file", selectedFile);

      const response =
        await createCenterWiseAttendance(formData);

      onSuccess?.(response);

      resetForm();
      onClose?.();
    } catch (uploadError) {
      console.error(
        "Center-wise attendance upload error:",
        uploadError
      );

      const message =
        uploadError?.response?.data?.message ||
        uploadError?.response?.data?.error ||
        uploadError?.message ||
        "Failed to upload attendance file.";

      setError(message);
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // FILE SIZE FORMATTER
  // ============================================================

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${Math.ceil(bytes / 1024)} KB`;
  };

  // ============================================================
  // DON'T RENDER WHEN CLOSED
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Upload Attendance
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload the center-wise attendance document.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ======================================================
            BODY
        ======================================================= */}

        <div className="space-y-5 px-6 py-5">

          {/* ====================================================
              SELECTED DETAILS
          ===================================================== */}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              {programName && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Program
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {programName}
                  </p>
                </div>
              )}

              {batchName && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Batch
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {batchName}
                  </p>
                </div>
              )}

              {districtName && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    District
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {districtName}
                  </p>
                </div>
              )}

              {blockName && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Block
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {blockName}
                  </p>
                </div>
              )}

              {centerName && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Center
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {centerName}
                  </p>
                </div>
              )}

              {date && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {date}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ====================================================
              FILE UPLOAD AREA
          ===================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Attendance File{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleChooseFile}
              disabled={uploading}
              className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex flex-col items-center">

                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16V4m0 0L8 8m4-4l4 4M4 16.5V19a1 1 0 001 1h14a1 1 0 001-1v-2.5"
                    />
                  </svg>
                </div>

                <p className="text-sm font-medium text-gray-700">
                  Click to select attendance file
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  PDF, JPG, JPEG or PNG — Maximum 10 MB
                </p>
              </div>
            </button>
          </div>

          {/* ====================================================
              SELECTED FILE
          ===================================================== */}

          {selectedFile && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (uploading) return;

                    setSelectedFile(null);
                    setError("");

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={uploading}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* ====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* ====================================================
              INFO
          ===================================================== */}

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs leading-5 text-blue-700">
              Only one attendance file should be uploaded for the
              selected center, batch and date. Maximum allowed file
              size is 10 MB.
            </p>
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ======================================================= */}

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">

          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CenterWiseAttendanceUpload;