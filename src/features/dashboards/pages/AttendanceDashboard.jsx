import { useEffect, useState } from "react";
import { getAttendanceDashboard, exportAttendanceDashboard } from "../services/dashboard.service";
import { DashboardHeader, ErrorBox, LoadingBox, MetricCard, ExportButton, DateInput, today } from "../components/dashboardCommon";

export default function AttendanceDashboard() {
  const [date, setDate] = useState(today());
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [exporting, setExporting] = useState(false); const [error, setError] = useState("");
  const load = async () => { try { setLoading(true); setError(""); setData((await getAttendanceDashboard({ date })).data); } catch (e) { setError(e.response?.data?.message || "Unable to load attendance dashboard"); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [date]);
  const exportExcel = async () => { try { setExporting(true); await exportAttendanceDashboard({ date }); } catch (e) { setError(e.response?.data?.message || "Unable to export attendance"); } finally { setExporting(false); } };
  return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
    <DashboardHeader eyebrow="Dashboards / Attendance" title="Attendance Dashboard"><ExportButton permission="dashboard.attendance.export" onClick={exportExcel} loading={exporting}>Export Excel</ExportButton></DashboardHeader>
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[240px_1fr]"><DateInput label="Attendance Date" value={date} onChange={setDate} /><div className="flex items-end"><span className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700">Cards update automatically for {date}</span></div></section>
    <ErrorBox message={error} />
    {loading ? <LoadingBox text="Loading attendance cards..." /> : <section className="space-y-3"><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Daily attendance</p><h2 className="text-xl font-black text-slate-900">Program & Batch Summary</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(data?.cards || []).map((c) => <article key={`${c.programId}-${c.batchId}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">{c.programName}</h3><p className="mt-1 text-xs font-bold text-indigo-600">Batch: {c.batchName}</p><div className="mt-5 grid grid-cols-3 gap-2"><MetricCard label="Total Student" value={c.totalStudent} tone="slate" /><MetricCard label="Present" value={c.totalPresent} tone="emerald" /><MetricCard label="Absent" value={c.totalAbsent} tone="rose" /></div></article>)}</div></section>}
  </div>;
}
