import { useEffect, useMemo, useState } from "react";
import { downloadStudentsDashboard, getDownloadStudentsOptions } from "../services/dashboard.service";
import { DashboardHeader, ErrorBox, ExportButton, ProgramBatchFilters, RegionFilters, DateInput, today, useDashboardOptions } from "../components/dashboardCommon";

const fallbackFields = { absentCount: "Absent Days", totalDays: "Total Days", absentPercentage: "Absent Percentage", srn: "SRN", rollNumber: "Roll Number", name: "Name", fatherName: "Father Name", motherName: "Mother Name", personalContact: "Personal Contact", parentContact: "Parent Contact", otherContact: "Other Contact", dob: "DOB", gender: "Gender", category: "Category", address: "Address", class: "Class", board: "Board", status: "Enrollment Status", enrollmentDate: "Enrollment Date", program: "Program", batch: "Batch", district: "District", block: "Block", center: "Center", centerCode: "Center Code", attendanceDate: "Attendance Date", attendance: "Attendance" };
const types = [
  { value: "student-details", label: "Student Details" },
  { value: "continuous-absentee", label: "Continuous Absentee Students Detail" },
  { value: "mostly-absent", label: "Mostly Absent Students Detail" },
  { value: "attendance-details", label: "Student Attendance Details" },
];
const defaults = ["srn", "rollNumber", "name", "fatherName", "motherName", "parentContact", "gender", "class", "board", "status", "program", "batch", "district", "block", "center"];

export default function DownloadStudentsDashboard() {
  const { options } = useDashboardOptions();
  const [meta, setMeta] = useState({ fieldOptions: fallbackFields, types });
  const [filters, setFilters] = useState({ programId: "", batchId: "", districtId: "", blockId: "", centerId: "", from: today(), to: today(), type: "student-details", srn: "" });
  const [selectedFields, setSelectedFields] = useState(defaults); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  useEffect(() => { getDownloadStudentsOptions().then((r) => setMeta(r.data || meta)).catch((e) => setError(e.response?.data?.message || "Unable to load export fields")); }, []);
  const visibleFields = useMemo(() => Object.entries(meta.fieldOptions || fallbackFields).filter(([key]) => filters.type === "attendance-details" || !["attendanceDate", "attendance"].includes(key)), [meta.fieldOptions, filters.type]);
  useEffect(() => { if (filters.type === "attendance-details") setSelectedFields((x) => x.includes("attendance") ? x : [...x, "attendanceDate", "attendance"]); }, [filters.type]);
  const exportData = async () => {
    if ((options.programs.length > 1 || options.batches.length > 1) && (!filters.programId || !filters.batchId)) { setError("Program and Batch are mandatory when more than one assigned program/batch is available."); return; }
    if (filters.type !== "student-details" && (!filters.from || !filters.to)) { setError("Date range is mandatory for this download type."); return; }
    try { setLoading(true); setError(""); await downloadStudentsDashboard({ ...filters, fields: selectedFields.join(",") }); } catch (e) { setError(e.response?.data?.message || "Unable to download student data"); } finally { setLoading(false); }
  };
  const toggle = (key) => setSelectedFields((x) => x.includes(key) ? x.filter((f) => f !== key) : [...x, key]);
  return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
    <DashboardHeader eyebrow="Dashboards / Download Students" title="Download Students"><ExportButton permission="dashboard.download-students.export" onClick={exportData} loading={loading}>Download Excel</ExportButton></DashboardHeader>
    <ProgramBatchFilters filters={filters} setFilters={setFilters} options={options} mandatory onApply={() => {}} />
    <RegionFilters filters={filters} setFilters={setFilters} options={options} />
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Type of Data<select value={filters.type} onChange={(e) => setFilters((x) => ({ ...x, type: e.target.value }))} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm normal-case text-slate-800">{meta.types.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">SRN (optional)<input value={filters.srn} onChange={(e) => setFilters((x) => ({ ...x, srn: e.target.value }))} placeholder="Enter SRN" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm normal-case" /></label>
      <DateInput label="From" value={filters.from} onChange={(v) => setFilters((x) => ({ ...x, from: v }))} />
      <DateInput label="To" value={filters.to} onChange={(v) => setFilters((x) => ({ ...x, to: v }))} />
    </section>
    <ErrorBox message={error} />
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-slate-900">Custom Export Fields</h2><p className="text-xs text-slate-400">Select exactly which columns should be present in Excel.</p></div><div className="flex gap-2"><button onClick={() => setSelectedFields(visibleFields.map(([k]) => k))} className="rounded-xl border px-3 py-2 text-xs font-bold">Select all</button><button onClick={() => setSelectedFields([])} className="rounded-xl border px-3 py-2 text-xs font-bold">Clear all</button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleFields.map(([key, label]) => <label key={key} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${selectedFields.includes(key) ? "border-indigo-200 bg-indigo-50" : "border-slate-100"}`}><input type="checkbox" checked={selectedFields.includes(key)} onChange={() => toggle(key)} className="h-4 w-4 accent-indigo-600" /><span className="text-sm font-semibold text-slate-700">{label}</span></label>)}</div><button disabled={!selectedFields.length || loading} onClick={exportData} className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50">{loading ? "Preparing Excel..." : `Export ${selectedFields.length} fields`}</button></section>
  </div>;
}
