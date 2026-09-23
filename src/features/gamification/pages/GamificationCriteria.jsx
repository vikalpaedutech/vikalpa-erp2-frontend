import { useEffect, useState } from "react";
import {
  getGamificationCriteria,
  updateGamificationCriteria,
} from "../services/gamification.service";

const unwrapObject = (response) =>
  response?.data?.data ??
  response?.data ??
  response;

export default function GamificationCriteria() {
  const [criteriaJson, setCriteriaJson] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getGamificationCriteria();

      const criteria =
        unwrapObject(response);

      setCriteriaJson(
        JSON.stringify(
          criteria,
          null,
          2
        )
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to load gamification criteria."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveCriteria = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload =
        JSON.parse(criteriaJson);

      const response =
        await updateGamificationCriteria(
          payload
        );

      const criteria =
        unwrapObject(response);

      setCriteriaJson(
        JSON.stringify(
          criteria,
          null,
          2
        )
      );

      setMessage(
        "Gamification criteria saved successfully."
      );
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "Criteria JSON is invalid."
          : e.response?.data?.message ||
              "Failed to save gamification criteria."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-100 ring-1 ring-white/10">
                Scoring Engine
              </span>

              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Gamification Criteria
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-indigo-100/75">
                Configure the point rules used by the
                gamification calculation engine.
              </p>
            </div>

            <button
              type="button"
              onClick={saveCriteria}
              disabled={
                saving || loading
              }
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-900 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Criteria"}
            </button>
          </div>
        </section>

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

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-slate-900">
              Advanced Scoring Configuration
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Edit the JSON below and save it. The changes
              are used the next time gamification is
              recalculated.
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="h-[650px] animate-pulse rounded-2xl bg-slate-100" />
            ) : (
              <textarea
                value={criteriaJson}
                onChange={(e) =>
                  setCriteriaJson(
                    e.target.value
                  )
                }
                spellCheck={false}
                className="min-h-[650px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
