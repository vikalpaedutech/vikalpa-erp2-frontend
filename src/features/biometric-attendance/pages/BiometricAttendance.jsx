import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBiometricUsers,
  getBiometricAttendance,
  getBiometricUserAttendanceByDate,
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
    const header = ["_id", "Date", "Check In", "Check Out", "Employee Name", "Employee ID", "Employee No String"];
    const rows = [header];
    summaryRows.forEach(({ user }) => {
      allDates.forEach((date) => {
        const group = groupByUserAndDate.get(`${String(user._id)}|${date}`) ||
          attendanceGroups.find((item) => item.date === date && String(item.employeeNoString || "") === String(user.employeeNoString || ""));
        const punches = (group?.logs || []).slice().sort((a, b) =>
          new Date(a.eventTime || a.rawEvent?.time) - new Date(b.eventTime || b.rawEvent?.time)
        );
        rows.push([
          user.linkedUserId || "",
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



  const exportEmployeeReport = () => {
    if (!dailyRows.length || !employee) return;
    const header = ["_id", "Date", "Check In", "Check Out", "Employee Name", "Employee ID", "Employee No String"];
    const rows = [header];
    dailyRows.forEach((row) => rows.push([
      employee.linkedUserId || "",
      dateLabel(row.date),
      timeLabel(row.checkIn?.eventTime || row.checkIn?.rawEvent?.time) === "-" ? "" : timeLabel(row.checkIn?.eventTime || row.checkIn?.rawEvent?.time),
      timeLabel(row.checkOut?.eventTime || row.checkOut?.rawEvent?.time) === "-" ? "" : timeLabel(row.checkOut?.eventTime || row.checkOut?.rawEvent?.time),
      employee.employeeName || employee.rawUser?.name || "",
      employee.empId || "",
      employee.employeeNoString || "",
    ]));
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\\r\\n");
    const blob = new Blob(["\\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `biometric-attendance-${employee.empId || biometricUserId}-${fromDate}-to-${toDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => navigate("/admin/biometric/attendance")} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">← Back to employees</button>
              <button onClick={exportEmployeeReport} disabled={!dailyRows.length || loading} className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Download Report</button>
            </div>
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
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Date", "Check In", "Check Out"].map((label) => <th key={label} className="whitespace-nowrap px-5 py-3">{label}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {dailyRows.map((row) => <tr key={row.date} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-3 font-medium">{dateLabel(row.date)}</td>
                      <td className="px-5 py-3">{timeLabel(row.checkIn?.eventTime || row.checkIn?.rawEvent?.time)}</td>
                      <td className="px-5 py-3">{timeLabel(row.checkOut?.eventTime || row.checkOut?.rawEvent?.time)}</td>
                    </tr>)}
                  </tbody>
                </table>
                {!dailyRows.length && <p className="p-10 text-center text-slate-500">No dates found in selected range.</p>}
              </div>
            )}
          </section>
        </>
      )}


    </main>
  );
}
