import { useMemo, useState } from "react";

export default function PermissionAssignmentModal({
  open,
  title,
  subtitle,
  permissions = [],
  assigned,
  setAssigned,
  effective = null,
  saving = false,
  onSave,
  onClose,
  mode = "role",
}) {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const modules = useMemo(
    () => [...new Set(permissions.map((p) => p.module).filter(Boolean))].sort(),
    [permissions]
  );

  const grouped = useMemo(() => {
    const query = search.trim().toLowerCase();
    return permissions
      .filter((p) => {
        const moduleOk = moduleFilter === "all" || p.module === moduleFilter;
        const text = `${p.permissionName} ${p.permissionCode} ${p.module} ${p.action}`.toLowerCase();
        return moduleOk && (!query || text.includes(query));
      })
      .reduce((acc, permission) => {
        (acc[permission.module || "Other"] ||= []).push(permission);
        return acc;
      }, {});
  }, [permissions, search, moduleFilter]);

  if (!open) return null;

  const togglePermission = (id) => {
    setAssigned((current) => {
      const next = new Set(current);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleModule = (items, checked) => {
    setAssigned((current) => {
      const next = new Set(current);
      items.forEach((item) => {
        const id = String(item._id);
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const effectiveIds = new Set((effective?.permissions || []).map((p) => String(p._id)));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-indigo-500">Permission Management</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
              {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{assigned.size} selected</span>
              {mode === "user" ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{effectiveIds.size} effective</span> : null}
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button>
              <button type="button" onClick={onSave} disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search permissions..." className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
            <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
              <option value="all">All modules</option>
              {modules.map((module) => <option key={module} value={module}>{module.replaceAll("_", " ")}</option>)}
            </select>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          <div className="space-y-4">
            {Object.entries(grouped).map(([module, items]) => {
              const directCount = items.filter((p) => assigned.has(String(p._id))).length;
              return (
                <section key={module} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-black capitalize text-slate-900">{module.replaceAll("_", " ")}</h3>
                      <p className="text-xs text-slate-400">{directCount}/{items.length} direct permissions selected</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => toggleModule(items, true)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50">Select All</button>
                      <button type="button" onClick={() => toggleModule(items, false)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50">Clear All</button>
                    </div>
                  </div>
                  <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((permission) => {
                      const id = String(permission._id);
                      const direct = assigned.has(id);
                      const inherited = mode === "user" && effectiveIds.has(id) && !direct;
                      return (
                        <label key={id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${direct ? "border-indigo-200 bg-indigo-50" : inherited ? "border-emerald-100 bg-emerald-50/50" : "border-slate-100 hover:bg-slate-50"}`}>
                          <input type="checkbox" checked={direct} onChange={() => togglePermission(id)} className="mt-1 h-4 w-4 accent-indigo-600" />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-800">{permission.permissionName}</span>
                            <span className="mt-1 block break-all font-mono text-[10px] text-slate-400">{permission.permissionCode}</span>
                            {inherited ? <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Granted by role</span> : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })}
            {!Object.keys(grouped).length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-400">No permissions match the selected filters.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
