import {
  useEffect,
  useState,
} from "react";

import {
  useRegionAccess,
} from "../../../context/RegionAccessContext";

import ProgramDropdown from "../../../components/common/dropdowns/ProgramDropdown";
import BatchDropdown from "../../../components/common/dropdowns/BatchDropdown";

import {
  getCenterMonitoringReport,
} from "../services/centerMonitoring.service";


// ============================================================
// Helpers
// ============================================================

const getToday = () => {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


// ============================================================
// Monitoring Individual Report
// ============================================================

function MonitoringIndividualReport() {

  // ==========================================================
  // Region Access
  // ==========================================================

  const {
    programAccess,
  } = useRegionAccess();


  const programs =
    programAccess?.programs || [];

  const batches =
    programAccess?.batches || [];


  // ==========================================================
  // Filter State
  // ==========================================================

  const [programId, setProgramId] =
    useState("");

  const [batchId, setBatchId] =
    useState("");

  const [fromDate, setFromDate] =
    useState(getToday());

  const [toDate, setToDate] =
    useState(getToday());


  // ==========================================================
  // Report State
  // ==========================================================

  const [report, setReport] =
    useState([]);

  const [summary, setSummary] =
    useState(null);


  // ==========================================================
  // UI State
  // ==========================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // PROGRAM AUTO-SELECTION
  // ==========================================================
  //
  // Rules:
  //
  // 1 program  -> automatically select it
  // >1         -> dropdown remains visible
  // 0          -> blank
  //
  // IMPORTANT:
  // We do NOT use ProgramDropdown's autoSelectSingle here.
  // Parent remains the source of truth.
  // ==========================================================

  useEffect(() => {

    if (programs.length === 1) {

      const onlyProgramId =
        String(
          programs[0]?._id
        );

      setProgramId(
        (currentProgramId) => {

          if (
            String(currentProgramId) ===
            onlyProgramId
          ) {
            return currentProgramId;
          }

          return onlyProgramId;
        }
      );

      return;
    }


    if (programs.length === 0) {

      setProgramId("");

      setBatchId("");

      return;
    }


    // --------------------------------------------------------
    // Multiple programs
    //
    // Keep manually selected program if it still exists.
    // Otherwise clear it.
    // --------------------------------------------------------

    setProgramId(
      (currentProgramId) => {

        const exists =
          programs.some(
            (program) =>
              String(program?._id) ===
              String(currentProgramId)
          );

        if (exists) {
          return currentProgramId;
        }

        return "";
      }
    );

  }, [
    programs,
  ]);


  // ==========================================================
  // GET BATCHES FOR SELECTED PROGRAM
  // ==========================================================

  const availableBatches =
    batches.filter(
      (batch) => {

        const batchProgramId =
          batch?.programId?._id ||
          batch?.programId;

        return (
          String(batchProgramId) ===
          String(programId)
        );
      }
    );


  // ==========================================================
  // BATCH AUTO-SELECTION
  // ==========================================================
  //
  // Rules:
  //
  // 0 batches -> blank
  // 1 batch    -> automatically select it
  // >1 batches -> BLANK + show dropdown
  //
  // This fixes the exact issue where 2025-27 was being
  // automatically selected before 2026-28 finished loading.
  // ==========================================================

  useEffect(() => {

    // --------------------------------------------------------
    // No program selected
    // --------------------------------------------------------

    if (!programId) {

      setBatchId("");

      return;
    }


    // --------------------------------------------------------
    // No batches
    // --------------------------------------------------------

    if (availableBatches.length === 0) {

      setBatchId("");

      return;
    }


    // --------------------------------------------------------
    // Exactly ONE batch
    // --------------------------------------------------------

    if (
      availableBatches.length === 1
    ) {

      const onlyBatchId =
        String(
          availableBatches[0]?._id
        );

      setBatchId(
        (currentBatchId) => {

          if (
            String(currentBatchId) ===
            onlyBatchId
          ) {
            return currentBatchId;
          }

          return onlyBatchId;
        }
      );

      return;
    }


    // --------------------------------------------------------
    // MULTIPLE BATCHES
    // --------------------------------------------------------
    //
    // IMPORTANT:
    // Do NOT select the first batch.
    //
    // If currently selected batch is not one of the available
    // batches, clear it.
    //
    // If user has manually selected a valid batch, keep it.
    // --------------------------------------------------------

    setBatchId(
      (currentBatchId) => {

        if (!currentBatchId) {
          return "";
        }


        const selectedBatchStillExists =
          availableBatches.some(
            (batch) =>
              String(batch?._id) ===
              String(currentBatchId)
          );


        if (
          selectedBatchStillExists
        ) {
          return currentBatchId;
        }


        return "";
      }
    );

  }, [
    programId,
    batches,
    availableBatches,
  ]);


  // ==========================================================
  // PROGRAM CHANGE
  // ==========================================================

  const handleProgramChange = (
    newProgramId
  ) => {

    /*
     * Whenever program changes:
     *
     * old batch must immediately be removed.
     *
     * Example:
     *
     * Program A
     *   Batch X
     *
     * change to
     *
     * Program B
     *   Batch Y
     *
     * We must not send Batch X with Program B.
     */

    setProgramId(
      newProgramId
    );

    setBatchId("");

    setError("");

    setReport([]);

    setSummary(null);

  };


  // ==========================================================
  // BATCH CHANGE
  // ==========================================================

  const handleBatchChange = (
    newBatchId
  ) => {

    setBatchId(
      newBatchId
    );

    setError("");

    setReport([]);

    setSummary(null);

  };


  // ==========================================================
  // SEARCH / VIEW REPORT
  // ==========================================================

  const handleSearch = async () => {

    // --------------------------------------------------------
    // Program validation
    // --------------------------------------------------------

    if (!programId) {

      setError(
        "Please select a Program."
      );

      return;
    }


    // --------------------------------------------------------
    // Batch validation
    // --------------------------------------------------------

    if (!batchId) {

      setError(
        "Please select a Batch."
      );

      return;
    }


    // --------------------------------------------------------
    // Date validation
    // --------------------------------------------------------

    if (
      !fromDate ||
      !toDate
    ) {

      setError(
        "Please select both From Date and To Date."
      );

      return;
    }


    if (
      fromDate >
      toDate
    ) {

      setError(
        "From Date cannot be greater than To Date."
      );

      return;
    }


    try {

      setLoading(true);

      setError("");

      setReport([]);

      setSummary(null);


      // ------------------------------------------------------
      // IMPORTANT
      //
      // These are the exact IDs that will be sent.
      // ------------------------------------------------------

      const response =
        await getCenterMonitoringReport({

          programId:
            String(programId),

          batchId:
            String(batchId),

          fromDate,

          toDate,

        });

        console.log(
  "================================================"
);

console.log(
  "INDIVIDUAL REPORT API RESPONSE"
);

console.log(
  response
);

console.log(
  "REPORT DATA:",
  response?.data?.data
);

console.log(
  "REPORT SUMMARY:",
  response?.data?.summary
);

console.log(
  "================================================"
);


      const responseData =
        response?.data || {};


      setReport(
        responseData?.data || []
      );


      setSummary(
        responseData?.summary || null
      );

    } catch (err) {

      console.error(
        "Failed to load individual monitoring report:",
        err
      );


      setReport([]);

      setSummary(null);


      setError(
        err?.response?.data?.message ||
        "Failed to load monitoring report."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // RESET
  // ==========================================================

  const handleReset = () => {

    const today =
      getToday();


    setProgramId("");

    setBatchId("");

    setFromDate(today);

    setToDate(today);

    setReport([]);

    setSummary(null);

    setError("");

  };


  // ==========================================================
  // DOWNLOAD CSV
  // ==========================================================

  const handleDownload = () => {

    if (
      !report ||
      report.length === 0
    ) {
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


    const rows =
      report.map(
        (item) => [

          item?.programName ||
            "",

          item?.batchName ||
            "",

          item?.userName ||
            "",

          item?.userEmail ||
            "",

          item?.districtName ||
            "",

          item?.blockName ||
            "",

          item?.centerName ||
            "",

          item?.discipline ||
            "",

          item?.remark ||
            "",

          item?.date ||
            "",

        ]
      );


    const csvContent =
      [
        headers,
        ...rows,
      ]
        .map(
          (row) =>
            row
              .map(
                (value) => {

                  const stringValue =
                    String(
                      value ?? ""
                    );

                  return `"${stringValue.replace(
                    /"/g,
                    '""'
                  )}"`;

                }
              )
              .join(",")
        )
        .join("\n");


    const blob =
      new Blob(
        [
          "\uFEFF" +
            csvContent,
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
      "my-center-monitoring-report.csv";


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
  // RENDER
  // ==========================================================

  return (

    <div className="space-y-6 p-4 md:p-6">


      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            My Monitoring Report
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View your center monitoring records for the
            selected program, batch and date range.
          </p>

        </div>


        <button
          type="button"
          onClick={
            handleDownload
          }
          disabled={
            loading ||
            report.length === 0
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download Report
        </button>

      </div>


      {/* ======================================================
          FILTER CARD
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-5">

          <h2 className="text-base font-semibold text-gray-800">
            Report Filters
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Select Program, Batch and date range for your
            monitoring report.
          </p>

        </div>


        {/* ====================================================
            PROGRAM + BATCH
        ==================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* --------------------------------------------------
              PROGRAM
          -------------------------------------------------- */}

          <ProgramDropdown
            programs={programs}
            value={programId}
            onChange={
              handleProgramChange
            }
            label="Program"
            placeholder="Select Program"

            /*
             * IMPORTANT:
             *
             * Parent handles auto-selection.
             *
             * So we disable ProgramDropdown's internal
             * auto-selection to avoid selecting an option
             * before all access data is loaded.
             */

            autoSelectSingle={false}

            /*
             * If only one program exists, hide dropdown.
             */

            hideWhenSingle={true}

            required={true}
          />


          {/* --------------------------------------------------
              BATCH
          -------------------------------------------------- */}

          <BatchDropdown
            batches={batches}
            programId={programId}
            value={batchId}
            onChange={
              handleBatchChange
            }
            label="Batch"
            placeholder="Select Batch"

            /*
             * IMPORTANT:
             *
             * Parent handles batch auto-selection.
             *
             * This prevents the first batch
             * (2025-27) from being selected while
             * the second batch (2026-28) is still loading.
             */

            autoSelectSingle={false}

            /*
             * If exactly one batch exists,
             * BatchDropdown hides itself.
             *
             * Parent will automatically select
             * that single batch.
             */

            hideWhenSingle={true}

            required={true}
          />

        </div>


        {/* ====================================================
            DATE RANGE
        ==================================================== */}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* --------------------------------------------------
              FROM DATE
          -------------------------------------------------- */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={
                (event) =>
                  setFromDate(
                    event.target.value
                  )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* --------------------------------------------------
              TO DATE
          -------------------------------------------------- */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={
                (event) =>
                  setToDate(
                    event.target.value
                  )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>

        )}


        {/* ====================================================
            BUTTONS
        ==================================================== */}

        <div className="mt-5 flex flex-wrap gap-2">

          <button
            type="button"
            onClick={
              handleSearch
            }
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : "View Report"}
          </button>


          <button
            type="button"
            onClick={
              handleReset
            }
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

        </div>

      </div>


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      {summary && (

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Rows
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-800">
              {summary?.totalRows ?? 0}
            </p>

          </div>


          <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Marked
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {summary?.markedRows ?? 0}
            </p>

          </div>


          <div className="rounded-xl border border-orange-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Not Marked
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-600">
              {summary?.notMarkedRows ?? 0}
            </p>

          </div>


          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Centers
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-800">
              {summary?.totalCenters ?? 0}
            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          REPORT TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-5 py-4">

          <h2 className="text-base font-semibold text-gray-800">
            Monitoring Records
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Only your monitoring records are shown here.
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="min-w-[1400px] w-full text-left text-sm">

            <thead className="bg-gray-50">

              <tr>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  Program
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  Batch
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  User Name
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  User Email
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  District
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  Block
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  Center
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  Discipline
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  Remark
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-600">
                  Date
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>

                  <td
                    colSpan="10"
                    className="px-6 py-12 text-center"
                  >

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading report...
                    </p>

                  </td>

                </tr>

              ) : report.length === 0 ? (

                <tr>

                  <td
                    colSpan="10"
                    className="px-6 py-12 text-center"
                  >

                    <p className="text-sm font-medium text-gray-600">
                      No monitoring records found.
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Select filters and click View Report.
                    </p>

                  </td>

                </tr>

              ) : (

                report.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={
                        item?._id ||
                        `${item?.centerId}-${item?.date}-${index}`
                      }
                      className="transition hover:bg-gray-50"
                    >

                      <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                        {item?.programName || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                        {item?.batchName || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-800">
                        {item?.userName || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                        {item?.userEmail || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                        {item?.districtName || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                        {item?.blockName || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-800">
                        {item?.centerName || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">

                        {item?.discipline ===
                        "Not marked" ? (

                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            Not marked
                          </span>

                        ) : (

                          <span className="font-medium text-gray-700">
                            {item?.discipline || "-"}
                          </span>

                        )}

                      </td>

                      <td className="max-w-xs px-4 py-4 text-gray-600">

                        <div className="truncate">
                          {item?.remark || "-"}
                        </div>

                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                        {item?.date || "-"}
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}


export default MonitoringIndividualReport;