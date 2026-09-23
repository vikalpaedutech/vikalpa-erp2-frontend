import { useRegionAccess } from "../../../context/RegionAccessContext";

function CenterDropdown({
  blockId = "",
  value = "",
  onChange,
  label = "Center",
  placeholder = "Select Center",
  disabled = false,
  required = false,
  independent = true,
}) {
  const {
    centers,
    getCentersByBlock,
    loadingRegionAccess,
  } = useRegionAccess();

  const availableCenters = independent
    ? centers
    : getCentersByBlock(blockId);

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
          loadingRegionAccess ||
          (!independent && !blockId)
        }
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">
          {loadingRegionAccess
            ? "Loading Centers..."
            : !independent && !blockId
            ? "Select Block First"
            : placeholder}
        </option>

        {availableCenters.map((center) => (
          <option
            key={center._id}
            value={center._id}
          >
            {center.centerCode
              ? `${center.centerCode} - ${center.centerName}`
              : center.centerName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CenterDropdown;