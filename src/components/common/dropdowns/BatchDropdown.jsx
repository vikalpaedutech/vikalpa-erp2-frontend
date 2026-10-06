import { useEffect, useMemo } from "react";
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
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">{placeholder}</option>
        {availableBatches.map((batch) => (
          <option key={batch._id} value={batch._id}>
            {batch.batchName}
            {batch.startYear && batch.endYear
              ? ` (${batch.startYear}-${batch.endYear})`
              : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export default BatchDropdown;
