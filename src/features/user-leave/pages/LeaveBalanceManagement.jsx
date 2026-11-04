import { useEffect, useMemo, useState } from "react";
import {
  bulkImportLeaveBalances,
  configureLeaveBalance,
  getLeaveBalanceDirectory,
  getLeaveTypes,
} from "../services/userLeave.service";

const currentYear = new Date().getFullYear();
const emptyFilters = { roleId: "", designationId: "", leaveYear: currentYear, leaveTypeId: "" };
const numericFields = ["openingBalance", "accruedBalance", "carryForwardBalance", "adjustmentBalance", "expiredBalance"];
const fieldLabels = {
  openingBalance: "Opening Balance",
  accruedBalance: "Accrued Balance",
  carryForwardBalance: "Carry Forward",
  adjustmentBalance: "Adjustments",
  expiredBalance: "Expired Balance",
};
const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const parseCsv = (text) => {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"' && quoted) { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  const headers = (rows.shift() || []).map((v) => v.trim());
  return rows.map((values) => Object.fromEntries(headers.map((key, index) => [key, values[index] ?? ""])));
};
const downloadCsv = (filename, rows) => {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
};

export default function LeaveBalanceManagement() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [directory, setDirectory] = useState({ employees: [], roles: [], designations: [] });
  const [filters, setFilters] = useState(emptyFilters);
  const [submittedFilters, setSubmittedFilters] = useState(emptyFilters);
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState({});
  const [savingId, setSavingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkYear, setBulkYear] = useState(currentYear);
  const [bulkType, setBulkType] = useState("");
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkFileName, setBulkFileName] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  const loadDirectory = async (params = submittedFilters) => {
    const response = await getLeaveBalanceDirectory({
      ...(params.roleId ? { roleId: params.roleId } : {}),
      ...(params.designationId ? { designationId: params.designationId } : {}),
      leaveYear: params.leaveYear,
      ...(params.leaveTypeId ? { leaveTypeId: params.leaveTypeId } : {}),
    });
    const data = response?.data || {};
    setDirectory({
      employees: data.employees || [],
      roles: data.roles || [],
      designations: data.designations || [],
    });
    const mapped = (data.employees || []).map((employee) => {
      const balance = employee.balance || {};
      return {
        ...employee,
        balanceId: balance._id || "",
        openingBalance: num(balance.openingBalance),
        accruedBalance: num(balance.accruedBalance),
        carryForwardBalance: num(balance.carryForwardBalance),
        adjustmentBalance: num(balance.adjustmentBalance),
        expiredBalance: num(balance.expiredBalance),
        availableBalance: num(balance.availableBalance),
      };
    });
    setRows(mapped);
    setEditing(Object.fromEntries(mapped.map((row) => [row._id, {
      openingBalance: row.openingBalance,
      accruedBalance: row.accruedBalance,
      carryForwardBalance: row.carryForwardBalance,
      adjustmentBalance: row.adjustmentBalance,
      expiredBalance: row.expiredBalance,
    }])));
  };

  const loadInitial = async () => {
    try {
      setLoading(true);
      const types = await getLeaveTypes({ isActive: true });
      setLeaveTypes(Array.isArray(types?.data) ? types.data : []);
      await loadDirectory(emptyFilters);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load leave balances.");
    } finally { setLoading(false); }
  };
  useEffect(() => { loadInitial(); }, []);

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    try {
      setError(""); setSuccess("");
      setLoading(true);
      setSubmittedFilters({ ...filters });
      await loadDirectory(filters);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to apply filters.");
    } finally { setLoading(false); }
  };

  const updateCell = (userId, field, value) => {
    setEditing((previous) => ({ ...previous, [userId]: { ...previous[userId], [field]: value } }));
  };

  const saveRow = async (employee) => {
    if (!submittedFilters.leaveTypeId) {
      setError("Please select a Leave Type and submit filters before updating balances.");
      return;
    }
    try {
      setSavingId(employee._id); setError(""); setSuccess("");
      const values = editing[employee._id] || {};
      await configureLeaveBalance({
        userId: employee._id,
        leaveTypeId: submittedFilters.leaveTypeId,
        leaveYear: Number(submittedFilters.leaveYear),
        ...Object.fromEntries(numericFields.map((field) => [field, num(values[field])])),
        openingBalanceExpiryDate: null,
      });
      setSuccess(`Leave balance updated for ${employee.name || employee.email}.`);
      await loadDirectory(submittedFilters);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update employee balance.");
    } finally { setSavingId(""); }
  };

  const templateRows = useMemo(() => {
    const headers = ["userId", "name", "contact", "email", "designation", "leaveYear", ...numericFields, "openingBalanceExpiryDate"];
    const data = rows.map((employee) => [
      employee._id, employee.name || "", employee.contact || "", employee.email || "",
      employee.designation?.designation || "", bulkYear, "", "", "", "", "", "",
    ]);
    return [headers, ...data];
  }, [rows, bulkYear]);

  const handleTemplateDownload = () => {
    if (!bulkType) { setError("Select Leave Type before downloading the template."); return; }
    downloadCsv(`leave-balance-template-${bulkYear}.csv`, templateRows);
  };

  const handleBulkFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (!parsed.length || !parsed[0].userId) throw new Error("CSV must contain a userId column and at least one employee row.");
      setBulkRows(parsed);
      setBulkFileName(file.name);
      setError("");
    } catch (err) { setError(err.message || "Unable to read CSV."); }
    event.target.value = "";
  };

  const handleBulkSubmit = async () => {
    if (!bulkType) { setError("Select Leave Type."); return; }
    if (!bulkRows.length) { setError("Download the template, fill it and upload the CSV file."); return; }
    try {
      setBulkSaving(true); setError(""); setSuccess("");
      const payloadRows = bulkRows.map((row) => ({
        userId: String(row.userId || "").trim(),
        leaveYear: Number(row.leaveYear || bulkYear),
        ...Object.fromEntries(numericFields.map((field) => [field, num(row[field])])),
        openingBalanceExpiryDate: row.openingBalanceExpiryDate || null,
      }));
      const response = await bulkImportLeaveBalances({ leaveTypeId: bulkType, rows: payloadRows });
      const result = response?.data || {};
      setSuccess(`${response?.message || "Bulk upload completed."} Created: ${result.createdCount || 0}, Updated: ${result.updatedCount || 0}, Failed: ${result.failedCount || 0}.`);
      if (result.errors?.length) setError(result.errors.slice(0, 8).map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      setBulkOpen(false);
      setBulkRows([]);
      await loadDirectory(submittedFilters);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Bulk upload failed.");
    } finally { setBulkSaving(false); }
  };

  if (loading && !rows.length) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">Loading leave balance management...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Balance Management</h1>
            <p className="mt-1 text-sm text-gray-500">Filter employees and manage year-wise, leave-type-wise balances.</p>
          </div>
          <button type="button" onClick={() => { setBulkYear(submittedFilters.leaveYear || currentYear); setBulkType(submittedFilters.leaveTypeId || ""); setBulkOpen(true); }} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Bulk Upload</button>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

        <form onSubmit={handleFilterSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4"><h2 className="font-semibold text-gray-900">Employee Filters</h2><p className="mt-1 text-xs text-gray-500">Choose role or designation, leave year and leave type, then submit.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-medium text-gray-700">Role
              <select value={filters.roleId} onChange={(e) => setFilters((p) => ({ ...p, roleId: e.target.value }))} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3">
                <option value="">All Roles</option>{directory.roles.map((role) => <option key={role._id} value={role._id}>{role.roleName}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">Designation
              <select value={filters.designationId} onChange={(e) => setFilters((p) => ({ ...p, designationId: e.target.value }))} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3">
                <option value="">All Designations</option>{directory.designations.map((item) => <option key={item._id} value={item._id}>{item.designation}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">Leave Year
              <input type="number" min="2000" max="3000" value={filters.leaveYear} onChange={(e) => setFilters((p) => ({ ...p, leaveYear: Number(e.target.value) }))} className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3" />
            </label>
            <label className="text-sm font-medium text-gray-700">Leave Type
              <select value={filters.leaveTypeId} onChange={(e) => setFilters((p) => ({ ...p, leaveTypeId: e.target.value }))} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3">
                <option value="">Select Leave Type</option>{leaveTypes.map((type) => <option key={type._id} value={type._id}>{type.name} ({type.code})</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex gap-3"><button type="submit" disabled={loading} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">Submit</button><button type="button" onClick={async () => { setFilters(emptyFilters); setSubmittedFilters(emptyFilters); setLoading(true); try { await loadDirectory(emptyFilters); } catch (err) { setError(err.response?.data?.message || err.message || "Unable to reset filters."); } finally { setLoading(false); } }} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700">Reset Filters</button></div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4"><div><h2 className="font-semibold text-gray-900">Employee Leave Balances</h2><p className="mt-1 text-xs text-gray-500">{rows.length} employee(s) · {submittedFilters.leaveYear} · {leaveTypes.find((x) => x._id === submittedFilters.leaveTypeId)?.name || "Select leave type to edit"}</p></div></div>
          {!submittedFilters.leaveTypeId ? <div className="p-8 text-center text-sm text-amber-700">Select Leave Type and click Submit to load editable balance fields.</div> : rows.length === 0 ? <div className="p-8 text-center text-sm text-gray-500">No active employees found for these filters.</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-[1500px] w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600"><tr>
                  <th className="px-4 py-3 text-left">Emp Name</th><th className="px-4 py-3 text-left">Contact</th><th className="px-4 py-3 text-left">Mail</th><th className="px-4 py-3 text-left">Designation</th>
                  {numericFields.map((field) => <th key={field} className="px-3 py-3 text-right">{fieldLabels[field]}</th>)}<th className="px-4 py-3 text-right">Available</th><th className="px-4 py-3 text-center">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((employee) => {
                    const values = editing[employee._id] || {};
                    const available = num(values.openingBalance) + num(values.accruedBalance) + num(values.carryForwardBalance) + num(values.adjustmentBalance) - num(values.expiredBalance) - num(employee.balance?.usedBalance);
                    return <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><div className="font-semibold text-gray-900">{employee.name || "-"}</div><div className="text-xs text-gray-400">{employee.userId || employee._id}</div></td>
                      <td className="px-4 py-3">{employee.contact || "-"}</td><td className="px-4 py-3">{employee.email || "-"}</td><td className="px-4 py-3">{employee.designation?.designation || "-"}</td>
                      {numericFields.map((field) => <td key={field} className="px-2 py-3"><input type="number" step="0.5" value={values[field] ?? 0} onChange={(e) => updateCell(employee._id, field, e.target.value)} className="w-24 rounded-lg border border-gray-300 px-2 py-2 text-right" /></td>)}
                      <td className="px-4 py-3 text-right font-bold text-indigo-700">{available}</td>
                      <td className="px-4 py-3 text-center"><button type="button" onClick={() => saveRow(employee)} disabled={savingId === employee._id} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{savingId === employee._id ? "Saving..." : "Save"}</button></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {bulkOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-gray-900">Bulk Upload Leave Balances</h2><p className="mt-1 text-sm text-gray-500">Select leave year and type, download the employee template, fill it and upload CSV.</p></div><button type="button" onClick={() => setBulkOpen(false)} className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100">×</button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">Leave Year<input type="number" min="2000" max="3000" value={bulkYear} onChange={(e) => setBulkYear(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3" /></label>
              <label className="text-sm font-medium text-gray-700">Leave Type<select value={bulkType} onChange={(e) => setBulkType(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3"><option value="">Select Leave Type</option>{leaveTypes.map((type) => <option key={type._id} value={type._id}>{type.name} ({type.code})</option>)}</select></label>
            </div>
            <div className="mt-5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 p-4"><p className="text-sm font-semibold text-indigo-900">Template columns</p><p className="mt-1 text-xs text-indigo-800">userId (_id), name, contact, email, designation, leaveYear, openingBalance, accruedBalance, carryForwardBalance, adjustmentBalance, expiredBalance, openingBalanceExpiryDate.</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={handleTemplateDownload} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Download Template CSV</button><label className="cursor-pointer rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700">Choose CSV File<input type="file" accept=".csv,text/csv" onChange={handleBulkFile} className="hidden" /></label></div>{bulkFileName && <p className="mt-2 text-xs text-gray-600">Selected: {bulkFileName} · {bulkRows.length} row(s)</p>}</div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setBulkOpen(false)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button><button type="button" disabled={bulkSaving || !bulkRows.length} onClick={handleBulkSubmit} className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{bulkSaving ? "Uploading..." : "Upload & Update"}</button></div>
          </div>
        </div>}
      </div>
    </div>
  );
}
