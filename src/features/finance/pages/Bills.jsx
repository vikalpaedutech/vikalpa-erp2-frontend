// // // frontend/src/features/finance/pages/Bills.jsx

// // import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";

// // import {
// //     getBills,
// //     submitBill,
// // } from "../services/bill.service";

// // import BillForm from "../components/BillForm";

// // const STATUS_OPTIONS = [
// //     {
// //         value: "",
// //         label: "All Status",
// //     },
// //     {
// //         value: "draft",
// //         label: "Draft",
// //     },
// //     {
// //         value: "verification-pending",
// //         label: "Verification Pending",
// //     },
// //     {
// //         value: "verified",
// //         label: "Verified",
// //     },
// //     {
// //         value: "approval-pending",
// //         label: "Approval Pending",
// //     },
// //     {
// //         value: "approved",
// //         label: "Approved",
// //     },
// //     {
// //         value: "payment-pending",
// //         label: "Payment Pending",
// //     },
// //     {
// //         value: "paid",
// //         label: "Paid",
// //     },
// //     {
// //         value: "rejected",
// //         label: "Rejected",
// //     },
// // ];

// // const getStatusLabel = (status) => {
// //     const option = STATUS_OPTIONS.find(
// //         (item) => item.value === status
// //     );

// //     return option?.label || status || "-";
// // };

// // const getStatusClasses = (status) => {
// //     switch (status) {
// //         case "draft":
// //             return "bg-gray-100 text-gray-700";

// //         case "verification-pending":
// //             return "bg-yellow-100 text-yellow-700";

// //         case "verified":
// //             return "bg-blue-100 text-blue-700";

// //         case "approval-pending":
// //             return "bg-purple-100 text-purple-700";

// //         case "approved":
// //             return "bg-indigo-100 text-indigo-700";

// //         case "payment-pending":
// //             return "bg-orange-100 text-orange-700";

// //         case "paid":
// //             return "bg-green-100 text-green-700";

// //         case "rejected":
// //             return "bg-red-100 text-red-700";

// //         default:
// //             return "bg-gray-100 text-gray-700";
// //     }
// // };

// // const formatDate = (date) => {
// //     if (!date) {
// //         return "-";
// //     }

// //     return new Date(date).toLocaleDateString(
// //         "en-IN",
// //         {
// //             day: "2-digit",
// //             month: "short",
// //             year: "numeric",
// //         }
// //     );
// // };

// // const formatAmount = (
// //     amount,
// //     currency = "INR"
// // ) => {
// //     return new Intl.NumberFormat(
// //         "en-IN",
// //         {
// //             style: "currency",
// //             currency,
// //             maximumFractionDigits: 2,
// //         }
// //     ).format(Number(amount || 0));
// // };

// // const Bills = () => {
// //     const navigate = useNavigate();

// //     const [bills, setBills] = useState([]);

// //     const [pagination, setPagination] =
// //         useState({
// //             total: 0,
// //             page: 1,
// //             limit: 10,
// //             totalPages: 0,
// //         });

// //     const [filters, setFilters] =
// //         useState({
// //             status: "",
// //             billNumber: "",
// //         });

// //     const [loading, setLoading] =
// //         useState(false);

// //     const [submittingBillId, setSubmittingBillId] =
// //         useState(null);

// //     const [error, setError] =
// //         useState("");

// //     const [successMessage, setSuccessMessage] =
// //         useState("");

// //     const [showCreateForm, setShowCreateForm] =
// //         useState(false);

// //     /*
// //      |--------------------------------------------------------------------------
// //      | FETCH BILLS
// //      |--------------------------------------------------------------------------
// //      */

// //     const fetchBills = async (
// //         page = 1,
// //         currentFilters = filters
// //     ) => {
// //         try {
// //             setLoading(true);
// //             setError("");

// //             const params = {
// //                 page,
// //                 limit: pagination.limit,
// //             };

// //             if (currentFilters.status) {
// //                 params.status =
// //                     currentFilters.status;
// //             }

// //             if (
// //                 currentFilters.billNumber.trim()
// //             ) {
// //                 params.billNumber =
// //                     currentFilters.billNumber.trim();
// //             }

// //             const response =
// //                 await getBills(params);

// //             setBills(
// //                 response.data?.bills || []
// //             );

// //             setPagination(
// //                 response.data?.pagination || {
// //                     total: 0,
// //                     page,
// //                     limit: 10,
// //                     totalPages: 0,
// //                 }
// //             );
// //         } catch (err) {
// //             console.error(
// //                 "GET BILLS ERROR:",
// //                 err
// //             );

// //             setError(
// //                 err.response?.data?.message ||
// //                     "Failed to fetch bills"
// //             );

// //             setBills([]);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     /*
// //      |--------------------------------------------------------------------------
// //      | INITIAL LOAD
// //      |--------------------------------------------------------------------------
// //      */

// //     useEffect(() => {
// //         fetchBills(1);
// //     }, []);

// //     /*
// //      |--------------------------------------------------------------------------
// //      | FILTER CHANGE
// //      |--------------------------------------------------------------------------
// //      */

// //     const handleFilterChange = (
// //         event
// //     ) => {
// //         const {
// //             name,
// //             value,
// //         } = event.target;

// //         setFilters((previous) => ({
// //             ...previous,
// //             [name]: value,
// //         }));
// //     };

// //     /*
// //      |--------------------------------------------------------------------------
// //      | SEARCH
// //      |--------------------------------------------------------------------------
// //      */

// //     const handleSearch = (event) => {
// //         event.preventDefault();

// //         fetchBills(1, filters);
// //     };

// //     /*
// //      |--------------------------------------------------------------------------
// //      | RESET
// //      |--------------------------------------------------------------------------
// //      */

// //     const handleReset = () => {
// //         const resetFilters = {
// //             status: "",
// //             billNumber: "",
// //         };

// //         setFilters(resetFilters);

// //         fetchBills(
// //             1,
// //             resetFilters
// //         );
// //     };

// //     /*
// //      |--------------------------------------------------------------------------
// //      | CREATE BILL SUCCESS
// //      |--------------------------------------------------------------------------
// //      */

// //     const handleBillCreated = () => {
// //         setShowCreateForm(false);

// //         setSuccessMessage(
// //             "Bill draft created successfully"
// //         );

