import { useEffect, useMemo, useState } from "react";
import { getStudentsDashboard, exportStudentsDashboard } from "../services/dashboard.service";
import { DashboardHeader, DashboardTable, ErrorBox, LoadingBox, MetricCard, ExportButton } from "../components/dashboardCommon";

const fields = {
  srn: "SRN", rollNumber: "Roll Number", name: "Name", fatherName: "Father Name", motherName: "Mother Name",
  personalContact: "Personal Contact", parentContact: "Parent Contact", otherContact: "Other Contact", dob: "DOB",
  gender: "Gender", category: "Category", address: "Address", class: "Class", board: "Board", status: "Enrollment Status",
  enrollmentDate: "Enrollment Date", program: "Program", batch: "Batch", district: "District", block: "Block", center: "Center", centerCode: "Center Code",
};
const defaultFields = ["srn", "rollNumber", "name", "fatherName", "motherName", "parentContact", "gender", "class", "board", "status", "program", "batch", "district", "block", "center"];

export default function StudentsDashboard() {
  const [data, setData] = useState(null);
  const [selectedFields, setSelectedFields] = useState(defaultFields);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    try { setLoading(true); setError(""); setData((await getStudentsDashboard()).data); }
    catch (e) { setError(e.response?.data?.message || "Unable to load students dashboard"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data?.rows || [];
    return (data?.rows || []).filter((r) => [r.srn, r.name, r.fatherName, r.district, r.block, r.center].some((x) => String(x || "").toLowerCase().includes(q)));
  }, [data, search]);

  const exportExcel = async () => {
    try { setExporting(true); await exportStudentsDashboard({ fields: selectedFields.join(",") }); }
    catch (e) { setError(e.response?.data?.message || "Unable to export students"); }
    finally { setExporting(false); }
  };
  const toggle = (key) => setSelectedFields((x) => x.includes(key) ? x.filter((f) => f !== key) : [...x, key]);

  return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
    <DashboardHeader eyebrow="Dashboards / Students" title="Students Dashboard" onExport={selectedFields.length ? exportExcel : null} exporting={exporting} />
    <ErrorBox message={error} />
    {loading ? <LoadingBox text="Loading student dashboard..." /> : <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Students" value={data?.rows?.length || 0} helper="Accessible active enrollments" />
        <MetricCard label="Programs" value={data?.cards?.length || 0} helper="Program / batch combinations" />
        <MetricCard label="Centers" value={data?.table?.length || 0} helper="Accessible centers with enrollment" />
        <MetricCard label="Student Records" value={rows.length} helper="Visible table rows" />
      </section>

      <section className="space-y-3">
        <div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Program Summary</p><h2 className="text-xl font-black text-slate-900">Program & Batch cards</h2></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data?.cards || []).map((card) => <article key={`${card.programId}-${card.batchId}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{card.programName}</h3><p className="mt-1 text-xs font-semibold text-indigo-600">Batch: {card.batchName}</p></div><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black text-indigo-700">Active</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[['Total Active Students', card.totalActiveStudents], ['Total Enrolled', card.totalEnrolled], ['SLC Requested', card.slcRequested], ['SLC Taken', card.slcTaken], ['Transfer Requested', card.totalTransferredRequest], ['Transferred', card.totalTransferred]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xl font-black text-slate-900">{value}</p></div>)}
            </div>
          </article>)}
        </div>
      </section>

      <DashboardTable title="District / Block / Center Student Summary" rows={(data?.table || []).map((r, i) => ({ ...r, _id: `${r.district}-${r.block}-${r.center}-${i}` }))} columns={[
        { key: "district", label: "District" }, { key: "block", label: "Block" }, { key: "center", label: "Center" }, { key: "totalEnrolled", label: "Total Enrolled" }, { key: "totalSlcRequested", label: "SLC Requested" }, { key: "totalSlcTaken", label: "SLC Taken" }, { key: "totalTransferRequested", label: "Transfer Requested" }, { key: "totalTransferred", label: "Transferred" }, { key: "totalLeft", label: "Total Left" },
      ]} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="font-black text-slate-900">Student Details</h2><p className="text-xs text-slate-400">Search the visible rows and customise Excel fields.</p></div><ExportButton permission="dashboard.students.export" onClick={exportExcel} loading={exporting}>Download Excel</ExportButton></div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SRN, student, father, district, block or center..." className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(fields).map(([key, label]) => <label key={key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${selectedFields.includes(key) ? "border-indigo-200 bg-indigo-50" : "border-slate-100"}`}><input type="checkbox" checked={selectedFields.includes(key)} onChange={() => toggle(key)} className="h-4 w-4 accent-indigo-600" /><span className="text-sm font-semibold text-slate-700">{label}</span></label>)}
        </div>
      </section>

      <DashboardTable title={`Student Records (${rows.length})`} rows={rows} columns={[
        { key: "srn", label: "SRN" }, { key: "name", label: "Name" }, { key: "fatherName", label: "Father" }, { key: "class", label: "Class" }, { key: "program", label: "Program" }, { key: "batch", label: "Batch" }, { key: "district", label: "District" }, { key: "block", label: "Block" }, { key: "center", label: "Center" },
      ]} />
    </>}
  </div>;
}
