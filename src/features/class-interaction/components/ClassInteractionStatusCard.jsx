import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import ProgramDropdown from "../../../components/common/dropdowns/ProgramDropdown";

import { useRegionAccess } from "../../../context/RegionAccessContext";
import { useAuth } from "../../../context/AuthContext";

import {
  CLASS_INTERACTION_RECORD_TYPES,
  CLASS_INTERACTION_STATUSES,
  CLASS_INTERACTION_SUBJECTS,
} from "../constants/classInteraction.constants";

import {
  createClassInteraction,
  getClassInteractionCenters,
  getClassInteractions,
} from "../services/classInteraction.service";


function ClassInteractionStatusCard({
  programs = [],
  batches = [],
}) {
  const { access } = useAuth();

  const navigate = useNavigate();

  const {
    programAccess,
    centers,
  } = useRegionAccess();


  /*
   * ============================================================
   * CURRENT DATE
   *
   * Date is NOT shown in UI.
   * Current date is automatically used for all records.
   * ============================================================
   */

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


  /*
   * ============================================================
   * FILTER STATES
   * ============================================================
   */

  const [
    programId,
    setProgramId,
  ] = useState("");

  const [
    batchId,
    setBatchId,
  ] = useState("");

  const [
    recordType,
    setRecordType,
  ] = useState("");

  const [
    subject,
    setSubject,
  ] = useState("");

  /*
   * Date is maintained internally only.
   */
  const [
    date,
    setDate,
  ] = useState(getToday());

  const [
    locationSearch,
    setLocationSearch,
  ] = useState("");


  /*
   * ============================================================
   * DATA STATES
   * ============================================================
   */

  const [
    accessibleCenters,
    setAccessibleCenters,
  ] = useState([]);

  const [
    interactionRecords,
    setInteractionRecords,
  ] = useState([]);

  const [
    loadingCenters,
    setLoadingCenters,
  ] = useState(false);

  const [
    loadingRecords,
    setLoadingRecords,
  ] = useState(false);

  const [
    savingKey,
    setSavingKey,
  ] = useState("");


  /*
   * ============================================================
   * REMARKS
   * ============================================================
   */

  const [
    remarks,
    setRemarks,
  ] = useState({});


  /*
   * ============================================================
   * ACCESSIBLE PROGRAMS
   * ============================================================
   */

  const accessiblePrograms =
    programAccess?.programs || [];


  /*
   * ============================================================
   * ACCESSIBLE BATCHES
   * ============================================================
   */

  const accessibleBatches =
    programAccess?.batches || [];


  /*
   * ============================================================
   * AVAILABLE PROGRAMS
   * ============================================================
   */

  const availablePrograms =
    useMemo(() => {
      const accessibleIds =
        accessiblePrograms.map(
          (program) =>
            String(program?._id)
        );

      return programs.filter(
        (program) =>
          accessibleIds.includes(
            String(program?._id)
          )
      );
    }, [
      programs,
      accessiblePrograms,
    ]);


  /*
   * ============================================================
   * AVAILABLE BATCHES
   * ============================================================
   */

  const availableBatches =
    useMemo(() => {
      return accessibleBatches.filter(
        (batch) => {
          if (!programId) {
            return true;
          }

          return (
            String(
              batch?.programId?._id ||
                batch?.programId
            ) ===
            String(programId)
          );
        }
      );
    }, [
      accessibleBatches,
      programId,
    ]);


  /*
   * ============================================================
   * AUTO SELECT SINGLE PROGRAM
   * ============================================================
   */

  useEffect(() => {
    if (
      availablePrograms.length !== 1
    ) {
      return;
    }

    const onlyProgramId =
      String(
        availablePrograms[0]._id
      );

    if (
      String(programId) !==
      onlyProgramId
    ) {
      setProgramId(
        onlyProgramId
      );
    }
  }, [
    availablePrograms,
    programId,
  ]);


  /*
   * ============================================================
   * AUTO SELECT SINGLE BATCH
   * ============================================================
   */

  useEffect(() => {
    if (
      availableBatches.length !== 1
    ) {
      return;
    }

    const onlyBatchId =
      String(
        availableBatches[0]._id
      );

    if (
      String(batchId) !==
      onlyBatchId
    ) {
      setBatchId(
        onlyBatchId
      );
    }
  }, [
    availableBatches,
    batchId,
  ]);


  /*
   * ============================================================
   * LOAD ACCESSIBLE CENTERS
   * ============================================================
   */

  useEffect(() => {
    const loadCenters = async () => {
      try {
        setLoadingCenters(true);

        const response =
          await getClassInteractionCenters();

        let loadedCenters = [];

        if (
          Array.isArray(response)
        ) {
          loadedCenters =
            response;
        } else if (
          Array.isArray(
            response?.data
          )
        ) {
          loadedCenters =
            response.data;
        } else if (
          Array.isArray(
            response?.data?.centers
          )
        ) {
          loadedCenters =
            response.data.centers;
        } else if (
          Array.isArray(
            response?.centers
          )
        ) {
          loadedCenters =
            response.centers;
        }

        setAccessibleCenters(
          loadedCenters
        );
      } catch (error) {
        console.error(
          "Failed to load class interaction centers:",
          error
        );

        setAccessibleCenters([]);
      } finally {
        setLoadingCenters(false);
      }
    };

    loadCenters();
  }, []);


  /*
   * ============================================================
   * AVAILABLE CENTERS
   * ============================================================
   */

  const availableCenters =
    useMemo(() => {
      if (
        accessibleCenters.length > 0
      ) {
        return accessibleCenters;
      }

      return centers || [];
    }, [
      accessibleCenters,
      centers,
    ]);


  /*
   * ============================================================
   * REGEX LOCATION FILTER
   *
   * Searches:
   * District
   * Block
   * Center
   * Center Code
   *
   * No separate District dropdown.
   * ============================================================
   */

  const filteredCenters =
    useMemo(() => {
      const search =
        locationSearch.trim();

      if (!search) {
        return availableCenters;
      }

      let regex;

      try {
        regex =
          new RegExp(
            search,
            "i"
          );
      } catch {
        return [];
      }

      return availableCenters.filter(
        (center) => {
          const districtName =
            center?.districtId
              ?.districtName ||
            center?.districtName ||
            "";

          const blockName =
            center?.blockId
              ?.blockName ||
            center?.blockName ||
            "";

          const centerName =
            center?.centerName ||
            "";

          const centerCode =
            center?.centerCode ||
            "";

          const searchableText =
            [
              districtName,
              blockName,
              centerName,
              centerCode,
            ].join(" ");

          return regex.test(
            searchableText
          );
        }
      );
    }, [
      availableCenters,
      locationSearch,
    ]);


  /*
   * ============================================================
   * AVAILABLE STATUSES
   * ============================================================
   */

  const availableStatuses =
    useMemo(() => {
      if (!recordType) {
        return [];
      }

      return (
        CLASS_INTERACTION_STATUSES[
          recordType
        ] || []
      );
    }, [
      recordType,
    ]);


  /*
   * ============================================================
   * DISPLAY HELPERS
   * ============================================================
   */

  const getDistrictName = (
    center
  ) =>
    center?.districtId
      ?.districtName ||
    center?.districtName ||
    "-";


  const getBlockName = (
    center
  ) =>
    center?.blockId
      ?.blockName ||
    center?.blockName ||
    "-";


  const selectedBatchName =
    availableBatches.find(
      (batch) =>
        String(
          batch?._id
        ) ===
        String(batchId)
    )?.batchName || "";


  const selectedSubjectName =
    CLASS_INTERACTION_SUBJECTS.find(
      (item) =>
        item.value === subject
    )?.label || "";


  /*
   * ============================================================
   * PROGRAM CHANGE
   * ============================================================
   */

  const handleProgramChange = (
    value
  ) => {
    setProgramId(value);
    setBatchId("");
    setInteractionRecords([]);
  };


  /*
   * ============================================================
   * BATCH CHANGE
   * ============================================================
   */

  const handleBatchChange = (
    value
  ) => {
    setBatchId(value);
    setInteractionRecords([]);
  };


  /*
   * ============================================================
   * RECORD TYPE CHANGE
   * ============================================================
   */

  const handleRecordTypeChange = (
    value
  ) => {
    setRecordType(value);
    setInteractionRecords([]);
  };


  /*
   * ============================================================
   * EXTRACT API RECORDS
   * ============================================================
   */

  const extractInteractionRecords =
    (response) => {
      if (
        Array.isArray(response)
      ) {
        return response;
      }

      if (
        Array.isArray(
          response?.data
        )
      ) {
        return response.data;
      }

      if (
        Array.isArray(
          response?.data
            ?.interactions
        )
      ) {
        return (
          response.data
            .interactions
        );
      }

      if (
        Array.isArray(
          response?.interactions
        )
      ) {
        return response.interactions;
      }

      if (
        Array.isArray(
          response?.data?.data
            ?.interactions
        )
      ) {
        return (
          response.data.data
            .interactions
        );
      }

      return [];
    };


  /*
   * ============================================================
   * SEARCH / FETCH RECORDS
   *
   * Date automatically uses current date.
   * No districtId is sent.
   * ============================================================
   */

  const handleSearch =
    async () => {
      if (!programId) {
        setInteractionRecords([]);
        return;
      }

      if (!batchId) {
        setInteractionRecords([]);
        return;
      }

      if (!recordType) {
        setInteractionRecords([]);
        return;
      }

      if (!subject) {
        setInteractionRecords([]);
        return;
      }

      try {
        setLoadingRecords(true);

        const params = {
          programId,
          batchId,
          date,
          recordType,
          subject,
        };

        const response =
          await getClassInteractions(
            params
          );

        const records =
          extractInteractionRecords(
            response
          );

        setInteractionRecords(
          records
        );
      } catch (error) {
        console.error(
          "Failed to load class interaction records:",
          error
        );

        setInteractionRecords([]);
      } finally {
        setLoadingRecords(false);
      }
    };


  /*
   * ============================================================
   * AUTO SEARCH
   * ============================================================
   */

  useEffect(() => {
    if (
      !programId ||
      !batchId ||
      !recordType ||
      !subject
    ) {
      setInteractionRecords([]);
      return;
    }

    handleSearch();
  }, [
    programId,
    batchId,
    recordType,
    subject,
    date,
  ]);


  /*
   * ============================================================
   * STATUS COUNT
   * ============================================================
   */

  const getStatusCount = (
    targetCenterId,
    targetStatus
  ) => {
    if (
      !Array.isArray(
        interactionRecords
      )
    ) {
      return 0;
    }

    return interactionRecords.filter(
      (record) => {
        const recordCenterId =
          record?.centerId?._id ||
          record?.centerId;

        const recordProgramId =
          record?.programId?._id ||
          record?.programId;

        const recordBatchId =
          record?.batchId?._id ||
          record?.batchId;

        return (
          String(
            recordCenterId
          ) ===
            String(
              targetCenterId
            ) &&
          String(
            recordProgramId
          ) ===
            String(programId) &&
          String(
            recordBatchId
          ) ===
            String(batchId) &&
          record?.status ===
            targetStatus &&
          record?.recordType ===
            recordType &&
          String(
            record?.subject
          ) === String(subject)
        );
      }
    ).length;
  };


  /*
   * ============================================================
   * TOTAL CENTER COUNT
   * ============================================================
   */

  const getTotalCenterCount = (
    targetCenterId
  ) => {
    if (
      !Array.isArray(
        interactionRecords
      )
    ) {
      return 0;
    }

    return interactionRecords.filter(
      (record) => {
        const recordCenterId =
          record?.centerId?._id ||
          record?.centerId;

        const recordProgramId =
          record?.programId?._id ||
          record?.programId;

        const recordBatchId =
          record?.batchId?._id ||
          record?.batchId;

        return (
          String(
            recordCenterId
          ) ===
            String(
              targetCenterId
            ) &&
          String(
            recordProgramId
          ) ===
            String(programId) &&
          String(
            recordBatchId
          ) ===
            String(batchId) &&
          record?.recordType ===
            recordType &&
          String(
            record?.subject
          ) === String(subject)
        );
      }
    ).length;
  };


  /*
   * ============================================================
   * REMARK KEY
   * ============================================================
   */

  const getRemarkKey = (
    targetCenterId,
    targetStatus
  ) =>
    `${targetCenterId}_${targetStatus}`;


  /*
   * ============================================================
   * REMARK CHANGE
   * ============================================================
   */

  const handleRemarkChange = (
    targetCenterId,
    targetStatus,
    value
  ) => {
    const key =
      getRemarkKey(
        targetCenterId,
        targetStatus
      );

    setRemarks(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );
  };


  /*
   * ============================================================
   * MARK STATUS
   *
   * Every click creates a NEW document.
   * ============================================================
   */

  const handleMarkStatus = async (
    center,
    targetStatus,
    event
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!center?._id) {
      return;
    }

    if (!programId) {
      return;
    }

    if (!batchId) {
      return;
    }

    if (!recordType) {
      return;
    }

    if (!subject) {
      return;
    }

    const key =
      getRemarkKey(
        center._id,
        targetStatus
      );

    const remarkValue =
      remarks[key] || "";

    try {
      setSavingKey(key);

      const payload = {
        programId,
        batchId,
        centerId:
          center._id,
        subject,
        recordType,
        status:
          targetStatus,
        date,
        remark:
          remarkValue,
      };

      const response =
        await createClassInteraction(
          payload
        );

      /*
       * Do NOT call handleSearch here.
       * This prevents table/page jump.
       */

      const savedRecord =
        response?.data ||
        response?.interaction ||
        response;

      if (
        savedRecord &&
        typeof savedRecord ===
          "object"
      ) {
        setInteractionRecords(
          (previous) => [
            ...previous,
            {
              ...savedRecord,
              programId,
              batchId,
              centerId:
                center._id,
              subject,
              recordType,
              status:
                targetStatus,
              date,
              remark:
                remarkValue,
            },
          ]
        );
      }

      setRemarks(
        (previous) => ({
          ...previous,
          [key]: "",
        })
      );
    } catch (error) {
      console.error(
        "Failed to save class interaction:",
        error
      );
    } finally {
      setSavingKey("");
    }
  };


  /*
   * ============================================================
   * RESET FILTERS
   *
   * Date always stays current date.
   * ============================================================
   */

  const handleResetFilters = () => {
    setProgramId("");
    setBatchId("");
    setRecordType("");
    setSubject("");
    setLocationSearch("");

    setInteractionRecords([]);
    setRemarks({});

    setDate(getToday());
  };


  /*
   * ============================================================
   * VIEW REPORT
   * ============================================================
   */

  const handleViewReport = () => {
    navigate(
      "/class-interaction/report"
    );
  };


  /*
   * ============================================================
   * REQUIRED FILTER STATE
   * ============================================================
   */

  const filtersReady =
    Boolean(
      programId &&
      batchId &&
      recordType &&
      subject
    );


  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="w-full">

      <div className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4 md:p-5">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-base font-semibold text-gray-800 sm:text-lg">
              Class Interaction
            </h2>

            <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
              Record classroom interaction
              and disciplinary observations.
            </p>
          </div>


          <div className="flex flex-wrap items-center gap-2">

            {/* ==================================================
                VIEW REPORT
            ================================================== */}

            <button
              type="button"
              onClick={
                handleViewReport
              }
              className="rounded-lg border border-blue-500 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 sm:px-3 sm:py-2 sm:text-sm"
            >
              View Report
            </button>


            {/* ==================================================
                RESET FILTERS
            ================================================== */}

            <button
              type="button"
              onClick={
                handleResetFilters
              }
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 sm:px-3 sm:py-2 sm:text-sm"
            >
              Reset Filters
            </button>

          </div>

        </div>


        {/* ======================================================
            PROGRAM
        ====================================================== */}

        <div className="mb-2.5">

          <ProgramDropdown
            programs={
              availablePrograms
            }
            value={programId}
            onChange={
              handleProgramChange
            }
            required
            autoSelectSingle
            hideWhenSingle
          />

        </div>


        {/* ======================================================
            BATCH | TYPE
        ====================================================== */}

        <div className="mb-2.5 flex flex-col gap-2 md:flex-row md:items-end md:gap-4">

          {/* ====================================================
              BATCH
          ==================================================== */}

          <div className="md:w-auto">

            <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
              Batch
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            {availableBatches.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500 sm:py-2 sm:text-sm">
                No batch available
              </div>
            ) : availableBatches.length === 1 ? (
              <div className="inline-flex rounded-lg border border-green-500 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800 sm:px-4 sm:py-2 sm:text-sm">
                {
                  availableBatches[0]
                    ?.batchName
                }
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">

                {availableBatches.map(
                  (batch) => {
                    const selected =
                      String(
                        batchId
                      ) ===
                      String(
                        batch._id
                      );

                    return (
                      <button
                        key={
                          batch._id
                        }
                        type="button"
                        onClick={() =>
                          handleBatchChange(
                            batch._id
                          )
                        }
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                          selected
                            ? "border-green-500 bg-green-100 text-green-800"
                            : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-gray-50"
                        }`}
                      >
                        {
                          batch.batchName
                        }
                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>


          {/* ====================================================
              SEPARATOR
          ==================================================== */}

          <div className="hidden px-0.5 pb-1.5 text-lg font-light text-gray-300 md:block">
            |
          </div>


          {/* ====================================================
              TYPE
          ==================================================== */}

          <div className="md:w-auto">

            <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
              Type
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">

              {CLASS_INTERACTION_RECORD_TYPES.map(
                (item) => {
                  const selected =
                    recordType ===
                    item.value;

                  return (
                    <button
                      key={
                        item.value
                      }
                      type="button"
                      onClick={() =>
                        handleRecordTypeChange(
                          item.value
                        )
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                        selected
                          ? "border-green-500 bg-green-100 text-green-800"
                          : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-gray-50"
                      }`}
                    >
                      {
                        item.label
                      }
                    </button>
                  );
                }
              )}

            </div>

          </div>

        </div>


        {/* ======================================================
            SUBJECT + SEARCH
        ====================================================== */}

        <div className="mb-3 grid grid-cols-1 gap-2.5 md:grid-cols-[minmax(220px,0.35fr)_minmax(0,1fr)] md:gap-3">

          {/* ====================================================
              SUBJECT
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
              Subject
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <select
              value={subject}
              onChange={(event) => {
                setSubject(
                  event.target.value
                );

                setInteractionRecords(
                  []
                );
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:px-3 sm:py-2 sm:text-sm"
            >

              <option value="">
                Select Subject
              </option>

              {CLASS_INTERACTION_SUBJECTS.map(
                (item) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                )
              )}

            </select>

          </div>


          {/* ====================================================
              REGEX SEARCH
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
              Search District / Block / Center
            </label>

            <input
              type="text"
              value={
                locationSearch
              }
              onChange={(event) =>
                setLocationSearch(
                  event.target.value
                )
              }
              placeholder="Type district, block, center or center code..."
              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:px-3 sm:py-2 sm:text-sm"
            />

            <p className="mt-0.5 text-[9px] text-gray-400 sm:mt-1 sm:text-xs">
              Regex supported. Example:
              <span className="ml-1 font-medium">
                rohtak
              </span>
              {" "}or{" "}
              <span className="font-medium">
                center.*12
              </span>
            </p>

          </div>

        </div>


        {/* ======================================================
            CURRENT SELECTION SUMMARY
        ====================================================== */}

        {filtersReady && (
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5 text-[10px] sm:gap-2 sm:text-xs">

            {selectedBatchName && (
              <span className="rounded-md bg-green-50 px-2 py-1 font-medium text-green-700">
                Batch:{" "}
                {
                  selectedBatchName
                }
              </span>
            )}

            {selectedSubjectName && (
              <span className="rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">
                Subject:{" "}
                {
                  selectedSubjectName
                }
              </span>
            )}

            <span className="rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-600">
              {
                filteredCenters.length
              }{" "}
              center
              {filteredCenters.length !==
              1
                ? "s"
                : ""}
            </span>

          </div>
        )}


        {/* ======================================================
            REQUIRED FILTER MESSAGE
        ====================================================== */}

        {!filtersReady && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 sm:px-4 sm:py-5 sm:text-sm">
            Select Program, Batch, Type
            and Subject to view data.
          </div>
        )}


        {/* ======================================================
            LOADING
        ====================================================== */}

        {filtersReady &&
          (loadingCenters ||
            loadingRecords) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 sm:px-4 sm:py-5 sm:text-sm">
              Loading...
            </div>
          )}


        {/* ======================================================
            NO CENTERS
        ====================================================== */}

        {filtersReady &&
          !loadingCenters &&
          !loadingRecords &&
          filteredCenters.length ===
            0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 sm:px-4 sm:py-5 sm:text-sm">
              No centers found.
            </div>
          )}


        {/* ======================================================
            TABLE
        ====================================================== */}

        {filtersReady &&
          !loadingCenters &&
          !loadingRecords &&
          filteredCenters.length >
            0 && (

            <div className="w-full overflow-x-auto rounded-lg border border-gray-200">

              <table className="w-full min-w-[485px] border-collapse md:min-w-[900px]">

                {/* ==================================================
                    TABLE HEADER
                ================================================== */}

                <thead className="bg-gray-50">

                  <tr>

                    {/* DISTRICT */}

                    <th className="w-[55px] max-w-[55px] whitespace-nowrap border-b border-gray-200 px-1 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wide text-gray-500 sm:w-[75px] sm:max-w-[75px] sm:px-1.5 sm:py-2 sm:text-[10px] md:w-auto md:max-w-none md:px-3 md:py-2.5 md:text-xs">

                      District

                    </th>


                    {/* CENTER */}

                    <th className="w-[85px] max-w-[85px] whitespace-nowrap border-b border-gray-200 px-1 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wide text-gray-500 sm:w-[110px] sm:max-w-[110px] sm:px-1.5 sm:py-2 sm:text-[10px] md:w-auto md:max-w-none md:px-3 md:py-2.5 md:text-xs">

                      Center

                    </th>


                    {/* STATUS COLUMNS */}

                    {availableStatuses.map(
                      (statusItem) => (
                        <th
                          key={
                            statusItem.value
                          }
                          className="w-[145px] min-w-[145px] border-b border-gray-200 px-1 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wide text-gray-500 sm:w-[165px] sm:min-w-[165px] sm:px-1.5 sm:py-2 sm:text-[10px] md:w-auto md:min-w-[240px] md:px-3 md:py-2.5 md:text-xs"
                        >
                          {
                            statusItem.label
                          }
                        </th>
                      )
                    )}


                    {/* TOTAL */}

                    <th className="w-[35px] min-w-[35px] border-b border-gray-200 px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-500 sm:w-[45px] sm:min-w-[45px] sm:px-1.5 sm:py-2 sm:text-[10px] md:w-auto md:min-w-0 md:px-3 md:py-2.5 md:text-xs">

                      Total

                    </th>

                  </tr>

                </thead>


                {/* ==================================================
                    TABLE BODY
                ================================================== */}

                <tbody className="divide-y divide-gray-200">

                  {filteredCenters.map(
                    (center) => {

                      const totalMarked =
                        getTotalCenterCount(
                          center._id
                        );

                      const hasMarked =
                        totalMarked > 0;

                      return (
                        <tr
                          key={
                            center._id
                          }
                          className={`transition ${
                            hasMarked
                              ? "bg-green-50/70"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >

                          {/* ========================================
                              DISTRICT
                          ======================================== */}

                          <td className="w-[55px] max-w-[55px] border-r border-gray-100 px-1 py-2 align-top sm:w-[75px] sm:max-w-[75px] sm:px-1.5 sm:py-2.5 md:w-auto md:max-w-none md:px-3 md:py-3">

                            <div className="truncate text-[10px] font-semibold leading-tight text-gray-800 sm:text-[11px] md:text-sm">

                              {
                                getDistrictName(
                                  center
                                )
                              }

                            </div>

                            <div className="mt-0.5 truncate text-[8px] leading-tight text-gray-400 sm:text-[9px] md:text-xs">

                              {
                                getBlockName(
                                  center
                                )
                              }

                            </div>

                          </td>


                          {/* ========================================
                              CENTER
                          ======================================== */}

                          <td className="w-[85px] max-w-[85px] border-r border-gray-100 px-1 py-2 align-top sm:w-[110px] sm:max-w-[110px] sm:px-1.5 sm:py-2.5 md:w-auto md:max-w-none md:px-3 md:py-3">

                            <div className="truncate text-[10px] font-semibold leading-tight text-gray-800 sm:text-[11px] md:text-sm">

                              {
                                center?.centerName ||
                                "-"
                              }

                            </div>

                            {center?.centerCode && (
                              <div className="mt-0.5 truncate text-[8px] leading-tight text-gray-500 sm:text-[9px] md:text-xs">

                                {
                                  center.centerCode
                                }

                              </div>
                            )}

                          </td>


                          {/* ========================================
                              STATUS COLUMNS
                          ======================================== */}

                          {availableStatuses.map(
                            (
                              statusItem
                            ) => {

                              const key =
                                getRemarkKey(
                                  center._id,
                                  statusItem.value
                                );

                              const count =
                                getStatusCount(
                                  center._id,
                                  statusItem.value
                                );

                              const isSaving =
                                savingKey ===
                                key;

                              return (
                                <td
                                  key={
                                    statusItem.value
                                  }
                                  className="w-[145px] min-w-[145px] border-r border-gray-100 px-1 py-1.5 align-middle sm:w-[165px] sm:min-w-[165px] sm:px-1.5 sm:py-2 md:w-auto md:min-w-0 md:px-3 md:py-2.5"
                                >

                                  <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5 md:min-w-[220px] md:gap-2">

                                    {/* STATUS BUTTON */}

                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) =>
                                        handleMarkStatus(
                                          center,
                                          statusItem.value,
                                          event
                                        )
                                      }
                                      disabled={
                                        isSaving ||
                                        !programId ||
                                        !batchId ||
                                        !recordType ||
                                        !subject
                                      }
                                      className={`flex w-full items-center justify-between rounded-md px-1.5 py-1.5 text-left text-[9px] font-semibold leading-tight transition sm:px-2 sm:py-1.5 sm:text-[10px] md:px-3 md:py-2 md:text-xs ${
                                        count >
                                        0
                                          ? "bg-green-600 text-white hover:bg-green-700"
                                          : "bg-blue-600 text-white hover:bg-blue-700"
                                      } disabled:cursor-not-allowed disabled:bg-gray-300`}
                                    >

                                      <span className="truncate">

                                        {
                                          isSaving
                                            ? "Saving..."
                                            : statusItem.label
                                        }

                                      </span>

                                      <span className="ml-1 min-w-[17px] rounded bg-white/20 px-1 py-0.5 text-center text-[9px] font-bold sm:min-w-[20px] sm:text-[10px] md:ml-2 md:min-w-[28px] md:px-2 md:text-sm">

                                        {
                                          isSaving
                                            ? "..."
                                            : count
                                        }

                                      </span>

                                    </button>


                                    {/* REMARK */}

                                    <input
                                      type="text"
                                      value={
                                        remarks[
                                          key
                                        ] ||
                                        ""
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handleRemarkChange(
                                          center._id,
                                          statusItem.value,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      placeholder="Remark..."
                                      className="w-full min-w-0 rounded-md border border-gray-300 bg-white px-1.5 py-1 text-[9px] outline-none placeholder:text-[8px] focus:border-blue-500 focus:ring-1 focus:ring-blue-100 sm:px-2 sm:py-1.5 sm:text-[10px] sm:placeholder:text-[9px] md:px-2.5 md:py-1.5 md:text-xs md:placeholder:text-xs"
                                    />

                                  </div>

                                </td>
                              );
                            }
                          )}


                          {/* ========================================
                              TOTAL
                          ======================================== */}

                          <td className="w-[35px] min-w-[35px] px-1 py-2 text-center align-middle sm:w-[45px] sm:min-w-[45px] sm:px-1.5 sm:py-2.5 md:w-auto md:min-w-0 md:px-3 md:py-3">

                            <span
                              className={`inline-flex min-w-[22px] items-center justify-center rounded-md px-1 py-1 text-[10px] font-bold sm:min-w-[28px] sm:px-1.5 sm:text-[11px] md:min-w-[38px] md:px-2.5 md:py-1.5 md:text-sm ${
                                totalMarked >
                                0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {
                                totalMarked
                              }
                            </span>

                          </td>

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


export default ClassInteractionStatusCard;