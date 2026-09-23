import React, { useEffect, useMemo } from "react";

import { useAuth } from "../../../context/AuthContext";

import DistrictCenterDropdown from "../../../components/common/dropdowns/DistrictCenterDropdown";
import CenterDropdown from "../../../components/common/dropdowns/CenterDropdown";
import ProgramDropdown from "../../../components/common/dropdowns/ProgramDropdown";
import BatchDropdown from "../../../components/common/dropdowns/BatchDropdown";

function CenterWiseAttendanceFilters({
  filters,
  onChange,
  onSearch,
  onReset,
  loading,

  programs = [],
  batches = [],
}) {
  const { access } = useAuth();

  // ============================================================
  // ROLE
  // ============================================================

  const roleCodes = useMemo(() => {
    return (
      access?.roles?.map((role) =>
        String(role?.roleCode || "").toLowerCase()
      ) || []
    );
  }, [access]);

  const isCC = roleCodes.includes("cc");

  // ============================================================
  // AUTO SELECT SINGLE PROGRAM
  // ============================================================

  useEffect(() => {
    if (
      programs.length === 1 &&
      String(filters.programId) !==
        String(programs[0]?._id)
    ) {
      onChange({
        ...filters,
        programId: programs[0]._id,
        batchId: "",
      });
    }
  }, [programs]);

  // ============================================================
  // AUTO SELECT SINGLE BATCH
  // ============================================================

  useEffect(() => {
    if (
      batches.length === 1 &&
      String(filters.batchId) !==
        String(batches[0]?._id)
    ) {
      onChange({
        ...filters,
        batchId: batches[0]._id,
      });
    }
  }, [batches]);

  // ============================================================
  // PROGRAM CHANGE
  // ============================================================

  const handleProgramChange = (programId) => {
    onChange({
      ...filters,
      programId,
      batchId: "",
    });
  };

  // ============================================================
  // BATCH CHANGE
  // ============================================================

  const handleBatchChange = (batchId) => {
    onChange({
      ...filters,
      batchId,
    });
  };

  // ============================================================
  // DISTRICT + CENTER CHANGE
  // ============================================================

  const handleDistrictCenterChange = ({
    districtId,
    centerId,
  }) => {
    onChange({
      ...filters,
      districtId,
      centerId,
      blockId: "",
    });
  };

  // ============================================================
  // CENTER CHANGE — CC
  // ============================================================

  const handleCenterChange = (centerId) => {
    onChange({
      ...filters,
      centerId,
      districtId: "",
      blockId: "",
    });
  };

  // ============================================================
  // DATE CHANGE
  // ============================================================

  const handleDateChange = (event) => {
    onChange({
      ...filters,
      date: event.target.value,
    });
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    onSearch();
  };

  // ============================================================
  // RENDER
  // ============================================================

  

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">
              Filters
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Select attendance date and required filters.
            </p>
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset Filters
          </button>
        </div>

        {/* ======================================================
            FILTER GRID
        ======================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

          {/* ====================================================
              DATE
          ===================================================== */}

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="date"
              value={filters.date}
              onChange={handleDateChange}
              disabled={loading}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* ====================================================
              PROGRAM
          ===================================================== */}

          {programs.length > 1 && (
            <ProgramDropdown
              programs={programs}
              value={filters.programId}
              onChange={handleProgramChange}
              disabled={loading}
              required
              autoSelectSingle
              hideWhenSingle
            />
          )}

          {/* ====================================================
              BATCH
          ===================================================== */}

          <BatchDropdown
            batches={batches}
            programId={filters.programId}
            value={filters.batchId}
            onChange={handleBatchChange}
            disabled={loading}
            required
            autoSelectSingle
            hideWhenSingle
          />

          {/* ====================================================
              CC → CENTER ONLY
          ==================================================== */}

          {isCC && (
            <CenterDropdown
              value={filters.centerId}
              onChange={handleCenterChange}
              disabled={loading}
              required
              independent
            />
          )}

          {/* ====================================================
              NON-CC → DISTRICT + CENTER
          ==================================================== */}

          {!isCC && (
            <DistrictCenterDropdown
              districtId={filters.districtId}
              centerId={filters.centerId}
              onChange={
                handleDistrictCenterChange
              }
              disabled={loading}
              required
            />
          )}

        </div>

        {/* ======================================================
            SEARCH BUTTON
        ======================================================= */}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Loading..."
              : "Search"}
          </button>
        </div>

      </div>
    </form>
  );
}

export default CenterWiseAttendanceFilters;