import Select from "react-select";
import { useRegionAccess } from "../../../context/RegionAccessContext";

function DistrictDropdown({ value = "", onChange, label = "District", placeholder = "Select District", disabled = false, required = false }) {
  const { districts, loadingRegionAccess } = useRegionAccess();
  const options = [...districts].sort((a, b) => String(a.districtName || "").localeCompare(String(b.districtName || ""), undefined, { sensitivity: "base" })).map((d) => ({ value: String(d._id), label: d.districtName }));
  return <div className="w-full">
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>
    <Select inputId={`district-${label.replace(/\W/g, "-")}`} options={options} value={options.find((o) => o.value === String(value)) || null} onChange={(o) => onChange?.(o?.value || "")} isClearable={!required} isSearchable placeholder={loadingRegionAccess ? "Loading Districts..." : placeholder} isDisabled={disabled || loadingRegionAccess} className="text-sm" classNamePrefix="react-select" required={required} noOptionsMessage={() => "No districts found"} />
  </div>;
}
export default DistrictDropdown;
