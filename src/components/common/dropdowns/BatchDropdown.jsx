import { useEffect, useMemo } from "react";
import { useRegionAccess } from "../../../context/RegionAccessContext";

/**
 * ============================================================
 * BatchDropdown
 * ============================================================
 *
 * PURPOSE:
 * Common reusable controlled dropdown for selecting a Batch.
 *
 * FEATURES:
 *
 * 1. CONTROLLED COMPONENT
 *    - `value` is controlled by the parent component.
 *    - `onChange` is called whenever the selected batch changes.
 *
 * 2. ACCESS CONTROL
 *    - Only batches available in RegionAccessContext's
 *      `programAccess.batches` are shown.
 *
 * 3. PROGRAM DEPENDENCY
 *    - By default, BatchDropdown depends on `programId`.
 *    - Only batches belonging to the selected program are shown.
 *
 * 4. INDEPENDENT MODE
 *    - `independent={true}` removes the program dependency.
 *    - This allows the parent to use BatchDropdown directly
 *      without selecting a Program first.
 *
 * 5. SINGLE BATCH AUTO-SELECTION
 *    - If `autoSelectSingle` is true and only one batch is
 *      available, it is automatically selected through `onChange`.
 *
 * 6. HIDE WHEN SINGLE
 *    - If `hideWhenSingle` is true and only one batch is
 *      available, the dropdown is not rendered.
 *
 * 7. MULTIPLE BATCHES
 *    - If multiple batches are available, the dropdown remains
 *      visible.
 *
 * 8. OPTIONAL / REQUIRED
 *    - Supports normal HTML `required` behavior.
 *
 * 9. DISABLED STATE
 *    - Parent can disable the dropdown using `disabled`.
 *
 * IMPORTANT:
 *    This component does NOT manage the selected value internally.
 *    The parent component remains the source of truth.
 * ============================================================
 */

function BatchDropdown({
  batches = [],

  /**
   * Program dependency.
   *
   * Required when `independent` is false.
   */
  programId = "",

  /**
   * Controlled value.
   */
  value = "",

  /**
   * Parent callback.
   */
  onChange,

  label = "Batch",
  placeholder = "Select Batch",

  disabled = false,
  required = false,

  /**
   * Automatically select the only available batch.
   */
  autoSelectSingle = false,

  /**
   * Hide dropdown when only one batch is available.
   */
  hideWhenSingle = false,

  /**
   * If true, program dependency is completely removed.
   */
  independent = false,
}) {
  const { programAccess } = useRegionAccess();

  /**
   * ------------------------------------------------------------
   * Get IDs of batches assigned to the current user.
   * ------------------------------------------------------------
   */
  const accessibleBatchIds = useMemo(() => {
    return (programAccess?.batches || []).map(
      (batch) => String(batch?._id)
    );
  }, [programAccess?.batches]);

  /**
   * ------------------------------------------------------------
   * Filter batches according to:
   *
   * 1. User's batch access
   * 2. Selected program (unless independent mode is enabled)
   * ------------------------------------------------------------
   */
  const availableBatches = useMemo(() => {
    let filteredBatches = batches.filter((batch) =>
      accessibleBatchIds.includes(String(batch?._id))
    );

    /**
     * Program-dependent mode.
     */
    if (!independent && programId) {
      filteredBatches = filteredBatches.filter(
        (batch) =>
          String(
            batch?.programId?._id ||
              batch?.programId
          ) === String(programId)
      );
    }

    /**
     * If no program is selected and component is dependent,
     * no batches should be shown.
     */
    if (!independent && !programId) {
      return [];
    }

    return filteredBatches;
  }, [
    batches,
    accessibleBatchIds,
    independent,
    programId,
  ]);

  /**
   * ------------------------------------------------------------
   * Automatically select the only available batch.
   *
   * Parent remains the source of truth.
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (!autoSelectSingle) return;

    if (availableBatches.length !== 1) return;

    const onlyBatchId = String(
      availableBatches[0]._id
    );

    if (String(value) !== onlyBatchId) {
      onChange?.(onlyBatchId);
    }
  }, [
    autoSelectSingle,
    availableBatches,
    value,
    onChange,
  ]);

  /**
   * ------------------------------------------------------------
   * Hide dropdown when only one option exists.
   * ------------------------------------------------------------
   */
  if (
    hideWhenSingle &&
    availableBatches.length === 1
  ) {
    return null;
  }

  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        disabled={
          disabled ||
          (!independent && !programId)
        }
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">
          {!independent && !programId
            ? "Select Program First"
            : placeholder}
        </option>

        {availableBatches.map((batch) => (
          <option
            key={batch._id}
            value={batch._id}
          >
            {batch.batchName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default BatchDropdown;