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

        <select
          value={centerId}
          onChange={(event) =>
            handleCenterChange(
              event.target.value
            )
          }
          disabled={
            disabled ||
            loadingRegionAccess ||
            !districtId
          }
          required={required}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="">
            {loadingRegionAccess
              ? "Loading Centers..."
              : !districtId
              ? "Select District First"
              : centerPlaceholder}
          </option>

          {availableCenters.map(
            (center) => (
              <option
                key={center._id}
                value={center._id}
              >
                {center.centerCode
                  ? `${center.centerCode} - ${center.centerName}`
                  : center.centerName}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
}

export default DistrictCenterDropdown;