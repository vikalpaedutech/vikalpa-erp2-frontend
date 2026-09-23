import { useEffect, useState } from "react";
import { getMyGamificationDashboard } from "../services/gamification.service";

const EVENT_LABELS = {
  "Self Attendance": "Self Attendance",
  "Student Attendance": "Student Attendance",
  "PDF Upload": "PDF Upload",
  "Calling Absentee": "Absentee Calling",
  Marks: "Marks",
  Disciplinary: "Disciplinary",
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

const pointClass = (value) =>
  Number(value || 0) > 0
    ? "text-emerald-600"
    : Number(value || 0) < 0
    ? "text-rose-600"
    : "text-slate-500";

export default function GamificationDashboardCard() {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: "",
  });

  useEffect(() => {
    let active = true;

    getMyGamificationDashboard()
      .then((response) => {
        if (!active) return;

        setState({
          loading: false,
          data: response.data,
          error: "",
        });
      })
      .catch((error) => {
        if (!active) return;

        setState({
          loading: false,
          data: null,
          error:
            error.response?.data?.message ||
            "Unable to load gamification.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-slate-100" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="h-24 rounded-2xl bg-slate-100" />
            <div className="h-24 rounded-2xl bg-slate-100" />
            <div className="h-24 rounded-2xl bg-slate-100" />
            <div className="h-24 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        {state.error}
      </div>
    );
  }

  if (!state.data?.isParticipant) {
    return null;
  }

  const rank = state.data.monthlyRank;

  const breakdown = (
    rank?.eventBreakdown || []
  ).map((item) => ({
    ...item,
    label:
      EVENT_LABELS[item.eventType] ||
      item.eventType,
  }));

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-5 py-6 text-white sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-100 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Monthly Performance
            </div>

            <h2 className="text-xl font-bold tracking-tight">
              Gamification
            </h2>

            <p className="mt-1 text-sm text-indigo-100/75">
              Your current month ranking and activity summary
            </p>
          </div>

        </div>
      </div>

      {/* RANK CARDS */}
      <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Today Rank
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {rank?.todayRank
              ? `#${rank.todayRank}`
              : "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Total Points
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-950">
            {formatPoints(
              rank?.totalPoints
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Today&apos;s Points
          </p>
          <p className="mt-2 text-3xl font-black text-amber-950">
            {formatPoints(
              rank?.todayPoints
            )}
          </p>
        </div>
      </div>

      {/* EVENT BREAKDOWN */}
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">
              Activity Breakdown
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Monthly total and current-day points by activity.
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            {rank?.eventCount || 0} total events
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {breakdown.map((item) => (
            <div
              key={item.eventType}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">
                  {item.label}
                </p>

              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Month
                  </p>
                  <p
                    className={`mt-1 text-xl font-black ${pointClass(
                      item.totalPoint
                    )}`}
                  >
                    {Number(
                      item.totalPoint || 0
                    ) > 0
                      ? "+"
                      : ""}
                    {formatPoints(
                      item.totalPoint
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Today
                  </p>
                  <p
                    className={`mt-1 text-sm font-bold ${pointClass(
                      item.todaysPoint
                    )}`}
                  >
                    {Number(
                      item.todaysPoint || 0
                    ) > 0
                      ? "+"
                      : ""}
                    {formatPoints(
                      item.todaysPoint
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