// //         fetchBills(
// //             1,
// //             filters
// //         );
// //     };

// //     /*
// //      |--------------------------------------------------------------------------
// //      | SUBMIT BILL
// //      |--------------------------------------------------------------------------
// //      */

// //     const handleSubmitBill = async (
// //         billId
// //     ) => {
// //         const shouldSubmit =
// //             window.confirm(
// //                 "Are you sure you want to submit this bill for verification?"
// //             );

// //         if (!shouldSubmit) {
// //             return;
// //         }

// //         try {
// //             setSubmittingBillId(
// //                 billId
// //             );

// //             setError("");
// //             setSuccessMessage("");

// //             const response =
// //                 await submitBill(
// //                     billId
// //                 );

// //             setSuccessMessage(
// //                 response.message ||
// //                     "Bill submitted successfully"
// //             );

// //             await fetchBills(
// //                 pagination.page,
// //                 filters
// //             );
// //         } catch (err) {
// //             console.error(
// //                 "SUBMIT BILL ERROR:",
// //                 err
// //             );

// //             setError(
// //                 err.response?.data
// //                     ?.message ||
// //                     "Failed to submit bill"
// //             );
// //         } finally {
// //             setSubmittingBillId(
// //                 null
// //             );
// //         }
// //     };

// //     /*
// //      |--------------------------------------------------------------------------
// //      | PAGE CHANGE
// //      |--------------------------------------------------------------------------
// //      */

// //     const handlePageChange = (
// //         page
// //     ) => {
// //         if (
// //             page < 1 ||
// //             page > pagination.totalPages ||
// //             page === pagination.page
// //         ) {
// //             return;
// //         }

// //         fetchBills(
// //             page,
// //             filters
// //         );
// //     };

// //     /*
// //      |--------------------------------------------------------------------------
// //      | RENDER
// //      |--------------------------------------------------------------------------
// //      */

// //     return (
// //         <div className="p-6">
// //             {/* =========================================================
// //                 HEADER
// //             ========================================================= */}

// //             <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
// //                 <div>
// //                     <h1 className="text-2xl font-bold text-gray-800">
// //                         Bills
// //                     </h1>

// //                     <p className="mt-1 text-sm text-gray-500">
// //                         Manage your bills and
// //                         finance workflow.
// //                     </p>
// //                 </div>

// //                 <button
// //                     type="button"
// //                     onClick={() =>
// //                         setShowCreateForm(
// //                             (previous) =>
// //                                 !previous
// //                         )
// //                     }
// //                     className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
// //                 >
// //                     {showCreateForm
// //                         ? "Close"
// //                         : "+ Create Bill"}
// //                 </button>
// //             </div>

// //             {/* =========================================================
// //                 MESSAGES
// //             ========================================================= */}

// //             {error && (
// //                 <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
// //                     <span>{error}</span>

// //                     <button
// //                         type="button"
// //                         onClick={() =>
// //                             setError("")
// //                         }
// //                         className="font-bold text-red-500 hover:text-red-700"
// //                     >
// //                         ×
// //                     </button>
// //                 </div>
// //             )}

// //             {successMessage && (
// //                 <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
// //                     <span>
// //                         {successMessage}
// //                     </span>

// //                     <button
// //                         type="button"
// //                         onClick={() =>
// //                             setSuccessMessage(
// //                                 ""
// //                             )
// //                         }
// //                         className="font-bold text-green-600 hover:text-green-800"
// //                     >
// //                         ×
// //                     </button>
// //                 </div>
// //             )}

// //             {/* =========================================================
// //                 CREATE BILL
// //             ========================================================= */}

// //             {showCreateForm && (
// //                 <div className="mb-8">
// //                     <BillForm
// //                         onSuccess={
// //                             handleBillCreated
// //                         }
// //                         onCancel={() =>
// //                             setShowCreateForm(
// //                                 false
// //                             )
// //                         }
// //                     />
// //                 </div>
// //             )}

// //             {/* =========================================================
// //                 FILTERS
// //             ========================================================= */}

// //             {!showCreateForm && (
// //                 <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
// //                     <h2 className="mb-4 text-lg font-semibold text-gray-800">
// //                         Search Bills
// //                     </h2>

// //                     <form
// //                         onSubmit={
// //                             handleSearch
// //                         }
// //                     >
// //                         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
// //                             {/* Bill Number */}

// //                             <div>
// //                                 <label className="mb-1 block text-sm font-medium text-gray-700">
// //                                     Bill Number
// //                                 </label>

// //                                 <input
// //                                     type="text"
// //                                     name="billNumber"
// //                                     value={
// //                                         filters.billNumber
// //                                     }
// //                                     onChange={
// //                                         handleFilterChange
// //                                     }
// //                                     placeholder="Search by bill number"
// //                                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
// //                                 />
// //                             </div>

// //                             {/* Status */}

// //                             <div>
// //                                 <label className="mb-1 block text-sm font-medium text-gray-700">
// //                                     Status
// //                                 </label>

// //                                 <select
// //                                     name="status"
// //                                     value={
// //                                         filters.status
// //                                     }
// //                                     onChange={
// //                                         handleFilterChange
// //                                     }
// //                                     className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
// //                                 >
// //                                     {STATUS_OPTIONS.map(
// //                                         (
// //                                             option
// //                                         ) => (
// //                                             <option
// //                                                 key={
// //                                                     option.value
// //                                                 }
// //                                                 value={
// //                                                     option.value
// //                                                 }
// //                                             >
// //                                                 {
// //                                                     option.label
// //                                                 }
// //                                             </option>
// //                                         )
// //                                     )}
// //                                 </select>
// //                             </div>

// //                             {/* Buttons */}

// //                             <div className="flex items-end gap-3">
// //                                 <button
// //                                     type="submit"
// //                                     disabled={
// //                                         loading
// //                                     }
// //                                     className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
// //                                 >
// //                                     {loading
// //                                         ? "Searching..."
// //                                         : "Search"}
// //                                 </button>

// //                                 <button
// //                                     type="button"
// //                                     onClick={
// //                                         handleReset
// //                                     }
// //                                     disabled={
// //                                         loading
// //                                     }
// //                                     className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
// //                                 >
// //                                     Reset
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     </form>
// //                 </div>
// //             )}

// //             {/* =========================================================
// //                 BILL LIST HEADER
// //             ========================================================= */}

// //             <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
// //                 <div>
// //                     <h2 className="text-lg font-semibold text-gray-800">
// //                         Bill List
// //                     </h2>

// //                     <p className="text-sm text-gray-500">
// //                         {pagination.total || 0}{" "}
// //                         bill
// //                         {pagination.total !==
// //                         1
// //                             ? "s"
// //                             : ""}{" "}
// //                         found
// //                     </p>
// //                 </div>
// //             </div>

// //             {/* =========================================================
// //                 LOADING
// //             ========================================================= */}

// //             {loading && (
// //                 <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
// //                     Loading bills...
// //                 </div>
// //             )}

// //             {/* =========================================================
// //                 EMPTY
// //             ========================================================= */}

// //             {!loading &&
// //                 bills.length === 0 && (
// //                     <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
// //                         <h3 className="text-lg font-semibold text-gray-700">
// //                             No bills found
// //                         </h3>

// //                         <p className="mt-1 text-sm text-gray-500">
// //                             Create a bill draft
// //                             to get started.
// //                         </p>
// //                     </div>
// //                 )}

// //             {/* =========================================================
// //                 DESKTOP TABLE
// //             ========================================================= */}

// //             {!loading &&
// //                 bills.length > 0 && (
// //                     <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm lg:block">
// //                         <div className="overflow-x-auto">
// //                             <table className="w-full min-w-[1000px] text-left">
// //                                 <thead className="border-b bg-gray-50">
// //                                     <tr>
// //                                         <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
// //                                             Bill
// //                                         </th>

// //                                         <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
// //                                             Date
// //                                         </th>

// //                                         <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
// //                                             Vendor
// //                                         </th>

// //                                         <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
// //                                             Amount
// //                                         </th>

// //                                         <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
// //                                             Status
// //                                         </th>

// //                                         <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
// //                                             Created By
// //                                         </th>

// //                                         <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
// //                                             Actions
// //                                         </th>
// //                                     </tr>
// //                                 </thead>

// //                                 <tbody className="divide-y">
// //                                     {bills.map(
// //                                         (
// //                                             bill
// //                                         ) => (
// //                                             <tr
// //                                                 key={
// //                                                     bill._id
// //                                                 }
// //                                                 className="hover:bg-gray-50"
// //                                             >
// //                                                 <td className="px-5 py-4">
// //                                                     <div>
// //                                                         <p className="font-semibold text-gray-800">
// //                                                             {
// //                                                                 bill.billNumber
// //                                                             }
// //                                                         </p>

// //                                                         <p className="mt-1 max-w-[250px] truncate text-sm text-gray-500">
// //                                                             {
// //                                                                 bill.title
// //                                                             }
// //                                                         </p>
// //                                                     </div>
// //                                                 </td>

// //                                                 <td className="px-5 py-4 text-sm text-gray-600">
// //                                                     {formatDate(
// //                                                         bill.billDate
// //                                                     )}
// //                                                 </td>

// //                                                 <td className="px-5 py-4 text-sm text-gray-600">
// //                                                     {bill
// //                                                         .vendor
// //                                                         ?.name ||
// //                                                         "-"}
// //                                                 </td>

// //                                                 <td className="px-5 py-4 text-sm font-semibold text-gray-800">
// //                                                     {formatAmount(
// //                                                         bill.totalAmount,
// //                                                         bill.currency
// //                                                     )}
// //                                                 </td>

// //                                                 <td className="px-5 py-4">
// //                                                     <span
// //                                                         className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
// //                                                             bill.status
// //                                                         )}`}
// //                                                     >
// //                                                         {getStatusLabel(
// //                                                             bill.status
// //                                                         )}
// //                                                     </span>
// //                                                 </td>

// //                                                 <td className="px-5 py-4 text-sm text-gray-600">
// //                                                     {bill
// //                                                         .submittedBy
// //                                                         ?.name ||
// //                                                         "-"}
// //                                                 </td>

// //                                                 <td className="px-5 py-4">
// //                                                     <div className="flex justify-end gap-2">
// //                                                         <button
// //                                                             type="button"
// //                                                             onClick={() =>
// //                                                                 navigate(
// //                                                                     `/finance/bills/${bill._id}`
// //                                                                 )
// //                                                             }
// //                                                             className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
// //                                                         >
// //                                                             View
// //                                                         </button>

// //                                                         {(bill.status ===
// //                                                             "draft" ||
// //                                                             bill.status ===
// //                                                                 "rejected") && (
// //                                                             <button
// //                                                                 type="button"
// //                                                                 onClick={() =>
// //                                                                     handleSubmitBill(
// //                                                                         bill._id
// //                                                                     )
// //                                                                 }
// //                                                                 disabled={
// //                                                                     submittingBillId ===
// //                                                                     bill._id
// //                                                                 }
// //                                                                 className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
// //                                                             >
// //                                                                 {submittingBillId ===
// //                                                                 bill._id
// //                                                                     ? "Submitting..."
// //                                                                     : bill.status ===
// //                                                                       "rejected"
// //                                                                     ? "Resubmit"
// //                                                                     : "Submit"}
// //                                                             </button>
// //                                                         )}
// //                                                     </div>
// //                                                 </td>
// //                                             </tr>
// //                                         )
// //                                     )}
// //                                 </tbody>
// //                             </table>
// //                         </div>
// //                     </div>
// //                 )}

// //             {/* =========================================================
// //                 MOBILE / TABLET CARDS
// //             ========================================================= */}

// //             {!loading &&
// //                 bills.length > 0 && (
// //                     <div className="grid grid-cols-1 gap-4 lg:hidden">
// //                         {bills.map(
// //                             (bill) => (
// //                                 <div
// //                                     key={
// //                                         bill._id
// //                                     }
// //                                     className="rounded-xl border bg-white p-5 shadow-sm"
// //                                 >
// //                                     <div className="flex items-start justify-between gap-3">
// //                                         <div>
// //                                             <p className="font-semibold text-gray-800">
// //                                                 {
// //                                                     bill.billNumber
// //                                                 }
// //                                             </p>

// //                                             <p className="mt-1 text-sm text-gray-500">
// //                                                 {
// //                                                     bill.title
// //                                                 }
// //                                             </p>
// //                                         </div>

// //                                         <span
// //                                             className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
// //                                                 bill.status
// //                                             )}`}
// //                                         >
// //                                             {getStatusLabel(
// //                                                 bill.status
// //                                             )}
// //                                         </span>
// //                                     </div>

// //                                     <div className="mt-4 grid grid-cols-2 gap-4">
// //                                         <div>
// //                                             <p className="text-xs text-gray-500">
// //                                                 Bill Date
// //                                             </p>

// //                                             <p className="mt-1 text-sm font-medium text-gray-700">
// //                                                 {formatDate(
// //                                                     bill.billDate
// //                                                 )}
// //                                             </p>
// //                                         </div>

// //                                         <div>
// //                                             <p className="text-xs text-gray-500">
// //                                                 Amount
// //                                             </p>

// //                                             <p className="mt-1 text-sm font-semibold text-gray-800">
// //                                                 {formatAmount(
// //                                                     bill.totalAmount,
// //                                                     bill.currency
// //                                                 )}
// //                                             </p>
// //                                         </div>

// //                                         <div>
// //                                             <p className="text-xs text-gray-500">
// //                                                 Vendor
// //                                             </p>

// //                                             <p className="mt-1 text-sm font-medium text-gray-700">
// //                                                 {bill
// //                                                     .vendor
// //                                                     ?.name ||
// //                                                     "-"}
// //                                             </p>
// //                                         </div>

// //                                         <div>
// //                                             <p className="text-xs text-gray-500">
// //                                                 Created By
// //                                             </p>

// //                                             <p className="mt-1 text-sm font-medium text-gray-700">
// //                                                 {bill
// //                                                     .submittedBy
// //                                                     ?.name ||
// //                                                     "-"}
// //                                             </p>
// //                                         </div>
// //                                     </div>

// //                                     <div className="mt-5 flex gap-2">
// //                                         <button
// //                                             type="button"
// //                                             onClick={() =>
// //                                                 navigate(
// //                                                     `/finance/bills/${bill._id}`
// //                                                 )
// //                                             }
// //                                             className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
// //                                         >
// //                                             View
// //                                         </button>

// //                                         {(bill.status ===
// //                                             "draft" ||
// //                                             bill.status ===
// //                                                 "rejected") && (
// //                                             <button
// //                                                 type="button"
// //                                                 onClick={() =>
// //                                                     handleSubmitBill(
// //                                                         bill._id
// //                                                     )
// //                                                 }
// //                                                 disabled={
// //                                                     submittingBillId ===
// //                                                     bill._id
// //                                                 }
// //                                                 className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
// //                                             >
// //                                                 {submittingBillId ===
// //                                                 bill._id
// //                                                     ? "Submitting..."
// //                                                     : bill.status ===
// //                                                       "rejected"
// //                                                     ? "Resubmit"
// //                                                     : "Submit"}
// //                                             </button>
// //                                         )}
// //                                     </div>
// //                                 </div>
// //                             )
// //                         )}
// //                     </div>
// //                 )}

// //             {/* =========================================================
// //                 PAGINATION
// //             ========================================================= */}

// //             {!loading &&
// //                 bills.length > 0 &&
// //                 pagination.totalPages >
// //                     1 && (
// //                     <div className="mt-5 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
// //                         <p className="text-sm text-gray-500">
// //                             Page{" "}
// //                             <span className="font-medium text-gray-700">
// //                                 {
// //                                     pagination.page
// //                                 }
// //                             </span>{" "}
// //                             of{" "}
// //                             <span className="font-medium text-gray-700">
// //                                 {
// //                                     pagination.totalPages
// //                                 }
// //                             </span>
// //                         </p>

// //                         <div className="flex gap-2">
// //                             <button
// //                                 type="button"
// //                                 onClick={() =>
// //                                     handlePageChange(
// //                                         pagination.page -
// //                                             1
// //                                     )
// //                                 }
// //                                 disabled={
// //                                     pagination.page <=
// //                                     1
// //                                 }
// //                                 className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
// //                             >
// //                                 Previous
// //                             </button>

// //                             <button
// //                                 type="button"
// //                                 onClick={() =>
// //                                     handlePageChange(
// //                                         pagination.page +
// //                                             1
// //                                     )
// //                                 }
// //                                 disabled={
// //                                     pagination.page >=
// //                                     pagination.totalPages
// //                                 }
// //                                 className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
// //                             >
// //                                 Next
// //                             </button>
// //                         </div>
// //                     </div>
// //                 )}
// //         </div>
// //     );
// // };

// // export default Bills;










// // frontend/src/features/finance/pages/Bills.jsx

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { useAuth } from "../../../context/AuthContext";

// import {
//     getBills,
//     submitBill,
// } from "../services/bill.service";

// import BillForm from "../components/BillForm";


// const formatDate = (date) => {
//     if (!date) return "-";

//     return new Date(date).toLocaleDateString();
// };


// const formatCurrency = (amount, currency = "INR") => {
//     return new Intl.NumberFormat("en-IN", {
//         style: "currency",
//         currency,
//         maximumFractionDigits: 2,
//     }).format(Number(amount || 0));
// };


// const formatStatus = (status) => {
//     if (!status) return "-";

//     return status
//         .replaceAll("-", " ")
//         .replace(/\b\w/g, (letter) =>
//             letter.toUpperCase()
//         );
// };


// const getStatusClass = (status) => {
//     switch (status) {
//         case "draft":
//             return "bg-gray-100 text-gray-700";

//         case "verification-pending":
//             return "bg-yellow-100 text-yellow-700";

//         case "approval-pending":
//             return "bg-purple-100 text-purple-700";

//         case "approved":
//             return "bg-green-100 text-green-700";

//         case "payment-pending":
//             return "bg-orange-100 text-orange-700";

//         case "paid":
//             return "bg-green-100 text-green-700";

//         case "rejected":
//             return "bg-red-100 text-red-700";

//         default:
//             return "bg-blue-100 text-blue-700";
//     }
// };


// const getRoleCode = (access) => {
//     return (
//         access?.roles?.find(
//             (role) => role?.roleCode
//         )?.roleCode || null
//     );
// };


// function Bills() {
//     const navigate = useNavigate();

//     const { user, access, isAdmin } =
//         useAuth();

//     const roleCode =
//         getRoleCode(access);

//     const [bills, setBills] = useState([]);

//     const [pagination, setPagination] =
//         useState({
//             total: 0,
//             page: 1,
//             limit: 10,
//             totalPages: 1,
//         });

//     const [status, setStatus] =
//         useState("");

//     const [billNumber, setBillNumber] =
//         useState("");

//     const [loading, setLoading] =
//         useState(true);

//     const [processingId, setProcessingId] =
//         useState(null);

//     const [error, setError] =
//         useState("");

//     const [showCreateForm, setShowCreateForm] =
//         useState(false);


//     /*
//      * ============================================================
//      * FETCH BILLS
//      * ============================================================
//      */

//     const fetchBills = async (
//         page = 1
//     ) => {
//         try {
//             setLoading(true);
//             setError("");

//             const params = {
//                 page,
//                 limit: 10,
//             };

//             if (status) {
//                 params.status = status;
//             }

//             if (billNumber.trim()) {
//                 params.billNumber =
//                     billNumber.trim();
//             }

//             /*
//              * IMPORTANT:
//              *
//              * Do NOT send submittedBy here.
//              *
//              * Backend now decides bill visibility
//              * using current user's role + region access.
//              */
//             const response =
//                 await getBills(params);

//             setBills(
//                 response.data?.bills || []
//             );

//             setPagination(
//                 response.data?.pagination || {
//                     total: 0,
//                     page: 1,
//                     limit: 10,
//                     totalPages: 1,
//                 }
//             );
//         } catch (err) {
//             console.error(
//                 "Failed to fetch bills:",
//                 err
//             );

//             setError(
//                 err.response?.data?.message ||
//                     "Failed to fetch bills"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };


//     useEffect(() => {
//         fetchBills(1);
//     }, []);


//     /*
//      * ============================================================
//      * SEARCH
//      * ============================================================
//      */

//     const handleSearch = async (
//         event
//     ) => {
//         event.preventDefault();

//         await fetchBills(1);
//     };


//     /*
//      * ============================================================
//      * RESET
//      * ============================================================
//      */

//     const handleReset = async () => {
//         setStatus("");
//         setBillNumber("");

//         await fetchBills(1);
//     };


//     /*
//      * ============================================================
//      * SUBMIT / RESUBMIT
//      * ============================================================
//      */

//     const handleSubmit = async (
//         bill
//     ) => {
//         if (!bill?._id) {
//             return;
//         }

//         const confirmed =
//             window.confirm(
//                 bill.status === "rejected"
//                     ? "Are you sure you want to resubmit this bill?"
//                     : "Are you sure you want to submit this bill for verification?"
//             );

//         if (!confirmed) {
//             return;
//         }

//         try {
//             setProcessingId(
//                 bill._id
//             );

//             await submitBill(
//                 bill._id
//             );

//             alert(
//                 bill.status === "rejected"
//                     ? "Bill resubmitted successfully"
//                     : "Bill submitted successfully"
//             );

//             await fetchBills(
//                 pagination.page
//             );
//         } catch (err) {
//             console.error(
//                 "Failed to submit bill:",
//                 err
//             );

//             alert(
//                 err.response?.data?.message ||
//                     "Failed to submit bill"
//             );
//         } finally {
//             setProcessingId(
//                 null
//             );
//         }
//     };


//     /*
//      * ============================================================
//      * CREATE SUCCESS
//      * ============================================================
//      */

//     const handleBillCreated = async () => {
//         setShowCreateForm(false);

//         await fetchBills(1);
//     };


//     /*
//      * ============================================================
//      * PERMISSION / ACTION HELPERS
//      * ============================================================
//      */

//     const isOwner = (bill) => {
//         const currentUserId =
//             user?._id ||
//             user?.id ||
//             null;

//         const submittedById =
//             bill?.submittedBy?._id ||
//             bill?.submittedBy ||
//             null;

//         return (
//             currentUserId &&
//             submittedById &&
//             currentUserId.toString() ===
//                 submittedById.toString()
//         );
//     };


//     const canSubmitBill = (bill) => {
//         return (
//             isOwner(bill) &&
//             ["draft", "rejected"].includes(
//                 bill.status
//             )
//         );
//     };


//     const needsVerification = (bill) => {
//         return (
//             bill.status ===
//             "verification-pending"
//         );
//     };


//     const needsApproval = (bill) => {
//         return (
//             bill.status ===
//             "approval-pending"
//         );
//     };


//     return (
//         <div className="min-h-screen bg-gray-50 p-4 md:p-6">

//             {/* =====================================================
//                 HEADER
//             ===================================================== */}

//             <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

//                 <div>
//                     <h1 className="text-2xl font-bold text-gray-900">
//                         Bills
//                     </h1>

//                     <p className="mt-1 text-sm text-gray-500">
//                         Manage bills and approval workflow
//                     </p>
//                 </div>

//                 <button
//                     type="button"
//                     onClick={() =>
//                         setShowCreateForm(
//                             (value) => !value
//                         )
//                     }
//                     className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
//                 >
//                     {showCreateForm
//                         ? "Close Form"
//                         : "Create Bill"}
//                 </button>
//             </div>


//             {/* =====================================================
//                 CREATE BILL
//             ===================================================== */}

//             {showCreateForm && (
//                 <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">

//                     <BillForm
//                         onSuccess={
//                             handleBillCreated
//                         }
//                     />
//                 </div>
//             )}


//             {/* =====================================================
//                 FILTERS
//             ===================================================== */}

//             <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">

//                 <form
//                     onSubmit={
//                         handleSearch
//                     }
//                     className="grid grid-cols-1 gap-4 md:grid-cols-4"
//                 >

//                     <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-700">
//                             Bill Number
//                         </label>

//                         <input
//                             type="text"
//                             value={
//                                 billNumber
//                             }
//                             onChange={(
//                                 event
//                             ) =>
//                                 setBillNumber(
//                                     event.target
//                                         .value
//                                 )
//                             }
//                             placeholder="Search bill number"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
//                         />
//                     </div>


//                     <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-700">
//                             Status
//                         </label>

//                         <select
//                             value={
//                                 status
//                             }
//                             onChange={(
//                                 event
//                             ) =>
//                                 setStatus(
//                                     event.target
//                                         .value
//                                 )
//                             }
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
//                         >
//                             <option value="">
//                                 All Statuses
//                             </option>

//                             <option value="draft">
//                                 Draft
//                             </option>

//                             <option value="verification-pending">
//                                 Verification Pending
//                             </option>

//                             <option value="approval-pending">
//                                 Approval Pending
//                             </option>

//                             <option value="approved">
//                                 Approved
//                             </option>

//                             <option value="payment-pending">
//                                 Payment Pending
//                             </option>

//                             <option value="paid">
//                                 Paid
//                             </option>

//                             <option value="rejected">
//                                 Rejected
//                             </option>
//                         </select>
//                     </div>


//                     <div className="flex items-end gap-2 md:col-span-2">

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
//                         >
//                             Search
//                         </button>

//                         <button
//                             type="button"
//                             onClick={
//                                 handleReset
//                             }
//                             disabled={loading}
//                             className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//                         >
//                             Reset
//                         </button>
//                     </div>
//                 </form>
//             </div>


//             {/* =====================================================
//                 ERROR
//             ===================================================== */}

//             {error && (
//                 <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
//                     <p className="text-sm text-red-600">
//                         {error}
//                     </p>
//                 </div>
//             )}


//             {/* =====================================================
//                 BILLS TABLE
//             ===================================================== */}

//             <div className="rounded-xl border bg-white shadow-sm">

//                 {loading ? (
//                     <div className="p-10 text-center text-sm text-gray-500">
//                         Loading bills...
//                     </div>
//                 ) : bills.length ===
//                   0 ? (
//                     <div className="p-10 text-center text-sm text-gray-500">
//                         No bills found.
//                     </div>
//                 ) : (
//                     <>
//                         {/* Desktop */}
//                         <div className="hidden overflow-x-auto md:block">

//                             <table className="min-w-full text-sm">

//                                 <thead>
//                                     <tr className="border-b bg-gray-50">

//                                         <th className="px-4 py-3 text-left">
//                                             Bill Number
//                                         </th>

//                                         <th className="px-4 py-3 text-left">
//                                             Title
//                                         </th>

//                                         <th className="px-4 py-3 text-left">
//                                             Submitted By
//                                         </th>

//                                         <th className="px-4 py-3 text-left">
//                                             Date
//                                         </th>

//                                         <th className="px-4 py-3 text-right">
//                                             Amount
//                                         </th>

//                                         <th className="px-4 py-3 text-left">
//                                             Status
//                                         </th>

//                                         <th className="px-4 py-3 text-right">
//                                             Action
//                                         </th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>

//                                     {bills.map(
//                                         (bill) => (
//                                             <tr
//                                                 key={
//                                                     bill._id
//                                                 }
//                                                 className="border-b last:border-b-0"
//                                             >

//                                                 <td className="px-4 py-4 font-medium text-gray-900">
//                                                     {
//                                                         bill.billNumber
//                                                     }
//                                                 </td>

//                                                 <td className="px-4 py-4">
//                                                     {
//                                                         bill.title
//                                                     }
//                                                 </td>

//                                                 <td className="px-4 py-4">
//                                                     {
//                                                         bill
//                                                             .submittedBy
//                                                             ?.name ||
//                                                             "-"
//                                                     }
//                                                 </td>

//                                                 <td className="px-4 py-4">
//                                                     {formatDate(
//                                                         bill.billDate
//                                                     )}
//                                                 </td>

//                                                 <td className="px-4 py-4 text-right font-medium">
//                                                     {formatCurrency(
//                                                         bill.totalAmount,
//                                                         bill.currency
//                                                     )}
//                                                 </td>

//                                                 <td className="px-4 py-4">
//                                                     <span
//                                                         className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
//                                                             bill.status
//                                                         )}`}
//                                                     >
//                                                         {formatStatus(
//                                                             bill.status
//                                                         )}
//                                                     </span>
//                                                 </td>

//                                                 <td className="px-4 py-4">

//                                                     <div className="flex justify-end gap-2">

//                                                         <button
//                                                             type="button"
//                                                             onClick={() =>
//                                                                 navigate(
//                                                                     `/finance/bills/${bill._id}`
//                                                                 )
//                                                             }
//                                                             className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
//                                                         >
//                                                             View
//                                                         </button>


//                                                         {canSubmitBill(
//                                                             bill
//                                                         ) && (
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={() =>
//                                                                     handleSubmit(
//                                                                         bill
//                                                                     )
//                                                                 }
//                                                                 disabled={
//                                                                     processingId ===
//                                                                     bill._id
//                                                                 }
//                                                                 className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
//                                                             >
//                                                                 {processingId ===
//                                                                 bill._id
//                                                                     ? "..."
//                                                                     : bill.status ===
//                                                                       "rejected"
//                                                                     ? "Resubmit"
//                                                                     : "Submit"}
//                                                             </button>
//                                                         )}


//                                                         {needsVerification(
//                                                             bill
//                                                         ) &&
//                                                             !isOwner(
//                                                                 bill
//                                                             ) && (
//                                                                 <span className="rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700">
//                                                                     Verification Required
//                                                                 </span>
//                                                             )}


//                                                         {needsApproval(
//                                                             bill
//                                                         ) &&
//                                                             !isOwner(
//                                                                 bill
//                                                             ) && (
//                                                                 <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700">
//                                                                     Approval Required
//                                                                 </span>
//                                                             )}
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         )
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>


//                         {/* Mobile */}
//                         <div className="space-y-4 p-4 md:hidden">

//                             {bills.map(
//                                 (bill) => (
//                                     <div
//                                         key={
//                                             bill._id
//                                         }
//                                         className="rounded-xl border p-4"
//                                     >

//                                         <div className="flex items-start justify-between gap-3">

//                                             <div>
//                                                 <p className="font-semibold text-gray-900">
//                                                     {
//                                                         bill.billNumber
//                                                     }
//                                                 </p>

//                                                 <p className="mt-1 text-sm text-gray-600">
//                                                     {
//                                                         bill.title
//                                                     }
//                                                 </p>
//                                             </div>

//                                             <span
//                                                 className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
//                                                     bill.status
//                                                 )}`}
//                                             >
//                                                 {formatStatus(
//                                                     bill.status
//                                                 )}
//                                             </span>
//                                         </div>


//                                         <div className="mt-4 space-y-2 text-sm">

//                                             <div className="flex justify-between gap-4">
//                                                 <span className="text-gray-500">
//                                                     Submitted By
//                                                 </span>

//                                                 <span className="font-medium">
//                                                     {
//                                                         bill
//                                                             .submittedBy
//                                                             ?.name ||
//                                                             "-"
//                                                     }
//                                                 </span>
//                                             </div>

//                                             <div className="flex justify-between gap-4">
//                                                 <span className="text-gray-500">
//                                                     Date
//                                                 </span>

//                                                 <span>
//                                                     {formatDate(
//                                                         bill.billDate
//                                                     )}
//                                                 </span>
//                                             </div>

//                                             <div className="flex justify-between gap-4">
//                                                 <span className="text-gray-500">
//                                                     Amount
//                                                 </span>

//                                                 <span className="font-semibold">
//                                                     {formatCurrency(
//                                                         bill.totalAmount,
//                                                         bill.currency
//                                                     )}
//                                                 </span>
//                                             </div>
//                                         </div>


//                                         <div className="mt-4 flex flex-wrap gap-2">

//                                             <button
//                                                 type="button"
//                                                 onClick={() =>
//                                                     navigate(
//                                                         `/finance/bills/${bill._id}`
//                                                     )
//                                                 }
//                                                 className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700"
//                                             >
//                                                 View
//                                             </button>


//                                             {canSubmitBill(
//                                                 bill
//                                             ) && (
//                                                 <button
//                                                     type="button"
//                                                     onClick={() =>
//                                                         handleSubmit(
//                                                             bill
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         processingId ===
//                                                         bill._id
//                                                     }
//                                                     className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
//                                                 >
//                                                     {processingId ===
//                                                     bill._id
//                                                         ? "Processing..."
//                                                         : bill.status ===
//                                                           "rejected"
//                                                         ? "Resubmit"
//                                                         : "Submit"}
//                                                 </button>
//                                             )}

//                                         </div>
//                                     </div>
//                                 )
//                             )}
//                         </div>


//                         {/* =================================================
//                             PAGINATION
//                         ================================================= */}

//                         {pagination.totalPages >
//                             1 && (
//                             <div className="flex items-center justify-between border-t px-4 py-4">

//                                 <p className="text-sm text-gray-500">
//                                     Page{" "}
//                                     {
//                                         pagination.page
//                                     }{" "}
//                                     of{" "}
//                                     {
//                                         pagination.totalPages
//                                     }
//                                 </p>

//                                 <div className="flex gap-2">

//                                     <button
//                                         type="button"
//                                         disabled={
//                                             pagination.page <=
//                                                 1 ||
//                                             loading
//                                         }
//                                         onClick={() =>
//                                             fetchBills(
//                                                 pagination.page -
//                                                     1
//                                             )
//                                         }
//                                         className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//                                     >
//                                         Previous
//                                     </button>

//                                     <button
//                                         type="button"
//                                         disabled={
//                                             pagination.page >=
//                                                 pagination.totalPages ||
//                                             loading
//                                         }
//                                         onClick={() =>
//                                             fetchBills(
//                                                 pagination.page +
//                                                     1
//                                             )
//                                         }
//                                         className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//                                     >
//                                         Next
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }


// export default Bills;

















import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import {
    getBills,
    getBillById,
    submitBill,
} from "../services/bill.service";

import BillForm from "../components/BillForm";


const getStatusLabel = (status) => {
    const labels = {
        draft: "Draft",
        "verification-pending": "Verification Pending",
        verified: "Verified",
        "approval-pending": "Approval Pending",
        approved: "Approved",
        "payment-pending": "Payment Pending",
        paid: "Paid",
        rejected: "Rejected",
    };

    return labels[status] || status;
};


const getStatusClass = (status) => {
    const classes = {
        draft:
            "bg-slate-100 text-slate-700",

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


const formatAmount = (
    amount,
    currency = "INR"
) => {
    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }
    ).format(
        Number(amount || 0)
    );
};


const formatDate = (date) => {
    if (!date) {
        return "-";
    }

    return new Date(
        date
    ).toLocaleDateString(
        "en-GB"
    );
};


