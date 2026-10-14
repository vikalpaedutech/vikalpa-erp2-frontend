import { useEffect, useMemo } from "react";
import Select from "react-select";
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
      <Select
        options={[...availablePrograms].sort((a,b) => String(a.programName || "").localeCompare(String(b.programName || ""), undefined, { sensitivity: "base" })).map((program) => ({ value: String(program._id), label: `${program.programName || ""}${program.programCode ? ` (${program.programCode})` : ""}` }))}
        value={[...availablePrograms].map((program) => ({ value: String(program._id), label: `${program.programName || ""}${program.programCode ? ` (${program.programCode})` : ""}` })).find((option) => option.value === String(value)) || null}
        onChange={(option) => onChange?.(option?.value || "")}
        isClearable={!required}
        isSearchable
        placeholder={placeholder}
        isDisabled={disabled}
        className="text-sm"
        classNamePrefix="react-select"
        noOptionsMessage={() => "No programs found"}
      />
    </div>
  );
}

export default ProgramDropdown;
