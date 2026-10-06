import { useEffect, useMemo } from "react";
import { useRegionAccess } from "../../../context/RegionAccessContext";
import { useAuth } from "../../../context/AuthContext";

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
  const { programAccess, accessScope } = useRegionAccess();
  const { isAdmin } = useAuth();

  const accessibleProgramIds = useMemo(
    () => new Set(
      (programAccess?.programs || [])
        .map((program) => String(program?._id ?? program?.id ?? program))
        .filter(Boolean)
    ),
    [programAccess?.programs]
  );

  const availablePrograms = useMemo(() => {
    // If the caller already supplied an explicitly scoped list and there is no
    // access metadata yet, keep the list visible while authorization hydrates.
    // Once access is available, apply the normal assignment filter.
    if (!Array.isArray(programs)) return [];
    // Administrators have global academic access and must never be
    // filtered by the assignment arrays in UserAccess (which are empty
    // by design for admins).
    if (isAdmin || accessScope == null) return programs;
    return programs.filter((program) =>
      accessibleProgramIds.has(String(program?._id ?? program?.id))
    );
  }, [programs, accessibleProgramIds, programAccess?.programs, accessScope, isAdmin]);

  useEffect(() => {
    if (!autoSelectSingle || availablePrograms.length !== 1) return;
    const onlyProgramId = String(availablePrograms[0]._id);
    if (String(value) !== onlyProgramId) onChange?.(onlyProgramId);
  }, [autoSelectSingle, availablePrograms, value, onChange]);

  if (hideWhenSingle && availablePrograms.length === 1) return null;

  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">{placeholder}</option>
        {availablePrograms.map((program) => (
          <option key={program._id} value={program._id}>
            {program.programName}
            {program.programCode ? ` (${program.programCode})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProgramDropdown;
