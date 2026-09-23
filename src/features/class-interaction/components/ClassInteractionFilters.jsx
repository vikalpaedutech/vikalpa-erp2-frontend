import { useEffect, useMemo } from "react";

import ProgramDropdown from "../../../components/common/dropdowns/ProgramDropdown";
import BatchDropdown from "../../../components/common/dropdowns/BatchDropdown";
import DistrictDropdown from "../../../components/common/dropdowns/DistrictDropdown";
import BlockDropdown from "../../../components/common/dropdowns/BlockDropdown";
import CenterDropdown from "../../../components/common/dropdowns/CenterDropdown";

import {
  CLASS_INTERACTION_RECORD_TYPES,
  CLASS_INTERACTION_STATUSES,
  CLASS_INTERACTION_SUBJECTS,
} from "../constants/classInteraction.constants";

function ClassInteractionFilters({
  programs = [],
  batches = [],

  programId = "",
  batchId = "",

  districtId = "",
  blockId = "",
  centerId = "",

  subject = "",
  recordType = "",
  status = "",
  date = "",

  isCC = false,

  onProgramChange,
  onBatchChange,
  onDistrictChange,
  onBlockChange,
  onCenterChange,

  onSubjectChange,
  onRecordTypeChange,
  onStatusChange,
  onDateChange,

  disabled = false,
}) {
  /**
   * ============================================================
   * Statuses depend on selected Record Type
   * ============================================================
   */
  const availableStatuses = useMemo(() => {
    if (!recordType) {
      return [];
    }

    return (
      CLASS_INTERACTION_STATUSES[recordType] || []
    );
  }, [recordType]);

  /**
   * ============================================================
   * Reset status whenever Record Type changes
   *
   * This prevents something like:
   *
   * Disciplinary -> Indiscipline
   *
   * changing to:
   *
   * Interaction -> Indiscipline
   *
   * ============================================================
   */
  useEffect(() => {
    if (!recordType) {
      if (status) {
        onStatusChange?.("");
      }

      return;
    }

    const statusExists = availableStatuses.some(
      (item) => item.value === status
    );

    if (status && !statusExists) {
      onStatusChange?.("");
    }
  }, [
    recordType,
    status,
    availableStatuses,
    onStatusChange,
  ]);

  return (
    <div className="space-y-4">
      {/* ======================================================
          Program / Batch
          ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProgramDropdown
          programs={programs}
          value={programId}
          onChange={onProgramChange}
          disabled={disabled}
          required
          autoSelectSingle
          hideWhenSingle
        />

        <BatchDropdown
          batches={batches}
          programId={programId}
          value={batchId}
          onChange={onBatchChange}
          disabled={disabled}
          required
          autoSelectSingle
          hideWhenSingle
        />
      </div>

      {/* ======================================================
          Region
          ====================================================== */}

      {isCC ? (
        <div className="grid grid-cols-1 gap-4">
          <CenterDropdown
            value={centerId}
            onChange={onCenterChange}
            label="Center"
            disabled={disabled}
            required
            independent
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DistrictDropdown
            value={districtId}
            onChange={onDistrictChange}
            label="District"
            disabled={disabled}
            required
          />

          <BlockDropdown
            districtId={districtId}
            value={blockId}
            onChange={onBlockChange}
            label="Block"
            disabled={disabled}
            required
          />

          <CenterDropdown
            blockId={blockId}
            value={centerId}
            onChange={onCenterChange}
            label="Center"
            disabled={disabled}
            required
            independent={false}
          />
        </div>
      )}

      {/* ======================================================
          Subject / Date
          ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Subject */}

        <div className="w-full">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Subject
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            value={subject}
            onChange={(event) =>
              onSubjectChange?.(
                event.target.value
              )
            }
            disabled={disabled}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">
              Select Subject
            </option>

            {CLASS_INTERACTION_SUBJECTS.map(
              (item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              )
            )}
          </select>
        </div>

        {/* Date */}

        <div className="w-full">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            type="date"
            value={date}
            onChange={(event) =>
              onDateChange?.(
                event.target.value
              )
            }
            disabled={disabled}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* ======================================================
          Record Type
          ====================================================== */}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Record Type
          <span className="ml-1 text-red-500">
            *
          </span>
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CLASS_INTERACTION_RECORD_TYPES.map(
            (item) => {
              const isSelected =
                recordType === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    onRecordTypeChange?.(
                      item.value
                    )
                  }
                  disabled={disabled}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-gray-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {item.label}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ======================================================
          Status
          ====================================================== */}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Status
          <span className="ml-1 text-red-500">
            *
          </span>
        </label>

        {!recordType ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Select Record Type first
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {availableStatuses.map((item) => {
              const isSelected =
                status === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    onStatusChange?.(
                      item.value
                    )
                  }
                  disabled={disabled}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    isSelected
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-gray-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassInteractionFilters;