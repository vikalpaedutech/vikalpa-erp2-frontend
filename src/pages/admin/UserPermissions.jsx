import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../../services/user.service";
import { getPermissions } from "../../services/permission.service";
import { getRoles } from "../../services/role.service";
import { getUsersByRole } from "../../services/userRole.service";
import {
  getUserPermissions,
  getEffectiveUserPermissions,
  replaceUserPermissions,
} from "../../services/userPermission.service";
import PermissionAssignmentModal from "../../components/admin/PermissionAssignmentModal";

export default function UserPermissions() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [assigned, setAssigned] = useState(new Set());
  const [effective, setEffective] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadBase = async () => {
    try {
      setLoading(true);
      setError("");
      const [permissionResponse, roleResponse] = await Promise.all([
        getPermissions({ page: 1, limit: 500, isActive: "true" }),
        getRoles({ page: 1, limit: 100, isActive: "true" }),
      ]);
      setPermissions(permissionResponse.data?.permissions || []);
      setRoles(roleResponse.data?.roles || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load permission administration");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      if (roleFilter !== "all") {
        const response = await getUsersByRole(roleFilter);
        const roleUsers = (response.data || [])
          .filter((mapping) => mapping.isActive !== false)
          .map((mapping) => mapping.userId)
          .filter((user) => user?.isActive);
        const query = search.trim().toLowerCase();
        setUsers(query ? roleUsers.filter((user) => `${user.name || ""} ${user.email || ""} ${user.contact || ""} ${user.userId || ""}`.toLowerCase().includes(query)) : roleUsers);
      } else {
        const response = await getUsers({ page: 1, limit: 200, isActive: "true", search });
        setUsers(response.data?.users || []);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBase(); }, []);
  useEffect(() => { loadUsers(); }, [search, roleFilter]);

  const open = async (user) => {
    try {
      setSelected(user);
      setLoadingUser(true);
      setError("");
      const [direct, access] = await Promise.all([
        getUserPermissions(user._id),
        getEffectiveUserPermissions(user._id),
      ]);
      setAssigned(new Set((direct.data?.permissionIds || []).map((permission) => String(permission._id))));
      setEffective(access.data || null);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load user permissions");
    } finally {
      setLoadingUser(false);
    }
  };

  const close = () => {
    if (saving) return;
    setSelected(null);
    setAssigned(new Set());
    setEffective(null);
  };

  const save = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      setError("");
      await replaceUserPermissions(selected._id, [...assigned]);
      await open(selected);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to save user permissions");
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = useMemo(() => roles.filter((role) => role.isActive !== false), [roles]);

  return (
    <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-7 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-200">User & Access / User Administrations</p>
        <h1 className="mt-2 text-3xl font-black">User Permissions</h1>
        <p className="mt-2 max-w-3xl text-sm text-indigo-100/80">Manage direct permissions for active users. Role-inherited access remains visible separately and is not removed when direct permissions are changed.</p>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-end">
          <label className="w-full lg:max-w-xs text-xs font-black uppercase tracking-wider text-slate-500">Role Filter
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium normal-case text-slate-800">
              <option value="all">All active roles</option>
              {roleOptions.map((role) => <option key={role._id} value={role._id}>{role.roleName} ({role.roleCode})</option>)}
            </select>
          </label>
          <label className="flex-1 text-xs font-black uppercase tracking-wider text-slate-500">Search
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, user ID or contact..." className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium normal-case outline-none focus:border-indigo-400" />
          </label>
          <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-600">{users.length} active users</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">Loading active users...</td></tr> : users.length ? users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-5 py-4"><p className="font-bold text-slate-900">{user.name || "-"}</p><p className="text-xs text-slate-400">{user.userId || ""}</p></td>
                  <td className="px-5 py-4 text-slate-600">{user.email || "-"}</td>
                  <td className="px-5 py-4 text-slate-600">{user.contact || "-"}</td>
                  <td className="px-5 py-4"><button type="button" onClick={() => open(user)} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white hover:bg-indigo-700">Manage</button></td>
                </tr>
              )) : <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">No active users match the selected filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <PermissionAssignmentModal
        open={Boolean(selected)}
        title={selected ? `Permissions — ${selected.name}` : "User Permissions"}
        subtitle={selected ? `${selected.email || selected.contact || ""} · direct permissions can be changed here` : ""}
        permissions={permissions}
        assigned={assigned}
        setAssigned={setAssigned}
        effective={effective}
        saving={saving || loadingUser}
        onSave={save}
        onClose={close}
        mode="user"
      />
    </div>
  );
}
