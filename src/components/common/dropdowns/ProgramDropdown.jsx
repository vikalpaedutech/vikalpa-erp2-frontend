import { useEffect, useMemo } from "react";
import { useRegionAccess } from "../../../context/RegionAccessContext";

/**
 * ============================================================
 * ProgramDropdown
 * ============================================================
 *
 * PURPOSE:
 * Common reusable controlled dropdown for selecting a Program.
 *
 * FEATURES:
 *
 * 1. CONTROLLED COMPONENT
 *    - `value` is controlled by the parent component.
 *    - `onChange` is called whenever the selected program changes.
 *
 * 2. ACCESS CONTROL
 *    - Only programs available in RegionAccessContext's
 *      `programAccess.programs` are shown.
 *
 * 3. SINGLE PROGRAM AUTO-SELECTION
 *    - If `autoSelectSingle` is true and the user has only
 *      one accessible program, that program is automatically
 *      selected through `onChange`.
 *
 * 4. HIDE WHEN SINGLE
 *    - If `hideWhenSingle` is true and there is only one
 *      accessible program, the dropdown is not rendered.
 *
 * 5. MULTIPLE PROGRAMS
 *    - If the user has multiple accessible programs, the
 *      dropdown remains visible.
 *
 * 6. OPTIONAL / REQUIRED
 *    - Supports normal HTML `required` behavior.
 *
 * 7. DISABLED STATE
 *    - Parent can disable the dropdown using `disabled`.
 *
 * IMPORTANT:
 *    This component does NOT manage the selected value internally.
 *    The parent component remains the source of truth.
 * ============================================================
 */

function ProgramDropdown({
  programs = [],
  value = "",
  onChange,

  label = "Program",
  placeholder = "Select Program",

  disabled = false,
  required = false,

  autoSelectSingle = false,
  hideWhenSingle = false,
}) {
  const { programAccess } = useRegionAccess();

  /**
   * ------------------------------------------------------------
   * Get IDs of programs assigned to the current user.
   * ------------------------------------------------------------
   */
  const accessibleProgramIds = useMemo(() => {
    return (programAccess?.programs || []).map(
      (program) => String(program?._id)
    );
  }, [programAccess?.programs]);

  /**
   * ------------------------------------------------------------
   * Filter the complete program list according to user's access.
   * ------------------------------------------------------------
   */
  const availablePrograms = useMemo(() => {
    return programs.filter((program) =>
      accessibleProgramIds.includes(String(program?._id))
    );
  }, [programs, accessibleProgramIds]);

  /**
   * ------------------------------------------------------------
   * Automatically select the only available program.
   *
   * This does NOT directly mutate the value.
   * It informs the parent through `onChange`.
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (!autoSelectSingle) return;

    if (availablePrograms.length !== 1) return;

    const onlyProgramId = String(availablePrograms[0]._id);

    if (String(value) !== onlyProgramId) {
      onChange?.(onlyProgramId);
    }
  }, [
    autoSelectSingle,
    availablePrograms,
    value,
    onChange,
  ]);

  /**
   * ------------------------------------------------------------
   * Hide dropdown when there is exactly one option.
   *
   * We still keep the component controlled because the parent
   * receives the automatic selection through `onChange`.
   * ------------------------------------------------------------
   */
  if (
    hideWhenSingle &&
    availablePrograms.length === 1
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
        disabled={disabled}
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">
          {placeholder}
        </option>

        {availablePrograms.map((program) => (
          <option
            key={program._id}
            value={program._id}
          >
            {program.programName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProgramDropdown;