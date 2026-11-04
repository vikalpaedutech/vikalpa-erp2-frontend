import { useEffect, useMemo, useState } from "react";
import apiClient from "../../../api/apiClient";

const TYPES = ["All", "Accrual", "Expiry", "Carry Forward", "Manual Adjustment", "Opening Balance", "Leave Deduction", "Leave Cancellation", "Leave Withdrawal"];
const csvCell = value => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function LeaveAccrualReport() {
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const [year,setYear]=useState(new Date().getFullYear()),[type,setType]=useState("All"),[search,setSearch]=useState("");
  const [roleId,setRoleId]=useState(""),[designationId,setDesignationId]=useState(""),[departmentId,setDepartmentId]=useState("");
  useEffect(()=>{let live=true;setLoading(true);setError("");
    const params={leaveYear:year};if(type!=="All")params.transactionType=type;
    if(roleId.trim())params.roleId=roleId.trim();if(designationId.trim())params.designationId=designationId.trim();if(departmentId.trim())params.departmentId=departmentId.trim();
    apiClient.get("/user-management/leave-policies/accrual-report",{params})
      .then(r=>{if(live)setRows(r?.data?.data||[]);})
      .catch(e=>{if(live)setError(e?.response?.data?.message||"Unable to load leave transaction report.");})
      .finally(()=>{if(live)setLoading(false);});
    return()=>{live=false;};
  },[year,type,roleId,designationId,departmentId]);
  const filtered=useMemo(()=>rows.filter(r=>{
    const q=search.toLowerCase();return !q||[r.userId?.name,r.userId?.userId,r.leaveTypeId?.name,r.transactionType,r.reason,r.remarks].some(v=>String(v||"").toLowerCase().includes(q));
  }),[rows,search]);
  const total=filtered.reduce((s,r)=>s+(Number(r.amount)||0),0);
  const exportCsv=()=>{
    const cols=["Date","Employee","Employee ID","Leave Type","Transaction Type","Amount (days)","Balance Before","Balance After","Reason","Remarks"];
    const lines=[cols.map(csvCell).join(","),...filtered.map(r=>[
      r.transactionDate?new Date(r.transactionDate).toISOString().slice(0,10):"",r.userId?.name,r.userId?.userId,
      r.leaveTypeId?.name||r.leaveTypeId?.code,r.transactionType,r.amount,r.balanceBefore,r.balanceAfter,r.reason,r.remarks
    ].map(csvCell).join(","))];
    const blob=new Blob([lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`leave-transactions-${year}.csv`;a.click();URL.revokeObjectURL(url);
  };
  return <main className="p-5 md:p-7 space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900">Leave Transaction & Scheduler Reports</h1><p className="text-sm text-slate-500 mt-1">Audit accrual credits, expiries, carry forwards and other leave balance movements.</p></div>
      <button onClick={exportCsv} disabled={!filtered.length} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-semibold disabled:opacity-40">Export CSV</button>
    </header>
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <article className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Transactions</p><p className="text-2xl font-bold">{filtered.length}</p></article>
      <article className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Net movement</p><p className="text-2xl font-bold">{total.toFixed(2)} days</p></article>
      <article className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Employees in report</p><p className="text-2xl font-bold">{new Set(filtered.map(r=>r.userId?._id).filter(Boolean)).size}</p></article>
    </section>
    <section className="rounded-xl border bg-white p-4 space-y-3">
      <h2 className="font-semibold text-slate-800">Filters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <label className="text-sm text-slate-600">Leave year<select className="mt-1 w-full rounded-lg border p-2.5" value={year} onChange={e=>setYear(Number(e.target.value))}>{[year,year-1,year-2,year+1].map(y=><option key={y}>{y}</option>)}</select></label>
        <label className="text-sm text-slate-600">Transaction / scheduler type<select className="mt-1 w-full rounded-lg border p-2.5" value={type} onChange={e=>setType(e.target.value)}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></label>
        <label className="text-sm text-slate-600">Search employee / leave<input className="mt-1 w-full rounded-lg border p-2.5" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, ID, leave type..."/></label>
        <label className="text-sm text-slate-600">Role ID (optional)<input className="mt-1 w-full rounded-lg border p-2.5" value={roleId} onChange={e=>setRoleId(e.target.value)} placeholder="Paste role ID"/></label>
        <label className="text-sm text-slate-600">Designation ID (optional)<input className="mt-1 w-full rounded-lg border p-2.5" value={designationId} onChange={e=>setDesignationId(e.target.value)} placeholder="Paste designation ID"/></label>
        <label className="text-sm text-slate-600">Department ID (optional)<input className="mt-1 w-full rounded-lg border p-2.5" value={departmentId} onChange={e=>setDepartmentId(e.target.value)} placeholder="Paste department ID"/></label>
      </div>
      <p className="text-xs text-slate-500">Role, designation and department filters accept MongoDB IDs. Search filters the loaded employee and leave details.</p>
    </section>
    {error&&<p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    <section className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["Date","Employee","Employee ID","Leave Type","Transaction","Days","Before","After","Details"].map(h=><th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>)}</tr></thead>
      <tbody>{loading?<tr><td colSpan="9" className="p-6 text-center text-slate-500">Loading report...</td></tr>:filtered.length?filtered.map(r=><tr key={r._id} className="border-t hover:bg-slate-50"><td className="px-3 py-3 whitespace-nowrap">{r.transactionDate?new Date(r.transactionDate).toLocaleDateString():"—"}</td><td className="px-3 py-3">{r.userId?.name||"—"}</td><td className="px-3 py-3">{r.userId?.userId||"—"}</td><td className="px-3 py-3">{r.leaveTypeId?.name||r.leaveTypeId?.code||"—"}</td><td className="px-3 py-3 whitespace-nowrap">{r.transactionType}</td><td className="px-3 py-3">{Number(r.amount||0).toFixed(2)}</td><td className="px-3 py-3">{Number(r.balanceBefore||0).toFixed(2)}</td><td className="px-3 py-3">{Number(r.balanceAfter||0).toFixed(2)}</td><td className="px-3 py-3">{r.reason||r.remarks||"—"}</td></tr>):<tr><td colSpan="9" className="p-6 text-center text-slate-500">No transactions found for the selected filters.</td></tr>}</tbody></table>
    </section>
  </main>;
}
