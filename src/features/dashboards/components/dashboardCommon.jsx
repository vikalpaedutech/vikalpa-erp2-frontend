import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getDashboardOptions } from "../services/dashboard.service";

export const today = () => new Date().toISOString().slice(0, 10);
export const monthStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return d.toISOString().slice(0, 10);
};

export function useDashboardOptions() {
  const [options, setOptions] = useState({ programs: [], batches: [], districts: [], blocks: [], centers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getDashboardOptions()
      .then((response) => active && setOptions(response.data || {}))
      .catch((e) => active && setError(e.response?.data?.message || "Unable to load dashboard filters"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);
  return { options, loading, error };
}

export function MetricCard({ label, value, helper, tone = "indigo" }) {
  const tones = {
    indigo: "from-indigo-50 to-white border-indigo-100 text-indigo-700",
    emerald: "from-emerald-50 to-white border-emerald-100 text-emerald-700",
    amber: "from-amber-50 to-white border-amber-100 text-amber-700",
    rose: "from-rose-50 to-white border-rose-100 text-rose-700",
    slate: "from-slate-50 to-white border-slate-200 text-slate-700",
  };
  return <div className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${tones[tone] || tones.indigo}`}>
    <p className="text-[11px] font-black uppercase tracking-[.12em] opacity-60">{label}</p>
    <p className="mt-2 text-3xl font-black text-slate-950">{value ?? 0}</p>
    {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
  </div>;
}

export function DashboardHeader({ eyebrow, title, description, onExport, exporting, exportLabel = "Export Excel", children }) {
  return <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white shadow-xl sm:p-7">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[.2em] text-indigo-200">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-indigo-100/80">{description}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">{children}{onExport ? <button onClick={onExport} disabled={exporting} className="rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-900 shadow-sm disabled:opacity-60">{exporting ? "Preparing..." : exportLabel}</button> : null}</div>
    </div>
  </section>;
}

export function ErrorBox({ message }) {
  return message ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{message}</div> : null;
}

export function LoadingBox({ text = "Loading dashboard..." }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-medium text-slate-500 shadow-sm">{text}</div>;
}

export function DashboardTable({ title, rows = [], columns = [], compact = false }) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div><h2 className="font-black text-slate-900">{title}</h2><p className="mt-0.5 text-xs text-slate-400">{rows.length.toLocaleString()} rows</p></div>
    </div>
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${compact ? "min-w-[760px]" : "min-w-[980px]"}`}>
        <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500"><tr>{columns.map((c) => <th key={c.key} className="whitespace-nowrap px-4 py-3 font-black">{c.label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length ? rows.map((row, i) => <tr key={row._id || `${i}-${row.enrollmentId || row.centerId || row.examId || "row"}`} className="hover:bg-slate-50">
            {columns.map((c) => <td key={c.key} className="whitespace-nowrap px-4 py-3 text-slate-700">{c.render ? c.render(row) : row[c.key] ?? "-"}</td>)}
          </tr>) : <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">No data in your accessible scope.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>;
}

export function ProgramBatchFilters({ filters, setFilters, options, mandatory = false, showDate = false, onApply }) {
  const batches = useMemo(() => filters.programId ? options.batches.filter((b) => String(b.programId) === String(filters.programId)) : options.batches, [options.batches, filters.programId]);
  useEffect(() => {
    if (filters.batchId && !batches.some((b) => String(b._id) === String(filters.batchId))) setFilters((x) => ({ ...x, batchId: "" }));
  }, [batches, filters.batchId, setFilters]);
  return <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
    <Select label="Program" value={filters.programId} onChange={(v) => setFilters((x) => ({ ...x, programId: v, batchId: "" }))} options={options.programs} valueKey="_id" labelKey="programName" placeholder={mandatory ? "Select program" : "All programs"} />
    <Select label="Batch" value={filters.batchId} onChange={(v) => setFilters((x) => ({ ...x, batchId: v }))} options={batches} valueKey="_id" labelKey="batchName" placeholder={mandatory ? "Select batch" : "All batches"} />
    {showDate ? <><DateInput label="From" value={filters.from} onChange={(v) => setFilters((x) => ({ ...x, from: v }))} /><DateInput label="To" value={filters.to} onChange={(v) => setFilters((x) => ({ ...x, to: v }))} /></> : null}
    {onApply ? <button onClick={onApply} className="self-end rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white hover:bg-indigo-700">Apply Filters</button> : null}
  </div>;
}

export function RegionFilters({ filters, setFilters, options, onApply, notMarkedLabel }) {
  const blocks = useMemo(() => filters.districtId ? options.blocks.filter((x) => String(x.districtId) === String(filters.districtId)) : options.blocks, [options.blocks, filters.districtId]);
  const centers = useMemo(() => {
    let list = options.centers;
    if (filters.districtId) list = list.filter((x) => String(x.districtId) === String(filters.districtId));
    if (filters.blockId) list = list.filter((x) => String(x.blockId) === String(filters.blockId));
    return list;
  }, [options.centers, filters.districtId, filters.blockId]);
  useEffect(() => {
    if (filters.blockId && !blocks.some((x) => String(x._id) === String(filters.blockId))) setFilters((x) => ({ ...x, blockId: "", centerId: "" }));
    if (filters.centerId && !centers.some((x) => String(x._id) === String(filters.centerId))) setFilters((x) => ({ ...x, centerId: "" }));
  }, [blocks, centers, filters.blockId, filters.centerId, setFilters]);
  return <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
    <Select label="District" value={filters.districtId} onChange={(v) => setFilters((x) => ({ ...x, districtId: v, blockId: "", centerId: "" }))} options={options.districts} labelKey="districtName" placeholder="All districts" />
    <Select label="Block" value={filters.blockId} onChange={(v) => setFilters((x) => ({ ...x, blockId: v, centerId: "" }))} options={blocks} labelKey="blockName" placeholder="All blocks" />
    <Select label="Center" value={filters.centerId} onChange={(v) => setFilters((x) => ({ ...x, centerId: v }))} options={centers} labelKey="centerName" placeholder="All centers" />
    {notMarkedLabel ? <label className="flex items-end gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"><input type="checkbox" checked={!!filters.notMarked} onChange={(e) => setFilters((x) => ({ ...x, notMarked: e.target.checked }))} className="mb-0.5 h-4 w-4 accent-indigo-600" />{notMarkedLabel}</label> : null}
    {onApply ? <button onClick={onApply} className="self-end rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white hover:bg-indigo-700">Apply Filters</button> : null}
  </div>;
}

export function DateRangeFilters({ filters, setFilters, onApply }) {
  return <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-3">
    <DateInput label="From" value={filters.from} onChange={(v) => setFilters((x) => ({ ...x, from: v }))} />
    <DateInput label="To" value={filters.to} onChange={(v) => setFilters((x) => ({ ...x, to: v }))} />
    <button onClick={onApply} className="self-end rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white">Apply</button>
  </div>;
}

export function Select({ label, value, onChange, options = [], valueKey = "_id", labelKey, placeholder }) {
  return <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">{label}<select value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium normal-case text-slate-800 outline-none focus:border-indigo-400">
    <option value="">{placeholder || `Select ${label}`}</option>{options.map((x) => <option key={x[valueKey]} value={x[valueKey]}>{x[labelKey] || x.name || x.label}</option>)}
  </select></label>;
}

export function DateInput({ label, value, onChange }) {
  return <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">{label}<input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium normal-case text-slate-800" /></label>;
}

export function ExportButton({ permission, onClick, loading, children = "Export Excel" }) {
  const { can, isAdmin } = useAuth();
  if (!isAdmin && !can(permission)) return null;
  return <button onClick={onClick} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 shadow-sm disabled:opacity-50">{loading ? "Preparing..." : children}</button>;
}
