import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { approveBill, getBillById, rejectBill, verifyBill } from "../services/bill.service";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN") : "-";
const pretty = (value) => String(value || "-").replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function BillExpenseGroupDetails() {
    const { billId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const group = location.state?.group;
    const mode = location.state?.mode || (location.pathname.includes("bill-approval") ? "approve" : "verify");
    const sourceExpenses = useMemo(() => group?.expenses || [], [group]);
    const [expenses, setExpenses] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [detailsError, setDetailsError] = useState("");
    const [remarks, setRemarks] = useState({});

    // Each stored Bills document contains one expense in expenses[0], while
    // attachments are stored at the document root. Fetch each full document so
    // private DigitalOcean Spaces attachments arrive with signed URLs.
    useEffect(() => {
        let cancelled = false;
        const loadExpenseDetails = async () => {
            if (!sourceExpenses.length) {
                setExpenses([]);
                setLoadingDetails(false);
                return;
            }
            setLoadingDetails(true);
            setDetailsError("");
            const loaded = await Promise.all(sourceExpenses.map(async (billDoc) => {
                const id = billDoc?._id;
                let fullDoc = billDoc;
                if (id) {
                    try {
                        const response = await getBillById(id);
                        fullDoc = response?.data?.data || response?.data || response?.bill || billDoc;
                    } catch (error) {
                        console.error("Failed to load bill expense details", id, error);
                    }
                }
                const nestedExpense = Array.isArray(fullDoc?.expenses) ? fullDoc.expenses[0] : null;
                return {
                    ...fullDoc,
                    ...(nestedExpense || {}),
                    _id: fullDoc?._id || id,
                    billDocumentId: fullDoc?._id || id,
                    category: nestedExpense?.category || fullDoc?.category,
                    amount: nestedExpense?.amount ?? fullDoc?.totalAmount ?? fullDoc?.amount ?? 0,
                    expenseDate: nestedExpense?.expenseDate || fullDoc?.expenseDate,
                    description: nestedExpense?.description || fullDoc?.expenseDescription || "",
                    expenseDescription: nestedExpense?.description || fullDoc?.expenseDescription || "",
                    billDescription: fullDoc?.description || "",
                    attachments: Array.isArray(fullDoc?.attachments) ? fullDoc.attachments : (nestedExpense?.attachments || []),
                    travel: nestedExpense?.travel || fullDoc?.travel,
                    stayedAt: nestedExpense?.stayedAt || fullDoc?.stayedAt,
                    itemName: nestedExpense?.itemName || fullDoc?.itemName,
                    purpose: nestedExpense?.purpose || fullDoc?.purpose,
                    expense: nestedExpense?.expense || fullDoc?.expense,
                };
            }));
            if (!cancelled) {
                setExpenses(loaded);
                setLoadingDetails(false);
                if (loaded.length && loaded.every((item) => !item.category && !item.amount)) {
                    setDetailsError("Expense details could not be read from the bill records.");
                }
            }
        };
        loadExpenseDetails();
        return () => { cancelled = true; };
    }, [sourceExpenses]);
    const [processingId, setProcessingId] = useState(null);

    const act = async (expense, action) => {
        const id = expense._id;
        const remark = (remarks[id] || "").trim();
        if (action === "reject" && !remark) {
            window.alert("Rejection remarks are required.");
            return;
        }
        if (!window.confirm(`Are you sure you want to ${action} this expense?`)) return;
        try {
            setProcessingId(id);
            if (action === "verify") await verifyBill(id, { remarks: remark || undefined });
            if (action === "approve") await approveBill(id, { remarks: remark || undefined });
            if (action === "reject") await rejectBill(id, { remarks: remark });
            window.alert(`Expense ${action === "reject" ? "rejected" : action === "verify" ? "verified" : "approved"} successfully.`);
            navigate(mode === "approve" ? "/finance/bill-approval" : "/finance/bill-verification");
        } catch (error) {
            window.alert(error.response?.data?.message || `Failed to ${action} expense.`);
        } finally {
            setProcessingId(null);
        }
    };

    if (!group) {
        return <div className="min-h-screen bg-gray-50 p-6"><button className="mb-4 rounded border px-4 py-2" onClick={() => navigate(-1)}>← Back</button><div className="rounded-xl bg-white p-6 shadow-sm"><h1 className="text-xl font-semibold">Expense group unavailable</h1><p className="mt-2 text-gray-600">Open this page from the Verification or Approval list so the grouped expenses are passed to the details page.</p><p className="mt-1 text-sm text-gray-500">Bill ID: {billId}</p></div></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <button className="mb-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100" onClick={() => navigate(mode === "approve" ? "/finance/bill-approval" : "/finance/bill-verification")}>← Back to {mode === "approve" ? "Approval" : "Verification"}</button>
            <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h1 className="text-xl font-semibold text-gray-900">Expense Details</h1><p className="mt-1 text-sm text-gray-500">Bill ID: {billId}</p></div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{expenses.length} expense(s)</span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div><p className="text-xs uppercase text-gray-500">Expense Purpose</p><p className="mt-1 font-medium">{group.expensePurpose || group.title || "-"}</p></div>
                    <div><p className="text-xs uppercase text-gray-500">Submitted By</p><p className="mt-1 font-medium">{group.submittedBy?.name || "-"}</p></div>
                    <div><p className="text-xs uppercase text-gray-500">Total Amount</p><p className="mt-1 font-semibold">{money(group.totalAmount)}</p></div>
                    <div className="sm:col-span-3"><p className="text-xs uppercase text-gray-500">Bill Description</p><p className="mt-1 whitespace-pre-wrap">{group.description || group.billDescription || "-"}</p></div>
                </div>
            </div>
            {loadingDetails && <div className="rounded-xl bg-white p-5 text-sm text-gray-500 shadow-sm">Loading complete expense details and attachments…</div>}
            {detailsError && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{detailsError}</div>}
            <div className="space-y-4">
                {expenses.map((expense, index) => (
                    <article key={expense._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-gray-900">Expense #{index + 1} · {pretty(expense.category)}</h2><p className="mt-1 text-sm text-gray-500">Expense ID: {expense._id}</p></div><p className="text-lg font-semibold">{money(expense.amount)}</p></div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div><p className="text-xs uppercase text-gray-500">Expense Date</p><p className="mt-1">{date(expense.expenseDate)}</p></div>
                            {expense.travel && <><div><p className="text-xs uppercase text-gray-500">From</p><p className="mt-1">{expense.travel.from || "-"}</p></div><div><p className="text-xs uppercase text-gray-500">To</p><p className="mt-1">{expense.travel.to || "-"}</p></div><div><p className="text-xs uppercase text-gray-500">Travel Purpose</p><p className="mt-1">{expense.travel.purpose || "-"}</p></div><div><p className="text-xs uppercase text-gray-500">Mode of Travel</p><p className="mt-1">{expense.travel.modeOfTravel || "-"}</p></div><div><p className="text-xs uppercase text-gray-500">Distance</p><p className="mt-1">{expense.travel.distance ?? "-"}</p></div></>}
                            {expense.stayedAt && <div><p className="text-xs uppercase text-gray-500">Stayed At</p><p className="mt-1">{expense.stayedAt}</p></div>}
                            {expense.itemName && <div><p className="text-xs uppercase text-gray-500">Item Name</p><p className="mt-1">{expense.itemName}</p></div>}
                            {expense.purpose && !expense.travel?.purpose && <div><p className="text-xs uppercase text-gray-500">Purpose</p><p className="mt-1">{expense.purpose}</p></div>}
                            {expense.expenseDescription && <div className="sm:col-span-2 lg:col-span-3"><p className="text-xs uppercase text-gray-500">Expense Description</p><p className="mt-1 whitespace-pre-wrap">{expense.expenseDescription}</p></div>}
                            {expense.expense && <div className="sm:col-span-2 lg:col-span-3"><p className="text-xs uppercase text-gray-500">Expense</p><p className="mt-1 whitespace-pre-wrap">{expense.expense}</p></div>}
                        </div>
                        {Array.isArray(expense.attachments) && expense.attachments.length > 0 && <div className="mt-4"><p className="mb-2 text-xs uppercase text-gray-500">Attachments</p><div className="flex flex-wrap gap-2">{expense.attachments.map((file, i) => { const url = typeof file === "string" ? file : file.url || file.location; const label = typeof file === "string" ? `Attachment ${i + 1}` : file.fileName || file.originalName || file.name || `Attachment ${i + 1}`; return url ? <a key={file._id || url || i} href={url} target="_blank" rel="noreferrer" onClick={(event) => { if (!url) event.preventDefault(); }} className="rounded border px-3 py-2 text-sm text-blue-700 underline">{label}</a> : null; })}</div></div>}
                        <div className="mt-4"><label className="mb-1 block text-sm font-medium text-gray-700">Remarks {mode === "verify" ? "(optional)" : "(required for rejection)"}</label><textarea value={remarks[expense._id] || ""} onChange={(e) => setRemarks((prev) => ({ ...prev, [expense._id]: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500" placeholder="Enter remarks..." /></div>
                        <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <button disabled={processingId === expense._id} onClick={() => act(expense, "reject")} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Reject</button>
                            {mode === "approve" ? <button disabled={processingId === expense._id} onClick={() => act(expense, "approve")} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{processingId === expense._id ? "Processing..." : "Approve"}</button> : <button disabled={processingId === expense._id} onClick={() => act(expense, "verify")} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{processingId === expense._id ? "Processing..." : "Verify"}</button>}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
