import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../../context/AuthContext";

import {
  getBatches,
} from "../../../services/batch.service";

import {
  getDistricts,
} from "../../../services/district.service";

import {
  getBlocks,
} from "../../../services/block.service";

import {
  getCenters,
} from "../../../services/center.service";

import {
  getAbsenteeCallingStudents,
  saveAbsenteeCalling,
} from "../services/absenteeCalling.service";

import AbsenteeCallingFilters from "../components/AbsenteeCallingFilters";
import AbsenteeCallingCard from "../components/AbsenteeCallingCard";

// ============================================================
// HELPERS
// ============================================================

const getId = (value) => {
  if (!value) {
    return "";
  }

  return String(
    value?._id || value
  );
};

// ============================================================
// REMARK OPTIONS
// ============================================================

const connectedRemarks = [
  "Sick",
  "Out of town",
  "Wants SLC",
  "Not interested",
  "Other",
];

const notConnectedRemarks = [
  "Call not picked",
  "Wrong number",
  "Out of service",
  "Number Busy",
];

// ============================================================
// COMPONENT
// ============================================================

function AbsenteeCalling() {
  const {
    accessScope,
    isAdmin,
  } = useAuth();

  // ============================================================
  // ACCESS
  // ============================================================

  const programAccess =
    accessScope?.programAccess || {};

  const accessibleBatches =
    programAccess.batches || [];

  const regionAccess =
    accessScope?.regionAccess || [];

  const hasGlobalScope =
    isAdmin ||
    regionAccess.some(
      (region) =>
        region.scope === "global"
    );

  /*
   * Filter visibility according to region scope.
   *
   * Global/Admin:
   * District + Block + Center
   *
   * District:
   * District + Block + Center
   *
   * Block:
   * Block + Center
   *
   * Center:
   * Center only
   */

  const showDistrict =
    hasGlobalScope ||
    regionAccess.some(
      (region) =>
        region.scope === "district"
    );

  const showBlock =
    hasGlobalScope ||
    regionAccess.some(
      (region) =>
        region.scope === "district" ||
        region.scope === "block"
    );

  const showCenter =
    hasGlobalScope ||
    regionAccess.some(
      (region) =>
        [
          "district",
          "block",
          "center",
        ].includes(region.scope)
    );

  // ============================================================
  // FILTERS
  // ============================================================

  /*
   * IMPORTANT:
   *
   * Date is intentionally blank initially.
   *
   * No data will be loaded until user explicitly
   * selects Date + Batch + Center and clicks Search.
   */

  const [filters, setFilters] = useState({
    date: "",
    batchId: "",
    districtId: "",
    blockId: "",
    centerId: "",
  });

  // ============================================================
  // FILTER ERROR
  // ============================================================

  const [filterError, setFilterError] =
    useState("");

  // ============================================================
  // REGION DATA
  // ============================================================

  const [districts, setDistricts] =
    useState([]);

  const [blocks, setBlocks] =
    useState([]);

  const [centers, setCenters] =
    useState([]);

  const [batches, setBatches] =
    useState([]);

  // ============================================================
  // STUDENTS
  // ============================================================

  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [filterLoading, setFilterLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // SELECTED STUDENT
  // ============================================================

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [callingStatus, setCallingStatus] =
    useState("");

  const [remark, setRemark] =
    useState("");

  const [comment, setComment] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  // ============================================================
  // ACCESSIBLE REGION IDS
  // ============================================================

  const accessibleDistrictIds =
    useMemo(() => {
      return [
        ...new Set(
          regionAccess
            .filter(
              (region) =>
                region.districtId
            )
            .map(
              (region) =>
                getId(
                  region.districtId
                )
            )
            .filter(Boolean)
        ),
      ];
    }, [regionAccess]);

  const accessibleBlockIds =
    useMemo(() => {
      return [
        ...new Set(
          regionAccess
            .filter(
              (region) =>
                region.blockId
            )
            .map(
              (region) =>
                getId(
                  region.blockId
                )
            )
            .filter(Boolean)
        ),
      ];
    }, [regionAccess]);

  const accessibleCenterIds =
    useMemo(() => {
      return [
        ...new Set(
          regionAccess
            .filter(
              (region) =>
                region.centerId
            )
            .map(
              (region) =>
                getId(
                  region.centerId
                )
            )
            .filter(Boolean)
        ),
      ];
    }, [regionAccess]);

  // ============================================================
  // LOAD FILTER DATA
  // ============================================================

  const loadFilterData = async () => {
    try {
      setFilterLoading(true);
      setError("");

      // ========================================================
      // BATCHES
      // ========================================================

      if (
        !isAdmin &&
        accessibleBatches.length > 0
      ) {
        setBatches(
          accessibleBatches
        );
      } else {
        const batchResponse =
          await getBatches({
            page: 1,
            limit: 1000,
          });

        setBatches(
          batchResponse.data
            ?.batches ||
            batchResponse.data ||
            []
        );
      }

      // ========================================================
      // REGIONS
      // ========================================================

      const [
        districtResponse,
        blockResponse,
        centerResponse,
      ] = await Promise.all([
        getDistricts({
          page: 1,
          limit: 1000,
        }),

        getBlocks({
          page: 1,
          limit: 1000,
        }),

        getCenters({
          page: 1,
          limit: 1000,
        }),
      ]);

      const allDistricts =
        districtResponse.data
          ?.districts ||
        districtResponse.data ||
        [];

      const allBlocks =
        blockResponse.data
          ?.blocks ||
        blockResponse.data ||
        [];

      const allCenters =
        centerResponse.data
          ?.centers ||
        centerResponse.data ||
        [];

      // ========================================================
      // ADMIN / GLOBAL
      // ========================================================

      if (hasGlobalScope) {
        setDistricts(
          allDistricts
        );

        setBlocks(
          allBlocks
        );

        setCenters(
          allCenters
        );

        return;
      }

      // ========================================================
      // DISTRICTS
      // ========================================================

      const filteredDistricts =
        allDistricts.filter(
          (district) =>
            accessibleDistrictIds.includes(
              String(
                district._id
              )
            )
        );

      setDistricts(
        filteredDistricts
      );

      // ========================================================
      // BLOCKS
      // ========================================================

      const filteredBlocks =
        allBlocks.filter(
          (block) => {
            const blockId =
              String(
                block._id
              );

            const districtId =
              getId(
                block.districtId
              );

            return (
              accessibleBlockIds.includes(
                blockId
              ) ||
              accessibleDistrictIds.includes(
                districtId
              )
            );
          }
        );

      setBlocks(
        filteredBlocks
      );

      // ========================================================
      // CENTERS
      // ========================================================

      const filteredCenters =
        allCenters.filter(
          (center) => {
            const centerId =
              String(
                center._id
              );

            const blockId =
              getId(
                center.blockId
              );

            const districtId =
              getId(
                center.districtId
              );

            return (
              accessibleCenterIds.includes(
                centerId
              ) ||
              accessibleBlockIds.includes(
                blockId
              ) ||
              accessibleDistrictIds.includes(
                districtId
              )
            );
          }
        );

      setCenters(
        filteredCenters
      );
    } catch (error) {
      console.error(
        "Failed to load absentee filters:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load filter data."
      );
    } finally {
      setFilterLoading(false);
    }
  };

  // ============================================================
  // LOAD ABSENT STUDENTS
  // ============================================================

  const loadStudents = async (
    filterValues
  ) => {
    try {
      setLoading(true);
      setError("");
      setFilterError("");

      const params = {
        date:
          filterValues.date,
      };

      if (
        filterValues.batchId
      ) {
        params.batchId =
          filterValues.batchId;
      }

      if (
        filterValues.districtId
      ) {
        params.districtId =
          filterValues.districtId;
      }

      if (
        filterValues.blockId
      ) {
        params.blockId =
          filterValues.blockId;
      }

      if (
        filterValues.centerId
      ) {
        params.centerId =
          filterValues.centerId;
      }

      const response =
        await getAbsenteeCallingStudents(
          params
        );

      setStudents(
        response.data?.students ||
          []
      );
    } catch (error) {
      console.error(
        "Failed to load absentee students:",
        error
      );

      setStudents([]);

      setError(
        error.response?.data?.message ||
          "Failed to load absentee students."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL FILTER DATA ONLY
  // ============================================================

  useEffect(() => {
    loadFilterData();
  }, [
    isAdmin,
    accessScope,
  ]);

  /*
   * IMPORTANT:
   *
   * There is NO loadStudents() here.
   *
   * Students will only be loaded after Search button.
   */

  // ============================================================
  // FILTERED BLOCKS
  // ============================================================

  const visibleBlocks =
    useMemo(() => {
      if (
        !filters.districtId
      ) {
        return blocks;
      }

      return blocks.filter(
        (block) =>
          getId(
            block.districtId
          ) ===
          String(
            filters.districtId
          )
      );
    }, [
      blocks,
      filters.districtId,
    ]);

  // ============================================================
  // FILTERED CENTERS
  // ============================================================

  const visibleCenters =
    useMemo(() => {
      let result =
        centers;

      if (
        filters.districtId
      ) {
        result =
          result.filter(
            (center) =>
              getId(
                center.districtId
              ) ===
              String(
                filters.districtId
              )
          );
      }

      if (
        filters.blockId
      ) {
        result =
          result.filter(
            (center) =>
              getId(
                center.blockId
              ) ===
              String(
                filters.blockId
              )
          );
      }

      return result;
    }, [
      centers,
      filters.districtId,
      filters.blockId,
    ]);

  // ============================================================
  // FILTER CHANGE
  // ============================================================

  const handleFilterChange = (
    field,
    value
  ) => {
    setFilterError("");

    setFilters(
      (previous) => {
        const updated = {
          ...previous,
          [field]: value,
        };

        // ------------------------------------------------------
        // DISTRICT CHANGED
        // ------------------------------------------------------

        if (
          field ===
          "districtId"
        ) {
          updated.blockId = "";
          updated.centerId = "";
        }

        // ------------------------------------------------------
        // BLOCK CHANGED
        // ------------------------------------------------------

        if (
          field ===
          "blockId"
        ) {
          updated.centerId = "";
        }

        return updated;
      }
    );
  };

  // ============================================================
  // SEARCH VALIDATION
  // ============================================================

  const validateFilters =
    () => {
      if (!filters.date) {
        return "Please select Date.";
      }

      if (!filters.batchId) {
        return "Please select Batch.";
      }

      /*
       * Center is mandatory for every user.
       */

      if (!filters.centerId) {
        return "Please select Center.";
      }

      /*
       * If District filter is visible,
       * it must be selected.
       */

      if (
        showDistrict &&
        !filters.districtId
      ) {
        return "Please select District.";
      }

      /*
       * If Block filter is visible,
       * it must be selected.
       */

      if (
        showBlock &&
        !filters.blockId
      ) {
        return "Please select Block.";
      }

      return "";
    };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = async (
    event
  ) => {
    event.preventDefault();

    setFilterError("");
    setError("");

    const validationError =
      validateFilters();

    if (validationError) {
      setStudents([]);
      setFilterError(
        validationError
      );
      return;
    }

    await loadStudents(
      filters
    );
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    const resetFilters = {
      date: "",
      batchId: "",
      districtId: "",
      blockId: "",
      centerId: "",
    };

    setFilters(
      resetFilters
    );

    /*
     * Important:
     *
     * Reset does NOT call API.
     * Existing students are cleared.
     */

    setStudents([]);

    setFilterError("");
    setError("");
  };

  // ============================================================
  // OPEN CALL
  // ============================================================

  const handleOpenCall = (
    student
  ) => {
    setSelectedStudent(
      student
    );

    setCallingStatus(
      student.callingStatus ||
        ""
    );

    setRemark(
      student.remark ||
        ""
    );

    setComment(
      student.comment ||
        ""
    );

    setSaveError("");
  };

  // ============================================================
  // CLOSE CALL
  // ============================================================

  const handleCloseCall =
    () => {
      if (saving) {
        return;
      }

      setSelectedStudent(
        null
      );

      setCallingStatus("");
      setRemark("");
      setComment("");
      setSaveError("");
    };

  // ============================================================
  // STATUS CHANGE
  // ============================================================

  const handleStatusChange =
    (value) => {
      setCallingStatus(
        value
      );

      setRemark("");
    };

  // ============================================================
  // SAVE CALL
  // ============================================================

  const handleSaveCall =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !selectedStudent
      ) {
        return;
      }

      if (!callingStatus) {
        setSaveError(
          "Please select calling status."
        );

        return;
      }

      if (!remark) {
        setSaveError(
          "Please select remark."
        );

        return;
      }

      try {
        setSaving(true);
        setSaveError("");

        const response =
          await saveAbsenteeCalling(
            {
              enrollmentId:
                selectedStudent.enrollmentId,

              callingStatus,

              remark,

              comment,
            }
          );

        const savedDetail =
          response.data
            ?.callingDetails;

        // ======================================================
        // UPDATE CARD LOCALLY
        // ======================================================

        setStudents(
          (previous) =>
            previous.map(
              (student) => {
                if (
                  String(
                    student.enrollmentId
                  ) !==
                  String(
                    selectedStudent.enrollmentId
                  )
                ) {
                  return student;
                }

                return {
                  ...student,

                  callingDetailsId:
                    savedDetail?._id ||
                    student.callingDetailsId,

                  callingStatus:
                    savedDetail
                      ?.callingStatus ||
                    callingStatus,

                  remark:
                    savedDetail
                      ?.remark ||
                    remark,

                  comment:
                    savedDetail
                      ?.comment ||
                    comment,

                  calledAt:
                    savedDetail
                      ?.updatedAt ||
                    new Date()
                      .toISOString(),
                };
              }
            )
        );

        setSelectedStudent(
          null
        );

        setCallingStatus("");
        setRemark("");
        setComment("");
      } catch (error) {
        console.error(
          "Failed to save absentee calling:",
          error
        );

        setSaveError(
          error.response?.data?.message ||
            "Failed to save absentee calling."
        );
      } finally {
        setSaving(false);
      }
    };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Absentee Calling
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Select filters to view absent students for calling.
        </p>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <AbsenteeCallingFilters
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
        batches={batches}
        districts={
          districts
        }
        blocks={
          visibleBlocks
        }
        centers={
          visibleCenters
        }
        showDistrict={
          showDistrict
        }
        showBlock={
          showBlock
        }
        showCenter={
          showCenter
        }
        loading={
          loading ||
          filterLoading
        }
      />

      {/* ======================================================
          FILTER VALIDATION ERROR
      ====================================================== */}

      {filterError && (
        <div className="mb-5 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {filterError}
        </div>
      )}

      {/* ======================================================
          API ERROR
      ====================================================== */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          BEFORE SEARCH
      ====================================================== */}

      {!loading &&
        !error &&
        !filterError &&
        students.length === 0 &&
        !filters.date &&
        !filters.batchId &&
        !filters.districtId &&
        !filters.blockId &&
        !filters.centerId && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="font-medium text-gray-700">
              Select filters to view absentee students.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Date, Batch and Center are required.
            </p>
          </div>
        )}

      {/* ======================================================
          TOTAL
      ====================================================== */}

      {(
        loading ||
        students.length > 0
      ) && (
        <div className="mb-4 text-sm text-gray-600">
          Total Absentees:{" "}
          <span className="font-semibold text-gray-900">
            {students.length}
          </span>
        </div>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Loading absentee students...
        </div>
      )}

      {/* ======================================================
          STUDENTS
      ====================================================== */}

      {!loading &&
        students.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {students.map(
              (student) => (
                <AbsenteeCallingCard
                  key={
                    student.enrollmentId
                  }
                  student={
                    student
                  }
                  onCall={
                    handleOpenCall
                  }
                />
              )
            )}
          </div>
        )}

      {/* ======================================================
          SEARCH COMPLETED BUT NO STUDENTS
      ====================================================== */}

      {!loading &&
        students.length === 0 &&
        filters.date &&
        filters.batchId &&
        filters.centerId &&
        !filterError && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="font-medium text-gray-700">
              No absent students found.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing the filters.
            </p>
          </div>
        )}

      {/* ======================================================
          CALL FORM MODAL
      ====================================================== */}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-start justify-between border-b border-gray-200 p-5">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Absentee Calling
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedStudent.name}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseCall
                }
                disabled={
                  saving
                }
                className="text-2xl leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* ==================================================
                STUDENT SUMMARY
            ================================================== */}

            <div className="border-b border-gray-200 bg-gray-50 p-5">

              <div className="grid grid-cols-2 gap-4 text-sm">

                <div>
                  <p className="text-xs text-gray-500">
                    Father
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {selectedStudent.fatherName ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Center
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {selectedStudent.centerName ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Contact
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {selectedStudent.personalContact ||
                      selectedStudent.parentContact ||
                      selectedStudent.otherContact ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Attendance
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    Absent
                  </span>
                </div>

              </div>
            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={
                handleSaveCall
              }
              className="p-5"
            >

              {saveError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              {/* =================================================
                  CALLING STATUS
              ================================================= */}

              <div className="mb-4">

                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Calling Status
                </label>

                <select
                  value={
                    callingStatus
                  }
                  onChange={(
                    event
                  ) =>
                    handleStatusChange(
                      event.target.value
                    )
                  }
                  disabled={
                    saving
                  }
                  className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select Status
                  </option>

                  <option value="Connected">
                    Connected
                  </option>

                  <option value="Not Connected">
                    Not Connected
                  </option>
                </select>

              </div>

              {/* =================================================
                  REMARK
              ================================================= */}

              {callingStatus && (
                <div className="mb-4">

                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Remark
                  </label>

                  <select
                    value={
                      remark
                    }
                    onChange={(
                      event
                    ) =>
                      setRemark(
                        event.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                    className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select Remark
                    </option>

                    {(
                      callingStatus ===
                      "Connected"
                        ? connectedRemarks
                        : notConnectedRemarks
                    ).map(
                      (
                        option
                      ) => (
                        <option
                          key={
                            option
                          }
                          value={
                            option
                          }
                        >
                          {
                            option
                          }
                        </option>
                      )
                    )}
                  </select>

                </div>
              )}

              {/* =================================================
                  COMMENT
              ================================================= */}

              <div className="mb-5">

                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Comment
                </label>

                <textarea
                  rows="4"
                  value={
                    comment
                  }
                  onChange={(
                    event
                  ) =>
                    setComment(
                      event.target.value
                    )
                  }
                  disabled={
                    saving
                  }
                  placeholder="Enter comment..."
                  className="w-full resize-none rounded-lg border border-gray-400 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={
                    handleCloseCall
                  }
                  disabled={
                    saving
                  }
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Call"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AbsenteeCalling;