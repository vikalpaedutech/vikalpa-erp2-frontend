import { useEffect, useMemo, useState } from "react";
import {

  initiateGamificationDaily,
  updateGamificationMonthlyRanking,
  getGamificationLeaderboard,
  downloadGamificationReport,
  initiateGamificationEvent,
  updateGamificationEventPointValue,
} from "../services/gamification.service";
import { initiateGamification } from "../services/gamification.service";

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
};

const unwrapList = (response) => {
  const root = response?.data ?? response;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;

  return [];
};

const formatPoints = (value) => {
  const number = Number(value || 0);

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(1);
};

const classificationClass = (value) => {
  if (value === "Positive") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (value === "Negative") {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }

  return "bg-slate-50 text-slate-600 ring-slate-200";
};

export default function GamificationDashboard({ scope = "admin" }) {
  const [month, setMonth] = useState(currentMonth());
  const [rankDate, setRankDate] = useState(new Date().toISOString().slice(0, 10));
  const [monthlyLeaderboard, setMonthlyLeaderboard] =
    useState([]);
  const [dailyLeaderboard, setDailyLeaderboard] =
    useState([]);
  const [eventLeaderboard, setEventLeaderboard] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] =
    useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const eventTypes = ["Self Attendance", "Student Attendance", "PDF Upload", "Calling Absentee", "Marks", "Disciplinary"];
  const [selectedEvent, setSelectedEvent] = useState("Self Attendance");
  const [eventPeriod, setEventPeriod] = useState("Daily");
  const [overrideEvent, setOverrideEvent] = useState("Self Attendance");
  const [overridePoints, setOverridePoints] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [monthly, daily] = await Promise.all([
        getGamificationLeaderboard({
          month,
          periodType: "Monthly",
          ...(scope === "region" || scope === "all" ? { scope } : {}),
        }),
        getGamificationLeaderboard({
          month,
          periodType: "Daily",
          date: rankDate,
          ...(scope === "region" || scope === "all" ? { scope } : {}),
        }),
      ]);

      setMonthlyLeaderboard(
        unwrapList(monthly)
      );

      setDailyLeaderboard(
        unwrapList(daily)
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to load gamification dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [month, rankDate, scope]);

  const initiate = async () => {
    if (!window.confirm(`Calculate gamification rank for ${rankDate} only? Other dates will not be recalculated.`)) return;
    setProcessing("recalculate"); setError(""); setMessage("");
    try { const response = await initiateGamificationDaily(rankDate); setMessage(response?.message || `Rank calculated for ${rankDate}.`); await loadDashboard(); }
    catch (e) { setError(e.response?.data?.message || "Failed to calculate daily rank."); }
    finally { setProcessing(""); }
  };

  const updateRank = async () => {
    setProcessing("rank");
    setError("");
    setMessage("");

    try {
      const response =
        await updateGamificationMonthlyRanking(
          month
        );

      setMessage(
        response?.message ||
          "Monthly ranking updated successfully."
      );

      await loadDashboard();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to update monthly ranking."
      );
    } finally {
      setProcessing("");
    }
  };

  const calculateSelectedEvent = async () => {
    const payload = eventPeriod === "Monthly"
      ? { eventType: selectedEvent, periodType: "Monthly", month }
      : { eventType: selectedEvent, periodType: "Daily", date: rankDate };
    if (!window.confirm(`Recalculate ${selectedEvent} for ${eventPeriod === "Monthly" ? month : rankDate}? Other event types will remain unchanged.`)) return;
    setProcessing("event"); setError(""); setMessage("");
    try {
      const response = await initiateGamificationEvent(payload);
      const eventRankResponse = await getGamificationLeaderboard({
        month,
        periodType: eventPeriod,
        ...(eventPeriod === "Daily" ? { date: rankDate } : {}),
        eventType: selectedEvent,
        ...(scope === "region" || scope === "all" ? { scope } : {}),
      });
      setEventLeaderboard(unwrapList(eventRankResponse));
      setMessage(response?.message || `${selectedEvent} ranking recalculated.`);
      await loadDashboard();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to calculate selected event ranking.");
    } finally { setProcessing(""); }
  };

  const saveEventPointValue = async () => {
    if (overridePoints === "" || !Number.isFinite(Number(overridePoints))) {
      setError("Enter a valid point value."); return;
    }
    if (!window.confirm(`Set ${overrideEvent} points to ${overridePoints} for all existing users/events and future recalculations?`)) return;
    setProcessing("override"); setError(""); setMessage("");
    try {
      const response = await updateGamificationEventPointValue({ eventType: overrideEvent, pointValue: Number(overridePoints) });
      setMessage(response?.message || "Event point value updated.");
      setOverridePoints("");
      await loadDashboard();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update event point value.");
    } finally { setProcessing(""); }
  };

  const download = async (format) => {
    setProcessing(`download-${format}`);
    setError("");

    try {
      const blob =
        await downloadGamificationReport(
          month,
          format,
          scope === "all" ? "all" : "region",
          rankDate
        );

      const url = URL.createObjectURL(blob);
      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download = `gamification-report-${month}.${format === "csv" ? "csv" : "xlsx"}`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to download report."
      );
    } finally {
      setProcessing("");
    }
  };

  const monthlyTotals = useMemo(() => {
    return monthlyLeaderboard.reduce(
      (summary, row) => {
        summary.points += Number(
          row.totalPoints || 0
        );
        summary.events += Number(
          row.eventCount || 0
        );

        return summary;
      },
      {
        points: 0,
        events: 0,
      }
    );
  }, [monthlyLeaderboard]);

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100 ring-1 ring-white/15">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Gamification Control Center
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Ranking & Performance
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/80">
                Rankings refresh automatically after tracked activity changes.
                Use recalculation controls only to recover or audit a period,
                and export performance reports when needed.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-indigo-100">
                Ranking Month
              </label>

              <input
                type="month"
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value)
                }
                className="rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-white/20"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => download("xlsx")} disabled={Boolean(processing)} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-indigo-800 shadow-sm disabled:opacity-50">
                  {processing === "download-xlsx" ? "Exporting..." : "Export Excel"}
                </button>
                <button type="button" onClick={() => download("csv")} disabled={Boolean(processing)} className="rounded-xl border border-white/30 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                  {processing === "download-csv" ? "Exporting..." : "Export CSV"}
                </button>
              </div>
            </div>
            {scope !== "admin" && (
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-indigo-100">Daily Ranking Date</label>
                <input type="date" value={rankDate} onChange={(e) => setRankDate(e.target.value)} className="rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800" />
              </div>
            )}
          </div>
        </section>

        {scope === "admin" && <>
        {/* ACTIONS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Calculation Controls
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Points and rankings update automatically after tracked activity saves.
                These controls remain available for recovery and historical corrections.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Rank date
                <input type="date" value={rankDate} onChange={(e) => setRankDate(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" />
              </label>
              <button
                type="button"
                onClick={initiate}
                disabled={Boolean(processing)}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing === "recalculate"
                  ? "Recalculating..."
                  : "Calculate Today’s Rank"}
              </button>

              <button
                type="button"
                onClick={updateRank}
                disabled={Boolean(processing)}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing === "rank"
                  ? "Updating..."
                  : "Update Monthly Ranking"}
              </button>

            </div>
          </div>
        </section>

        {/* EVENT-SPECIFIC CONTROLS */}
        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Calculate Rank by Event</h2>
            <p className="mt-1 text-sm text-slate-500">Recalculate only the selected event type for a date or month. Other event types remain unchanged.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Event Type
                <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5">
                  {eventTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">Calculation Period
                <select value={eventPeriod} onChange={(e) => setEventPeriod(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5">
                  <option value="Daily">Today / Selected Date</option><option value="Monthly">Selected Month</option>
                </select>
              </label>
            </div>
            <button type="button" onClick={calculateSelectedEvent} disabled={Boolean(processing)} className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {processing === "event" ? "Calculating..." : "Calculate Selected Event Rank"}
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Update Event Points for All Users</h2>
            <p className="mt-1 text-sm text-slate-500">Sets one point value for every existing ledger entry of this event and applies it to future recalculations.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Event Type
                <select value={overrideEvent} onChange={(e) => setOverrideEvent(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5">
                  {eventTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">New Points Value
                <input type="number" step="0.1" value={overridePoints} onChange={(e) => setOverridePoints(e.target.value)} placeholder="e.g. 5 or -5" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
              </label>
            </div>
            <button type="button" onClick={saveEventPointValue} disabled={Boolean(processing)} className="mt-4 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {processing === "override" ? "Updating..." : "Apply Point Value to All Users"}
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">{selectedEvent} — {eventPeriod} Event Ranking</h2>
            <p className="mt-1 text-xs text-slate-500">Ranking is calculated using only this event type, independently of other event points.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Rank</th><th className="px-5 py-3">Participant</th><th className="px-5 py-3">Event Points</th><th className="px-5 py-3">Event Count</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {eventLeaderboard.length ? eventLeaderboard.map((row) => <tr key={row.userId?._id || row._id}><td className="px-5 py-3 font-semibold">#{row.rank}</td><td className="px-5 py-3">{row.userId?.name || "-"}</td><td className="px-5 py-3 font-bold">{formatPoints(row.totalPoints)}</td><td className="px-5 py-3">{row.eventCount || 0}</td></tr>) : <tr><td colSpan="4" className="px-5 py-6 text-center text-slate-500">Select an event and calculate its ranking to view event-specific results.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        </>}


        {/* STATUS */}
        {(message || error) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* SUMMARY */}
        {!loading && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Participants
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {monthlyLeaderboard.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Active gamification participants
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Monthly Events
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {monthlyTotals.events}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Generated point events
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Point Sum
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatPoints(
                  monthlyTotals.points
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Net points across participants
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                Rank Storage
              </p>
              <p className="mt-2 text-lg font-bold text-indigo-900">
                One record / user / month
              </p>
              <p className="mt-1 text-xs text-indigo-700/70">
                Monthly + current-day rank snapshot
              </p>
            </div>
          </section>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            Loading ranking data...
          </div>
        ) : (
          <>
            {/* CURRENT DAY */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Current Day Ranking
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Daily points and ranking for{" "}
                      {rankDate}.
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                    {dailyLeaderboard.length} participants
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Rank</th>
                      <th className="px-5 py-3">Participant</th>
                      <th className="px-5 py-3">Date Points</th>
                      <th className="px-5 py-3">Events</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {dailyLeaderboard.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-5 py-10 text-center text-sm text-slate-500"
                        >
                          No ranking has been generated for
                          this month yet.
                        </td>
                      </tr>
                    ) : (
                      dailyLeaderboard.map(
                        (row) => (
                          <tr
                            key={row.userId?._id || row._id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                                #{row.rank}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800">
                                {row.userId?.name ||
                                  "-"}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                {row.userId?.userId ||
                                  ""}
                              </p>
                            </td>

                            <td className="px-5 py-4 font-bold text-slate-900">
                              {formatPoints(
                                row.totalPoints
                              )}
                            </td>

                            <td className="px-5 py-4 text-slate-500">
                              {row.eventCount || 0}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classificationClass(
                                  row.pointClassification
                                )}`}
                              >
                                {row.pointClassification ||
                                  "Neutral"}
                              </span>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* MONTHLY */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Monthly Ranking
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      One persistent monthly summary per participant.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    {month}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Rank</th>
                      <th className="px-5 py-3">Participant</th>
                      <th className="px-5 py-3">Total Points</th>
                      <th className="px-5 py-3">Today</th>
                      <th className="px-5 py-3">Events</th>
                      <th className="px-5 py-3">Classification</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {monthlyLeaderboard.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-5 py-10 text-center text-sm text-slate-500"
                        >
                          No monthly ranking has been generated yet.
                        </td>
                      </tr>
                    ) : (
                      monthlyLeaderboard.map(
                        (row) => (
                          <tr
                            key={row._id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">
                                #{row.rank}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800">
                                {row.userId?.name ||
                                  "-"}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                {row.userId?.userId ||
                                  ""}
                              </p>
                            </td>

                            <td className="px-5 py-4 font-bold text-slate-900">
                              {formatPoints(
                                row.totalPoints
                              )}
                            </td>

                            <td className="px-5 py-4 font-semibold text-indigo-700">
                              {formatPoints(
                                row.todayPoints
                              )}
                            </td>

                            <td className="px-5 py-4 text-slate-500">
                              {row.eventCount || 0}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classificationClass(
                                  row.pointClassification
                                )}`}
                              >
                                {row.pointClassification ||
                                  "Neutral"}
                              </span>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
