import { useEffect, useState } from "react";
import SearchableSelect from "../../../components/common/SearchableSelect";
import Select from "react-select";
import apiClient from "../../../api/apiClient";
import { getLeaveTypes, getLeavePolicies, saveLeavePolicy, deactivateLeavePolicy } from "../services/userLeave.service";

const blank = { leaveTypeId: "", eligibility: { applyToAll: true, roles: [], designations: [], users: [] }, accrualFrequency: "none", accrualAmount: 0, annualEntitlement: 0, carryForwardAllowed: false, maxCarryForward: 0, expiryMonths: 0, effectiveFrom: new Date().toISOString().slice(0, 10), description: "", isActive: true };

export default function LeavePolicies() {
  const [types, setTypes] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      setLoading(true); setError("");
      const [typeRes, policyRes, roleRes, designationRes, userRes] = await Promise.all([
        getLeaveTypes({ isActive: true }),
        getLeavePolicies(),
        apiClient.get("/permissions-management/roles/active"),
        apiClient.get("/designation/active"),
        apiClient.get("/user-management/users", { params: { page: 1, limit: 100, isActive: true } }),
      ]);
      setTypes(Array.isArray(typeRes?.data) ? typeRes.data : []);
      setPolicies(Array.isArray(policyRes?.data) ? policyRes.data : []);
      setRoles(Array.isArray(roleRes?.data?.data) ? roleRes.data.data : Array.isArray(roleRes?.data) ? roleRes.data : []);
      setDesignations(Array.isArray(designationRes?.data?.data) ? designationRes.data.data : Array.isArray(designationRes?.data) ? designationRes.data : []);
      const userData = userRes?.data?.data?.users || userRes?.data?.users || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (e) { setError(e.response?.data?.message || "Unable to load leave policies."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const change = (e) => {
    const { name, value, checked, type } = e.target;
    if (name === "applyToAll") {
      setForm(p => ({ ...p, eligibility: { ...p.eligibility, applyToAll: checked } }));
      return;
    }
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const edit = (p) => {
    setEditingId(p._id);
    setForm({
      leaveTypeId: p.leaveTypeId?._id || p.leaveTypeId || "",
      eligibility: {
        applyToAll: p.eligibility?.applyToAll !== false,
        roles: (p.eligibility?.roles || []).map(x => x?._id || x),
        designations: (p.eligibility?.designations || []).map(x => x?._id || x),
        users: (p.eligibility?.users || []).map(x => x?._id || x),
      },
      accrualFrequency: p.accrualFrequency || "none",
      accrualAmount: p.accrualAmount ?? 0,
      annualEntitlement: p.annualEntitlement ?? 0,
      carryForwardAllowed: Boolean(p.carryForwardAllowed),
      maxCarryForward: p.maxCarryForward ?? 0,
      expiryMonths: p.expiryMonths ?? 0,
      effectiveFrom: p.effectiveFrom ? new Date(p.effectiveFrom).toISOString().slice(0, 10) : blank.effectiveFrom,
      description: p.description || "", isActive: p.isActive !== false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reset = () => { setEditingId(""); setForm(blank); };
  const submit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.leaveTypeId) return setError("Please select a leave type.");
    try {
      setSaving(true);
      await saveLeavePolicy({ ...form, accrualAmount: Number(form.accrualAmount), annualEntitlement: Number(form.annualEntitlement), maxCarryForward: Number(form.maxCarryForward), expiryMonths: Number(form.expiryMonths) });
      setSuccess("Leave policy saved successfully."); reset(); await load();
    } catch (err) { setError(err.response?.data?.message || "Failed to save leave policy."); }
    finally { setSaving(false); }
  };
  const deactivate = async (p) => {
    if (!window.confirm("Deactivate this leave policy?")) return;
    try { await deactivateLeavePolicy(p._id); setSuccess("Leave policy deactivated."); await load(); }
    catch (e) { setError(e.response?.data?.message || "Failed to deactivate policy."); }
  };
  const field = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm";
  return <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">
    <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Leave Policies</h1><p className="mt-1 text-sm text-gray-500">Define entitlement, monthly or periodic accrual, carry-forward and expiry rules for each leave type.</p></div>
    {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {success && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
    <form onSubmit={submit} className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-gray-900">{editingId ? "Edit Leave Policy" : "Configure Leave Policy"}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-medium text-gray-700">Leave Type
          <SearchableSelect name="leaveTypeId" value={form.leaveTypeId} onChange={change} className={field}><option value="">Select Leave Type</option>{types.map(t => <option key={t._id} value={t._id}>{t.name} ({t.code})</option>)}</SearchableSelect>
        </label>
        <label className="text-sm font-medium text-gray-700">Accrual Frequency
          <select name="accrualFrequency" value={form.accrualFrequency} onChange={change} className={field}><option value="none">No automatic accrual</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="half_yearly">Half-yearly</option><option value="yearly">Yearly</option></select>
        </label>
        <label className="text-sm font-medium text-gray-700">Accrual Amount (per cycle)
          <input type="number" min="0" step="0.5" name="accrualAmount" value={form.accrualAmount} onChange={change} className={field} />
        </label>
        <label className="text-sm font-medium text-gray-700">Annual Entitlement (days)
          <input type="number" min="0" step="0.5" name="annualEntitlement" value={form.annualEntitlement} onChange={change} className={field} />
        </label>
        <label className="text-sm font-medium text-gray-700">Effective From
          <input type="date" name="effectiveFrom" value={form.effectiveFrom} onChange={change} className={field} />
        </label>
        <label className="text-sm font-medium text-gray-700">Expiry After (months; 1 = end of credit month, 0 = no expiry)
          <input type="number" min="0" name="expiryMonths" value={form.expiryMonths} onChange={change} className={field} />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" name="carryForwardAllowed" checked={form.carryForwardAllowed} onChange={change} /> Allow carry forward</label>
        <label className="text-sm font-medium text-gray-700">Maximum Carry Forward (days)
          <input type="number" min="0" step="0.5" name="maxCarryForward" value={form.maxCarryForward} onChange={change} disabled={!form.carryForwardAllowed} className={field} />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" name="isActive" checked={form.isActive} onChange={change} /> Policy active</label>
        <label className="text-sm font-medium text-gray-700 md:col-span-2 lg:col-span-3">Policy Notes
          <textarea name="description" value={form.description} onChange={change} rows="2" className={field} placeholder="e.g. CL can be accumulated monthly; unused balance expires at year end." />
        </label>
      </div>
      <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
        <h3 className="font-semibold text-gray-900">Leave Eligibility & Assignment</h3>
        <p className="mt-1 text-xs text-gray-500">Choose who can see and use this leave type. If Apply to all is selected, all active employees are eligible.</p>
        <label className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" name="applyToAll" checked={form.eligibility.applyToAll} onChange={change} />
          Apply to all employees
        </label>
        {!form.eligibility.applyToAll && <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">Eligible Roles
            <Select
              isMulti
              isSearchable
              closeMenuOnSelect={false}
              options={roles.map(r => ({ value: r._id, label: `${r.roleName || r.name || "Role"}${r.roleCode ? ` (${r.roleCode})` : ""}` }))}
              value={roles.filter(r => form.eligibility.roles.includes(r._id)).map(r => ({ value: r._id, label: `${r.roleName || r.name || "Role"}${r.roleCode ? ` (${r.roleCode})` : ""}` }))}
              onChange={selected => setForm(p => ({ ...p, eligibility: { ...p.eligibility, roles: (selected || []).map(x => x.value) } }))}
              placeholder="Search and select roles..."
              noOptionsMessage={() => "No roles found"}
              className="mt-1"
              classNamePrefix="react-select"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">Eligible Designations
            <Select
              isMulti
              isSearchable
              closeMenuOnSelect={false}
              options={designations.map(d => ({ value: d._id, label: `${d.designation || d.name || "Designation"}${d.designationCode ? ` (${d.designationCode})` : ""}` }))}
              value={designations.filter(d => form.eligibility.designations.includes(d._id)).map(d => ({ value: d._id, label: `${d.designation || d.name || "Designation"}${d.designationCode ? ` (${d.designationCode})` : ""}` }))}
              onChange={selected => setForm(p => ({ ...p, eligibility: { ...p.eligibility, designations: (selected || []).map(x => x.value) } }))}
              placeholder="Search and select designations..."
              noOptionsMessage={() => "No designations found"}
              className="mt-1"
              classNamePrefix="react-select"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">Specific Employees
            <Select
              isMulti
              isSearchable
              closeMenuOnSelect={false}
              options={users.map(u => ({ value: u._id, label: `${u.name || u.email || "Employee"}${u.userId ? ` (${u.userId})` : ""}` }))}
              value={users.filter(u => form.eligibility.users.includes(u._id)).map(u => ({ value: u._id, label: `${u.name || u.email || "Employee"}${u.userId ? ` (${u.userId})` : ""}` }))}
              onChange={selected => setForm(p => ({ ...p, eligibility: { ...p.eligibility, users: (selected || []).map(x => x.value) } }))}
              placeholder="Search and select employees..."
              noOptionsMessage={() => "No employees found"}
              className="mt-1"
              classNamePrefix="react-select"
            />
          </label>
        </div>}
      </div>
      <div className="mt-5 flex gap-3"><button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : editingId ? "Update Policy" : "Save Policy"}</button>{editingId && <button type="button" onClick={reset} className="rounded-xl border px-5 py-2.5 text-sm font-semibold">Cancel</button>}</div>
      <p className="mt-3 text-xs text-amber-700">Note: This screen stores policy rules. Automatic monthly/periodic balance credit is not enabled by this configuration alone yet.</p>
    </form>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="border-b px-5 py-4 font-semibold">Configured Policies</div>
      {loading ? <div className="p-8 text-center text-sm text-gray-500">Loading...</div> : policies.length === 0 ? <div className="p-8 text-center text-sm text-gray-500">No leave policies configured yet.</div> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr>{["Leave Type","Eligibility","Accrual","Amount / Cycle","Annual Entitlement","Carry Forward","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead><tbody className="divide-y">{policies.map(p=><tr key={p._id}><td className="px-4 py-3 font-medium">{p.leaveTypeId?.name || "-"}</td><td className="px-4 py-3">{p.eligibility?.applyToAll !== false ? "All employees" : [...(p.eligibility?.roles || []).map(x => x.roleCode || x.roleName), ...(p.eligibility?.designations || []).map(x => x.designation), ...(p.eligibility?.users || []).map(x => x.name)].join(", ") || "No assignment"}</td><td className="px-4 py-3">{(p.accrualFrequency || "none").replace("_"," ")}</td><td className="px-4 py-3">{p.accrualAmount}</td><td className="px-4 py-3">{p.annualEntitlement}</td><td className="px-4 py-3">{p.carryForwardAllowed ? `Yes (max ${p.maxCarryForward})` : "No"}</td><td className="px-4 py-3">{p.isActive ? "Active" : "Inactive"}</td><td className="px-4 py-3"><div className="flex gap-3"><button onClick={()=>edit(p)} className="font-semibold text-indigo-600">Edit</button>{p.isActive && <button onClick={()=>deactivate(p)} className="font-semibold text-red-600">Deactivate</button>}</div></td></tr>)}</tbody></table></div>}
    </div>
  </div></div>;
}
