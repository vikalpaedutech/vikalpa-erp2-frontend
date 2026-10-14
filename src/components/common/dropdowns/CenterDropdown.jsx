import Select from "react-select";
import { useRegionAccess } from "../../../context/RegionAccessContext";
function CenterDropdown({ blockId = "", value = "", onChange, label = "Center", placeholder = "Select Center", disabled = false, required = false, independent = true }) {
  const { centers, getCentersByBlock, loadingRegionAccess } = useRegionAccess();
  const availableCenters = independent ? centers : getCentersByBlock(blockId);
  const options = [...availableCenters].sort((a,b) => String(a.centerName || "").localeCompare(String(b.centerName || ""), undefined, { sensitivity: "base" })).map((c) => ({ value: String(c._id), label: c.centerCode ? `${c.centerCode} - ${c.centerName}` : c.centerName }));
  return <div className="w-full"><label className="mb-1 block text-sm font-medium text-gray-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>
    <Select options={options} value={options.find((o) => o.value === String(value)) || null} onChange={(o) => onChange?.(o?.value || "")} isClearable={!required} isSearchable placeholder={loadingRegionAccess ? "Loading Centers..." : !independent && !blockId ? "Select Block First" : placeholder} isDisabled={disabled || loadingRegionAccess || (!independent && !blockId)} className="text-sm" classNamePrefix="react-select" noOptionsMessage={() => "No centers found"} />
  </div>;
}
export default CenterDropdown;
