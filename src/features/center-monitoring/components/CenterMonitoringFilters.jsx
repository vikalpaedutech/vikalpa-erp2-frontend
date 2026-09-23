import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMyMonitoringAccess,
} from "../services/monitoringRegionAccess.service";


// ============================================================
// HELPERS
// ============================================================

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


// ============================================================
// CENTER MONITORING FILTERS
// ============================================================

function CenterMonitoringFilters({
  onFiltersChange,
}) {
  // ==========================================================
  // Monitoring Access
  // ==========================================================

  const [monitoringAccess, setMonitoringAccess] =
    useState([]);

  const [loadingAccess, setLoadingAccess] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================================
  // Selected Filters
  // ==========================================================

  const [programId, setProgramId] =
    useState("");

  const [batchId, setBatchId] =
    useState("");

  const [districtId, setDistrictId] =
    useState("");

  const [date, setDate] =
    useState(getToday());

  const [search, setSearch] =
    useState("");


  // ==========================================================
  // Load Current User Monitoring Access
  // ==========================================================

  useEffect(() => {
    const loadMonitoringAccess =
      async () => {
        try {
          setLoadingAccess(true);
          setError("");

          const response =
            await getMyMonitoringAccess();

          setMonitoringAccess(
            response?.data || []
          );
        } catch (err) {
          console.error(
            "Failed to load monitoring access:",
            err
          );

          setMonitoringAccess([]);

          setError(
            err?.response?.data?.message ||
              "Failed to load monitoring access"
          );
        } finally {
          setLoadingAccess(false);
        }
      };

    loadMonitoringAccess();
  }, []);


  // ==========================================================
  // UNIQUE PROGRAMS
  // ==========================================================

  const programs = useMemo(() => {
    const map = new Map();

    monitoringAccess.forEach(
      (access) => {
        const program =
          access?.programId;

        if (!program?._id) {
          return;
        }

        const id = String(
          program._id
        );

        if (!map.has(id)) {
          map.set(id, program);
        }
      }
    );

    return Array.from(
      map.values()
    );
  }, [
    monitoringAccess,
  ]);


  // ==========================================================
  // AVAILABLE BATCHES
  //
  // Only batches belonging to selected program
  // ==========================================================

  const batches = useMemo(() => {
    const map = new Map();

    monitoringAccess.forEach(
      (access) => {
        const batch =
          access?.batchId;

        if (!batch?._id) {
          return;
        }

        /*
         * Program filtering
         */
        if (
          programId &&
          String(
            access?.programId?._id
          ) !== String(programId)
        ) {
          return;
        }

        const id = String(
          batch._id
        );

        if (!map.has(id)) {
          map.set(id, batch);
        }
      }
    );

    return Array.from(
      map.values()
    );
  }, [
    monitoringAccess,
    programId,
  ]);


  // ==========================================================
  // AVAILABLE DISTRICTS
  //
  // Districts are filtered by selected
  // program + batch.
  //
  // District names are sorted A-Z.
  // ==========================================================

  const districts = useMemo(() => {
    const map = new Map();

    monitoringAccess.forEach(
      (access) => {
        const district =
          access?.districtId;

        if (!district?._id) {
          return;
        }

        /*
         * Program filter
         */
        if (
          programId &&
          String(
            access?.programId?._id
          ) !== String(programId)
        ) {
          return;
        }

        /*
         * Batch filter
         */
        if (
          batchId &&
          String(
            access?.batchId?._id
          ) !== String(batchId)
        ) {
          return;
        }

        const id = String(
          district._id
        );

        if (!map.has(id)) {
          map.set(
            id,
            district
          );
        }
      }
    );

    // ========================================================
    // SORT DISTRICTS BY NAME - A TO Z
    // ========================================================

    return Array.from(
      map.values()
    ).sort((a, b) =>
      String(
        a?.districtName || ""
      ).localeCompare(
        String(
          b?.districtName || ""
        ),
        undefined,
        {
          sensitivity: "base",
        }
      )
    );

  }, [
    monitoringAccess,
    programId,
    batchId,
  ]);


  // ==========================================================
  // AUTO SELECT PROGRAM
  //
  // One program:
  // select automatically
  // ==========================================================

  useEffect(() => {
    if (
      loadingAccess
    ) {
      return;
    }

    if (
      programs.length === 1
    ) {
      const onlyProgram =
        String(
          programs[0]._id
        );

      if (
        String(programId) !==
        onlyProgram
      ) {
        setProgramId(
          onlyProgram
        );
      }

      return;
    }

    /*
     * If selected program is no longer
     * available, clear it.
     */
    if (
      programId &&
      !programs.some(
        (program) =>
          String(program._id) ===
          String(programId)
      )
    ) {
      setProgramId("");
    }
  }, [
    programs,
    programId,
    loadingAccess,
  ]);


  // ==========================================================
  // AUTO SELECT BATCH
  //
  // One batch:
  // select automatically
  // ==========================================================

  useEffect(() => {
    if (
      !programId
    ) {
      setBatchId("");
      return;
    }

    if (
      batches.length === 1
    ) {
      const onlyBatch =
        String(
          batches[0]._id
        );

      if (
        String(batchId) !==
        onlyBatch
      ) {
        setBatchId(
          onlyBatch
        );
      }

      return;
    }

    /*
     * Clear invalid selected batch.
     */
    if (
      batchId &&
      !batches.some(
        (batch) =>
          String(batch._id) ===
          String(batchId)
      )
    ) {
      setBatchId("");
    }
  }, [
    batches,
    batchId,
    programId,
  ]);


  // ==========================================================
  // AUTO SELECT DISTRICT
  //
  // If only one district remains,
  // select automatically.
  //
  // Unlike program/batch, we do NOT hide
  // district because district is useful
  // as a user filter even with one option.
  // ==========================================================

  useEffect(() => {
    if (
      districts.length === 1
    ) {
      const onlyDistrict =
        String(
          districts[0]._id
        );

      if (
        String(districtId) !==
        onlyDistrict
      ) {
        setDistrictId(
          onlyDistrict
        );
      }

      return;
    }

    /*
     * Clear invalid selected district.
     */
    if (
      districtId &&
      !districts.some(
        (district) =>
          String(district._id) ===
          String(districtId)
      )
    ) {
      setDistrictId("");
    }
  }, [
    districts,
    districtId,
  ]);


  // ==========================================================
  // SEND FILTERS TO PARENT
  // ==========================================================

  useEffect(() => {
    onFiltersChange?.({
      programId,
      batchId,
      districtId,
      date,
      search: search.trim(),
    });
  }, [
    programId,
    batchId,
    districtId,
    date,
    search,
    onFiltersChange,
  ]);


  // ==========================================================
  // PROGRAM CHANGE
  // ==========================================================

  const handleProgramChange = (
    event
  ) => {
    const value =
      event.target.value;

    setProgramId(value);

    /*
     * Batch and district depend on program.
     */
    setBatchId("");
    setDistrictId("");
  };


  // ==========================================================
  // BATCH CHANGE
  // ==========================================================

  const handleBatchChange = (
    event
  ) => {
    const value =
      event.target.value;

    setBatchId(value);

    /*
     * District options depend on batch.
     */
    setDistrictId("");
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
  };


  // ==========================================================
  // RESET
  // ==========================================================

  const handleReset = () => {
    /*
     * Respect single available program.
     */
    if (
      programs.length === 1
    ) {
      setProgramId(
        String(programs[0]._id)
      );
    } else {
      setProgramId("");
    }

    /*
     * Respect single available batch
     * for selected program.
     */
    if (
      batches.length === 1
    ) {
      setBatchId(
        String(batches[0]._id)
      );
    } else {
      setBatchId("");
    }

    setDistrictId("");

    setDate(getToday());

    setSearch("");
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-5">

        <h2 className="text-base font-semibold text-gray-800">
          Filters
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Select program, batch and district to view your assigned monitoring centers.
        </p>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* ======================================================
          FILTER GRID
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

        {/* ==================================================
            PROGRAM
        ================================================== */}

        {programs.length > 1 && (
          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Program
            </label>

            <select
              value={programId}
              onChange={
                handleProgramChange
              }
              disabled={
                loadingAccess
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >

              <option value="">
                Select Program
              </option>

              {programs.map(
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
        )}


        {/* ==================================================
            BATCH
        ================================================== */}

        {batches.length > 1 && (
          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Batch
            </label>

            <select
              value={batchId}
              onChange={
                handleBatchChange
              }
              disabled={
                loadingAccess ||
                !programId
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >

              <option value="">
                {!programId
                  ? "Select Program First"
                  : "Select Batch"}
              </option>

              {batches.map(
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
        )}


        {/* ==================================================
            DISTRICT
        ================================================== */}

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            District
          </label>

          <select
            value={districtId}
            onChange={
              handleDistrictChange
            }
            disabled={
              loadingAccess ||
              !programId ||
              !batchId
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          >

            <option value="">
              {!programId
                ? "Select Program First"
                : !batchId
                ? "Select Batch First"
                : "Select District"}
            </option>

            {districts.map(
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
            DATE
        ================================================== */}

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(
                event.target.value
              )
            }
            disabled={
              loadingAccess
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

        </div>

      </div>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="mt-4">

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Search
        </label>

        <div className="flex gap-3">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search district, block, center or center code..."
            disabled={
              loadingAccess
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          <button
            type="button"
            onClick={
              handleReset
            }
            disabled={
              loadingAccess
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

        </div>

      </div>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loadingAccess && (
        <div className="mt-4 text-xs text-gray-500">
          Loading monitoring access...
        </div>
      )}

    </div>
  );
}

export default CenterMonitoringFilters;