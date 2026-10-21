import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getBillsForApproval,
    approveBill,
    rejectBill,
} from "../services/bill.service";


const groupExpensesByBillId = (items = []) => {
    const groups = new Map();
    items.forEach((expense) => {
        const rawBillId = expense.billId;
        const groupId = rawBillId?._id || rawBillId || expense._id;
        const key = String(groupId);
        if (!groups.has(key)) {
            groups.set(key, {
                ...expense,
                _id: key,
                billId: rawBillId,
                expenses: [],
                totalAmount: 0,
                expensePurpose: rawBillId?.expensePurpose || expense.expensePurpose || expense.title || 'Expense group',
                submissionDate: rawBillId?.submissionDate || expense.submittedAt || expense.createdAt,
            });
        }
        const group = groups.get(key);
        group.expenses.push(expense);
        group.totalAmount += Number(expense.amount ?? expense.totalAmount ?? 0);
        if (!group.submittedBy && expense.submittedBy) group.submittedBy = expense.submittedBy;
        if (!group.status || ['draft','submitted'].includes(group.status)) group.status = expense.status || group.status;
    });
    return Array.from(groups.values()).map((group) => ({
        ...group,
        billNumber: group._id,
        title: group.expensePurpose,
        billDate: group.submissionDate,
        currency: 'INR',
        expenseCount: group.expenses.length,
    }));
};

const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB");
};

const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
};

const BillApproval = () => {
    const navigate = useNavigate();

    const [bills, setBills] = useState([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const [billNumber, setBillNumber] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [processingId, setProcessingId] = useState(null);

    /*
     * null
     * = no remarks box open
     *
     * "approve"
     * = approval remarks open
     *
     * "reject"
     * = rejection remarks open
     */
    const [openAction, setOpenAction] = useState({
        billId: null,
        type: null,
    });

    const [remarks, setRemarks] = useState("");

    /*
     * ============================================================
     * FETCH BILLS
     * ============================================================
     */

    const fetchBills = async (page = 1) => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit: 10,
            };

            if (billNumber.trim()) {
                params.billNumber = billNumber.trim();
            }

            const response = await getBillsForApproval(params);

            setBills(groupExpensesByBillId(response.data?.bills || []));

            setPagination(
                response.data?.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 1,
                }
            );
        } catch (err) {
            console.error(
                "Failed to fetch approval bills:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to fetch approval bills"
            );
        } finally {
            setLoading(false);
        }
    };

    // BillAuditor assignments are enforced by the backend queue API.
    // Do not hardcode user role codes in the page-level access check.
    useEffect(() => {
        fetchBills(1);
    }, []);

    /*
     * ============================================================
     * SEARCH
     * ============================================================
     */

    const handleSearch = async (event) => {
        event.preventDefault();

        await fetchBills(1);
    };

    /*
     * ============================================================
     * RESET
     * ============================================================
     */

    const handleReset = async () => {
        setBillNumber("");

        setOpenAction({
            billId: null,
            type: null,
        });

        setRemarks("");

        await fetchBills(1);
    };

    /*
     * ============================================================
     * OPEN APPROVAL REMARKS
     * ============================================================
     */

    const openExpenseGroup = (bill) => {
        navigate(`/finance/bill-approval/group/${bill._id}`, {
            state: { group: bill, mode: 'approve' },
        });
    };

    const handleOpenApprove = (billOrId) => {
        const group = bills.find((item) => item._id === (billOrId?._id || billOrId));
        if (group) openExpenseGroup(group);
    };
    const handleOpenReject = handleOpenApprove;
    const handleCancelAction = () => { setOpenAction({ billId: null, type: null }); setRemarks(''); };
    const handleApprove = async (bill) => openExpenseGroup(bill);
    const handleReject = async (bill) => openExpenseGroup(bill);

    /*
     * ============================================================
     * ACCESS DENIED
     * ============================================================
     */

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Bill Approval
                </h1>

                <p className="mt-2 text-base text-gray-500">
                    Review and approve bills assigned to your approval scope.
                </p>
            </div>


            {/* =====================================================
                SEARCH
            ===================================================== */}

            <div className="mb-8 rounded-xl border border-gray-900 bg-white p-5 shadow-sm">

                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-4 md:flex-row md:items-end"
                >

                    <div className="flex-1">

                        <label className="mb-2 block text-base font-medium text-gray-700">
                            Bill ID
                        </label>

                        <input
                            type="text"
                            value={billNumber}
                            onChange={(event) =>
                                setBillNumber(
                                    event.target.value
                                )
                            }
                            placeholder="Search by bill number"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-blue-500"
                        />

                    </div>

                    <div className="flex gap-3">

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-7 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-7 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </div>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                        {error}
                    </p>
                </div>
            )}


            {/* =====================================================
                BILL LIST
            ===================================================== */}

            <div className="overflow-hidden rounded-xl border border-gray-900 bg-white">

                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        Loading approval bills...
                    </div>
                ) : bills.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No bills are pending approval.
                    </div>
                ) : (
                    <>

                        {/* =================================================
                            DESKTOP
                        ================================================= */}

                        <div className="hidden overflow-x-auto md:block">

                            <table className="min-w-full">

                                <thead>

                                    <tr className="border-b border-gray-900">

                                        <th className="px-5 py-5 text-left text-base font-semibold text-gray-900">
                                            Bill ID
                                        </th>

                                        <th className="px-5 py-5 text-left text-base font-semibold text-gray-900">
                                            Expense Purpose
                                        </th>

                                        <th className="px-5 py-5 text-left text-base font-semibold text-gray-900">
                                            Submitted By
                                        </th>

                                        <th className="px-5 py-5 text-left text-base font-semibold text-gray-900">
                                            Submitted Date
                                        </th>

                                        <th className="px-5 py-5 text-right text-base font-semibold text-gray-900">
                                            Amount
                                        </th>

                                        <th className="px-5 py-5 text-left text-base font-semibold text-gray-900">
                                            Status
                                        </th>

                                        <th className="px-5 py-5 text-right text-base font-semibold text-gray-900">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {bills.map((bill) => (
                                        <>
                                            {/* ============================
                                                BILL ROW
                                            ============================ */}

                                            <tr
                                                key={bill._id}
                                                className="border-b border-gray-300"
                                            >

                                                <td className="px-5 py-6 text-base font-semibold text-gray-900">
                                                    {bill.billNumber}
                                                </td>

                                                <td className="px-5 py-6 text-base text-gray-900">
                                                    {bill.title}
                                                </td>

                                                <td className="px-5 py-6 text-base text-gray-900">
                                                    {bill.submittedBy?.name || "-"}
                                                </td>

                                                <td className="px-5 py-6 text-base text-gray-900">
                                                    {formatDate(
                                                        bill.billDate
                                                    )}
                                                </td>

                                                <td className="px-5 py-6 text-right text-base font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        bill.totalAmount,
                                                        bill.currency
                                                    )}
                                                </td>

                                                <td className="px-5 py-6">

                                                    <span className="inline-block rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
                                                        Approval Pending
                                                    </span>

                                                </td>

                                                <td className="px-5 py-6">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/finance/bill-approval/group/${bill._id}`, { state: { group: bill, mode: "approve" } }
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50"
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleOpenApprove(
                                                                    bill._id
                                                                )
                                                            }
                                                            disabled={
                                                                processingId ===
                                                                bill._id
                                                            }
                                                            className="rounded-lg bg-green-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleOpenReject(
                                                                    bill._id
                                                                )
                                                            }
                                                            disabled={
                                                                processingId ===
                                                                bill._id
                                                            }
                                                            className="rounded-lg bg-red-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>


                                            {/* ============================
                                                APPROVAL REMARKS
                                            ============================ */}

                                            {openAction.billId ===
                                                bill._id &&
                                                openAction.type ===
                                                    "approve" && (
                                                    <tr className="border-b border-gray-300 bg-green-50">

                                                        <td
                                                            colSpan="7"
                                                            className="px-5 py-6"
                                                        >

                                                            <div className="mx-auto max-w-3xl">

                                                                <h3 className="text-xl font-semibold text-gray-900">
                                                                    Approval Remarks
                                                                </h3>

                                                                <p className="mt-1 text-base text-gray-500">
                                                                    Add remarks before approving this bill. This is optional.
                                                                </p>

                                                                <textarea
                                                                    value={remarks}
                                                                    onChange={(event) =>
                                                                        setRemarks(
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    rows="4"
                                                                    placeholder="Enter approval remarks"
                                                                    className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-green-500"
                                                                />

                                                                <div className="mt-4 flex gap-3">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleApprove(
                                                                                bill
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            processingId ===
                                                                            bill._id
                                                                        }
                                                                        className="rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                                                    >
                                                                        {processingId ===
                                                                        bill._id
                                                                            ? "Approving..."
                                                                            : "Confirm Approval"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            handleCancelAction
                                                                        }
                                                                        className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        Cancel
                                                                    </button>

                                                                </div>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                )}


                                            {/* ============================
                                                REJECTION REMARKS
                                            ============================ */}

                                            {openAction.billId ===
                                                bill._id &&
                                                openAction.type ===
                                                    "reject" && (
                                                    <tr className="border-b border-gray-300 bg-red-50">

                                                        <td
                                                            colSpan="7"
                                                            className="px-5 py-6"
                                                        >

                                                            <div className="mx-auto max-w-3xl">

                                                                <h3 className="text-xl font-semibold text-gray-900">
                                                                    Rejection Remarks
                                                                </h3>

                                                                <p className="mt-1 text-base text-gray-500">
                                                                    Rejection remarks are required.
                                                                </p>

                                                                <textarea
                                                                    value={remarks}
                                                                    onChange={(event) =>
                                                                        setRemarks(
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    rows="4"
                                                                    placeholder="Enter reason for rejecting this bill"
                                                                    className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-red-500"
                                                                />

                                                                <div className="mt-4 flex gap-3">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleReject(
                                                                                bill
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            processingId ===
                                                                            bill._id
                                                                        }
                                                                        className="rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                                                    >
                                                                        {processingId ===
                                                                        bill._id
                                                                            ? "Rejecting..."
                                                                            : "Confirm Rejection"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            handleCancelAction
                                                                        }
                                                                        className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        Cancel
                                                                    </button>

                                                                </div>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                )}

                                        </>
                                    ))}

                                </tbody>

                            </table>

                        </div>


                        {/* =================================================
                            MOBILE
                        ================================================= */}

                        <div className="space-y-4 p-4 md:hidden">

                            {bills.map((bill) => (
                                <div
                                    key={bill._id}
                                    className="rounded-xl border border-gray-300 bg-white"
                                >

                                    <div className="p-4">

                                        <div className="flex items-start justify-between gap-3">

                                            <div>

                                                <p className="font-semibold text-gray-900">
                                                    {bill.billNumber}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-600">
                                                    {bill.title}
                                                </p>

                                            </div>

                                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                                                Approval Pending
                                            </span>

                                        </div>


                                        <div className="mt-4 space-y-2 text-sm">

                                            <div className="flex justify-between gap-4">

                                                <span className="text-gray-500">
                                                    Submitted By
                                                </span>

                                                <span className="font-medium text-gray-900">
                                                    {bill.submittedBy?.name || "-"}
                                                </span>

                                            </div>

                                            <div className="flex justify-between gap-4">

                                                <span className="text-gray-500">
                                                    Submitted Date
                                                </span>

                                                <span>
                                                    {formatDate(
                                                        bill.billDate
                                                    )}
                                                </span>

                                            </div>

                                            <div className="flex justify-between gap-4">

                                                <span className="text-gray-500">
                                                    Amount
                                                </span>

                                                <span className="font-semibold">
                                                    {formatCurrency(
                                                        bill.totalAmount,
                                                        bill.currency
                                                    )}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="mt-4 flex flex-wrap gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/finance/bill-approval/group/${bill._id}`, { state: { group: bill, mode: "approve" } }
                                                    )
                                                }
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                                            >
                                                View
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenApprove(
                                                        bill._id
                                                    )
                                                }
                                                disabled={
                                                    processingId ===
                                                    bill._id
                                                }
                                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                            >
                                                Approve
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenReject(
                                                        bill._id
                                                    )
                                                }
                                                disabled={
                                                    processingId ===
                                                    bill._id
                                                }
                                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                            >
                                                Reject
                                            </button>

                                        </div>

                                    </div>


                                    {/* ================================
                                        MOBILE APPROVAL REMARKS
                                    ================================= */}

                                    {openAction.billId ===
                                        bill._id &&
                                        openAction.type ===
                                            "approve" && (
                                            <div className="border-t bg-green-50 p-4">

                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Approval Remarks
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Add remarks before approving this bill. This is optional.
                                                </p>

                                                <textarea
                                                    value={remarks}
                                                    onChange={(event) =>
                                                        setRemarks(
                                                            event.target.value
                                                        )
                                                    }
                                                    rows="4"
                                                    placeholder="Enter approval remarks"
                                                    className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
                                                />

                                                <div className="mt-3 flex gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleApprove(
                                                                bill
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            bill._id
                                                        }
                                                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                    >
                                                        {processingId ===
                                                        bill._id
                                                            ? "Approving..."
                                                            : "Confirm Approval"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleCancelAction
                                                        }
                                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </div>
                                        )}


                                    {/* ================================
                                        MOBILE REJECTION REMARKS
                                    ================================= */}

                                    {openAction.billId ===
                                        bill._id &&
                                        openAction.type ===
                                            "reject" && (
                                            <div className="border-t bg-red-50 p-4">

                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Rejection Remarks
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Rejection remarks are required.
                                                </p>

                                                <textarea
                                                    value={remarks}
                                                    onChange={(event) =>
                                                        setRemarks(
                                                            event.target.value
                                                        )
                                                    }
                                                    rows="4"
                                                    placeholder="Enter reason for rejecting this bill"
                                                    className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500"
                                                />

                                                <div className="mt-3 flex gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleReject(
                                                                bill
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            bill._id
                                                        }
                                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                    >
                                                        {processingId ===
                                                        bill._id
                                                            ? "Rejecting..."
                                                            : "Confirm Rejection"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleCancelAction
                                                        }
                                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </div>
                                        )}

                                </div>
                            ))}

                        </div>


                        {/* =================================================
                            PAGINATION
                        ================================================= */}

                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-300 px-5 py-4">

                                <p className="text-sm text-gray-500">
                                    Page {pagination.page} of{" "}
                                    {pagination.totalPages}
                                </p>

                                <div className="flex gap-2">

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page <= 1 ||
                                            loading
                                        }
                                        onClick={() =>
                                            fetchBills(
                                                pagination.page - 1
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page >=
                                                pagination.totalPages ||
                                            loading
                                        }
                                        onClick={() =>
                                            fetchBills(
                                                pagination.page + 1
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
                                    >
                                        Next
                                    </button>

                                </div>

                            </div>
                        )}

                    </>
                )}

            </div>

        </div>
    );
};

export default BillApproval;