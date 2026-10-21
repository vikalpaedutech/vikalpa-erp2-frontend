import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getBillsForVerification,
    verifyBill,
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

    return new Date(date).toLocaleDateString();
};


const formatCurrency = (
    amount,
    currency = "INR"
) => {
    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }
    ).format(
        Number(amount || 0)
    );
};


const formatStatus = (status) => {
    if (!status) return "-";

    return status
        .replaceAll("-", " ")
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );
};


function BillVerification() {
    const navigate = useNavigate();

    const [bills, setBills] =
        useState([]);

    const [pagination, setPagination] =
        useState({
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
        });

    const [billNumber, setBillNumber] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [processingId, setProcessingId] =
        useState(null);

    const [error, setError] =
        useState("");

    const [remarks, setRemarks] =
        useState({});


    /*
     * ============================================================
     * FETCH
     * ============================================================
     */

    const fetchBills = async (
        page = 1
    ) => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit: 10,
            };

            if (
                billNumber.trim()
            ) {
                params.billNumber =
                    billNumber.trim();
            }

            const response =
                await getBillsForVerification(
                    params
                );

            setBills(groupExpensesByBillId(response.data?.bills || []));

            setPagination(
                response.data?.pagination ||
                {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                }
            );
        } catch (err) {
            console.error(
                "Failed to fetch verification bills:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to fetch verification bills"
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

    const handleSearch = async (
        event
    ) => {
        event.preventDefault();

        await fetchBills(1);
    };


    const handleReset = async () => {
        setBillNumber("");

        await fetchBills(1);
    };


    /*
     * ============================================================
     * REMARKS
     * ============================================================
     */

    const getRemarks = (
        billId
    ) => {
        return (
            remarks[billId] ||
            ""
        );
    };


    const setBillRemarks = (
        billId,
        value
    ) => {
        setRemarks(
            (previous) => ({
                ...previous,
                [billId]:
                    value,
            })
        );
    };


    /*
     * ============================================================
     * VERIFY
     * ============================================================
     */

    const openExpenseGroup = (bill) => {
        navigate(`/finance/bill-verification/group/${bill._id}`, {
            state: { group: bill, mode: 'verify' },
        });
    };

    const handleVerify = async (bill) => openExpenseGroup(bill);
    const handleReject = async (bill) => openExpenseGroup(bill);

    /*
     * ============================================================
     * ACCESS DENIED
     * ============================================================
     */

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Bill Verification
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Review and verify bills assigned to your
                    verification scope.
                </p>
            </div>


            {/* =====================================================
                SEARCH
            ===================================================== */}

            <form
                onSubmit={handleSearch}
                className="mb-6 rounded-xl border bg-white p-5 shadow-sm"
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-gray-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Reset
                    </button>

                </div>
            </form>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                        {error}
                    </p>
                </div>
            )}


            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading bills...
                    </div>
                ) : bills.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No bills are pending verification.
                    </div>
                ) : (
                    <>

                        {/* DESKTOP */}

                        <div className="hidden overflow-x-auto md:block">

                            <table className="w-full text-left">

                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                                            Bill ID
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                                            Expense Purpose
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                                            Submitted By
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                                            Submitted Date
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                                            Amount
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {bills.map(
                                        (bill) => (
                                            <tr
                                                key={bill._id}
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="px-5 py-4 text-sm font-medium text-gray-800">
                                                    {bill.billNumber} <span className="text-xs text-gray-500">({bill.expenseCount} expenses)</span>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {bill.title}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {bill.submittedBy?.name ||
                                                        "-"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {formatDate(
                                                        bill.billDate
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm font-medium text-gray-800">
                                                    {formatCurrency(
                                                        bill.totalAmount,
                                                        bill.currency
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                                                        {formatStatus(
                                                            bill.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/finance/bill-verification/group/${bill._id}`, { state: { group: bill, mode: "verify" } }
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleVerify(
                                                                    bill
                                                                )
                                                            }
                                                            disabled={
                                                                processingId ===
                                                                bill._id
                                                            }
                                                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            {processingId ===
                                                            bill._id
                                                                ? "..."
                                                                : "Verify"}
                                                        </button>

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
                                                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>

                                                    </div>

                                                    <div className="mt-3">
                                                        <textarea
                                                            value={getRemarks(
                                                                bill._id
                                                            )}
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setBillRemarks(
                                                                    bill._id,
                                                                    event.target.value
                                                                )
                                                            }
                                                            rows={2}
                                                            placeholder="Verification / rejection remarks"
                                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>

                            </table>

                        </div>


                        {/* MOBILE */}

                        <div className="space-y-4 p-4 md:hidden">

                            {bills.map(
                                (bill) => (
                                    <div
                                        key={bill._id}
                                        className="rounded-xl border p-4"
                                    >

                                        <div className="grid grid-cols-2 gap-3 text-sm">

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Bill ID
                                                </p>

                                                <p className="font-medium text-gray-800">
                                                    {bill.billNumber}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Status
                                                </p>

                                                <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                                                    {formatStatus(
                                                        bill.status
                                                    )}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Expense Purpose
                                                </p>

                                                <p className="font-medium text-gray-800">
                                                    {bill.title}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Submitted By
                                                </p>

                                                <p className="font-medium text-gray-800">
                                                    {bill.submittedBy?.name ||
                                                        "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Submitted Date
                                                </p>

                                                <p className="font-medium text-gray-800">
                                                    {formatDate(
                                                        bill.billDate
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Amount
                                                </p>

                                                <p className="font-medium text-gray-800">
                                                    {formatCurrency(
                                                        bill.totalAmount,
                                                        bill.currency
                                                    )}
                                                </p>
                                            </div>

                                        </div>


                                        <textarea
                                            value={getRemarks(
                                                bill._id
                                            )}
                                            onChange={(
                                                event
                                            ) =>
                                                setBillRemarks(
                                                    bill._id,
                                                    event.target.value
                                                )
                                            }
                                            rows={3}
                                            placeholder="Verification / rejection remarks"
                                            className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                                        />


                                        <div className="mt-4 grid grid-cols-3 gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/finance/bill-verification/group/${bill._id}`, { state: { group: bill, mode: "verify" } }
                                                    )
                                                }
                                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                                            >
                                                View
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleVerify(
                                                        bill
                                                    )
                                                }
                                                disabled={
                                                    processingId ===
                                                    bill._id
                                                }
                                                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                                            >
                                                Verify
                                            </button>

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
                                                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                                            >
                                                Reject
                                            </button>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>


                        {/* PAGINATION */}

                        {pagination.totalPages >
                            1 && (
                            <div className="flex items-center justify-between border-t px-5 py-4">

                                <p className="text-sm text-gray-500">
                                    Page{" "}
                                    {pagination.page}{" "}
                                    of{" "}
                                    {pagination.totalPages}
                                </p>

                                <div className="flex gap-2">

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page <=
                                                1 ||
                                            loading
                                        }
                                        onClick={() =>
                                            fetchBills(
                                                pagination.page -
                                                    1
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
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
                                                pagination.page +
                                                    1
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
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
}


export default BillVerification;