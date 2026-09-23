import { useEffect, useState } from "react";
import {
  DashboardHeader,
  ErrorBox,
  LoadingBox,
  MetricCard,
  ProgramBatchFilters,
  RegionFilters,
  DateRangeFilters,
  DashboardTable,
  ExportButton,
  today,
  monthStart,
  useDashboardOptions,
} from "../components/dashboardCommon";
import {
  getCopyCheckingDashboard,
  exportCopyCheckingDashboard,
  exportCopyCheckingStudentData,
} from "../services/dashboard.service";

export default function CopyCheckingDashboard() {
  const { options, loading: optionsLoading, error: optionsError } = useDashboardOptions();
  const [filters, setFilters] = useState({ programId: "", batchId: "", districtId: "", blockId: "", centerId: "", from: monthStart(), to: today() });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [studentExporting, setStudentExporting] = useState(false);
  const [error, setError] = useState("");

  const multipleProgramBatch = options.programs.length > 1 || options.batches.length > 1;

  const load = async () => {
    if (multipleProgramBatch && (!filters.programId || !filters.batchId)) {
      setError("Select Program and Batch because multiple program/batch assignments are available.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await getCopyCheckingDashboard(filters);
      setData(response.data);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load copy checking dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!optionsLoading && options.programs.length === 1 && options.batches.length === 1) {
      setFilters((current) => ({ ...current, programId: String(options.programs[0]._id), batchId: String(options.batches[0]._id) }));
    }
  }, [optionsLoading, options.programs, options.batches]);

  useEffect(() => {
    if (!optionsLoading && !multipleProgramBatch) load();
    // Initial/default load only; filter changes are explicit through Apply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsLoading, multipleProgramBatch]);

  const exportSummary = async () => {
    try {
      setExporting(true);
      setError("");
      await exportCopyCheckingDashboard(filters);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to export copy checking summary");
    } finally {
      setExporting(false);
    }
  };

  const exportStudents = async () => {
    try {
      setStudentExporting(true);
      setError("");
      await exportCopyCheckingStudentData(filters);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to export copy checking student data");
    } finally {
      setStudentExporting(false);
    }
  };

  return (
    <div className="min-h-full space-y-5 p-4 sm:p-6 lg:p-8">
      <DashboardHeader eyebrow="Dashboards / Copy Checking" title="Copy Checking Dashboard">
        <ExportButton permission="dashboard.copy-checking.export" onClick={exportSummary} loading={exporting}>Export Excel</ExportButton>
        <ExportButton permission="dashboard.copy-checking.student-export" onClick={exportStudents} loading={studentExporting}>Export Student Data</ExportButton>
      </DashboardHeader>

      <ErrorBox message={error || optionsError} />

      <ProgramBatchFilters
        filters={filters}
        setFilters={setFilters}
        options={options}
        mandatory={multipleProgramBatch}
      />
      <RegionFilters filters={filters} setFilters={setFilters} options={options} />
      <DateRangeFilters filters={filters} setFilters={setFilters} onApply={load} />

      {loading || optionsLoading ? <LoadingBox text="Loading copy checking report..." /> : data ? <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Students" value={data.totals?.totalStudents} tone="slate" />
          <MetricCard label="Total Copy Checked" value={data.totals?.totalCopyChecked} tone="indigo" />
          <MetricCard label="Class Work Checked" value={data.totals?.classWorkChecked} tone="emerald" />
          <MetricCard label="Home Work Checked" value={data.totals?.homeWorkChecked} tone="amber" />
        </section>

        <DashboardTable
          title="District / Block / Center Copy Checking Report"
          rows={data.table || []}
          columns={[
            { key: "district", label: "District" },
            { key: "block", label: "Block" },
            { key: "center", label: "Center" },
            { key: "totalStudents", label: "Total Students" },
            { key: "totalCopyChecked", label: "Total Copy Checked" },
            { key: "classWorkChecked", label: "Class Work Checked" },
            { key: "homeWorkChecked", label: "Home Work Checked" },
          ]}
        />
      </> : null}
    </div>
  );
}
