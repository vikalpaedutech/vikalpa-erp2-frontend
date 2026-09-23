import { useRegionAccess } from "../../../context/RegionAccessContext";

function DistrictDropdown({
  value = "",
  onChange,
  label = "District",
  placeholder = "Select District",
  disabled = false,
  required = false,
}) {
  const {
    districts,
    loadingRegionAccess,
  } = useRegionAccess();

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
          onChange(event.target.value)
        }
        disabled={
          disabled ||
          loadingRegionAccess
        }
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">
          {loadingRegionAccess
            ? "Loading Districts..."
            : placeholder}
        </option>

        {districts.map((district) => (
          <option
            key={district._id}
            value={district._id}
          >
            {district.districtName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DistrictDropdown;