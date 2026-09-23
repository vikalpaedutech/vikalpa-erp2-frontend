import { useEffect, useState } from "react";
import {
  getGamificationRoles,
  updateGamificationRole,
} from "../services/gamification.service";

const unwrapList = (response) => {
  const root = response?.data ?? response;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;

  return [];
};

export default function GamificationRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getGamificationRoles();

      setRoles(unwrapList(response));
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to load gamification roles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveRole = async (role, value) => {
    setSavingId(role._id);
    setError("");
    setMessage("");

    try {
      await updateGamificationRole(
        role._id,
        value
      );

      setRoles((current) =>
        current.map((item) =>
          item._id === role._id
            ? {
                ...item,
                isAllowed: value,
              }
            : item
        )
      );

      setMessage(
        `${role.roleName} gamification access ${
          value ? "enabled" : "disabled"
        }.`
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to update role access."
      );
    } finally {
      setSavingId("");
    }
  };

  const enabledCount = roles.filter(
    (role) => role.isAllowed
  ).length;

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-100 ring-1 ring-white/10">
                Access Control
              </span>

              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Gamification Eligible Roles
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/75">
                Decide which employee roles are allowed
                to participate in the gamification program.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Enabled Roles
              </p>
              <p className="mt-1 text-3xl font-black">
                {enabledCount}
                <span className="ml-1 text-base font-medium text-indigo-200">
                  / {roles.length}
                </span>
              </p>
            </div>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Role Access
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Only users with at least one enabled role can
              be configured as gamification participants.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-slate-100"
                  />
                )
              )}
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
              No roles found.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role._id}
                  className={`rounded-2xl border p-4 transition ${
                    role.isAllowed
                      ? "border-indigo-100 bg-indigo-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-800">
                        {role.roleName}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {role.roleCode}
                      </p>
                    </div>

                    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          role.isAllowed
                        )}
                        disabled={
                          savingId === role._id
                        }
                        onChange={(event) =>
                          saveRole(
                            role,
                            event.target.checked
                          )
                        }
                        className="peer sr-only"
                      />

                      <div className="h-7 w-12 rounded-full bg-slate-200 ring-1 ring-slate-200 after:absolute after:left-[3px] after:top-[3px] after:h-[22px] after:w-[22px] after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-indigo-600 peer-checked:ring-indigo-600 peer-checked:after:translate-x-[20px]" />
                    </label>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        role.isAllowed
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />

                    <span className="text-xs font-semibold text-slate-500">
                      {savingId === role._id
                        ? "Updating..."
                        : role.isAllowed
                        ? "Eligible"
                        : "Not eligible"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
