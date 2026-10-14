import React from "react";
import Select from "react-select";

const alpha = (items, getLabel) => [...(Array.isArray(items) ? items : [])].sort((a, b) => String(getLabel(a) || "").localeCompare(String(getLabel(b) || ""), undefined, { sensitivity: "base" }));
const optionsFor = (items, getLabel) => alpha(items, getLabel).map((item) => ({ value: String(item._id), label: String(getLabel(item) || item._id) }));
const selected = (options, value) => options.find((option) => option.value === String(value || "")) || null;

const AbsenteeCallingFilters = ({ filters, onChange, onSearch, onReset, batches, districts, blocks, centers, showDistrict, showBlock, showCenter, loading }) => {
  const batchOptions = optionsFor(batches, (item) => item.batchName || item.name || item._id);
  const districtOptions = optionsFor(districts, (item) => item.districtName);
  const blockOptions = optionsFor(blocks, (item) => item.blockName);
  const centerOptions = optionsFor(centers, (item) => item.centerName || item.centerCode || item._id);
  const selectClass = "text-sm";
  return (
    <div className="mb-6 rounded-xl border border-gray-900 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">Absentee Calling Filters</h2>
      <form onSubmit={onSearch}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div><label className="mb-2 block text-sm font-medium text-gray-800">Date</label><input type="date" value={filters.date} onChange={(event) => onChange("date", event.target.value)} className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
          <div><label className="mb-2 block text-sm font-medium text-gray-800">Batch</label><Select options={batchOptions} value={selected(batchOptions, filters.batchId)} onChange={(option) => onChange("batchId", option?.value || "")} isClearable isSearchable placeholder="Select Batch" className={selectClass} classNamePrefix="react-select" noOptionsMessage={() => "No batches found"} /></div>
          {showDistrict && <div><label className="mb-2 block text-sm font-medium text-gray-800">District</label><Select options={districtOptions} value={selected(districtOptions, filters.districtId)} onChange={(option) => onChange("districtId", option?.value || "")} isClearable isSearchable placeholder="Select District" className={selectClass} classNamePrefix="react-select" noOptionsMessage={() => "No districts found"} /></div>}
          {showBlock && <div><label className="mb-2 block text-sm font-medium text-gray-800">Block</label><Select options={blockOptions} value={selected(blockOptions, filters.blockId)} onChange={(option) => onChange("blockId", option?.value || "")} isClearable isSearchable placeholder="Select Block" className={selectClass} classNamePrefix="react-select" noOptionsMessage={() => "No blocks found"} /></div>}
          {showCenter && <div><label className="mb-2 block text-sm font-medium text-gray-800">Center</label><Select options={centerOptions} value={selected(centerOptions, filters.centerId)} onChange={(option) => onChange("centerId", option?.value || "")} isClearable isSearchable placeholder="Select Center" className={selectClass} classNamePrefix="react-select" noOptionsMessage={() => "No centers found"} /></div>}
        </div>
        <div className="mt-5 flex gap-3"><button type="submit" disabled={loading} className="rounded-lg border border-gray-900 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Searching..." : "Search"}</button><button type="button" onClick={onReset} disabled={loading} className="rounded-lg border border-gray-400 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Reset</button></div>
      </form>
    </div>
  );
};
export default AbsenteeCallingFilters;
