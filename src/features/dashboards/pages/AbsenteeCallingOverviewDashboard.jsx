import { useEffect, useState } from "react";
import { getAbsenteeCallingOverviewDashboard, exportAbsenteeCallingOverviewDashboard } from "../services/dashboard.service";
import { DashboardHeader, ExportButton, LoadingBox, ErrorBox, MetricCard, DateInput, today } from "../components/dashboardCommon";

export default function AbsenteeCallingOverviewDashboard() {
  const [date, setDate] = useState(today());
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [exporting, setExporting] = useState(false); const [error, setError] = useState("");
  const load = async () => { try { setLoading(true); setError(""); setData((await getAbsenteeCallingOverviewDashboard({ date })).data); } catch (e) { setError(e.response?.data?.message || "Unable to load absentee calling overview"); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [date]);
  const exportExcel = async () => { try { setExporting(true); await exportAbsenteeCallingOverviewDashboard({ date }); } catch (e) { setError(e.response?.data?.message || "Unable to export overview"); } finally { setExporting(false); } };
  return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
    <DashboardHeader eyebrow="Dashboards / Absentee Calling" title="Absentee Calling Dashboard"><ExportButton permission="dashboard.absentee-calling-overview.export" onClick={exportExcel} loading={exporting}>Export Excel</ExportButton></DashboardHeader>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:w-[280px]"><DateInput label="Date" value={date} onChange={setDate} /></section>
    <ErrorBox message={error} />
    {loading ? <LoadingBox text="Loading absentee calling overview..." /> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(data?.cards || []).map((c) => <article key={`${c.programId}-${c.batchId}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">{c.programName}</h3><p className="mt-1 text-xs font-bold text-indigo-600">Batch: {c.batchName}</p><div className="mt-5 grid grid-cols-3 gap-2"><MetricCard label="Total Student" value={c.totalStudent} tone="slate" /><MetricCard label="Total Present" value={c.totalPresent} tone="emerald" /><MetricCard label="Total Absent" value={c.totalAbsent} tone="rose" /></div></article>)}</section>}
  </div>;
}
