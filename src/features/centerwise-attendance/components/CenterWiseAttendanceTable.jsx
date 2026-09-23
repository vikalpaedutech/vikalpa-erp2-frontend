// C:\Users\shubh\OneDrive\Desktop\vikalpaerpv2\frontend\src\features\centerwise-attendance\components\CenterWiseAttendanceTable.jsx

import React from "react";

const CenterWiseAttendanceTable = ({
  records = [],
  loading = false,
  selectedCenter = null,
  selectedBatch = null,
  onView,
  onDelete,
}) => {
  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // FORMAT DATE TIME
  // ============================================================

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================================
  // FILE TYPE
  // ============================================================

  const getFileType = (record) => {
    const mimeType =
      record?.fileType ||
      record?.mimeType ||
      record?.file?.mimeType ||
      "";

    if (mimeType === "application/pdf") {
      return "PDF";
    }

    if (
      mimeType === "image/jpeg" ||
      mimeType === "image/jpg"
    ) {
      return "JPG";
    }

    if (mimeType === "image/png") {
      return "PNG";
    }

    const fileName =
      record?.fileName ||
      record?.file?.fileName ||
      record?.originalName ||
      "";

    const extension =
      fileName
        .split(".")
        .pop()
        ?.toUpperCase();

    return extension || "FILE";
  };

  // ============================================================
  // FILE NAME
  // ============================================================

  const getFileName = (record) => {
    return (
      record?.fileName ||
      record?.file?.fileName ||
      record?.originalName ||
      record?.file?.originalName ||
      "Attendance File"
    );
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-h-[220px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="text-sm text-gray-500">
              Loading attendance records...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (!records.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <h3 className="mt-4 text-base font-semibold text-gray-700">
            No attendance uploaded
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            No attendance record was found for the selected filters.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // TABLE
  // ============================================================

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Attendance Records
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {records.length} record
            {records.length !== 1 ? "s" : ""} found.
          </p>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ======================================================= */}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Date
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Center
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Batch
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                File
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Uploaded At
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {records.map((record) => {
              const recordCenter =
                record?.centerId &&
                typeof record.centerId === "object"
                  ? record.centerId
                  : null;

              const recordBatch =
                record?.batchId &&
                typeof record.batchId === "object"
                  ? record.batchId
                  : null;

              return (
                <tr
                  key={record._id}
                  className="transition hover:bg-gray-50"
                >
                  {/* DATE */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                    {formatDate(record.date)}
                  </td>

                  {/* CENTER */}

                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {recordCenter?.centerName ||
                          selectedCenter?.centerName ||
                          record?.centerName ||
                          "-"}
                      </p>

                      {(recordCenter?.centerCode ||
                        selectedCenter?.centerCode ||
                        record?.centerCode) && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          Code:{" "}
                          {recordCenter?.centerCode ||
                            selectedCenter?.centerCode ||
                            record?.centerCode}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* BATCH */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                    {recordBatch?.batchName ||
                      selectedBatch?.batchName ||
                      record?.batchName ||
                      "-"}
                  </td>

                  {/* FILE */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        {getFileType(record)}
                      </span>

                      <span
                        className="max-w-[220px] truncate text-sm text-gray-700"
                        title={getFileName(record)}
                      >
                        {getFileName(record)}
                      </span>
                    </div>
                  </td>

                  {/* UPLOADED AT */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                    {formatDateTime(record.createdAt)}
                  </td>

                  {/* ACTIONS */}

                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onView?.(record._id)
                        }
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDelete?.(record._id)
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CenterWiseAttendanceTable;