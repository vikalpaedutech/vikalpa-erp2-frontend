import { useCallback, useEffect, useState } from "react";
import apiClient from "../../../api/apiClient";

const todayYear = new Date().getFullYear();
const blank = {
  calendarName: "Vikalpa Haryana Holiday Calendar", year: todayYear, name: "", date: "",
  type: "National", isOptional: false, floatingHolidayLimit: 2,
  selectionStartDate: "", selectionEndDate: "",
  applicableTo: { allEmployees: true, designations: [], departments: [], employees: [] },
  isActive: true
};
const unpack = r => r?.data?.data ?? r?.data ?? {};
const dateLabel = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

export default function HolidayCalendarManagement() {
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState(blank);
  const [bulkText, setBulkText] = useState("");
  const [year, setYear] = useState(todayYear);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selections, setSelections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    Promise.all([
      apiClient.get("/department/active"),
      apiClient.get("/designation/active")
    ]).then(([d, g]) => {
      setDepartments(unpack(d) || []);
      setDesignations(unpack(g) || []);
    }).catch(() => {
      setDepartments([]);
      setDesignations([]);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [h, s] = await Promise.all([
        apiClient.get("/hrms/holidays", { params: { year } }),
        apiClient.get("/hrms/holidays/selections", { params: { year } })
      ]);
      setHolidays(unpack(h).holidays || []);
      setSelections(unpack(s).selections || []);
    } catch (e) { setError(e?.response?.data?.message || "Unable to load holiday calendar."); }
    finally { setLoading(false); }
  }, [year]);
  useEffect(() => { load(); }, [load]);

  const setField = (key, value) => setForm(old => ({ ...old, [key]: value }));
  async function submit(e) {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const payload = { ...form, year: Number(form.year), floatingHolidayLimit: Number(form.floatingHolidayLimit) };
      if (editingId) await apiClient.patch(`/hrms/holidays/${editingId}`, payload);
      else await apiClient.post("/hrms/holidays", payload);
      setNotice(editingId ? "Holiday updated." : "Holiday created.");
      setForm(blank); setEditingId(""); await load();
    } catch (e) { setError(e?.response?.data?.message || "Unable to save holiday."); }
    finally { setSaving(false); }
  }
  function startEdit(h) {
    setEditingId(h._id);
    setForm({
      ...blank, ...h,
      applicableTo: {
        allEmployees: h.applicableTo?.allEmployees !== false,
        designations: (h.applicableTo?.designations || []).map(x => String(x?._id || x)),
        departments: (h.applicableTo?.departments || h.applicableDepartments || []).map(x => String(x?._id || x)),
        employees: (h.applicableTo?.employees || []).map(x => String(x?._id || x))
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function removeHoliday(h) {
    if (!window.confirm(`Delete ${h.name}?`)) return;
    try { await apiClient.delete(`/hrms/holidays/${h._id}`); setNotice("Holiday deleted."); await load(); }
    catch (e) { setError(e?.response?.data?.message || "Unable to delete holiday. You may deactivate it instead."); }
  }
  async function bulkCreate(e) {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const parsed = JSON.parse(bulkText);
      const holidaysToCreate = Array.isArray(parsed) ? parsed : parsed.holidays;
      if (!Array.isArray(holidaysToCreate) || !holidaysToCreate.length) throw new Error("JSON must contain a holidays array.");
      const base = Array.isArray(parsed) ? {} : parsed;
      const result = await apiClient.post("/hrms/holidays/bulk", {
        calendarName: base.calendarName || form.calendarName,
        year: Number(base.year || year),
        floatingHolidayLimit: Number(base.floatingHolidayLimit ?? form.floatingHolidayLimit),
        selectionStartDate: base.selectionStartDate ?? form.selectionStartDate,
        selectionEndDate: base.selectionEndDate ?? form.selectionEndDate,
        holidays: holidaysToCreate
      });
      setNotice(`${unpack(result).createdCount || holidaysToCreate.length} holidays created successfully.`);
      setBulkText(""); await load();
    } catch (e) { setError(e?.response?.data?.message || e.message || "Bulk upload failed."); }
    finally { setSaving(false); }
  }
  async function toggleActive(h) {
    try { await apiClient.patch(`/hrms/holidays/${h._id}`, { ...h, isActive: !h.isActive }); await load(); }
    catch (e) { setError(e?.response?.data?.message || "Unable to update holiday."); }
  }
  const setApplicable = (key, value) => setForm(old => ({
    ...old, applicableTo: { ...old.applicableTo, [key]: value }
  }));
  const toggleApplicableId = (key, id, checked) => {
    const current = form.applicableTo[key] || [];
    setApplicable(key, checked ? [...current, id] : current.filter(x => x !== id));
  }

  return <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-blue-600">HR Management</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Holiday Calendar</h1><p className="mt-1 text-sm text-slate-500">Manage fixed and optional holidays. Each holiday is stored as a separate record.</p></div>
      <label className="text-sm font-medium">Calendar year<select value={year} onChange={e=>setYear(Number(e.target.value))} className="ml-2 rounded-lg border border-slate-300 p-2">{Array.from({length:8},(_,i)=>todayYear-2+i).map(y=><option key={y}>{y}</option>)}</select></label>
    </header>
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</div>}
    <form onSubmit={submit} className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-3">
      <h2 className="font-semibold md:col-span-3">{editingId ? "Edit holiday" : "Add a holiday"}</h2>
      <label className="text-sm">Calendar name *<input required value={form.calendarName} onChange={e=>setField("calendarName",e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
      <label className="text-sm">Year *<input required type="number" min="2000" max="2100" value={form.year} onChange={e=>setField("year",e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
      <label className="text-sm">Holiday name *<input required value={form.name} onChange={e=>setField("name",e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
      <label className="text-sm">Date *<input required type="date" value={form.date} onChange={e=>setField("date",e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
      <label className="text-sm">Type<select value={form.type} onChange={e=>setField("type",e.target.value)} className="mt-1 w-full rounded-lg border p-2">{["National","Festival","Regional","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={form.isOptional} onChange={e=>setField("isOptional",e.target.checked)}/> Floating / Optional holiday</label>
      <label className="text-sm">Annual floater limit<input type="number" min="0" max="30" value={form.floatingHolidayLimit} onChange={e=>setField("floatingHolidayLimit",e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
      <label className="text-sm">Selection opens<input type="date" value={form.selectionStartDate} onChange={e=>setField("selectionStartDate",e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
      <label className="text-sm">Selection closes<input type="date" value={form.selectionEndDate} onChange={e=>setField("selectionEndDate",e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
      <div className="space-y-3 rounded-lg border bg-slate-50 p-3 md:col-span-3">
        <div><h3 className="font-semibold">Holiday applicability</h3><p className="text-xs text-slate-500">Choose which employees should receive this holiday. If All Employees is selected, other filters are ignored.</p></div>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.applicableTo?.allEmployees !== false} onChange={e=>setApplicable("allEmployees",e.target.checked)}/> Applicable to all employees</label>
        <div className="grid gap-3 md:grid-cols-2">
          <fieldset disabled={form.applicableTo?.allEmployees !== false} className="rounded-lg border bg-white p-3">
            <legend className="px-1 text-sm font-semibold">Designations</legend>
            <div className="max-h-36 space-y-2 overflow-auto">{designations.map(item=><label key={item._id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={(form.applicableTo?.designations||[]).includes(String(item._id))} onChange={e=>toggleApplicableId("designations",String(item._id),e.target.checked)}/>{item.designation}</label>)}{!designations.length&&<p className="text-xs text-slate-500">No active designations found.</p>}</div>
          </fieldset>
          <fieldset disabled={form.applicableTo?.allEmployees !== false} className="rounded-lg border bg-white p-3">
            <legend className="px-1 text-sm font-semibold">Departments</legend>
            <div className="max-h-36 space-y-2 overflow-auto">{departments.map(item=><label key={item._id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={(form.applicableTo?.departments||[]).includes(String(item._id))} onChange={e=>toggleApplicableId("departments",String(item._id),e.target.checked)}/>{item.departmentName}</label>)}{!departments.length&&<p className="text-xs text-slate-500">No active departments found.</p>}</div>
          </fieldset>
        </div>
        <label className="block text-sm">Specific employee IDs (MongoDB User IDs, comma-separated)
          <textarea rows={2} disabled={form.applicableTo?.allEmployees !== false} value={(form.applicableTo?.employees||[]).join(", ")} onChange={e=>setApplicable("employees",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))} placeholder="Enter user ObjectIds separated by commas" className="mt-1 w-full rounded-lg border p-2 font-mono text-xs"/>
        </label>
        <p className="text-xs text-slate-500">When All Employees is off, an employee qualifies if their user ID, designation, OR department matches any selected rule. Select at least one rule.</p>
      </div>
      <div className="flex flex-wrap gap-2 md:col-span-3"><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : editingId ? "Update Holiday" : "Add Holiday"}</button>{editingId && <button type="button" onClick={()=>{setEditingId("");setForm(blank);}} className="rounded-lg border px-4 py-2 text-sm">Cancel edit</button>}</div>
    </form>
    <form onSubmit={bulkCreate} className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
      <div><h2 className="font-semibold">Bulk create holidays</h2><p className="text-xs text-slate-500">Paste a JSON array. Calendar name, year and floater settings can be set in the form above or in the JSON object.</p></div>
      <textarea rows={6} value={bulkText} onChange={e=>setBulkText(e.target.value)} placeholder={'[\n  {"name":"Republic Day","date":"2027-01-26","type":"National","isOptional":false},\n  {"name":"Lohri","date":"2027-01-13","type":"Festival","isOptional":true,"applicableTo":{"allEmployees":false,"designations":[],"departments":[],"employees":[]}}\n]'} className="w-full rounded-lg border p-3 font-mono text-xs"/>
      <button disabled={saving || !bulkText.trim()} className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50">Bulk upload</button>
    </form>
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4"><h2 className="font-semibold">Holiday records ({holidays.length})</h2><button onClick={load} className="text-sm text-blue-700">Refresh</button></div>
      {loading ? <p className="p-6 text-sm text-slate-500">Loading holidays...</p> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Date</th><th className="p-3">Holiday</th><th className="p-3">Calendar</th><th className="p-3">Type</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{holidays.map(h=><tr key={h._id} className="border-t"><td className="p-3 whitespace-nowrap">{dateLabel(h.date)}</td><td className="p-3 font-medium">{h.name}</td><td className="p-3">{h.calendarName}</td><td className="p-3">{h.type}</td><td className="p-3">{h.isOptional ? "Floating" : "Fixed"}</td><td className="p-3">{h.isActive ? "Active" : "Inactive"}</td><td className="p-3"><div className="flex gap-3"><button onClick={()=>startEdit(h)} className="text-blue-700">Edit</button><button onClick={()=>toggleActive(h)} className="text-amber-700">{h.isActive ? "Deactivate" : "Activate"}</button><button onClick={()=>removeHoliday(h)} className="text-red-700">Delete</button></div></td></tr>)}</tbody></table>{!holidays.length&&<p className="p-6 text-sm text-slate-500">No holidays found for this year.</p>}</div>}
    </section>
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b p-4"><h2 className="font-semibold">Employee floating holiday selections</h2><p className="text-xs text-slate-500">Review employee-wise confirmed selections.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Employee</th><th className="p-3">Calendar</th><th className="p-3">Selected holidays</th><th className="p-3">Quota</th><th className="p-3">Status</th></tr></thead><tbody>{selections.map(s=><tr key={s._id} className="border-t"><td className="p-3">{s.employeeId?.name || s.employeeId?.email || s.employeeId?._id || "Employee"}</td><td className="p-3">{s.calendarName} ({s.year})</td><td className="p-3">{(s.selectedHolidays||[]).map(x=>x.holidayName).join(", ") || "-"}</td><td className="p-3">{s.totalSelected}/{s.totalAllowed}</td><td className="p-3">{s.status}</td></tr>)}</tbody></table>{!selections.length&&<p className="p-5 text-sm text-slate-500">No employee selections yet.</p>}</div>
    </section>
  </main>;
}
