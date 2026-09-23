import { useRegionAccess } from "../../../context/RegionAccessContext";

function BlockDropdown({
  districtId = "",
  value = "",
  onChange,
  label = "Block",
  placeholder = "Select Block",
  disabled = false,
  required = false,
}) {
  const {
    getBlocksByDistrict,
    loadingRegionAccess,
  } = useRegionAccess();

  const availableBlocks =
    getBlocksByDistrict(districtId);

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
          !districtId
        }
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">
          {loadingRegionAccess
            ? "Loading Blocks..."
            : !districtId
            ? "Select District First"
            : placeholder}
        </option>

        {availableBlocks.map((block) => (
          <option
            key={block._id}
            value={block._id}
          >
            {block.blockName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default BlockDropdown;