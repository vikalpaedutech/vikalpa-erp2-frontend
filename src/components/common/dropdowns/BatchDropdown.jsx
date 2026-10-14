import { useEffect, useMemo } from "react";
import Select from "react-select";
import { useRegionAccess } from "../../../context/RegionAccessContext";
import { useAuth } from "../../../context/AuthContext";

function BatchDropdown({
  batches = [],
  programId = "",
  value = "",
  onChange,
  label = "Batch",
  placeholder = "Select Batch",
  disabled = false,
  required = false,
  autoSelectSingle = false,
  hideWhenSingle = false,
  independent = false,
}) {
  const { programAccess, accessScope } = useRegionAccess();
  const { isAdmin } = useAuth();

  const accessibleBatchIds = useMemo(
    () => new Set(
      (programAccess?.batches || [])
        .map((batch) => String(batch?._id ?? batch?.id ?? batch))
        .filter(Boolean)
    ),
    [programAccess?.batches]
  );

  const availableBatches = useMemo(() => {
    if (!Array.isArray(batches)) return [];

    let filtered = batches;
    if (!isAdmin && accessScope != null && Array.isArray(programAccess?.batches)) {
      filtered = filtered.filter((batch) =>
        accessibleBatchIds.has(String(batch?._id ?? batch?.id))
      );
    }

    if (!independent && programId) {
      filtered = filtered.filter(
        (batch) =>
          String(batch?.programId?._id ?? batch?.programId?.id ?? batch?.programId) ===
          String(programId)
      );
    }

    if (!independent && !programId) return [];
    return filtered;
  }, [batches, accessibleBatchIds, programAccess?.batches, accessScope, isAdmin, independent, programId]);

  useEffect(() => {
    if (!autoSelectSingle || availableBatches.length !== 1) return;
    const onlyBatchId = String(availableBatches[0]._id);
    if (String(value) !== onlyBatchId) onChange?.(onlyBatchId);
  }, [autoSelectSingle, availableBatches, value, onChange]);

  if (hideWhenSingle && availableBatches.length === 1) return null;

  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <Select
        options={[...availableBatches].sort((a,b) => String(a.batchName || "").localeCompare(String(b.batchName || ""), undefined, { sensitivity: "base" })).map((batch) => ({ value: String(batch._id), label: `${batch.batchName || batch.name || ""}${batch.startYear && batch.endYear ? ` (${batch.startYear}-${batch.endYear})` : ""}` }))}
        value={[...availableBatches].map((batch) => ({ value: String(batch._id), label: `${batch.batchName || batch.name || ""}${batch.startYear && batch.endYear ? ` (${batch.startYear}-${batch.endYear})` : ""}` })).find((option) => option.value === String(value)) || null}
        onChange={(option) => onChange?.(option?.value || "")}
        isClearable={!required}
        isSearchable
        placeholder={placeholder}
        isDisabled={disabled}
        className="text-sm"
        classNamePrefix="react-select"
        noOptionsMessage={() => "No batches found"}
      />
    </div>
  );
}

export default BatchDropdown;
