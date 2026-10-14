import Select from "react-select";
import { useRegionAccess } from "../../../context/RegionAccessContext";

import DistrictDropdown from "./DistrictDropdown";

function DistrictCenterDropdown({
  districtId = "",
  centerId = "",
  onChange,
  disabled = false,
  required = false,
  districtLabel = "District",
  centerLabel = "Center",
  centerPlaceholder = "Select Center",
}) {
  const {
    districts,
    centers,
    getCentersByDistrict,
    loadingRegionAccess,
  } = useRegionAccess();

  const availableCenters =
    getCentersByDistrict(districtId);

  const handleDistrictChange = (
    nextDistrictId
  ) => {
    onChange?.({
      districtId: nextDistrictId,
      centerId: "",
    });
  };

  const handleCenterChange = (
    nextCenterId
  ) => {
    onChange?.({
      districtId,
      centerId: nextCenterId,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* District */}

      <DistrictDropdown
        value={districtId}
        onChange={handleDistrictChange}
        label={districtLabel}
        disabled={disabled}
        required={required}
      />

      {/* Center */}

      <div className="w-full">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {centerLabel}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <Select
          options={[...availableCenters].sort((a,b) => String(a.centerName || "").localeCompare(String(b.centerName || ""), undefined, { sensitivity: "base" })).map((center) => ({ value: String(center._id), label: center.centerCode ? `${center.centerCode} - ${center.centerName}` : center.centerName }))}
          value={[...availableCenters].map((center) => ({ value: String(center._id), label: center.centerCode ? `${center.centerCode} - ${center.centerName}` : center.centerName })).find((option) => option.value === String(centerId)) || null}
          onChange={(option) => handleCenterChange(option?.value || "")}
          isClearable={!required}
          isSearchable
          placeholder={loadingRegionAccess ? "Loading Centers..." : !districtId ? "Select District First" : centerPlaceholder}
          isDisabled={disabled || loadingRegionAccess || !districtId}
          className="text-sm"
          classNamePrefix="react-select"
          noOptionsMessage={() => "No centers found"}
        />
      </div>
    </div>
  );
}

export default DistrictCenterDropdown;