import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import CenterMonitoringFilters from "../components/CenterMonitoringFilters";

import {
  getMonitoringCenters,
  createCenterMonitoring,
} from "../services/centerMonitoring.service";

import {
  getMyMonitoringAccess,
} from "../services/monitoringRegionAccess.service";

import {
  CENTER_MONITORING_DISCIPLINE_BUTTONS,
} from "../constants/centerMonitoring.constants";


// ============================================================
// Helpers
// ============================================================

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


// ============================================================
// Center Monitoring
// ============================================================

function CenterMonitoring() {

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  const navigate = useNavigate();


  // ----------------------------------------------------------
  // Filters
  // ----------------------------------------------------------

  const [filters, setFilters] = useState({
    programId: "",
    batchId: "",
    districtId: "",
    date: getToday(),
    search: "",
  });


  // ----------------------------------------------------------
  // Monitoring Access
  // Used only to resolve selected Program / Batch names
  // ----------------------------------------------------------

  const [
    monitoringAccess,
    setMonitoringAccess,
  ] = useState([]);


  // ----------------------------------------------------------
  // Data
  // ----------------------------------------------------------

  const [centers, setCenters] = useState([]);


  // ----------------------------------------------------------
  // Loading / errors
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // Track EXACT button being saved:
  // `${centerId}::${discipline}`
  const [savingKey, setSavingKey] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // ----------------------------------------------------------
  // Remark state
  // ----------------------------------------------------------

  const [remarks, setRemarks] = useState({});


  // ----------------------------------------------------------
  // Scroll position
  // ----------------------------------------------------------

  const scrollPositionRef = useRef(0);

  const fetchingRef = useRef(false);


  // ==========================================================
  // Load My Monitoring Access
  // ==========================================================

  useEffect(() => {

    const loadMonitoringAccess = async () => {

      try {

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

      }

    };


    loadMonitoringAccess();

  }, []);


  // ==========================================================
  // Selected Program Name
  // ==========================================================

  const selectedProgramName = useMemo(() => {

    if (!filters?.programId) {
      return "";
    }


    const selectedAccess =
      monitoringAccess.find(
        (access) =>
          String(
            access?.programId?._id
          ) ===
          String(
            filters.programId
          )
      );


    return (
      selectedAccess
        ?.programId
        ?.programName || ""
    );

  }, [
    monitoringAccess,
    filters.programId,
  ]);


  // ==========================================================
  // Selected Batch Name
  //
  // Batch is resolved along with selected Program + Batch
  // so that same batch IDs from different programs don't
  // accidentally get matched.
  // ==========================================================

  const selectedBatchName = useMemo(() => {

    if (!filters?.batchId) {
      return "";
    }


    const selectedAccess =
      monitoringAccess.find(
        (access) => {

          const accessProgramId =
            access?.programId?._id;

          const accessBatchId =
            access?.batchId?._id;


          return (
            String(
              accessProgramId
            ) ===
              String(
                filters.programId
              ) &&
            String(
              accessBatchId
            ) ===
              String(
                filters.batchId
              )
          );

        }
      );


    return (
      selectedAccess
        ?.batchId
        ?.batchName || ""
    );

  }, [
    monitoringAccess,
    filters.programId,
    filters.batchId,
  ]);


  // ==========================================================
  // SORT CENTERS BY DISTRICT NAME
  //
  // A → Z
  // ==========================================================

  const sortedCenters = useMemo(() => {

    return [...centers].sort(
      (a, b) =>
        String(
          a?.districtId?.districtName || ""
        ).localeCompare(
          String(
            b?.districtId?.districtName || ""
          ),
          undefined,
          {
            sensitivity: "base",
          }
        )
    );

  }, [
    centers,
  ]);


  // ==========================================================
  // Save current scroll position
  // ==========================================================

  const saveScrollPosition = useCallback(() => {

    scrollPositionRef.current =
      window.scrollY ||
      window.pageYOffset ||
      0;

  }, []);


  // ==========================================================
  // Restore previous scroll position
  // ==========================================================

  const restoreScrollPosition = useCallback(() => {

    const savedPosition =
      scrollPositionRef.current;


    requestAnimationFrame(() => {

      window.scrollTo({
        top: savedPosition,
        left: 0,
        behavior: "auto",
      });


      requestAnimationFrame(() => {

        window.scrollTo({
          top: savedPosition,
          left: 0,
          behavior: "auto",
        });

      });

    });

  }, []);


  // ==========================================================
  // Fetch Monitoring Centers
  // ==========================================================

  const fetchCenters = useCallback(
    async (
      currentFilters,
      {
        silent = false,
        preserveScroll = false,
      } = {}
    ) => {

      if (
        !currentFilters?.programId ||
        !currentFilters?.batchId
      ) {

        setCenters([]);

        return;
      }


      if (fetchingRef.current) {
        return;
      }


      fetchingRef.current = true;


      try {

        if (silent) {

          setRefreshing(true);

        } else {

          setLoading(true);

        }


        setError("");


        const response =
          await getMonitoringCenters({

            programId:
              currentFilters.programId,

            batchId:
              currentFilters.batchId,

            districtId:
              currentFilters.districtId,

            date:
              currentFilters.date,

            search:
              currentFilters.search?.trim() ||
              "",

          });


        setCenters(
          response?.data || []
        );


        if (preserveScroll) {

          restoreScrollPosition();

        }

      } catch (err) {

        console.error(
          "Failed to fetch monitoring centers:",
          err
        );


        setCenters([]);


        setError(
          err?.response?.data?.message ||
            "Failed to load monitoring centers"
        );

      } finally {

        fetchingRef.current = false;


        if (silent) {

          setRefreshing(false);

        } else {

          setLoading(false);

        }

      }

    },
    [
      restoreScrollPosition,
    ]
  );


  // ==========================================================
  // Filters Change
  // ==========================================================

  const handleFiltersChange =
    useCallback(
      (newFilters) => {

        setFilters(newFilters);

        setError("");

        setSuccess("");

      },
      []
    );


  // ==========================================================
  // Fetch when filters change
  // ==========================================================

  useEffect(() => {

    if (
      !filters?.programId ||
      !filters?.batchId
    ) {

      setCenters([]);

      return;
    }


    fetchCenters(
      filters,
      {
        silent: false,
        preserveScroll: false,
      }
    );

  }, [
    filters,
    fetchCenters,
  ]);


  // ==========================================================
  // Remark change
  // ==========================================================

  const handleRemarkChange =
    useCallback(
      (
        centerId,
        value
      ) => {

        setRemarks(
          (previous) => ({

            ...previous,

            [centerId]:
              value,

          })
        );

      },
      []
    );


  // ==========================================================
  // Submit Monitoring Action
  // ==========================================================

  const handleMonitoringAction =
    async (
      event,
      center,
      discipline
    ) => {

      event.preventDefault();

      event.stopPropagation();


      // ------------------------------------------------------
      // Preserve current scroll position
      // ------------------------------------------------------

      saveScrollPosition();


      // ------------------------------------------------------
      // Validate Program / Batch
      // ------------------------------------------------------

      if (
        !filters?.programId ||
        !filters?.batchId
      ) {

        setError(
          "Please select Program and Batch first."
        );

        return;
      }


      // ------------------------------------------------------
      // Center ID
      // ------------------------------------------------------

      const centerId =
        center?._id;


      if (!centerId) {

        setError(
          "Center ID is missing."
        );

        return;
      }


      // ------------------------------------------------------
      // Unique button key
      // ------------------------------------------------------

      const actionKey =
        `${centerId}::${discipline}`;


      // ------------------------------------------------------
      // Prevent duplicate click
      // ------------------------------------------------------

      if (
        savingKey === actionKey
      ) {

        return;

      }


      try {

        // ----------------------------------------------------
        // Only clicked button shows Saving...
        // ----------------------------------------------------

        setSavingKey(
          actionKey
        );

        setError("");

        setSuccess("");


        // ----------------------------------------------------
        // Create Monitoring
        // ----------------------------------------------------

        await createCenterMonitoring({

          programId:
            filters.programId,

          batchId:
            filters.batchId,

          districtId:
            center?.districtId?._id ||
            center?.districtId ||
            "",

          blockId:
            center?.blockId?._id ||
            center?.blockId ||
            "",

          centerId,

          discipline,

          date:
            filters.date,

          remark:
            remarks[
              centerId
            ]?.trim() || "",

        });


        // ----------------------------------------------------
        // Success message disabled
        // ----------------------------------------------------

        // setSuccess(
        //   `${discipline} recorded for ${
        //     center?.centerName ||
        //     "center"
        //   }`
        // );


        // ----------------------------------------------------
        // Clear Remark
        // ----------------------------------------------------

        setRemarks(
          (previous) => {

            const updated = {
              ...previous,
            };

            delete updated[
              centerId
            ];

            return updated;

          }
        );


        // ----------------------------------------------------
        // Refresh table WITHOUT losing scroll position
        // ----------------------------------------------------

        await fetchCenters(
          filters,
          {
            silent: true,
            preserveScroll: true,
          }
        );

      } catch (err) {

        console.error(
          "Failed to record center monitoring:",
          err
        );


        setError(
          err?.response?.data?.message ||
            "Failed to record center monitoring"
        );


        restoreScrollPosition();

      } finally {

        setSavingKey(
          null
        );

      }

    };


  // ==========================================================
  // Render
  // ==========================================================

  return (

    <div className="space-y-6 p-4 md:p-6">


      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            Center Monitoring
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor and record the performance of assigned
            centers.
          </p>

        </div>


        {/* ==================================================
            VIEW REPORT
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/center-monitoring/my-report"
            )
          }
          className="rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          View Report
        </button>

      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <CenterMonitoringFilters
        onFiltersChange={
          handleFiltersChange
        }
      />


      {/* ======================================================
          CURRENT SELECTION
          SIMPLE ONE-LINE DISPLAY
      ====================================================== */}

      {filters.programId &&
        filters.batchId && (

        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">

            <span className="font-semibold text-gray-700">
              Program:
            </span>

            <span className="font-medium text-gray-900">
              {selectedProgramName ||
                "Loading..."}
            </span>


            <span className="text-gray-400">
              |
            </span>


            <span className="font-semibold text-gray-700">
              Batch:
            </span>

            <span className="font-medium text-gray-900">
              {selectedBatchName ||
                "Loading..."}
            </span>

          </div>

        </div>

      )}


      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (

        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

          {success}

        </div>

      )}


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </div>

      )}


      {/* ======================================================
          TABLE CARD
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">


        {/* ====================================================
            TABLE HEADER
        ==================================================== */}

        <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-base font-semibold text-gray-800">
              Monitoring Centers
            </h2>

            <p className="text-xs text-gray-500">

              {sortedCenters.length} center
              {sortedCenters.length !== 1
                ? "s"
                : ""} available

            </p>

          </div>


          {/* ==================================================
              REFRESH
          ================================================== */}

          <button
            type="button"
            onClick={(
              event
            ) => {

              event.preventDefault();

              event.stopPropagation();

              saveScrollPosition();

              fetchCenters(
                filters,
                {
                  silent: true,
                  preserveScroll: true,
                }
              );

            }}
            disabled={
              loading ||
              refreshing ||
              !filters.programId ||
              !filters.batchId
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>


        {/* ====================================================
            NO PROGRAM / BATCH
        ==================================================== */}

        {!filters.programId ||
        !filters.batchId ? (

          <div className="px-6 py-16 text-center">

            <p className="text-sm font-medium text-gray-600">
              Select Program and Batch to view centers.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Your monitoring assigned centers will appear here.
            </p>

          </div>

        ) : loading ? (

          /* ==================================================
             LOADING
          ================================================== */

          <div className="px-6 py-16 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-3 text-sm text-gray-500">
              Loading monitoring centers...
            </p>

          </div>

        ) : sortedCenters.length === 0 ? (

          /* ==================================================
             EMPTY
          ================================================== */

          <div className="px-6 py-16 text-center">

            <p className="text-sm font-medium text-gray-600">
              No monitoring centers found.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Try changing the selected filters.
            </p>

          </div>

        ) : (

          /* ==================================================
             TABLE
          ================================================== */

          <div className="overflow-x-auto">

            <table className="min-w-[1200px] w-full text-left text-sm">

              <thead className="bg-gray-50 text-xs uppercase text-gray-600">

                <tr>

                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    #
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    District
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Center
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Remark
                  </th>

                  {CENTER_MONITORING_DISCIPLINE_BUTTONS.map(
                    (action) => (

                      <th
                        key={
                          action.value
                        }
                        className="whitespace-nowrap px-4 py-3 text-center font-semibold"
                      >

                        {
                          action.label
                        }

                      </th>

                    )
                  )}

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {sortedCenters.map(
                  (
                    center,
                    index
                  ) => {

                    const centerId =
                      center?._id;

                    const counts =
                      center?.counts ||
                      {};


                    return (

                      <tr
                        key={
                          centerId
                        }
                        className="transition hover:bg-gray-50"
                      >


                        {/* ----------------------------------
                            #
                        ---------------------------------- */}

                        <td className="whitespace-nowrap px-4 py-4 text-gray-500">

                          {
                            index + 1
                          }

                        </td>


                        {/* ----------------------------------
                            DISTRICT
                        ---------------------------------- */}

                        <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">

                          {
                            center
                              ?.districtId
                              ?.districtName ||
                            "-"
                          }

                        </td>


                        {/* ----------------------------------
                            CENTER
                        ---------------------------------- */}

                        <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-800">

                          {
                            center
                              ?.centerName ||
                            "-"
                          }

                        </td>


                        {/* ----------------------------------
                            REMARK
                        ---------------------------------- */}

                        <td className="px-4 py-4">

                          <input
                            type="text"
                            value={
                              remarks[
                                centerId
                              ] || ""
                            }
                            onChange={(
                              event
                            ) =>
                              handleRemarkChange(
                                centerId,
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Optional remark"
                            className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />

                        </td>


                        {/* ----------------------------------
                            DISCIPLINE BUTTONS
                        ---------------------------------- */}

                        {CENTER_MONITORING_DISCIPLINE_BUTTONS.map(
                          (action) => {

                            const actionKey =
                              `${centerId}::${action.value}`;


                            const isThisSaving =
                              savingKey ===
                              actionKey;


                            return (

                              <td
                                key={
                                  action.value
                                }
                                className="whitespace-nowrap px-4 py-4 text-center"
                              >

                                <div className="flex flex-col items-center gap-2">

                                  <button
                                    type="button"
                                    onClick={(
                                      event
                                    ) =>
                                      handleMonitoringAction(
                                        event,
                                        center,
                                        action.value
                                      )
                                    }
                                    disabled={
                                      isThisSaving
                                    }
                                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >

                                    {
                                      isThisSaving
                                        ? "Saving..."
                                        : action.label
                                    }

                                  </button>


                                  <span className="text-xs font-medium text-gray-500">

                                    {
                                      counts[
                                        action.value
                                      ] ||
                                      0
                                    }

                                  </span>

                                </div>

                              </td>

                            );

                          }
                        )}

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );
}


export default CenterMonitoring;