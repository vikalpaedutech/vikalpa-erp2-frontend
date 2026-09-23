import { useEffect, useState } from "react";

import {
  getMonitoringReportOptions,
} from "../services/centerMonitoring.service";

const getToday = () => {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const MonitoringReportFilters = ({
  onSearch,
  loading = false,
}) => {
  const [options, setOptions] = useState({
    programs: [],
    batches: [],
    districts: [],
  });

  const [programId, setProgramId] =
    useState("");

  const [batchId, setBatchId] =
    useState("");

  const [districtId, setDistrictId] =
    useState("");

  const [fromDate, setFromDate] =
    useState(getToday());

  const [toDate, setToDate] =
    useState(getToday());

  const [error, setError] =
    useState("");

  // ==========================================================
  // LOAD REPORT OPTIONS
  // ==========================================================

  useEffect(() => {
    const loadOptions =
      async () => {
        try {
          const response =
            await getMonitoringReportOptions();

          console.log(
            "MONITORING REPORT OPTIONS:",
            response
          );

          const data =
            response?.data || {};

          setOptions({
            programs:
              Array.isArray(
                data.programs
              )
                ? [...data.programs].sort(
                    (a, b) =>
                      String(
                        a.programName ||
                          ""
                      ).localeCompare(
                        String(
                          b.programName ||
                            ""
                        )
                      )
                  )
                : [],

            batches:
              Array.isArray(
                data.batches
              )
                ? data.batches
                : [],

            districts:
              Array.isArray(
                data.districts
              )
                ? [...data.districts].sort(
                    (a, b) =>
                      String(
                        a.districtName ||
                          ""
                      ).localeCompare(
                        String(
                          b.districtName ||
                            ""
                        )
                      )
                  )
                : [],
          });
        } catch (error) {
          console.error(
            "Failed to load monitoring report options:",
            error
          );

          setError(
            error?.response?.data?.message ||
              "Failed to load report options."
          );
        }
      };

    loadOptions();
  }, []);

  // ==========================================================
  // FILTER BATCHES BY PROGRAM
  // ==========================================================

  const filteredBatches =
    options.batches
      .filter((batch) => {
        if (!programId) {
          return true;
        }

        const batchProgramId =
          batch?.programId?._id ||
          batch?.programId;

        return (
          String(
            batchProgramId
          ) ===
          String(
            programId
          )
        );
      })
      .sort((a, b) =>
        String(
          a.batchName ||
            ""
        ).localeCompare(
          String(
            b.batchName ||
              ""
          )
        )
      );

  // ==========================================================
  // PROGRAM CHANGE
  // ==========================================================

  const handleProgramChange = (
    event
  ) => {
    const value =
      event.target.value;

    setProgramId(value);

    // Batch must be selected again
    // when program changes.
    setBatchId("");

    setError("");
  };

  // ==========================================================
  // BATCH CHANGE
  // ==========================================================

  const handleBatchChange = (
    event
  ) => {
    setBatchId(
      event.target.value
    );

    setError("");
  };

  // ==========================================================
  // DISTRICT CHANGE
  // ==========================================================

  const handleDistrictChange = (
    event
  ) => {
    setDistrictId(
      event.target.value
    );

    setError("");
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    setError("");

    // --------------------------------------------------------
    // PROGRAM
    // --------------------------------------------------------

    if (!programId) {
      setError(
        "Please select a Program."
      );

      return;
    }

    // --------------------------------------------------------
    // BATCH
    // --------------------------------------------------------

    if (!batchId) {
      setError(
        "Please select a Batch."
      );

      return;
    }

    // --------------------------------------------------------
    // FROM DATE
    // --------------------------------------------------------

    if (!fromDate) {
      setError(
        "Please select a From Date."
      );

      return;
    }

    // --------------------------------------------------------
    // TO DATE
    // --------------------------------------------------------

    if (!toDate) {
      setError(
        "Please select a To Date."
      );

      return;
    }

    // --------------------------------------------------------
    // DATE RANGE
    // --------------------------------------------------------

    if (
      fromDate >
      toDate
    ) {
      setError(
        "From Date cannot be greater than To Date."
      );

      return;
    }

    // --------------------------------------------------------
    // SEND FILTERS
    //
    // District is optional.
    // --------------------------------------------------------

    onSearch({
      programId,
      batchId,

      districtId:
        districtId || "",

      fromDate,
      toDate,
    });
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const handleReset = () => {
    setProgramId("");
    setBatchId("");
    setDistrictId("");

    setFromDate(
      getToday()
    );

    setToDate(
      getToday()
    );

    setError("");

    if (onSearch) {
      onSearch(null);
    }
  };

  // ==========================================================
  // COMMON INPUT CLASS
  // ==========================================================

  const inputClassName =
    "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50";

  const labelClassName =
    "block text-sm font-medium text-slate-700";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <form
      onSubmit={
        handleSearch
      }
      className="w-full"
    >
      {/* ====================================================
          FILTER GRID
      ==================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* ==================================================
            PROGRAM
        ================================================== */}

        <div>
          <label
            htmlFor="monitoring-report-program"
            className={labelClassName}
          >
            Program
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            id="monitoring-report-program"
            value={programId}
            onChange={
              handleProgramChange
            }
            disabled={
              loading
            }
            className={
              inputClassName
            }
          >
            <option value="">
              Select Program
            </option>

            {options.programs.map(
              (program) => (
                <option
                  key={
                    program._id
                  }
                  value={
                    program._id
                  }
                >
                  {
                    program.programName
                  }
                </option>
              )
            )}
          </select>
        </div>

        {/* ==================================================
            BATCH
        ================================================== */}

        <div>
          <label
            htmlFor="monitoring-report-batch"
            className={labelClassName}
          >
            Batch
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            id="monitoring-report-batch"
            value={batchId}
            onChange={
              handleBatchChange
            }
            disabled={
              loading ||
              !programId
            }
            className={
              inputClassName
            }
          >
            <option value="">
              {programId
                ? "Select Batch"
                : "Select Program First"}
            </option>

            {filteredBatches.map(
              (batch) => (
                <option
                  key={
                    batch._id
                  }
                  value={
                    batch._id
                  }
                >
                  {
                    batch.batchName
                  }
                </option>
              )
            )}
          </select>
        </div>

        {/* ==================================================
            DISTRICT
        ================================================== */}

        <div>
          <label
            htmlFor="monitoring-report-district"
            className={labelClassName}
          >
            District
          </label>

          <select
            id="monitoring-report-district"
            value={districtId}
            onChange={
              handleDistrictChange
            }
            disabled={
              loading
            }
            className={
              inputClassName
            }
          >
            <option value="">
              All Districts
            </option>

            {options.districts.map(
              (district) => (
                <option
                  key={
                    district._id
                  }
                  value={
                    district._id
                  }
                >
                  {
                    district.districtName
                  }
                </option>
              )
            )}
          </select>
        </div>

        {/* ==================================================
            FROM DATE
        ================================================== */}

        <div>
          <label
            htmlFor="monitoring-report-from-date"
            className={labelClassName}
          >
            From Date
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            id="monitoring-report-from-date"
            type="date"
            value={
              fromDate
            }
            onChange={(event) =>
              setFromDate(
                event.target.value
              )
            }
            disabled={
              loading
            }
            className={
              inputClassName
            }
          />
        </div>

        {/* ==================================================
            TO DATE
        ================================================== */}

        <div>
          <label
            htmlFor="monitoring-report-to-date"
            className={labelClassName}
          >
            To Date
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            id="monitoring-report-to-date"
            type="date"
            value={
              toDate
            }
            onChange={(event) =>
              setToDate(
                event.target.value
              )
            }
            disabled={
              loading
            }
            className={
              inputClassName
            }
          />
        </div>
      </div>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ====================================================
          ACTION BUTTONS
      ==================================================== */}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={
            loading
          }
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Loading...
            </>
          ) : (
            "View Report"
          )}
        </button>

        <button
          type="button"
          onClick={
            handleReset
          }
          disabled={
            loading
          }
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default MonitoringReportFilters;