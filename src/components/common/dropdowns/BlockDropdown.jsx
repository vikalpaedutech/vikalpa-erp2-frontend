import Select from "react-select";
import { useRegionAccess } from "../../../context/RegionAccessContext";
function BlockDropdown({ districtId = "", value = "", onChange, label = "Block", placeholder = "Select Block", disabled = false, required = false }) {
  const { getBlocksByDistrict, loadingRegionAccess } = useRegionAccess();
  const options = [...getBlocksByDistrict(districtId)].sort((a,b) => String(a.blockName || "").localeCompare(String(b.blockName || ""), undefined, { sensitivity: "base" })).map((b) => ({ value: String(b._id), label: b.blockName }));
  return <div className="w-full"><label className="mb-1 block text-sm font-medium text-gray-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>
    <Select options={options} value={options.find((o) => o.value === String(value)) || null} onChange={(o) => onChange?.(o?.value || "")} isClearable={!required} isSearchable placeholder={loadingRegionAccess ? "Loading Blocks..." : !districtId ? "Select District First" : placeholder} isDisabled={disabled || loadingRegionAccess || !districtId} className="text-sm" classNamePrefix="react-select" noOptionsMessage={() => "No blocks found"} />
  </div>;
}
export default BlockDropdown;
