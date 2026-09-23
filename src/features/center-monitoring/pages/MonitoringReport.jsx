import { useState } from "react";

import MonitoringReportFilters from "../components/MonitoringReportFilters";

import {
  getCenterMonitoringReport,
} from "../services/centerMonitoring.service";

const MonitoringReport = () => {
  const [report, setReport] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // FETCH FULL REPORT
  // ==========================================================

  const handleSearch = async (filters) => {
    if (!filters) {
      setReport([]);
      setSummary(null);
      setSearched(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      setError("");

      const response =
        await getCenterMonitoringReport(filters);

      console.log(
        "=============================================="
      );

      console.log(
        "FULL MONITORING REPORT API RESPONSE"
      );

      console.log(response);

      console.log(
        "FULL REPORT WRAPPER:",
        response?.data
      );

      console.log(
        "FULL REPORT DATA:",
        response?.data?.data
      );

      console.log(
        "FULL REPORT SUMMARY:",
        response?.data?.summary
      );

      console.log(
        "=============================================="
      );

      // ======================================================
      // BACKEND RESPONSE:
      //
      // {
      //   success: true,
      //   data: {
      //      reportMode: "full",
      //      filters: {...},
      //      summary: {...},
      //      data: [...]
      //   }
      // }
      // ======================================================

      const reportData =
        response?.data?.data;

      const reportSummary =
        response?.data?.summary;

      setReport(
        Array.isArray(reportData)
          ? reportData
          : []
      );

      setSummary(
        reportSummary || null
      );
    } catch (error) {
      console.error(
        "Failed to load monitoring report:",
        error
      );

      setReport([]);
      setSummary(null);

      setError(
        error?.response?.data?.message ||
          "Failed to load monitoring report"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DOWNLOAD CSV
  // ==========================================================

  const handleDownload = () => {
    if (!report.length) {
      return;
    }

    const headers = [
      "Program",
      "Batch",
      "User Name",
      "User Email",
      "District",
      "Block",
      "Center",
      "Discipline",
      "Remark",
      "Date",
    ];

    const escapeCSV = (value) => {
      const stringValue =
        String(value ?? "");

      return `"${stringValue.replace(
        /"/g,
        '""'
      )}"`;
    };

    const rows = report.map(
      (row) => {
        return [
          row.programName,
          row.batchName,
          row.userName,
          row.userEmail,
          row.districtName,
          row.blockName,
          row.centerName,
          row.discipline,
          row.remark,
          row.date,
        ]
          .map(escapeCSV)
          .join(",");
      }
    );

    const csv = [
      headers
        .map(escapeCSV)
        .join(","),

      ...rows,
    ].join("\n");

    const blob = new Blob(
      [
        "\uFEFF" + csv,
      ],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "center-monitoring-full-report.csv";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  // ==========================================================
  // DISCIPLINE STYLE
  // ==========================================================

  const getDisciplineClasses =
    (discipline) => {
      switch (discipline) {
        case "Excellent":
          return "bg-green-100 text-green-700 border border-green-200";

        case "Good":
          return "bg-emerald-50 text-emerald-700 border border-emerald-200";

        case "Average":
          return "bg-yellow-50 text-yellow-700 border border-yellow-200";

        case "Poor":
          return "bg-red-50 text-red-700 border border-red-200";

        case "Camera Off":
          return "bg-gray-100 text-gray-700 border border-gray-200";

        case "Not marked":
          return "bg-orange-50 text-orange-700 border border-orange-200";

        default:
          return "bg-gray-100 text-gray-700 border border-gray-200";
      }
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Monitoring Report
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Complete center monitoring report
          </p>
        </div>

        {report.length > 0 && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download Report
          </button>
        )}
      </div>

      {/* ====================================================
          FILTER CARD
      ==================================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Report Filters
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select program, batch, district and date range
            for the report.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <MonitoringReportFilters
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
      </div>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ====================================================
          SUMMARY
      ==================================================== */}

      {summary && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* TOTAL ROWS */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Total Rows
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {summary.totalRows ??
                0}
            </p>
          </div>

          {/* MARKED */}

          <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Marked
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {summary.markedRows ??
                0}
            </p>
          </div>

          {/* NOT MARKED */}

          <div className="rounded-xl border border-orange-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Not Marked
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {summary.notMarkedRows ??
                0}
            </p>
          </div>

          {/* TOTAL CENTERS */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Total Centers
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {summary.totalCenters ??
                0}
            </p>
          </div>
        </div>
      )}

      {/* ====================================================
          REPORT TABLE CARD
      ==================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* TABLE HEADER */}

        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Monitoring Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Complete monitoring data for the selected
            filters.
          </p>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading monitoring report...
            </p>
          </div>
        ) : searched &&
          report.length === 0 ? (
          /* ==================================================
             EMPTY RESULT
          ================================================== */

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <span className="text-xl text-slate-400">
                —
              </span>
            </div>

            <h3 className="text-base font-semibold text-slate-800">
              No monitoring data found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              No monitoring records were found for the
              selected program, batch, district and date
              range.
            </p>
          </div>
        ) : report.length > 0 ? (
          /* ==================================================
             TABLE
          ================================================== */

          <div className="overflow-x-auto">
            <table className="min-w-[1250px] w-full border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    #
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Program
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Batch
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User Name
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User Email
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    District
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Block
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Center
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Discipline
                  </th>

                  <th className="min-w-[220px] whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Remark
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={
                        row._id ||
                        `${row.centerId}-${row.date}-${index}`
                      }
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                        {row.programName ||
                          "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {row.batchName ||
                          "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                        {row.userName ||
                          "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {row.userEmail ||
                          "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {row.districtName ||
                          "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {row.blockName ||
                          "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                        {row.centerName ||
                          "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getDisciplineClasses(
                            row.discipline
                          )}`}
                        >
                          {row.discipline ||
                            "-"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="max-w-[300px] truncate">
                          {row.remark ||
                            "-"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {row.date ||
                          "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ==================================================
             INITIAL STATE
          ================================================== */

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <span className="text-xl text-blue-500">
                📊
              </span>
            </div>

            <h3 className="text-base font-semibold text-slate-800">
              Select report filters
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Select the required filters and click
              <span className="font-semibold text-slate-700">
                {" "}
                View Report
              </span>{" "}
              to load monitoring data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringReport;