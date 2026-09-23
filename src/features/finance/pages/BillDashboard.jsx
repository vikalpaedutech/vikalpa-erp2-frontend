import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import {
    getBillDashboard,
    bulkVerifyBills,
    bulkApproveBills,
    bulkRejectBills,
    bulkMarkPaymentPending,
    bulkMarkBillsPaid,
    exportBillDashboard,
    verifyBill,
    approveBill,
    rejectBill,
    markPaymentPending,
    markBillPaid,
} from "../services/bill.service";

import { getUsers } from "../../../services/user.service";
import { getDistricts } from "../../../services/district.service";
import {
    getBlocksByDistrict,
} from "../../../services/block.service";
import {
    getCentersByBlock,
} from "../../../services/center.service";


const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
        "en-GB"
    );
};


const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
        "en-GB"
    );
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
    ).format(Number(amount || 0));
};


const statusLabel = (status) => {
    const labels = {
        draft: "Draft",
        "verification-pending":
            "Verification Pending",
        verified: "Verified",
        "approval-pending":
            "Approval Pending",
        approved: "Approved",
        "payment-pending":
            "Payment Pending",
        paid: "Paid",
        rejected: "Rejected",
    };

    return labels[status] || status;
};


const statusClasses = (status) => {
    const classes = {
        draft:
            "bg-gray-100 text-gray-700",

        "verification-pending":
            "bg-yellow-100 text-yellow-700",

        verified:
            "bg-blue-100 text-blue-700",

        "approval-pending":
            "bg-purple-100 text-purple-700",

        approved:
            "bg-green-100 text-green-700",

        "payment-pending":
            "bg-orange-100 text-orange-700",

        paid:
            "bg-emerald-100 text-emerald-700",

        rejected:
            "bg-red-100 text-red-700",
    };

    return (
        classes[status] ||
        "bg-gray-100 text-gray-700"
    );
};


const getUserName = (user) => {
    if (!user) return "-";

    return (
        user.name ||
        user.fullName ||
        user.email ||
        "-"
    );
};


const getUserEmail = (user) => {
    if (!user) return "-";

    return user.email || "-";
};


const getUserContact = (user) => {
    if (!user) return "-";

    return (
        user.contact ||
        user.phone ||
        user.mobile ||
        "-"
    );
};


/*
|--------------------------------------------------------------------------
| GET ROLE NAME
|--------------------------------------------------------------------------
|
| Backend may return:
|
| 1. String:
|    "CC"
|
| 2. Object:
|    {
|        roleCode: "cc",
|        roleName: "Center Coordinator"
|    }
|
| 3. Array:
|    [
|        {
|            roleCode: "cc",
|            roleName: "Center Coordinator"
|        }
|    ]
|
*/

const getRoleName = (role) => {
    if (!role) return "-";

    if (typeof role === "string") {
        return role;
    }

    if (Array.isArray(role)) {
        if (role.length === 0) {
            return "-";
        }

        return role
            .map((item) => {
                if (!item) {
                    return null;
                }

                if (typeof item === "string") {
                    return item;
                }

                return (
                    item.roleName ||
                    item.roleCode ||
                    null
                );
            })
            .filter(Boolean)
            .join(", ") || "-";
    }

    if (typeof role === "object") {
        return (
            role.roleName ||
            role.roleCode ||
            "-"
        );
    }

    return "-";
};


const getRegionName = (
    region,
    type
) => {
    if (!region) return "-";

    if (typeof region === "string") {
        return region;
    }

    if (type === "district") {
        return (
            region.districtName ||
            region.name ||
            "-"
        );
    }

    if (type === "block") {
        return (
            region.blockName ||
            region.name ||
            "-"
        );
    }

    if (type === "center") {
        return (
            region.centerName ||
            region.name ||
            "-"
        );
    }

    return "-";
};


const BillDashboard = () => {
    const navigate = useNavigate();

    const {
        access,
        isAdmin,
    } = useAuth();


    /*
     * ============================================================
     * USER ROLES
     * ============================================================
     */

    const roleCodes =
        access?.roles?.map(
            (role) =>
                role?.roleCode?.toLowerCase()
        ) || [];


    /*
     * ============================================================
     * DATA
     * ============================================================
     */

    const [bills, setBills] =
        useState([]);

    const [users, setUsers] =
        useState([]);

    const [districts, setDistricts] =
        useState([]);

    const [blocks, setBlocks] =
        useState([]);

    const [centers, setCenters] =
        useState([]);


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    const [loading, setLoading] =
        useState(true);

    const [filterLoading, setFilterLoading] =
        useState(false);

    const [processingId, setProcessingId] =
        useState(null);


    /*
     * ============================================================
     * ERROR
     * ============================================================
     */

    const [error, setError] =
        useState("");


    /*
     * ============================================================
     * FILTERS
     * ============================================================
     */

    const [filters, setFilters] =
        useState({
            status: "",
            submittedByRole: "",
            submittedBy: "",
            action: "",
            districtId: "",
            blockId: "",
            centerId: "",
            fromDate: "",
            toDate: "",
            billNumber: "",
        });


    /*
     * ============================================================
     * PAGINATION
     * ============================================================
     */

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
        });


    /*
     * ============================================================
     * SUMMARY
     * ============================================================
     */

    const [summary, setSummary] =
        useState({
            total: 0,
            draft: 0,
            verificationPending: 0,
            verified: 0,
            approvalPending: 0,
            approved: 0,
            paymentPending: 0,
            paid: 0,
            rejected: 0,
            totalAmount: 0,
        });


    /*
     * ============================================================
     * SELECTION
     * ============================================================
     */

    const [selectedBills, setSelectedBills] =
        useState([]);


    /*
     * ============================================================
     * BULK ACTION
     * ============================================================
     */

    const [bulkAction, setBulkAction] =
        useState("");

    const [bulkRemarks, setBulkRemarks] =
        useState("");

    const [showBulkRemarks, setShowBulkRemarks] =
        useState(false);

    const [bulkPaymentData, setBulkPaymentData] =
        useState({
            paymentReference: "",
            paymentMode: "",
        });


    /*
     * ============================================================
     * INDIVIDUAL ACTION
     * ============================================================
     */

    const [individualAction, setIndividualAction] =
        useState({
            billId: null,
            type: null,
        });

    const [individualRemarks, setIndividualRemarks] =
        useState("");

    const [paymentData, setPaymentData] =
        useState({
            paymentReference: "",
            paymentMode: "",
            remarks: "",
        });


    /*
     * ============================================================
     * FETCH USERS
     * ============================================================
     */

    const fetchUsers = async () => {
        try {
            const response =
                await getUsers({
                    page: 1,
                    limit: 100,
                });

            setUsers(
                response.data?.users ||
                []
            );
        } catch (err) {
            console.error(
                "Failed to fetch users:",
                err
            );
        }
    };


    /*
     * ============================================================
     * FETCH DISTRICTS
     * ============================================================
     */

    const fetchDistricts = async () => {
        try {
            const response =
                await getDistricts({
                    page: 1,
                    limit: 100,
                });

            setDistricts(
                response.data?.districts ||
                []
            );
        } catch (err) {
            console.error(
                "Failed to fetch districts:",
                err
            );
        }
    };


    /*
     * ============================================================
     * DISTRICT CHANGE
     * ============================================================
     */

    const handleDistrictChange = async (
        event
    ) => {
        const districtId =
            event.target.value;

        setFilters(
            (previous) => ({
                ...previous,
                districtId,
                blockId: "",
                centerId: "",
            })
        );

        setBlocks([]);
        setCenters([]);

        if (!districtId) {
            return;
        }

        try {
            const response =
                await getBlocksByDistrict(
                    districtId
                );

            setBlocks(
                response.data?.blocks ||
                []
            );
        } catch (err) {
            console.error(
                "Failed to fetch blocks:",
                err
            );

            setBlocks([]);
        }
    };


    /*
     * ============================================================
     * BLOCK CHANGE
     * ============================================================
     */

    const handleBlockChange = async (
        event
    ) => {
        const blockId =
            event.target.value;

        setFilters(
            (previous) => ({
                ...previous,
                blockId,
                centerId: "",
            })
        );

        setCenters([]);

        if (!blockId) {
            return;
        }

        try {
            const response =
                await getCentersByBlock(
                    blockId
                );

            setCenters(
                response.data?.centers ||
                []
            );
        } catch (err) {
            console.error(
                "Failed to fetch centers:",
                err
            );

            setCenters([]);
        }
    };


    /*
     * ============================================================
     * FILTER CHANGE
     * ============================================================
     */

    const handleFilterChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setFilters(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    };


    /*
     * ============================================================
     * FETCH DASHBOARD
     * ============================================================
     */

    const fetchDashboard = async (
        page = 1,
        customFilters = filters
    ) => {
        try {
            setFilterLoading(true);
            setError("");

            const params = {
                page,
                limit: 20,
            };

            Object.entries(
                customFilters
            ).forEach(
                ([key, value]) => {
                    if (
                        value !== "" &&
                        value !== null &&
                        value !== undefined
                    ) {
                        params[key] =
                            value;
                    }
                }
            );

            const response =
                await getBillDashboard(
                    params
                );

            setBills(
                response.data?.bills ||
                []
            );

            setPagination(
                response.data?.pagination ||
                {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 1,
                }
            );

            setSummary(
                response.data?.summary ||
                {
                    total: 0,
                    draft: 0,
                    verificationPending: 0,
                    verified: 0,
                    approvalPending: 0,
                    approved: 0,
                    paymentPending: 0,
                    paid: 0,
                    rejected: 0,
                    totalAmount: 0,
                }
            );

            setSelectedBills([]);

        } catch (err) {
            console.error(
                "Failed to fetch bill dashboard:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to fetch bill dashboard"
            );
        } finally {
            setFilterLoading(false);
            setLoading(false);
        }
    };


    /*
     * ============================================================
     * INITIAL LOAD
     * ============================================================
     */

    useEffect(() => {
        fetchUsers();
        fetchDistricts();
        fetchDashboard(1);
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

        await fetchDashboard(
            1,
            filters
        );
    };


    /*
     * ============================================================
     * RESET
     * ============================================================
     */

    const handleReset = async () => {
        const resetFilters = {
            status: "",
            submittedByRole: "",
            submittedBy: "",
            action: "",
            districtId: "",
            blockId: "",
            centerId: "",
            fromDate: "",
            toDate: "",
            billNumber: "",
        };

        setFilters(
            resetFilters
        );

        setBlocks([]);
        setCenters([]);

        await fetchDashboard(
            1,
            resetFilters
        );
    };


    /*
     * ============================================================
     * SELECT BILL
     * ============================================================
     */

    const toggleBillSelection = (
        billId
    ) => {
        setSelectedBills(
            (previous) =>
                previous.includes(
                    billId
                )
                    ? previous.filter(
                          (id) =>
                              id !== billId
                      )
                    : [
                          ...previous,
                          billId,
                      ]
        );
    };


    /*
     * ============================================================
     * SELECT ALL
     * ============================================================
     */

    const allBillsSelected =
        bills.length > 0 &&
        bills.every(
            (bill) =>
                selectedBills.includes(
                    bill._id
                )
        );


    const toggleSelectAll = () => {
        if (
            allBillsSelected
        ) {
            setSelectedBills(
                []
            );

            return;
        }

        setSelectedBills(
            bills.map(
                (bill) =>
                    bill._id
            )
        );
    };


    /*
     * ============================================================
     * BULK ACTION OPEN
     * ============================================================
     */

    const openBulkAction = (
        action
    ) => {
        if (
            selectedBills.length ===
            0
        ) {
            alert(
                "Please select at least one bill"
            );

            return;
        }

        setBulkAction(
            action
        );

        setBulkRemarks("");

        setBulkPaymentData({
            paymentReference: "",
            paymentMode: "",
        });

        setShowBulkRemarks(
            true
        );
    };


    /*
     * ============================================================
     * BULK ACTION SUBMIT
     * ============================================================
     */

    const handleBulkAction = async () => {
        if (
            selectedBills.length ===
            0
        ) {
            return;
        }

        if (
            bulkAction ===
                "reject" &&
            !bulkRemarks.trim()
        ) {
            alert(
                "Rejection remarks are required"
            );

            return;
        }

        if (
            bulkAction ===
                "paid" &&
            !bulkPaymentData.paymentMode
        ) {
            alert(
                "Payment mode is required"
            );

            return;
        }

        try {
            setFilterLoading(
                true
            );

            let response;

            if (
                bulkAction ===
                "verify"
            ) {
                response =
                    await bulkVerifyBills(
                        selectedBills,
                        bulkRemarks
                    );
            }

            if (
                bulkAction ===
                "approve"
            ) {
                response =
                    await bulkApproveBills(
                        selectedBills,
                        bulkRemarks
                    );
            }

            if (
                bulkAction ===
                "reject"
            ) {
                response =
                    await bulkRejectBills(
                        selectedBills,
                        bulkRemarks
                    );
            }

            if (
                bulkAction ===
                "payment-pending"
            ) {
                response =
                    await bulkMarkPaymentPending(
                        selectedBills,
                        bulkRemarks
                    );
            }

            if (
                bulkAction ===
                "paid"
            ) {
                response =
                    await bulkMarkBillsPaid(
                        selectedBills,
                        {
                            paymentReference:
                                bulkPaymentData.paymentReference.trim(),

                            paymentMode:
                                bulkPaymentData.paymentMode,

                            remarks:
                                bulkRemarks.trim(),
                        }
                    );
            }

            const successful =
                response?.data
                    ?.successfulCount ||
                0;

            const failed =
                response?.data
                    ?.failedCount ||
                0;

            const failedItems =
                response?.data
                    ?.failed ||
                [];

            let message =
                `Bulk action completed.\n\nSuccessful: ${successful}\nFailed: ${failed}`;

            if (
                failedItems.length >
                0
            ) {
                message +=
                    "\n\nFailed bills:\n";

                failedItems
                    .slice(0, 10)
                    .forEach(
                        (item) => {
                            message +=
                                `\n${item.billNumber || item.billId}: ${
                                    item.reason ||
                                    "Failed"
                                }`;
                        }
                    );

                if (
                    failedItems.length >
                    10
                ) {
                    message +=
                        `\n\n...and ${
                            failedItems.length -
                            10
                        } more`;
                }
            }

            alert(message);

            setShowBulkRemarks(
                false
            );

            setBulkAction("");

            setBulkRemarks("");

            setBulkPaymentData({
                paymentReference: "",
                paymentMode: "",
            });

            await fetchDashboard(
                1,
                filters
            );

        } catch (err) {
            console.error(
                "Bulk action failed:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Bulk action failed"
            );
        } finally {
            setFilterLoading(
                false
            );
        }
    };


    /*
     * ============================================================
     * INDIVIDUAL ACTION OPEN
     * ============================================================
     */

    const openIndividualAction = (
        billId,
        type
    ) => {
        setIndividualAction({
            billId,
            type,
        });

        setIndividualRemarks("");

        setPaymentData({
            paymentReference: "",
            paymentMode: "",
            remarks: "",
        });
    };


    /*
     * ============================================================
     * CLOSE INDIVIDUAL ACTION
     * ============================================================
     */

    const closeIndividualAction =
        () => {
            setIndividualAction({
                billId: null,
                type: null,
            });

            setIndividualRemarks("");

            setPaymentData({
                paymentReference: "",
                paymentMode: "",
                remarks: "",
            });
        };


    /*
     * ============================================================
     * INDIVIDUAL VERIFY
     * ============================================================
     */

    const handleVerify = async (
        bill
    ) => {
        try {
            setProcessingId(
                bill._id
            );

            await verifyBill(
                bill._id,
                {
                    remarks:
                        individualRemarks.trim(),
                }
            );

            alert(
                "Bill verified successfully"
            );

            closeIndividualAction();

            await fetchDashboard(
                1,
                filters
            );

        } catch (err) {
            console.error(
                "Failed to verify bill:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to verify bill"
            );
        } finally {
            setProcessingId(
                null
            );
        }
    };


    /*
     * ============================================================
     * INDIVIDUAL APPROVE
     * ============================================================
     */

    const handleApprove = async (
        bill
    ) => {
        try {
            setProcessingId(
                bill._id
            );

            await approveBill(
                bill._id,
                {
                    remarks:
                        individualRemarks.trim(),
                }
            );

            alert(
                "Bill approved successfully"
            );

            closeIndividualAction();

            await fetchDashboard(
                1,
                filters
            );

        } catch (err) {
            console.error(
                "Failed to approve bill:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to approve bill"
            );
        } finally {
            setProcessingId(
                null
            );
        }
    };


    /*
     * ============================================================
     * INDIVIDUAL REJECT
     * ============================================================
     */

    const handleReject = async (
        bill
    ) => {
        if (
            !individualRemarks.trim()
        ) {
            alert(
                "Rejection remarks are required"
            );

            return;
        }

        try {
            setProcessingId(
                bill._id
            );

            await rejectBill(
                bill._id,
                {
                    remarks:
                        individualRemarks.trim(),
                }
            );

            alert(
                "Bill rejected successfully"
            );

            closeIndividualAction();

            await fetchDashboard(
                1,
                filters
            );

        } catch (err) {
            console.error(
                "Failed to reject bill:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to reject bill"
            );
        } finally {
            setProcessingId(
                null
            );
        }
    };


    /*
     * ============================================================
     * INDIVIDUAL PAYMENT PENDING
     * ============================================================
     */

    const handlePaymentPending =
        async (bill) => {
            try {
                setProcessingId(
                    bill._id
                );

                await markPaymentPending(
                    bill._id,
                    {
                        remarks:
                            paymentData.remarks.trim(),
                    }
                );

                alert(
                    "Bill moved to payment pending"
                );

                closeIndividualAction();

                await fetchDashboard(
                    1,
                    filters
                );

            } catch (err) {
                console.error(
                    "Failed to move bill to payment pending:",
                    err
                );

                alert(
                    err.response?.data?.message ||
                    "Failed to update payment status"
                );
            } finally {
                setProcessingId(
                    null
                );
            }
        };


    /*
     * ============================================================
     * INDIVIDUAL MARK PAID
     * ============================================================
     */

    const handleMarkPaid =
        async (bill) => {
            if (
                !paymentData.paymentMode
            ) {
                alert(
                    "Payment mode is required"
                );

                return;
            }

            try {
                setProcessingId(
                    bill._id
                );

                await markBillPaid(
                    bill._id,
                    {
                        paymentReference:
                            paymentData.paymentReference.trim(),

                        paymentMode:
                            paymentData.paymentMode,

                        remarks:
                            paymentData.remarks.trim(),
                    }
                );

                alert(
                    "Bill marked as paid successfully"
                );

                closeIndividualAction();

                await fetchDashboard(
                    1,
                    filters
                );

            } catch (err) {
                console.error(
                    "Failed to mark bill as paid:",
                    err
                );

                alert(
                    err.response?.data?.message ||
                    "Failed to mark bill as paid"
                );
            } finally {
                setProcessingId(
                    null
                );
            }
        };


    /*
     * ============================================================
     * EXPORT CSV
     * ============================================================
     */

    const handleExport = async () => {
        try {
            setFilterLoading(true);

            const params = {};

            Object.entries(
                filters
            ).forEach(
                ([key, value]) => {
                    if (
                        value !== "" &&
                        value !== null &&
                        value !== undefined
                    ) {
                        params[key] =
                            value;
                    }
                }
            );

            const response =
                await exportBillDashboard(
                    params
                );

            const blob =
                new Blob(
                    [
                        response.data,
                    ],
                    {
                        type:
                            "text/csv;charset=utf-8;",
                    }
                );

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href =
                url;

            link.setAttribute(
                "download",
                `bill-dashboard-${Date.now()}.csv`
            );

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );

        } catch (err) {
            console.error(
                "CSV export failed:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to export CSV"
            );
        } finally {
            setFilterLoading(false);
        }
    };


    /*
     * ============================================================
     * AVAILABLE BULK ACTIONS
     * ============================================================
     */

    const selectedBillObjects =
        useMemo(
            () =>
                bills.filter(
                    (bill) =>
                        selectedBills.includes(
                            bill._id
                        )
                ),
            [
                bills,
                selectedBills,
            ]
        );


    const canBulkVerify =
        selectedBillObjects.length >
            0 &&
        selectedBillObjects.every(
            (bill) =>
                bill.status ===
                "verification-pending"
        );


    const canBulkApprove =
        selectedBillObjects.length >
            0 &&
        selectedBillObjects.every(
            (bill) =>
                bill.status ===
                "approval-pending"
        );


    const canBulkReject =
        selectedBillObjects.length >
            0 &&
        selectedBillObjects.every(
            (bill) =>
                bill.status ===
                    "verification-pending" ||
                bill.status ===
                    "approval-pending"
        );


    const canBulkPaymentPending =
        selectedBillObjects.length >
            0 &&
        selectedBillObjects.every(
            (bill) =>
                bill.status ===
                "approved"
        );


    const canBulkPaid =
        selectedBillObjects.length >
            0 &&
        selectedBillObjects.every(
            (bill) =>
                bill.status ===
                "payment-pending"
        );


    /*
     * ============================================================
     * ACCESS
     * ============================================================
     */

    const hasFinanceRole =
        isAdmin ||
        roleCodes.includes(
            "cc"
        ) ||
        roleCodes.includes(
            "aci"
        ) ||
        roleCodes.includes(
            "cm"
        );


    if (
        !hasFinanceRole
    ) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">

                    <h1 className="text-xl font-semibold text-red-800">
                        Access Denied
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        You are not authorized to access
                        the Bill Dashboard.
                    </p>

                </div>

            </div>
        );
    }


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Bill Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage, filter and process bills
                        from one place.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleExport}
                    disabled={filterLoading}
                    className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {filterLoading
                        ? "Processing..."
                        : "Export CSV"}
                </button>

            </div>


            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-500">
                        Total
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {summary.total}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-500">
                        Verification Pending
                    </p>

                    <p className="mt-1 text-2xl font-bold text-yellow-600">
                        {summary.verificationPending}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-500">
                        Verified
                    </p>

                    <p className="mt-1 text-2xl font-bold text-blue-600">
                        {summary.verified}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-500">
                        Approval Pending
                    </p>

                    <p className="mt-1 text-2xl font-bold text-purple-600">
                        {summary.approvalPending}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-500">
                        Approved
                    </p>

                    <p className="mt-1 text-2xl font-bold text-green-600">
                        {summary.approved}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-500">
                        Payment Pending
                    </p>

                    <p className="mt-1 text-2xl font-bold text-orange-600">
                        {summary.paymentPending}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-500">
                        Paid
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-600">
                        {summary.paid}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-500">
                        Rejected
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-600">
                        {summary.rejected}
                    </p>
                </div>

            </div>


            {/* =====================================================
                FILTERS
            ===================================================== */}

            <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">

                <form
                    onSubmit={handleSearch}
                >

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {/* STATUS */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                name="status"
                                value={
                                    filters.status
                                }
                                onChange={
                                    handleFilterChange
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            >
                                <option value="">
                                    All Statuses
                                </option>

                                <option value="verification-pending">
                                    Verification Pending
                                </option>

                                <option value="verified">
                                    Verified
                                </option>

                                <option value="approval-pending">
                                    Approval Pending
                                </option>

                                <option value="approved">
                                    Approved
                                </option>

                                <option value="payment-pending">
                                    Payment Pending
                                </option>

                                <option value="paid">
                                    Paid
                                </option>

                                <option value="rejected">
                                    Rejected
                                </option>
                            </select>
                        </div>


                        {/* SUBMITTED BY ROLE */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Submitted By Role
                            </label>

                            <select
                                name="submittedByRole"
                                value={
                                    filters.submittedByRole
                                }
                                onChange={
                                    handleFilterChange
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            >
                                <option value="">
                                    All Roles
                                </option>

                                <option value="cc">
                                    CC
                                </option>

                                <option value="aci">
                                    ACI
                                </option>

                                <option value="cm">
                                    CM
                                </option>
                            </select>
                        </div>


                        {/* SUBMITTED BY USER */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Submitted By
                            </label>

                            <select
                                name="submittedBy"
                                value={
                                    filters.submittedBy
                                }
                                onChange={
                                    handleFilterChange
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            >
                                <option value="">
                                    All Users
                                </option>

                                {users.map(
                                    (user) => (
                                        <option
                                            key={
                                                user._id
                                            }
                                            value={
                                                user._id
                                            }
                                        >
                                            {getUserName(
                                                user
                                            )}
                                            {" - "}
                                            {getUserEmail(
                                                user
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>


                        {/* ACTION */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Workflow Action
                            </label>

                            <select
                                name="action"
                                value={
                                    filters.action
                                }
                                onChange={
                                    handleFilterChange
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            >
                                <option value="">
                                    All Actions
                                </option>

                                <option value="verify">
                                    Verification
                                </option>

                                <option value="approve">
                                    Approval
                                </option>
                            </select>
                        </div>


                        {/* DISTRICT */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                District
                            </label>

                            <select
                                name="districtId"
                                value={
                                    filters.districtId
                                }
                                onChange={
                                    handleDistrictChange
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            >
                                <option value="">
                                    All Districts
                                </option>

                                {districts.map(
                                    (district) => (
                                        <option
                                            key={
                                                district._id
                                            }
                                            value={
                                                district._id
                                            }
                                        >
                                            {getRegionName(
                                                district,
                                                "district"
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>


                        {/* BLOCK */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Block
                            </label>

                            <select
                                name="blockId"
                                value={
                                    filters.blockId
                                }
                                onChange={
                                    handleBlockChange
                                }
                                disabled={
                                    !filters.districtId
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                            >
                                <option value="">
                                    All Blocks
                                </option>

                                {blocks.map(
                                    (block) => (
                                        <option
                                            key={
                                                block._id
                                            }
                                            value={
                                                block._id
                                            }
                                        >
                                            {getRegionName(
                                                block,
                                                "block"
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>


                        {/* CENTER */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Center
                            </label>

                            <select
                                name="centerId"
                                value={
                                    filters.centerId
                                }
                                onChange={
                                    handleFilterChange
                                }
                                disabled={
                                    !filters.blockId
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                            >
                                <option value="">
                                    All Centers
                                </option>

                                {centers.map(
                                    (center) => (
                                        <option
                                            key={
                                                center._id
                                            }
                                            value={
                                                center._id
                                            }
                                        >
                                            {getRegionName(
                                                center,
                                                "center"
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>


                        {/* FROM DATE */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                From Date
                            </label>

                            <input
                                type="date"
                                name="fromDate"
                                value={
                                    filters.fromDate
                                }
                                onChange={
                                    handleFilterChange
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />
                        </div>


                        {/* TO DATE */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                To Date
                            </label>

                            <input
                                type="date"
                                name="toDate"
                                value={
                                    filters.toDate
                                }
                                onChange={
                                    handleFilterChange
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />
                        </div>


                        {/* BILL NUMBER */}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Bill Number
                            </label>

                            <input
                                type="text"
                                name="billNumber"
                                value={
                                    filters.billNumber
                                }
                                onChange={
                                    handleFilterChange
                                }
                                placeholder="Search bill number"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />
                        </div>

                    </div>


                    {/* FILTER BUTTONS */}

                    <div className="mt-5 flex flex-wrap gap-3">

                        <button
                            type="submit"
                            disabled={
                                filterLoading
                            }
                            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleReset
                            }
                            disabled={
                                filterLoading
                            }
                            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
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
                BULK ACTION BAR
            ===================================================== */}

            {selectedBills.length >
                0 && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>

                            <p className="font-semibold text-gray-900">
                                {selectedBills.length}{" "}
                                bill
                                {selectedBills.length !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                selected
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                                Bulk actions are available
                                according to the selected
                                bill status.
                            </p>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            {canBulkVerify && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        openBulkAction(
                                            "verify"
                                        )
                                    }
                                    disabled={
                                        filterLoading
                                    }
                                    className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                    Bulk Verify
                                </button>
                            )}


                            {canBulkApprove && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        openBulkAction(
                                            "approve"
                                        )
                                    }
                                    disabled={
                                        filterLoading
                                    }
                                    className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                    Bulk Approve
                                </button>
                            )}


                            {canBulkReject && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        openBulkAction(
                                            "reject"
                                        )
                                    }
                                    disabled={
                                        filterLoading
                                    }
                                    className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    Bulk Reject
                                </button>
                            )}


                            {canBulkPaymentPending && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        openBulkAction(
                                            "payment-pending"
                                        )
                                    }
                                    disabled={
                                        filterLoading
                                    }
                                    className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                                >
                                    Bulk Payment Pending
                                </button>
                            )}


                            {canBulkPaid && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        openBulkAction(
                                            "paid"
                                        )
                                    }
                                    disabled={
                                        filterLoading
                                    }
                                    className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    Bulk Paid
                                </button>
                            )}


                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedBills(
                                        []
                                    )
                                }
                                disabled={
                                    filterLoading
                                }
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Clear Selection
                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* =====================================================
                BULK ACTION MODAL
            ===================================================== */}

            {showBulkRemarks && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

                        <div className="mb-5 flex items-center justify-between">

                            <div>

                                <h2 className="text-lg font-semibold text-gray-900">
                                    {bulkAction ===
                                        "verify" &&
                                        "Bulk Verification"}

                                    {bulkAction ===
                                        "approve" &&
                                        "Bulk Approval"}

                                    {bulkAction ===
                                        "reject" &&
                                        "Bulk Rejection"}

                                    {bulkAction ===
                                        "payment-pending" &&
                                        "Bulk Payment Pending"}

                                    {bulkAction ===
                                        "paid" &&
                                        "Bulk Mark Paid"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedBills.length} bills selected
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowBulkRemarks(
                                        false
                                    )
                                }
                                className="text-xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>


                        {bulkAction ===
                            "paid" && (
                            <div className="mb-4">

                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Payment Mode
                                    <span className="text-red-500">
                                        {" "}
                                        *
                                    </span>
                                </label>

                                <select
                                    value={
                                        bulkPaymentData.paymentMode
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setBulkPaymentData(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                paymentMode:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                >
                                    <option value="">
                                        Select Payment Mode
                                    </option>

                                    <option value="bank-transfer">
                                        Bank Transfer
                                    </option>

                                    <option value="upi">
                                        UPI
                                    </option>

                                    <option value="cash">
                                        Cash
                                    </option>

                                    <option value="cheque">
                                        Cheque
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>

                                </select>

                            </div>
                        )}


                        {bulkAction ===
                            "paid" && (
                            <div className="mb-4">

                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Payment Reference
                                </label>

                                <input
                                    type="text"
                                    value={
                                        bulkPaymentData.paymentReference
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setBulkPaymentData(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                paymentReference:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    placeholder="Enter payment reference"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                />

                            </div>
                        )}


                        <div className="mb-5">

                            <label className="mb-1 block text-sm font-medium text-gray-700">

                                Remarks

                                {bulkAction ===
                                    "reject" && (
                                    <span className="text-red-500">
                                        {" "}
                                        *
                                    </span>
                                )}

                            </label>

                            <textarea
                                rows={4}
                                value={
                                    bulkRemarks
                                }
                                onChange={(
                                    event
                                ) =>
                                    setBulkRemarks(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder={
                                    bulkAction ===
                                    "reject"
                                        ? "Enter rejection remarks"
                                        : "Enter remarks (optional)"
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />

                        </div>


                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowBulkRemarks(
                                        false
                                    )
                                }
                                disabled={
                                    filterLoading
                                }
                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleBulkAction
                                }
                                disabled={
                                    filterLoading
                                }
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {filterLoading
                                    ? "Processing..."
                                    : "Confirm"}
                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* =====================================================
                INDIVIDUAL ACTION MODAL
            ===================================================== */}

            {individualAction.type && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

                        <div className="mb-5 flex items-center justify-between">

                            <h2 className="text-lg font-semibold text-gray-900">
                                {individualAction.type ===
                                    "verify" &&
                                    "Verify Bill"}

                                {individualAction.type ===
                                    "approve" &&
                                    "Approve Bill"}

                                {individualAction.type ===
                                    "reject" &&
                                    "Reject Bill"}

                                {individualAction.type ===
                                    "payment-pending" &&
                                    "Payment Pending"}

                                {individualAction.type ===
                                    "paid" &&
                                    "Mark Bill Paid"}
                            </h2>

                            <button
                                type="button"
                                onClick={
                                    closeIndividualAction
                                }
                                className="text-xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>


                        {individualAction.type ===
                            "paid" && (
                            <>
                                <div className="mb-4">

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Payment Mode
                                    </label>

                                    <select
                                        value={
                                            paymentData.paymentMode
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPaymentData(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,
                                                    paymentMode:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                    >
                                        <option value="">
                                            Select Payment Mode
                                        </option>

                                        <option value="bank-transfer">
                                            Bank Transfer
                                        </option>

                                        <option value="upi">
                                            UPI
                                        </option>

                                        <option value="cash">
                                            Cash
                                        </option>

                                        <option value="cheque">
                                            Cheque
                                        </option>

                                        <option value="other">
                                            Other
                                        </option>

                                    </select>

                                </div>

                                <div className="mb-4">

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Payment Reference
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            paymentData.paymentReference
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPaymentData(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,
                                                    paymentReference:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                    />

                                </div>
                            </>
                        )}


                        <div className="mb-5">

                            <label className="mb-1 block text-sm font-medium text-gray-700">

                                Remarks

                                {individualAction.type ===
                                    "reject" && (
                                    <span className="text-red-500">
                                        {" "}
                                        *
                                    </span>
                                )}

                            </label>

                            <textarea
                                rows={4}
                                value={
                                    individualAction.type ===
                                    "payment-pending" ||
                                    individualAction.type ===
                                    "paid"
                                        ? paymentData.remarks
                                        : individualRemarks
                                }
                                onChange={(
                                    event
                                ) => {
                                    if (
                                        individualAction.type ===
                                            "payment-pending" ||
                                        individualAction.type ===
                                            "paid"
                                    ) {
                                        setPaymentData(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                remarks:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        );

                                        return;
                                    }

                                    setIndividualRemarks(
                                        event
                                            .target
                                            .value
                                    );
                                }}
                                placeholder={
                                    individualAction.type ===
                                    "reject"
                                        ? "Enter rejection remarks"
                                        : "Enter remarks (optional)"
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />

                        </div>


                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={
                                    closeIndividualAction
                                }
                                disabled={
                                    processingId !==
                                    null
                                }
                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>


                            {individualAction.type ===
                                "verify" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleVerify(
                                            bills.find(
                                                (
                                                    item
                                                ) =>
                                                    item._id ===
                                                    individualAction.billId
                                            )
                                        )
                                    }
                                    disabled={
                                        processingId !==
                                        null
                                    }
                                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                    {processingId
                                        ? "Processing..."
                                        : "Verify"}
                                </button>
                            )}


                            {individualAction.type ===
                                "approve" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleApprove(
                                            bills.find(
                                                (
                                                    item
                                                ) =>
                                                    item._id ===
                                                    individualAction.billId
                                            )
                                        )
                                    }
                                    disabled={
                                        processingId !==
                                        null
                                    }
                                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                    {processingId
                                        ? "Processing..."
                                        : "Approve"}
                                </button>
                            )}


                            {individualAction.type ===
                                "reject" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleReject(
                                            bills.find(
                                                (
                                                    item
                                                ) =>
                                                    item._id ===
                                                    individualAction.billId
                                            )
                                        )
                                    }
                                    disabled={
                                        processingId !==
                                        null
                                    }
                                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {processingId
                                        ? "Processing..."
                                        : "Reject"}
                                </button>
                            )}


                            {individualAction.type ===
                                "payment-pending" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handlePaymentPending(
                                            bills.find(
                                                (
                                                    item
                                                ) =>
                                                    item._id ===
                                                    individualAction.billId
                                            )
                                        )
                                    }
                                    disabled={
                                        processingId !==
                                        null
                                    }
                                    className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                                >
                                    {processingId
                                        ? "Processing..."
                                        : "Payment Pending"}
                                </button>
                            )}


                            {individualAction.type ===
                                "paid" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleMarkPaid(
                                            bills.find(
                                                (
                                                    item
                                                ) =>
                                                    item._id ===
                                                    individualAction.billId
                                            )
                                        )
                                    }
                                    disabled={
                                        processingId !==
                                        null
                                    }
                                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {processingId
                                        ? "Processing..."
                                        : "Mark Paid"}
                                </button>
                            )}

                        </div>

                    </div>

                </div>
            )}


            {/* =====================================================
                BILL LIST
            ===================================================== */}

            <div className="rounded-xl border bg-white shadow-sm">

                <div className="border-b border-gray-200 px-5 py-4">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Bills
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {pagination.total} total bill
                                {pagination.total !==
                                1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>

                        {bills.length >
                            0 && (
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">

                                <input
                                    type="checkbox"
                                    checked={
                                        allBillsSelected
                                    }
                                    onChange={
                                        toggleSelectAll
                                    }
                                    className="h-4 w-4"
                                />

                                Select All

                            </label>
                        )}

                    </div>

                </div>


                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        Loading bills...
                    </div>
                ) : bills.length ===
                  0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        No bills found.
                    </div>
                ) : (
                    <>
                        {/* =================================================
                            DESKTOP TABLE
                        ================================================= */}

                        <div className="hidden overflow-x-auto lg:block">

                            <table className="min-w-full divide-y divide-gray-200">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Select
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Bill
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Submitted By
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Bill Date
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Amount
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-gray-200">

                                    {bills.map(
                                        (bill) => {

                                            const submittedUser =
                                                bill.submittedBy;

                                            const district =
                                                bill.district ||
                                                bill.districtId;

                                            return (
                                                <tr
                                                    key={
                                                        bill._id
                                                    }
                                                    className="hover:bg-gray-50"
                                                >

                                                    <td className="px-5 py-4">

                                                        <input
                                                            type="checkbox"
                                                            checked={selectedBills.includes(
                                                                bill._id
                                                            )}
                                                            onChange={() =>
                                                                toggleBillSelection(
                                                                    bill._id
                                                                )
                                                            }
                                                            className="h-4 w-4"
                                                        />

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <div className="font-medium text-gray-900">
                                                            {
                                                                bill.billNumber
                                                            }
                                                        </div>

                                                        <div className="mt-1 text-sm text-gray-500">
                                                            {
                                                                bill.title
                                                            }
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-400">
                                                            ID:{" "}
                                                            {
                                                                bill._id
                                                            }
                                                        </div>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <div className="font-medium text-gray-900">
                                                            {getUserName(
                                                                submittedUser
                                                            )}
                                                        </div>

                                                        <div className="text-xs text-gray-500">
                                                            {getUserEmail(
                                                                submittedUser
                                                            )}
                                                        </div>

                                                        <div className="text-xs text-gray-500">
                                                            {getUserContact(
                                                                submittedUser
                                                            )}
                                                        </div>

                                                        <div className="mt-1 text-xs font-medium uppercase text-gray-400">
                                                            {getRoleName(
                                                                bill.submittedByRole
                                                            )}
                                                        </div>

                                                    </td>


                                                    <td className="px-5 py-4 text-sm text-gray-600">

                                                        <div>
                                                            {formatDate(
                                                                bill.billDate
                                                            )}
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-400">
                                                            Uploaded:{" "}
                                                            {formatDate(
                                                                bill.createdAt
                                                            )}
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-400">
                                                            District:{" "}
                                                            {getRegionName(
                                                                district,
                                                                "district"
                                                            )}
                                                        </div>

                                                    </td>


                                                    <td className="px-5 py-4 text-sm text-gray-700">

                                                        <span className="font-semibold">
                                                            {formatCurrency(
                                                                bill.totalAmount,
                                                                bill.currency
                                                            )}
                                                        </span>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                                                                bill.status
                                                            )}`}
                                                        >
                                                            {statusLabel(
                                                                bill.status
                                                            )}
                                                        </span>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <div className="flex flex-wrap gap-2">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/finance/bills/${bill._id}`
                                                                    )
                                                                }
                                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                            >
                                                                View
                                                            </button>


                                                            {bill.status ===
                                                                "verification-pending" && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openIndividualAction(
                                                                                bill._id,
                                                                                "verify"
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                                                    >
                                                                        Verify
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openIndividualAction(
                                                                                bill._id,
                                                                                "reject"
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}


                                                            {bill.status ===
                                                                "approval-pending" && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openIndividualAction(
                                                                                bill._id,
                                                                                "approve"
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                                                    >
                                                                        Approve
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openIndividualAction(
                                                                                bill._id,
                                                                                "reject"
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}


                                                            {bill.status ===
                                                                "approved" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openIndividualAction(
                                                                            bill._id,
                                                                            "payment-pending"
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                                                                >
                                                                    Payment Pending
                                                                </button>
                                                            )}


                                                            {bill.status ===
                                                                "payment-pending" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openIndividualAction(
                                                                            bill._id,
                                                                            "paid"
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* =================================================
                            MOBILE CARDS
                        ================================================= */}

                        <div className="space-y-4 p-4 lg:hidden">

                            {bills.map(
                                (bill) => {

                                    const submittedUser =
                                        bill.submittedBy;

                                    return (
                                        <div
                                            key={
                                                bill._id
                                            }
                                            className="rounded-xl border border-gray-200 p-4"
                                        >

                                            <div className="flex items-start gap-3">

                                                <input
                                                    type="checkbox"
                                                    checked={selectedBills.includes(
                                                        bill._id
                                                    )}
                                                    onChange={() =>
                                                        toggleBillSelection(
                                                            bill._id
                                                        )
                                                    }
                                                    className="mt-1 h-4 w-4"
                                                />

                                                <div className="min-w-0 flex-1">

                                                    <div className="flex flex-wrap items-center justify-between gap-2">

                                                        <div>

                                                            <p className="font-semibold text-gray-900">
                                                                {
                                                                    bill.billNumber
                                                                }
                                                            </p>

                                                            <p className="text-sm text-gray-500">
                                                                {
                                                                    bill.title
                                                                }
                                                            </p>

                                                        </div>

                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                                                                bill.status
                                                            )}`}
                                                        >
                                                            {statusLabel(
                                                                bill.status
                                                            )}
                                                        </span>

                                                    </div>


                                                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">

                                                        <div>
                                                            <p className="text-xs text-gray-400">
                                                                Submitted By
                                                            </p>

                                                            <p className="font-medium text-gray-700">
                                                                {getUserName(
                                                                    submittedUser
                                                                )}
                                                            </p>
                                                        </div>


                                                        <div>
                                                            <p className="text-xs text-gray-400">
                                                                Amount
                                                            </p>

                                                            <p className="font-semibold text-gray-800">
                                                                {formatCurrency(
                                                                    bill.totalAmount,
                                                                    bill.currency
                                                                )}
                                                            </p>
                                                        </div>


                                                        <div>
                                                            <p className="text-xs text-gray-400">
                                                                Bill Date
                                                            </p>

                                                            <p className="text-gray-700">
                                                                {formatDate(
                                                                    bill.billDate
                                                                )}
                                                            </p>
                                                        </div>


                                                        <div>
                                                            <p className="text-xs text-gray-400">
                                                                Uploaded
                                                            </p>

                                                            <p className="text-gray-700">
                                                                {formatDate(
                                                                    bill.createdAt
                                                                )}
                                                            </p>
                                                        </div>


                                                        <div className="col-span-2">
                                                            <p className="text-xs text-gray-400">
                                                                Email
                                                            </p>

                                                            <p className="break-all text-gray-700">
                                                                {getUserEmail(
                                                                    submittedUser
                                                                )}
                                                            </p>
                                                        </div>


                                                        <div className="col-span-2">
                                                            <p className="text-xs text-gray-400">
                                                                Contact
                                                            </p>

                                                            <p className="text-gray-700">
                                                                {getUserContact(
                                                                    submittedUser
                                                                )}
                                                            </p>
                                                        </div>


                                                        <div className="col-span-2">
                                                            <p className="text-xs text-gray-400">
                                                                Submitted By Role
                                                            </p>

                                                            <p className="font-medium uppercase text-gray-700">
                                                                {getRoleName(
                                                                    bill.submittedByRole
                                                                )}
                                                            </p>
                                                        </div>

                                                    </div>


                                                    <div className="mt-4 flex flex-wrap gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/finance/bills/${bill._id}`
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                                                        >
                                                            View
                                                        </button>


                                                        {bill.status ===
                                                            "verification-pending" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openIndividualAction(
                                                                            bill._id,
                                                                            "verify"
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                                                                >
                                                                    Verify
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openIndividualAction(
                                                                            bill._id,
                                                                            "reject"
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}


                                                        {bill.status ===
                                                            "approval-pending" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openIndividualAction(
                                                                            bill._id,
                                                                            "approve"
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                                                                >
                                                                    Approve
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openIndividualAction(
                                                                            bill._id,
                                                                            "reject"
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}


                                                        {bill.status ===
                                                            "approved" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openIndividualAction(
                                                                        bill._id,
                                                                        "payment-pending"
                                                                    )
                                                                }
                                                                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
                                                            >
                                                                Payment Pending
                                                            </button>
                                                        )}


                                                        {bill.status ===
                                                            "payment-pending" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openIndividualAction(
                                                                        bill._id,
                                                                        "paid"
                                                                    )
                                                                }
                                                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                                                            >
                                                                Mark Paid
                                                            </button>
                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>


                        {/* =================================================
                            PAGINATION
                        ================================================= */}

                        {pagination.totalPages >
                            1 && (
                            <div className="flex items-center justify-between border-t border-gray-300 px-5 py-4">

                                <p className="text-sm text-gray-500">
                                    Page{" "}
                                    {
                                        pagination.page
                                    }{" "}
                                    of{" "}
                                    {
                                        pagination.totalPages
                                    }
                                </p>


                                <div className="flex gap-2">

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page <=
                                                1 ||
                                            filterLoading
                                        }
                                        onClick={() =>
                                            fetchDashboard(
                                                pagination.page -
                                                    1,
                                                filters
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
                                            filterLoading
                                        }
                                        onClick={() =>
                                            fetchDashboard(
                                                pagination.page +
                                                    1,
                                                filters
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
};


export default BillDashboard;