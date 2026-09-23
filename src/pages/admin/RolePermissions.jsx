import { useEffect, useMemo, useState } from "react";
import { getRoles } from "../../services/role.service";
import { getPermissions } from "../../services/permission.service";
import { getPermissionsByRole, replacePermissionsForRole } from "../../services/rolePermission.service";
import PermissionAssignmentModal from "../../components/admin/PermissionAssignmentModal";

export default function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [assigned, setAssigned] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [roleResponse, permissionResponse] = await Promise.all([
        getRoles({ page: 1, limit: 100, isActive: "true" }),
        getPermissions({ page: 1, limit: 500, isActive: "true" }),
      ]);
      setRoles((roleResponse.data?.roles || []).filter((role) => role.isActive !== false));
      setPermissions(permissionResponse.data?.permissions || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load role permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visibleRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return roles.filter((role) => !query || `${role.roleName || ""} ${role.roleCode || ""} ${role.description || ""}`.toLowerCase().includes(query));
  }, [roles, search]);

  const open = async (role) => {
    try {
      setSelectedRole(role);
      setLoadingPermissions(true);
      setError("");
      const response = await getPermissionsByRole(role._id);
      setAssigned(new Set((response.data || []).map((mapping) => String(mapping.permissionId?._id)).filter(Boolean)));
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load assigned permissions");
    } finally {
      setLoadingPermissions(false);
    }
  };

  const close = () => {
    if (saving) return;
    setSelectedRole(null);
    setAssigned(new Set());
  };

  const save = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      setError("");
      await replacePermissionsForRole(selectedRole._id, [...assigned]);
      await open(selectedRole);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to save role permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-7 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-200">User & Access / Permission Administrations</p>
        <h1 className="mt-2 text-3xl font-black">Role Permissions</h1>
        <p className="mt-2 max-w-3xl text-sm text-indigo-100/80">Configure permissions for active roles. Users assigned to a role inherit its effective permission set automatically.</p>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs font-black uppercase tracking-wider text-slate-500">Search
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search role name, code or description..." className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium normal-case outline-none focus:border-indigo-400" />
          </label>
          <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-600">{roles.length} active roles</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <tr><th className="px-5 py-3">Role Name</th><th className="px-5 py-3">Role Code</th><th className="px-5 py-3">Description</th><th className="px-5 py-3">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">Loading active roles...</td></tr> : visibleRoles.length ? visibleRoles.map((role) => (
                <tr key={role._id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-900">{role.roleName}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{role.roleCode}</span></td>
                  <td className="px-5 py-4 text-slate-600">{role.description || "-"}</td>
                  <td className="px-5 py-4"><button type="button" onClick={() => open(role)} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white hover:bg-indigo-700">Manage</button></td>
                </tr>
              )) : <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">No active roles match the search.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <PermissionAssignmentModal
        open={Boolean(selectedRole)}
        title={selectedRole ? `Permissions — ${selectedRole.roleName}` : "Role Permissions"}
        subtitle={selectedRole ? `${selectedRole.roleCode} · role-level permissions inherited by assigned users` : ""}
        permissions={permissions}
        assigned={assigned}
        setAssigned={setAssigned}
        saving={saving || loadingPermissions}
        onSave={save}
        onClose={close}
        mode="role"
      />
    </div>
  );
}