const Bills = () => {
    const navigate =
        useNavigate();

    const [
        bills,
        setBills,
    ] = useState([]);

    const [
        pagination,
        setPagination,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        billNumber,
        setBillNumber,
    ] = useState("");

    const [
        status,
        setStatus,
    ] = useState("");

    const [
        showCreateForm,
        setShowCreateForm,
    ] = useState(false);

    const [
        editingBill,
        setEditingBill,
    ] = useState(null);

    const fetchBills = async (
        params = {}
    ) => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getBills({
                    page:
                        params.page ||
                        1,

                    limit:
                        params.limit ||
                        10,

                    billNumber:
                        params.billNumber ??
                        billNumber,

                    status:
                        params.status ??
                        status,
                });

            setBills(
                response.data?.bills ||
                    []
            );

            setPagination(
                response.data
                    ?.pagination ||
                    null
            );
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                    "Failed to fetch bills"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchBills({
            page: 1,
        });
    }, []);


    const handleSearch = () => {
        fetchBills({
            page: 1,
            billNumber,
            status,
        });
    };


    const handleReset = () => {
        setBillNumber("");
        setStatus("");

        fetchBills({
            page: 1,
            billNumber: "",
            status: "",
        });
    };


    const handleSubmitBill = async (
        billId
    ) => {
        try {
            setError("");

            await submitBill(
                billId
            );

            await fetchBills({
                page:
                    pagination?.page ||
                    1,
            });
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                    "Failed to submit bill"
            );
        }
    };


    const handleEdit = async (bill) => {
    try {
        setError("");

        setLoading(true);

        const response =
            await getBillById(
                bill._id
            );

        const completeBill =
            response.data?.bill ||
            response.data;

        setEditingBill(
            completeBill
        );

        setShowCreateForm(
            false
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    } catch (err) {
        setError(
            err.response?.data
                ?.message ||
                "Failed to load bill details for editing"
        );
    } finally {
        setLoading(false);
    }
};
    const handleCreate = () => {
        setEditingBill(null);

        setShowCreateForm(
            true
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    const handleFormSuccess = async () => {
        setEditingBill(null);
        setShowCreateForm(
            false
        );

        await fetchBills({
            page: 1,
        });
    };


    const handleFormCancel = () => {
        setEditingBill(null);
        setShowCreateForm(
            false
        );
    };


    const handlePageChange = (
        page
    ) => {
        fetchBills({
            page,
        });
    };


    return (
        <div className="w-full px-4 py-6 md:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Bills
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Manage bills and approval workflow
                    </p>
                </div>

                {!showCreateForm &&
                    !editingBill && (
                        <button
                            type="button"
                            onClick={
                                handleCreate
                            }
                            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                        >
                            Create Bill
                        </button>
                    )}
            </div>


            {/* Create / Edit Form */}
            {(showCreateForm ||
                editingBill) && (
                <div className="mb-8">

                    <BillForm
                        bill={
                            editingBill
                        }
                        isEditMode={
                            Boolean(
                                editingBill
                            )
                        }
                        onSuccess={
                            handleFormSuccess
                        }
                        onCancel={
                            handleFormCancel
                        }
                    />

                </div>
            )}


            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}


            {/* Filters */}
            <div className="mb-8 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">

                <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Bill Number
                        </label>

                        <input
                            type="text"
                            value={
                                billNumber
                            }
                            onChange={(e) =>
                                setBillNumber(
                                    e.target.value
                                )
                            }
                            placeholder="Search bill number"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>


                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Status
                        </label>

                        <select
                            value={
                                status
                            }
                            onChange={(e) =>
                                setStatus(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="draft">
                                Draft
                            </option>

                            <option value="verification-pending">
                                Verification Pending
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


                    <button
                        type="button"
                        onClick={
                            handleSearch
                        }
                        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Search
                    </button>


                    <button
                        type="button"
                        onClick={
                            handleReset
                        }
                        className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Reset
                    </button>

                </div>
            </div>


            {/* Bills */}
            <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">

                {loading ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                        Loading bills...
                    </div>
                ) : bills.length ===
                  0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                        No bills found.
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden overflow-x-auto md:block">

                            <table className="w-full">

                                <thead>
                                    <tr className="border-b border-slate-300 bg-slate-50">

                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                                            Bill Number
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                                            Title
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                                            Submitted By
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                                            Amount
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                                            Action
                                        </th>

                                    </tr>
                                </thead>


                                <tbody>

                                    {bills.map(
                                        (bill) => (
                                            <tr
                                                key={
                                                    bill._id
                                                }
                                                className="border-b border-slate-200 last:border-b-0"
                                            >

                                                <td className="px-6 py-5 font-semibold text-slate-900">
                                                    {
                                                        bill.billNumber
                                                    }
                                                </td>

                                                <td className="px-6 py-5 text-slate-700">
                                                    {
                                                        bill.title
                                                    }
                                                </td>

                                                <td className="px-6 py-5 text-slate-700">
                                                    {
                                                        bill.submittedBy
                                                            ?.name ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-6 py-5 text-slate-700">
                                                    {formatDate(
                                                        bill.billDate
                                                    )}
                                                </td>

                                                <td className="px-6 py-5 font-semibold text-slate-900">
                                                    {formatAmount(
                                                        bill.totalAmount,
                                                        bill.currency
                                                    )}
                                                </td>

                                                <td className="px-6 py-5">

                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                                                            bill.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            bill.status
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/finance/bills/${bill._id}`
                                                                )
                                                            }
                                                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            View
                                                        </button>


                                                        {(bill.status ===
                                                            "draft" ||
                                                            bill.status ===
                                                                "rejected") && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        bill
                                                                    )
                                                                }
                                                                className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}


                                                        {(bill.status ===
                                                            "draft" ||
                                                            bill.status ===
                                                                "rejected") && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSubmitBill(
                                                                        bill._id
                                                                    )
                                                                }
                                                                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                            >
                                                                {bill.status ===
                                                                "rejected"
                                                                    ? "Resubmit"
                                                                    : "Submit"}
                                                            </button>
                                                        )}

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* Mobile */}
                        <div className="divide-y divide-slate-200 md:hidden">

                            {bills.map(
                                (bill) => (
                                    <div
                                        key={
                                            bill._id
                                        }
                                        className="p-5"
                                    >

                                        <div className="mb-4 flex items-start justify-between gap-4">

                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {
                                                        bill.billNumber
                                                    }
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {
                                                        bill.title
                                                    }
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    bill.status
                                                )}`}
                                            >
                                                {getStatusLabel(
                                                    bill.status
                                                )}
                                            </span>

                                        </div>


                                        <div className="space-y-2 text-sm">

                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-500">
                                                    Submitted By
                                                </span>

                                                <span className="font-medium text-slate-800">
                                                    {
                                                        bill.submittedBy
                                                            ?.name ||
                                                        "-"
                                                    }
                                                </span>
                                            </div>


                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-500">
                                                    Date
                                                </span>

                                                <span className="font-medium text-slate-800">
                                                    {formatDate(
                                                        bill.billDate
                                                    )}
                                                </span>
                                            </div>


                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-500">
                                                    Amount
                                                </span>

                                                <span className="font-semibold text-slate-900">
                                                    {formatAmount(
                                                        bill.totalAmount,
                                                        bill.currency
                                                    )}
                                                </span>
                                            </div>

                                        </div>


                                        <div className="mt-5 flex flex-wrap gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/finance/bills/${bill._id}`
                                                    )
                                                }
                                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                                            >
                                                View
                                            </button>


                                            {(bill.status ===
                                                "draft" ||
                                                bill.status ===
                                                    "rejected") && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            bill
                                                        )
                                                    }
                                                    className="rounded-xl border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-600"
                                                >
                                                    Edit
                                                </button>
                                            )}


                                            {(bill.status ===
                                                "draft" ||
                                                bill.status ===
                                                    "rejected") && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSubmitBill(
                                                            bill._id
                                                        )
                                                    }
                                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                    {bill.status ===
                                                    "rejected"
                                                        ? "Resubmit"
                                                        : "Submit"}
                                                </button>
                                            )}

                                        </div>

                                    </div>
                                )
                            )}

                        </div>


                        {/* Pagination */}
                        {pagination &&
                            pagination.totalPages >
                                1 && (
                                <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">

                                    <p className="text-sm text-slate-500">
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
                                                1
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    pagination.page -
                                                        1
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                pagination.page >=
                                                pagination.totalPages
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    pagination.page +
                                                        1
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
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

export default Bills;