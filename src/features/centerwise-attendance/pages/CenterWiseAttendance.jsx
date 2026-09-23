import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../../context/AuthContext";
import { useRegionAccess } from "../../../context/RegionAccessContext";

import CenterWiseAttendanceFilters from "../components/CenterWiseAttendanceFilters";
import CenterWiseAttendanceUpload from "../components/CenterWiseAttendanceUpload";
import CenterWiseAttendanceDownloadModal from "../components/CenterWiseAttendanceDownloadModal";
import CenterWiseAttendanceTable from "../components/CenterWiseAttendanceTable";

import {
  getCenterWiseAttendances,
  getCenterWiseAttendanceFileUrl,
  deleteCenterWiseAttendance,
} from "../services/centerWiseAttendance.service";

const CenterWiseAttendance = () => {
  const { access } = useAuth();

  // ============================================================
  // REGION ACCESS
  // ============================================================

  const {
    programAccess,
    districts,
    blocks,
    centers,
    getCentersByDistrict,
    loadingRegionAccess,
  } = useRegionAccess();

  // ============================================================
  // STATE
  // ============================================================

  const [filters, setFilters] =
    useState({
      date: "",
      programId: "",
      batchId: "",
      districtId: "",
      blockId: "",
      centerId: "",
    });

  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    hasSearched,
    setHasSearched,
  ] = useState(false);

  const [
    uploadModalOpen,
    setUploadModalOpen,
  ] = useState(false);

  const [
    downloadModalOpen,
    setDownloadModalOpen,
  ] = useState(false);

  // ============================================================
  // ROLE
  // ============================================================

  const roleCodes = useMemo(() => {
    return (
      access?.roles?.map((role) =>
        String(
          role?.roleCode || ""
        ).toLowerCase()
      ) || []
    );
  }, [access]);

  const isCC =
    roleCodes.includes("cc");

  // ============================================================
  // NORMALIZE API LIST RESPONSE
  // ============================================================

  const normalizeList = (
    response,
    keys = []
  ) => {
    if (Array.isArray(response)) {
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
        response?.data?.data
      )
    ) {
      return response.data.data;
    }

    for (const key of keys) {
      if (
        Array.isArray(
          response?.[key]
        )
      ) {
        return response[key];
      }

      if (
        Array.isArray(
          response?.data?.[key]
        )
      ) {
        return response.data[key];
      }

      if (
        Array.isArray(
          response?.data?.data?.[key]
        )
      ) {
        return response.data.data[key];
      }
    }

    return [];
  };

  // ============================================================
  // ACCESSIBLE PROGRAMS
  // ============================================================

  const accessiblePrograms =
    useMemo(() => {
      return Array.isArray(
        programAccess?.programs
      )
        ? programAccess.programs
        : [];
    }, [
      programAccess,
    ]);

  // ============================================================
  // ACCESSIBLE BATCHES
  // ============================================================

  const accessibleBatches =
    useMemo(() => {
      return Array.isArray(
        programAccess?.batches
      )
        ? programAccess.batches
        : [];
    }, [
      programAccess,
    ]);

  // ============================================================
  // SELECTED PROGRAM
  // ============================================================

  const selectedProgram =
    useMemo(() => {
      return accessiblePrograms.find(
        (program) =>
          String(
            program?._id
          ) ===
          String(
            filters.programId
          )
      );
    }, [
      accessiblePrograms,
      filters.programId,
    ]);

  // ============================================================
  // FILTER BATCHES BY PROGRAM
  // ============================================================

  const filteredBatches =
    useMemo(() => {
      if (!filters.programId) {
        return accessibleBatches;
      }

      return accessibleBatches.filter(
        (batch) => {
          const batchProgramId =
            typeof batch?.programId ===
            "object"
              ? batch?.programId?._id
              : batch?.programId;

          return (
            String(
              batchProgramId
            ) ===
            String(
              filters.programId
            )
          );
        }
      );
    }, [
      accessibleBatches,
      filters.programId,
    ]);

  // ============================================================
  // SELECTED BATCH
  // ============================================================

  const selectedBatch =
    useMemo(() => {
      return accessibleBatches.find(
        (batch) =>
          String(
            batch?._id
          ) ===
          String(
            filters.batchId
          )
      );
    }, [
      accessibleBatches,
      filters.batchId,
    ]);

  // ============================================================
  // PROGRAM ID FROM SELECTED BATCH
  // ============================================================

  const selectedBatchProgramId =
    useMemo(() => {
      if (!selectedBatch?.programId) {
        return (
          filters.programId ||
          ""
        );
      }

      if (
        typeof selectedBatch.programId ===
        "object"
      ) {
        return (
          selectedBatch
            .programId?._id ||
          ""
        );
      }

      return selectedBatch.programId;
    }, [
      selectedBatch,
      filters.programId,
    ]);

  // ============================================================
  // AVAILABLE CENTERS
  // ============================================================

  const availableCenters =
    useMemo(() => {
      if (isCC) {
        return centers;
      }

      if (!filters.districtId) {
        return [];
      }

      return getCentersByDistrict(
        filters.districtId
      );
    }, [
      centers,
      filters.districtId,
      getCentersByDistrict,
      isCC,
    ]);

  // ============================================================
  // SELECTED DISTRICT
  // ============================================================

  const selectedDistrict =
    useMemo(() => {
      return districts.find(
        (district) =>
          String(
            district?._id
          ) ===
          String(
            filters.districtId
          )
      );
    }, [
      districts,
      filters.districtId,
    ]);

  // ============================================================
  // SELECTED CENTER
  // ============================================================

  const selectedCenter =
    useMemo(() => {
      return centers.find(
        (center) =>
          String(
            center?._id
          ) ===
          String(
            filters.centerId
          )
      );
    }, [
      centers,
      filters.centerId,
    ]);

  // ============================================================
  // SELECTED BLOCK
  // ============================================================

  const selectedBlock =
    useMemo(() => {
      return blocks.find(
        (block) =>
          String(
            block?._id
          ) ===
          String(
            selectedCenter
              ?.blockId?._id ||
              selectedCenter
                ?.blockId ||
              filters.blockId ||
              ""
          )
      );
    }, [
      blocks,
      selectedCenter,
      filters.blockId,
    ]);

  // ============================================================
  // AUTO SELECT PROGRAM
  // ============================================================

  useEffect(() => {
    if (
      !accessiblePrograms.length
    ) {
      return;
    }

    if (
      accessiblePrograms.length ===
      1
    ) {
      const onlyProgram =
        accessiblePrograms[0];

      setFilters(
        (previous) => {
          if (
            String(
              previous.programId
            ) ===
            String(
              onlyProgram?._id
            )
          ) {
            return previous;
          }

          return {
            ...previous,
            programId:
              onlyProgram._id,
            batchId: "",
          };
        }
      );

      return;
    }

    setFilters(
      (previous) => {
        const programStillAvailable =
          accessiblePrograms.some(
            (program) =>
              String(
                program?._id
              ) ===
              String(
                previous.programId
              )
          );

        if (
          programStillAvailable
        ) {
          return previous;
        }

        return {
          ...previous,
          programId: "",
          batchId: "",
        };
      }
    );
  }, [
    accessiblePrograms,
  ]);

  // ============================================================
  // AUTO SELECT BATCH
  // ============================================================

  useEffect(() => {
    if (
      !filteredBatches.length
    ) {
      return;
    }

    if (
      filteredBatches.length ===
      1
    ) {
      const onlyBatch =
        filteredBatches[0];

      setFilters(
        (previous) => {
          if (
            String(
              previous.batchId
            ) ===
            String(
              onlyBatch?._id
            )
          ) {
            return previous;
          }

          return {
            ...previous,
            batchId:
              onlyBatch._id,
          };
        }
      );

      return;
    }

    setFilters(
      (previous) => {
        const batchStillAvailable =
          filteredBatches.some(
            (batch) =>
              String(
                batch?._id
              ) ===
              String(
                previous.batchId
              )
          );

        if (
          batchStillAvailable
        ) {
          return previous;
        }

        return {
          ...previous,
          batchId: "",
        };
      }
    );
  }, [
    filteredBatches,
  ]);

  // ============================================================
  // AUTO SELECT SINGLE DISTRICT
  // ============================================================

  useEffect(() => {
    if (isCC) {
      return;
    }

    if (
      districts.length !== 1
    ) {
      return;
    }

    const onlyDistrict =
      districts[0];

    setFilters(
      (previous) => {
        if (
          String(
            previous.districtId
          ) ===
          String(
            onlyDistrict?._id
          )
        ) {
          return previous;
        }

        return {
          ...previous,
          districtId:
            onlyDistrict._id,
          blockId: "",
          centerId: "",
        };
      }
    );
  }, [
    districts,
    isCC,
  ]);

  // ============================================================
  // AUTO SELECT SINGLE CENTER
  // ============================================================

  useEffect(() => {
    if (
      availableCenters.length !==
      1
    ) {
      return;
    }

    const onlyCenter =
      availableCenters[0];

    setFilters(
      (previous) => {
        if (
          String(
            previous.centerId
          ) ===
          String(
            onlyCenter?._id
          )
        ) {
          return previous;
        }

        return {
          ...previous,
          centerId:
            onlyCenter._id,
        };
      }
    );
  }, [
    availableCenters,
  ]);

  // ============================================================
  // FILTER CHANGE
  // ============================================================

  const handleFilterChange = (
    nextFilters
  ) => {
    setFilters(
      nextFilters
    );

    setError("");
    setSuccessMessage("");

    setHasSearched(false);
    setRecords([]);
  };

  // ============================================================
  // VALIDATE FILTERS
  // ============================================================

  const validateFilters =
    () => {
      if (!filters.date) {
        return "Please select date.";
      }

      if (!filters.batchId) {
        return "Please select batch.";
      }

      if (!selectedBatchProgramId) {
        return "Program could not be determined from selected batch.";
      }

      // --------------------------------------------------------
      // CC → CENTER REQUIRED
      // --------------------------------------------------------

      if (
        isCC &&
        !filters.centerId
      ) {
        return "Please select center.";
      }

      // --------------------------------------------------------
      // NON-CC → DISTRICT REQUIRED
      // --------------------------------------------------------

      if (
        !isCC &&
        !filters.districtId
      ) {
        return "Please select district.";
      }

      return "";
    };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch =
    async () => {
      const validationError =
        validateFilters();

      if (validationError) {
        setError(
          validationError
        );

        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const params = {
          date:
            filters.date,

          batchId:
            filters.batchId,

          districtId:
            filters.districtId ||
            undefined,

          blockId:
            undefined,

          centerId:
            filters.centerId ||
            undefined,
        };

        const response =
          await getCenterWiseAttendances(
            params
          );

        const data =
          normalizeList(
            response,
            [
              "attendances",
              "records",
              "data",
              "results",
            ]
          );

        setRecords(data);
        setHasSearched(
          true
        );
      } catch (
        searchError
      ) {
        console.error(
          "Failed to load center-wise attendance:",
          searchError
        );

        setRecords([]);
        setHasSearched(
          true
        );

        setError(
          searchError?.response
            ?.data?.message ||
            searchError?.message ||
            "Failed to load attendance records."
        );
      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setRecords([]);
    setHasSearched(false);

    setError("");
    setSuccessMessage("");

    setFilters({
      date: "",

      programId:
        accessiblePrograms.length ===
        1
          ? accessiblePrograms[0]?._id
          : "",

      batchId: "",

      districtId: "",

      blockId: "",

      centerId: "",
    });
  };

  // ============================================================
  // VIEW FILE
  // ============================================================

  const handleViewFile =
    async (
      attendanceId
    ) => {
      try {
        setError("");

        const response =
          await getCenterWiseAttendanceFileUrl(
            attendanceId
          );

        const fileUrl =
          response?.data?.url ||
          response?.url ||
          response?.data;

        if (!fileUrl) {
          throw new Error(
            "File URL was not returned."
          );
        }

        window.open(
          fileUrl,
          "_blank",
          "noopener,noreferrer"
        );
      } catch (
        fileError
      ) {
        console.error(
          "Failed to open attendance file:",
          fileError
        );

        setError(
          fileError?.response
            ?.data?.message ||
            fileError?.message ||
            "Failed to open attendance file."
        );
      }
    };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete =
    async (
      attendanceId
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this attendance record?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccessMessage("");

        await deleteCenterWiseAttendance(
          attendanceId
        );

        setRecords(
          (previous) =>
            previous.filter(
              (record) =>
                String(
                  record?._id
                ) !==
                String(
                  attendanceId
                )
            )
        );

        setSuccessMessage(
          "Attendance record deleted successfully."
        );
      } catch (
        deleteError
      ) {
        console.error(
          "Failed to delete attendance:",
          deleteError
        );

        setError(
          deleteError?.response
            ?.data?.message ||
            deleteError?.message ||
            "Failed to delete attendance record."
        );
      }
    };

  // ============================================================
  // UPLOAD SUCCESS
  // ============================================================

  const handleUploadSuccess =
    async () => {
      setSuccessMessage(
        "Attendance uploaded successfully."
      );

      setUploadModalOpen(
        false
      );

      await handleSearch();
    };

  // ============================================================
  // RENDER
  // ============================================================


  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Center-wise Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Upload and manage center-wise attendance records.
          </p>
        </div>

        {/* ====================================================
            DOWNLOAD FORMAT
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            setDownloadModalOpen(
              true
            )
          }
          disabled={
            loading ||
            loadingRegionAccess
          }
          className="rounded-lg border border-blue-600 bg-white px-5 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download Attendance Pdf Format
        </button>

      </div>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ======================================================
          SUCCESS
      ======================================================= */}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">
            {successMessage}
          </p>
        </div>
      )}

      {/* ======================================================
          FILTERS
      ======================================================= */}

      <CenterWiseAttendanceFilters
        filters={filters}
        onChange={
          handleFilterChange
        }
        onSearch={
          handleSearch
        }
        onReset={
          handleReset
        }
        loading={
          loading ||
          loadingRegionAccess
        }
        programs={
          accessiblePrograms
        }
        batches={
          filteredBatches
        }
      />

      {/* ======================================================
          SEARCH RESULT SECTION
      ======================================================= */}

      {hasSearched && (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Program
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {selectedProgram
                    ?.programName ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Batch
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {selectedBatch
                    ?.batchName ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  District
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {isCC
                    ? "-"
                    : selectedDistrict
                        ?.districtName ||
                      "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Center
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {selectedCenter
                    ?.centerName ||
                    "-"}
                </p>
              </div>

            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Attendance Records
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {records.length} record
                {records.length !== 1
                  ? "s"
                  : ""}{" "}
                found.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setUploadModalOpen(
                  true
                )
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Upload Attendance
            </button>

          </div>

          <CenterWiseAttendanceTable
            records={
              records
            }
            loading={
              loading
            }
            selectedCenter={
              selectedCenter
            }
            selectedBatch={
              selectedBatch
            }
            onView={
              handleViewFile
            }
            onDelete={
              handleDelete
            }
          />
        </>
      )}

      {/* ======================================================
          UPLOAD MODAL
      ======================================================= */}

      <CenterWiseAttendanceUpload
        isOpen={
          uploadModalOpen
        }
        onClose={() =>
          setUploadModalOpen(
            false
          )
        }
        onSuccess={
          handleUploadSuccess
        }
        programId={
          selectedBatchProgramId
        }
        batchId={
          filters.batchId
        }
        districtId={
          filters.districtId
        }
        blockId={
          filters.blockId ||
          selectedCenter
            ?.blockId?._id ||
          selectedCenter
            ?.blockId ||
          ""
        }
        centerId={
          filters.centerId
        }
        date={
          filters.date
        }
        programName={
          selectedProgram
            ?.programName ||
          ""
        }
        batchName={
          selectedBatch
            ?.batchName ||
          ""
        }
        districtName={
          selectedDistrict
            ?.districtName ||
          ""
        }
        blockName={
          selectedBlock
            ?.blockName ||
          ""
        }
        centerName={
          selectedCenter
            ?.centerName ||
          ""
        }
      />

      {/* ======================================================
          DOWNLOAD FORMAT MODAL
      ======================================================= */}

      <CenterWiseAttendanceDownloadModal
        isOpen={
          downloadModalOpen
        }
        onClose={() =>
          setDownloadModalOpen(
            false
          )
        }
        programId={
          selectedBatchProgramId
        }
        batchId={
          filters.batchId
        }
        date={
          filters.date
        }
      />

    </div>
  );
};

export default CenterWiseAttendance;