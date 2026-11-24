import { useCallback, useEffect, useState } from "react";
import apiClient from "../../../api/apiClient";

const unpack = r => r?.data?.data ?? r?.data ?? {};
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const prettyDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) : "-";

export default function MyHolidays() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendars, setCalendars] = useState([]);
  const [chosen, setChosen] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await apiClient.get("/hrms/holidays/my", { params: { year } });
      const rows = unpack(response).calendars || [];
      setCalendars(rows);
      const next = {};
      rows.forEach(c => { next[c.holidayCalendarId] = (c.selection?.selectedHolidays || []).map(h => String(h.holidayId)); });
      setChosen(next);
    } catch (e) { setError(e?.response?.data?.message || "Unable to load your holidays."); }
    finally { setLoading(false); }
  }, [year]);
  useEffect(() => { load(); }, [load]);

  function toggle(calendar, id, checked) {
    setChosen(old => {
      const current = old[calendar.holidayCalendarId] || [];
      return { ...old, [calendar.holidayCalendarId]: checked ? [...current, id] : current.filter(x => x !== id) };
    });
  }
  async function submit(calendar) {
    const key = calendar.holidayCalendarId;
    setSaving(key); setError(""); setNotice("");
    try {
      await apiClient.post("/hrms/holidays/my/selections", {
        calendarName: calendar.calendarName, year: calendar.year, holidayIds: chosen[key] || []
      });
      setNotice(`Your floating holidays for ${calendar.calendarName} have been confirmed.`);
      await load();
    } catch (e) { setError(e?.response?.data?.message || "Unable to save floating holiday selection."); }
    finally { setSaving(""); }
  }

  return <main className="mx-auto w-full max-w-6xl space-y-5 p-4 md:p-6">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Employee Self Service</p><h1 className="mt-1 text-2xl font-bold">My Holidays</h1><p className="mt-1 text-sm text-slate-500">View fixed holidays and select your annual floating holidays.</p></div><label className="text-sm font-medium">Year<select value={year} onChange={e=>setYear(Number(e.target.value))} className="ml-2 rounded-lg border p-2">{Array.from({length:6},(_,i)=>new Date().getFullYear()-1+i).map(y=><option key={y}>{y}</option>)}</select></label></header>
    {error&&<div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {notice&&<div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</div>}
    {loading ? <div className="rounded-xl border bg-white p-8 text-sm text-slate-500">Loading your holiday calendar...</div> : calendars.map(calendar=>{
      const selected=chosen[calendar.holidayCalendarId]||[];
      const limit=Number(calendar.floatingHolidayLimit||0);
      const alreadyConfirmed=calendar.selection?.status==="Confirmed";
      const now=localToday();
      const windowOpen=(!calendar.selectionStartDate||now>=calendar.selectionStartDate)&&(!calendar.selectionEndDate||now<=calendar.selectionEndDate);
      return <section key={calendar.holidayCalendarId} className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-semibold">{calendar.calendarName}</h2><p className="text-xs text-slate-500">Fixed and optional holidays · {calendar.year}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{selected.length}/{limit} floating holidays selected</span></div>
        <div><h3 className="mb-2 font-semibold">Fixed holidays</h3><div className="grid gap-2 md:grid-cols-2">{calendar.fixedHolidays.map(h=><div key={h._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><div><p className="font-medium">{h.name}</p><p className="text-xs text-slate-500">{prettyDate(h.date)}</p></div><span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Fixed holiday</span></div>)}</div>{!calendar.fixedHolidays.length&&<p className="text-sm text-slate-500">No fixed holidays configured.</p>}</div>
        <div><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Choose floating holidays</h3><p className="text-xs text-slate-500">{calendar.selectionStartDate||calendar.selectionEndDate?`Selection: ${calendar.selectionStartDate||"Any time"} to ${calendar.selectionEndDate||"No closing date"}`:"Selection window not restricted by dates"}</p></div>
          <div className="grid gap-2 md:grid-cols-2">{calendar.optionalHolidays.map(h=>{const checked=selected.includes(String(h._id));return <label key={h._id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${checked?"border-blue-400 bg-blue-50":"border-slate-200"}`}><input type="checkbox" checked={checked} disabled={!windowOpen||(!checked&&selected.length>=limit)} onChange={e=>toggle(calendar,String(h._id),e.target.checked)}/><span className="min-w-0 flex-1"><span className="block font-medium">{h.name}</span><span className="block text-xs text-slate-500">{prettyDate(h.date)} · {h.type}</span></span><span className="text-xs text-slate-500">{checked?"Selected":"Optional"}</span></label>;})}</div>
          {!calendar.optionalHolidays.length&&<p className="text-sm text-slate-500">No floating holidays available.</p>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3"><p className="text-xs text-slate-500">{!windowOpen?"Selection window is currently closed.":alreadyConfirmed?"You can update your selection while the selection window remains open.":"Select up to the allowed quota and submit."}</p><button onClick={()=>submit(calendar)} disabled={!windowOpen||saving===calendar.holidayCalendarId||selected.length>limit||!calendar.optionalHolidays.length} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving===calendar.holidayCalendarId?"Saving...":alreadyConfirmed?"Update selection":"Submit selection"}</button></div>
      </section>;
    })}
    {!loading&&!calendars.length&&<div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">No holiday calendar has been assigned or published for {year}.</div>}
  </main>;
}
