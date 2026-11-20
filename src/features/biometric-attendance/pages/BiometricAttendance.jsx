import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBiometricUsers,
  getBiometricAttendance,
  getBiometricUserAttendanceByDate,
  manageBiometricUserAttendanceDay,
  pushBiometricAttendance,
} from "../services/biometricAttendance.service";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const monthStart = () => `${today().slice(0, 7)}-01`;
const dateLabel = (value) => {
  if (!value) return "-";
  const d = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const timeLabel = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
};
const timeInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const responseData = (response) => response?.data?.data || response?.data || {};
const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const dateKeys = (fromDate, toDate) => {
  if (!fromDate || !toDate || fromDate > toDate) return [];
  const out = [];
  const cursor = new Date(`${fromDate}T12:00:00`);
  const end = new Date(`${toDate}T12:00:00`);
  while (cursor <= end) {
    out.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
};

export default function BiometricAttendance() {
  const { biometricUserId } = useParams();
  const navigate = useNavigate();
  const isDetail = Boolean(biometricUserId);

  const [users, setUsers] = useState([]);
  const [attendanceGroups, setAttendanceGroups] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [dailyRows, setDailyRows] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(monthStart());
  const [toDate, setToDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pushing, setPushing] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!fromDate || !toDate || fromDate > toDate) {
      setError("Please select a valid date range.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const first = responseData(await getBiometricUsers({ page: 1, limit: 500 }));
      const allUsers = [...(first.users || [])];
      const totalPages = Math.ceil((first.total || allUsers.length) / 500);
      for (let page = 2; page <= totalPages; page += 1) {
        const next = responseData(await getBiometricUsers({ page, limit: 500 }));
        allUsers.push(...(next.users || []));
      }
      const attendanceResponse = responseData(await getBiometricAttendance({ fromDate, toDate }));
      setUsers(allUsers);
      setAttendanceGroups(attendanceResponse.attendance || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to load biometric attendance.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  const loadDetail = useCallback(async () => {
    if (!biometricUserId) return;
    if (!fromDate || !toDate || fromDate > toDate) {
      setError("Please select a valid date range.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = responseData(await getBiometricUserAttendanceByDate(biometricUserId, { fromDate, toDate }));
      setEmployee(data.biometricUser || null);
      setDailyRows(data.attendance || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to load employee biometric attendance.");
    } finally {
      setLoading(false);
    }
  }, [biometricUserId, fromDate, toDate]);

  useEffect(() => {
    if (isDetail) loadDetail();
    else loadSummary();
  }, [isDetail, loadDetail, loadSummary]);

  const allDates = useMemo(() => dateKeys(fromDate, toDate), [fromDate, toDate]);

  const visibleUsers = useMemo(() => {
    const query = search.trim();
    if (!query) return users;
    const matcher = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return users.filter((user) => [
      user.empId,
      user.employeeNoString,
      user.biometricUserId,
      user.employeeName,
      user.rawUser?.name,
    ].some((value) => matcher.test(String(value ?? ""))));
  }, [users, search]);

  const summaryRows = useMemo(() => visibleUsers.map((user) => {
    const userId = String(user._id);
    const employeeNoString = String(user.employeeNoString ?? "");
    const groups = attendanceGroups.filter((group) =>
      String(group.biometricUser?._id || "") === userId ||
      (employeeNoString && String(group.employeeNoString || "") === employeeNoString)
    );
    const presentDays = new Set(groups.map((group) => group.date).filter(Boolean));
    const totalDays = allDates.length;
    const totalPresent = presentDays.size;
    return {
      user,
      totalPresent,
      totalAbsent: Math.max(0, totalDays - totalPresent),
      totalDays,
    };
  }), [visibleUsers, attendanceGroups, allDates]);

  const exportReport = () => {
    if (!summaryRows.length || !allDates.length) return;
    const groupByUserAndDate = new Map();
    attendanceGroups.forEach((group) => {
      const key = `${String(group.biometricUser?._id || "")}|${group.date}`;
      groupByUserAndDate.set(key, group);
    });
    const header = ["Date", "Check In", "Check Out", "Employee Name", "Employee ID", "Employee No String"];
    const rows = [header];
    summaryRows.forEach(({ user }) => {
      allDates.forEach((date) => {
        const group = groupByUserAndDate.get(`${String(user._id)}|${date}`) ||
          attendanceGroups.find((item) => item.date === date && String(item.employeeNoString || "") === String(user.employeeNoString || ""));
        const punches = (group?.logs || []).slice().sort((a, b) =>
          new Date(a.eventTime || a.rawEvent?.time) - new Date(b.eventTime || b.rawEvent?.time)
        );
        rows.push([
          dateLabel(date),
          punches.length ? timeLabel(punches[0].eventTime || punches[0].rawEvent?.time) : "",
          punches.length > 1 ? timeLabel(punches[punches.length - 1].eventTime || punches[punches.length - 1].rawEvent?.time) : "",
          user.employeeName || user.rawUser?.name || "",
          user.empId || "",
          user.employeeNoString || "",
        ]);
      });
    });
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `biometric-attendance-${fromDate}-to-${toDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const openManage = (row) => setEditing({
    date: row.date,
    punchIn: timeInput(row.checkIn?.eventTime || row.checkIn?.rawEvent?.time),
    punchOut: timeInput(row.checkOut?.eventTime || row.checkOut?.rawEvent?.time),
  });

  const saveManage = async () => {
    if (!editing) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await manageBiometricUserAttendanceDay(biometricUserId, editing.date, {
        punchIn: editing.punchIn,
        punchOut: editing.punchOut,
      });
      setEditing(null);
      setNotice("Biometric attendance saved successfully.");
      await loadDetail();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to save biometric attendance.");
    } finally {
      setSaving(false);
    }
  };

  const pushRange = async () => {
    if (!fromDate || !toDate || fromDate > toDate) {
      setError("Please select a valid date range.");
      return;
    }
    if (!window.confirm(`Push biometric attendance from ${fromDate} to ${toDate} into UserAttendances?`)) return;
    setPushing(true);
    setError("");
    setNotice("");
    try {
      const data = responseData(await pushBiometricAttendance({ fromDate, toDate }));
      setNotice(`Attendance pushed. Created: ${data.created || 0}, Updated: ${data.updated || 0}, Unmatched: ${data.unmatched || 0}.`);
    } catch (e) {
      setError(e?.response?.data?.message || "Attendance push failed.");
    } finally {
      setPushing(false);
    }
  };

  return (
    <main className="space-y-5 p-4 md:p-6">
      <header className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-200">Administration / Biometric</p>
        <h1 className="mt-2 text-3xl font-black">{isDetail ? "Employee Biometric Attendance" : "Biometric Attendance"}</h1>
        <p className="mt-2 text-sm text-blue-100">{isDetail ? "Date-wise first and last biometric punches." : "Employee-wise biometric attendance summary from Hikvision logs."}</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

      {!isDetail ? (
        <>
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_auto_auto] lg:items-end">
              <label className="text-xs font-semibold text-slate-600">Start Date
                <input type="date" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1 block w-full rounded-xl border px-3 py-2.5 text-sm"/>
              </label>
              <label className="text-xs font-semibold text-slate-600">End Date
                <input type="date" value={toDate} min={fromDate} max={today()} onChange={(e) => setToDate(e.target.value)} className="mt-1 block w-full rounded-xl border px-3 py-2.5 text-sm"/>
              </label>
              <label className="text-xs font-semibold text-slate-600">Search Employee
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Emp ID, employee name or employee no. string" className="mt-1 block w-full rounded-xl border px-3 py-2.5 text-sm"/>
              </label>
              <button onClick={exportReport} disabled={!summaryRows.length || loading} className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Export Report</button>
              <button onClick={pushRange} disabled={pushing || loading} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{pushing ? "Pushing..." : "Update User Attendance"}</button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b p-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Biometric Employees</h2>
                <p className="text-xs text-slate-500">Punches are matched with biometricUsers using employeeNoString.</p>
              </div>
              <p className="text-sm font-semibold text-slate-500">{summaryRows.length} employees · {allDates.length} days</p>
            </div>
            {loading ? <p className="p-10 text-center text-slate-500">Loading biometric attendance...</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>{["EmpId", "Employee No String", "Employee Name", "Total Present", "Total Absent", "Total Days", "Action"].map((label) => <th key={label} className="whitespace-nowrap px-5 py-3">{label}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {summaryRows.map(({ user, totalPresent, totalAbsent, totalDays }) => (
                      <tr key={user._id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-4 font-medium">{user.empId || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4">{user.employeeNoString || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{user.employeeName || user.rawUser?.name || "-"}</td>
                        <td className="px-5 py-4 font-semibold text-emerald-700">{totalPresent}</td>
                        <td className="px-5 py-4 font-semibold text-rose-700">{totalAbsent}</td>
                        <td className="px-5 py-4">{totalDays}</td>
                        <td className="px-5 py-4"><button onClick={() => navigate(`/admin/biometric/attendance/${user._id}`)} className="whitespace-nowrap rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800">View Attendance</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!summaryRows.length && !loading && <p className="p-10 text-center text-slate-500">No biometric users found for this search.</p>}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => navigate("/admin/biometric/attendance")} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">← Back to employees</button>
            <div className="text-sm font-semibold text-slate-600">{employee?.empId || "-"} · {employee?.employeeNoString || "-"}</div>
          </div>
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employee Name</p><p className="mt-1 text-lg font-bold text-slate-900">{employee?.employeeName || employee?.rawUser?.name || "Loading..."}</p></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employee ID</p><p className="mt-1 text-lg font-bold text-slate-900">{employee?.empId || "-"}</p></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employee No String</p><p className="mt-1 text-lg font-bold text-slate-900">{employee?.employeeNoString || "-"}</p></div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">Start Date<input type="date" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1 block w-full rounded-xl border px-3 py-2.5 text-sm"/></label>
              <label className="text-xs font-semibold text-slate-600">End Date<input type="date" value={toDate} min={fromDate} max={today()} onChange={(e) => setToDate(e.target.value)} className="mt-1 block w-full rounded-xl border px-3 py-2.5 text-sm"/></label>
            </div>
            <div className="mt-4"><button onClick={loadDetail} className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white">Apply Date Range</button></div>
          </section>
          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-4"><h2 className="font-bold text-slate-900">Date-wise Biometric Attendance</h2><p className="text-xs text-slate-500">Check In is the first punch and Check Out is the last punch of the date.</p></div>
            {loading ? <p className="p-10 text-center text-slate-500">Loading attendance...</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Date", "Check In", "Check Out", "Action"].map((label) => <th key={label} className="whitespace-nowrap px-5 py-3">{label}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {dailyRows.map((row) => <tr key={row.date} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-3 font-medium">{dateLabel(row.date)}</td>
                      <td className="px-5 py-3">{timeLabel(row.checkIn?.eventTime || row.checkIn?.rawEvent?.time)}</td>
                      <td className="px-5 py-3">{timeLabel(row.checkOut?.eventTime || row.checkOut?.rawEvent?.time)}</td>
                      <td className="px-5 py-3"><button onClick={() => openManage(row)} className="rounded-lg border border-blue-200 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">Manage</button></td>
                    </tr>)}
                  </tbody>
                </table>
                {!dailyRows.length && <p className="p-10 text-center text-slate-500">No dates found in selected range.</p>}
              </div>
            )}
          </section>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Manage Biometric Attendance</h3>
            <p className="mt-1 text-sm text-slate-500">{dateLabel(editing.date)} · {employee?.employeeName || ""}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Check In<input type="time" value={editing.punchIn} onChange={(e) => setEditing((v) => ({ ...v, punchIn: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2.5"/></label>
              <label className="text-sm font-semibold text-slate-700">Check Out<input type="time" value={editing.punchOut} onChange={(e) => setEditing((v) => ({ ...v, punchOut: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2.5"/></label>
            </div>
            <p className="mt-3 text-xs text-slate-500">Leave Check Out blank if the employee has only one punch.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button>
              <button onClick={saveManage} disabled={saving || (!editing.punchIn && !editing.punchOut)} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save / Update"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
