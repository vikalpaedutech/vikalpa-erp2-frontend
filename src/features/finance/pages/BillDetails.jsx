// // frontend/src/features/finance/pages/BillDetails.jsx

// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//     getBillById,
//     getBillHistory,
//     submitBill,
//     verifyBill,
//     rejectBill,
//     approveBill,
//     markPaymentPending,
//     markBillPaid,
// } from "../services/bill.service";

// const STATUS_OPTIONS = {
//     draft: "Draft",
//     "verification-pending": "Verification Pending",
//     verified: "Verified",
//     "approval-pending": "Approval Pending",
//     approved: "Approved",
//     "payment-pending": "Payment Pending",
//     paid: "Paid",
//     rejected: "Rejected",
// };

// const formatDate = (date) => {
//     if (!date) {
//         return "-";
//     }

//     return new Date(date).toLocaleDateString(
//         "en-IN",
//         {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         }
//     );
// };

// const formatDateTime = (date) => {
//     if (!date) {
//         return "-";
//     }

//     return new Date(date).toLocaleString(
//         "en-IN",
//         {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//         }
//     );
// };

// const formatAmount = (
//     amount,
//     currency = "INR"
// ) => {
//     return new Intl.NumberFormat(
//         "en-IN",
//         {
//             style: "currency",
//             currency,
//             maximumFractionDigits: 2,
//         }
//     ).format(Number(amount || 0));
// };

// const getStatusClasses = (status) => {
//     switch (status) {
//         case "draft":
//             return "bg-gray-100 text-gray-700";

//         case "verification-pending":
//             return "bg-yellow-100 text-yellow-700";

//         case "verified":
//             return "bg-blue-100 text-blue-700";

//         case "approval-pending":
//             return "bg-purple-100 text-purple-700";

//         case "approved":
//             return "bg-indigo-100 text-indigo-700";

//         case "payment-pending":
//             return "bg-orange-100 text-orange-700";

//         case "paid":
//             return "bg-green-100 text-green-700";

//         case "rejected":
//             return "bg-red-100 text-red-700";

//         default:
//             return "bg-gray-100 text-gray-700";
//     }
// };

// const BillDetails = () => {
//     const { billId } = useParams();
//     const navigate = useNavigate();

//     const [bill, setBill] = useState(null);
//     const [history, setHistory] =
//         useState([]);

//     const [loading, setLoading] =
//         useState(true);

//     const [actionLoading, setActionLoading] =
//         useState(false);

//     const [error, setError] =
//         useState("");

//     const [successMessage, setSuccessMessage] =
//         useState("");

//     const [remarks, setRemarks] =
//         useState("");

//     const [showRejectBox, setShowRejectBox] =
//         useState(false);

//     const [showVerifyBox, setShowVerifyBox] =
//         useState(false);

//     const [showApproveBox, setShowApproveBox] =
//         useState(false);

//     const [
//         showPaymentPendingBox,
//         setShowPaymentPendingBox,
//     ] = useState(false);

//     const [showPaidBox, setShowPaidBox] =
//         useState(false);

//     const [paymentReference, setPaymentReference] =
//         useState("");

//     const [paymentMode, setPaymentMode] =
//         useState("");

//     /*
//      |--------------------------------------------------------------------------
//      | FETCH BILL
//      |--------------------------------------------------------------------------
//      */

//     const fetchBill = async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const [
//                 billResponse,
//                 historyResponse,
//             ] = await Promise.all([
//                 getBillById(billId),
//                 getBillHistory(billId),
//             ]);

//             setBill(
//                 billResponse.data || null
//             );

//             setHistory(
//                 historyResponse.data || []
//             );
//         } catch (err) {
//             console.error(
//                 "GET BILL DETAILS ERROR:",
//                 err
//             );

//             setError(
//                 err.response?.data?.message ||
//                     "Failed to fetch bill details"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (billId) {
//             fetchBill();
//         }
//     }, [billId]);

//     /*
//      |--------------------------------------------------------------------------
//      | RESET ACTION STATES
//      |--------------------------------------------------------------------------
//      */

//     const resetActionStates = () => {
//         setRemarks("");

//         setShowRejectBox(false);
//         setShowVerifyBox(false);
//         setShowApproveBox(false);
//         setShowPaymentPendingBox(false);
//         setShowPaidBox(false);

//         setPaymentReference("");
//         setPaymentMode("");
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | SUBMIT / RESUBMIT
//      |--------------------------------------------------------------------------
//      */

//     const handleSubmit = async () => {
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
//             setActionLoading(true);
//             setError("");
//             setSuccessMessage("");

//             const response =
//                 await submitBill(
//                     bill._id
//                 );

//             setSuccessMessage(
//                 response.message ||
//                     "Bill submitted successfully"
//             );

//             resetActionStates();

//             await fetchBill();
//         } catch (err) {
//             console.error(
//                 "SUBMIT BILL ERROR:",
//                 err
//             );

//             setError(
//                 err.response?.data
//                     ?.message ||
//                     "Failed to submit bill"
//             );
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | VERIFY
//      |--------------------------------------------------------------------------
//      */

//     const handleVerify = async () => {
//         try {
//             setActionLoading(true);
//             setError("");
//             setSuccessMessage("");

//             const response =
//                 await verifyBill(
//                     bill._id,
//                     {
//                         remarks:
//                             remarks.trim(),
//                     }
//                 );

//             setSuccessMessage(
//                 response.message ||
//                     "Bill verified successfully"
//             );

//             resetActionStates();

//             await fetchBill();
//         } catch (err) {
//             console.error(
//                 "VERIFY BILL ERROR:",
//                 err
//             );

//             setError(
//                 err.response?.data
//                     ?.message ||
//                     "Failed to verify bill"
//             );
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | REJECT
//      |--------------------------------------------------------------------------
//      */

//     const handleReject = async () => {
//         if (!remarks.trim()) {
//             setError(
//                 "Rejection remarks are required"
//             );

//             return;
//         }

//         try {
//             setActionLoading(true);
//             setError("");
//             setSuccessMessage("");

//             const response =
//                 await rejectBill(
//                     bill._id,
//                     {
//                         remarks:
//                             remarks.trim(),
//                     }
//                 );

//             setSuccessMessage(
//                 response.message ||
//                     "Bill rejected successfully"
//             );

//             resetActionStates();

//             await fetchBill();
//         } catch (err) {
//             console.error(
//                 "REJECT BILL ERROR:",
//                 err
//             );

//             setError(
//                 err.response?.data
//                     ?.message ||
//                     "Failed to reject bill"
//             );
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | APPROVE
//      |--------------------------------------------------------------------------
//      */

//     const handleApprove = async () => {
//         try {
//             setActionLoading(true);
//             setError("");
//             setSuccessMessage("");

//             const response =
//                 await approveBill(
//                     bill._id,
//                     {
//                         remarks:
//                             remarks.trim(),
//                     }
//                 );

//             setSuccessMessage(
//                 response.message ||
//                     "Bill approved successfully"
//             );

//             resetActionStates();

//             await fetchBill();
//         } catch (err) {
//             console.error(
//                 "APPROVE BILL ERROR:",
//                 err
//             );

//             setError(
//                 err.response?.data
//                     ?.message ||
//                     "Failed to approve bill"
//             );
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | PAYMENT PENDING
//      |--------------------------------------------------------------------------
//      */

//     const handlePaymentPending =
//         async () => {
//             try {
//                 setActionLoading(true);
//                 setError("");
//                 setSuccessMessage("");

//                 const response =
//                     await markPaymentPending(
//                         bill._id,
//                         {
//                             remarks:
//                                 remarks.trim(),
//                         }
//                     );

//                 setSuccessMessage(
//                     response.message ||
//                         "Bill marked as payment pending"
//                 );

//                 resetActionStates();

//                 await fetchBill();
//             } catch (err) {
//                 console.error(
//                     "PAYMENT PENDING ERROR:",
//                     err
//                 );

//                 setError(
//                     err.response?.data
//                         ?.message ||
//                         "Failed to mark bill as payment pending"
//                 );
//             } finally {
//                 setActionLoading(false);
//             }
//         };

//     /*
//      |--------------------------------------------------------------------------
//      | MARK PAID
//      |--------------------------------------------------------------------------
//      */

//     const handlePaid = async () => {
//         try {
//             setActionLoading(true);
//             setError("");
//             setSuccessMessage("");

//             const response =
//                 await markBillPaid(
//                     bill._id,
//                     {
//                         paymentReference:
//                             paymentReference.trim(),

//                         paymentMode:
//                             paymentMode || null,

//                         remarks:
//                             remarks.trim(),
//                     }
//                 );

//             setSuccessMessage(
//                 response.message ||
//                     "Bill marked as paid successfully"
//             );

//             resetActionStates();

//             await fetchBill();
//         } catch (err) {
//             console.error(
//                 "MARK PAID ERROR:",
//                 err
//             );

//             setError(
//                 err.response?.data
//                     ?.message ||
//                     "Failed to mark bill as paid"
//             );
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | LOADING
//      |--------------------------------------------------------------------------
//      */

//     if (loading) {
//         return (
//             <div className="p-6">
//                 <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
//                     Loading bill details...
//                 </div>
//             </div>
//         );
//     }

//     /*
//      |--------------------------------------------------------------------------
//      | BILL NOT FOUND
//      |--------------------------------------------------------------------------
//      */

//     if (!bill) {
//         return (
//             <div className="p-6">
//                 <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
//                     <h2 className="text-lg font-semibold text-gray-800">
//                         Bill not found
//                     </h2>

//                     <button
//                         type="button"
//                         onClick={() =>
//                             navigate(
//                                 "/finance/bills"
//                             )
//                         }
//                         className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//                     >
//                         Back to Bills
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const statusLabel =
//         STATUS_OPTIONS[
//             bill.status
//         ] || bill.status;

//     /*
//      |--------------------------------------------------------------------------
//      | RENDER
//      |--------------------------------------------------------------------------
//      */

//     return (
//         <div className="p-6">
//             {/* =========================================================
//                 HEADER
//             ========================================================= */}

//             <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                     <button
//                         type="button"
//                         onClick={() =>
//                             navigate(
//                                 "/finance/bills"
//                             )
//                         }
//                         className="mb-3 text-sm font-medium text-blue-600 hover:underline"
//                     >
//                         ← Back to Bills
//                     </button>

//                     <div className="flex flex-wrap items-center gap-3">
//                         <h1 className="text-2xl font-bold text-gray-800">
//                             {bill.billNumber}
//                         </h1>

//                         <span
//                             className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
//                                 bill.status
//                             )}`}
//                         >
//                             {statusLabel}
//                         </span>
//                     </div>

//                     <p className="mt-1 text-sm text-gray-500">
//                         {bill.title}
//                     </p>
//                 </div>
//             </div>

//             {/* =========================================================
//                 MESSAGES
//             ========================================================= */}

//             {error && (
//                 <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//                     {error}
//                 </div>
//             )}

//             {successMessage && (
//                 <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
//                     {successMessage}
//                 </div>
//             )}

//             {/* =========================================================
//                 WORKFLOW ACTIONS
//             ========================================================= */}

//             <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
//                 <h2 className="mb-4 text-lg font-semibold text-gray-800">
//                     Workflow Actions
//                 </h2>

//                 <div className="flex flex-wrap gap-3">
//                     {(bill.status === "draft" ||
//                         bill.status ===
//                             "rejected") && (
//                         <button
//                             type="button"
//                             onClick={
//                                 handleSubmit
//                             }
//                             disabled={
//                                 actionLoading
//                             }
//                             className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                             {bill.status ===
//                             "rejected"
//                                 ? "Resubmit Bill"
//                                 : "Submit for Verification"}
//                         </button>
//                     )}

//                     {bill.status ===
//                         "verification-pending" && (
//                         <>
//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     setShowVerifyBox(
//                                         true
//                                     );
//                                     setShowRejectBox(
//                                         false
//                                     );
//                                 }}
//                                 disabled={
//                                     actionLoading
//                                 }
//                                 className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
//                             >
//                                 Verify
//                             </button>

//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     setShowRejectBox(
//                                         true
//                                     );
//                                     setShowVerifyBox(
//                                         false
//                                     );
//                                 }}
//                                 disabled={
//                                     actionLoading
//                                 }
//                                 className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
//                             >
//                                 Reject
//                             </button>
//                         </>
//                     )}

//                     {bill.status ===
//                         "approval-pending" && (
//                         <>
//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     setShowApproveBox(
//                                         true
//                                     );
//                                     setShowRejectBox(
//                                         false
//                                     );
//                                 }}
//                                 disabled={
//                                     actionLoading
//                                 }
//                                 className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
//                             >
//                                 Approve
//                             </button>

//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     setShowRejectBox(
//                                         true
//                                     );
//                                     setShowApproveBox(
//                                         false
//                                     );
//                                 }}
//                                 disabled={
//                                     actionLoading
//                                 }
//                                 className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
//                             >
//                                 Reject
//                             </button>
//                         </>
//                     )}

//                     {bill.status ===
//                         "approved" && (
//                         <button
//                             type="button"
//                             onClick={() =>
//                                 setShowPaymentPendingBox(
//                                     true
//                                 )
//                             }
//                             disabled={
//                                 actionLoading
//                             }
//                             className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
//                         >
//                             Mark Payment Pending
//                         </button>
//                     )}

//                     {bill.status ===
//                         "payment-pending" && (
//                         <button
//                             type="button"
//                             onClick={() =>
//                                 setShowPaidBox(
//                                     true
//                                 )
//                             }
//                             disabled={
//                                 actionLoading
//                             }
//                             className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
//                         >
//                             Mark as Paid
//                         </button>
//                     )}
//                 </div>

//                 {/* =====================================================
//                     VERIFY / APPROVE / REJECT / PAYMENT FORMS
//                 ===================================================== */}

//                 {(showVerifyBox ||
//                     showApproveBox ||
//                     showRejectBox ||
//                     showPaymentPendingBox ||
//                     showPaidBox) && (
//                     <div className="mt-5 rounded-lg border bg-gray-50 p-4">
//                         {showRejectBox && (
//                             <>
//                                 <h3 className="mb-3 text-sm font-semibold text-gray-800">
//                                     Rejection Remarks
//                                 </h3>

//                                 <textarea
//                                     value={
//                                         remarks
//                                     }
//                                     onChange={(
//                                         event
//                                     ) =>
//                                         setRemarks(
//                                             event
//                                                 .target
//                                                 .value
//                                         )
//                                     }
//                                     rows={4}
//                                     placeholder="Enter reason for rejection"
//                                     className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500"
//                                 />

//                                 <div className="mt-3 flex gap-2">
//                                     <button
//                                         type="button"
//                                         onClick={
//                                             handleReject
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
//                                     >
//                                         {actionLoading
//                                             ? "Rejecting..."
//                                             : "Confirm Rejection"}
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={
//                                             resetActionStates
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </>
//                         )}

//                         {showVerifyBox && (
//                             <>
//                                 <h3 className="mb-3 text-sm font-semibold text-gray-800">
//                                     Verification Remarks
//                                 </h3>

//                                 <textarea
//                                     value={
//                                         remarks
//                                     }
//                                     onChange={(
//                                         event
//                                     ) =>
//                                         setRemarks(
//                                             event
//                                                 .target
//                                                 .value
//                                         )
//                                     }
//                                     rows={3}
//                                     placeholder="Optional verification remarks"
//                                     className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                 />

//                                 <div className="mt-3 flex gap-2">
//                                     <button
//                                         type="button"
//                                         onClick={
//                                             handleVerify
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
//                                     >
//                                         {actionLoading
//                                             ? "Verifying..."
//                                             : "Confirm Verification"}
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={
//                                             resetActionStates
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </>
//                         )}

//                         {showApproveBox && (
//                             <>
//                                 <h3 className="mb-3 text-sm font-semibold text-gray-800">
//                                     Approval Remarks
//                                 </h3>

//                                 <textarea
//                                     value={
//                                         remarks
//                                     }
//                                     onChange={(
//                                         event
//                                     ) =>
//                                         setRemarks(
//                                             event
//                                                 .target
//                                                 .value
//                                         )
//                                     }
//                                     rows={3}
//                                     placeholder="Optional approval remarks"
//                                     className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                 />

//                                 <div className="mt-3 flex gap-2">
//                                     <button
//                                         type="button"
//                                         onClick={
//                                             handleApprove
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
//                                     >
//                                         {actionLoading
//                                             ? "Approving..."
//                                             : "Confirm Approval"}
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={
//                                             resetActionStates
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </>
//                         )}

//                         {showPaymentPendingBox && (
//                             <>
//                                 <h3 className="mb-3 text-sm font-semibold text-gray-800">
//                                     Move to Payment Pending
//                                 </h3>

//                                 <textarea
//                                     value={
//                                         remarks
//                                     }
//                                     onChange={(
//                                         event
//                                     ) =>
//                                         setRemarks(
//                                             event
//                                                 .target
//                                                 .value
//                                         )
//                                     }
//                                     rows={3}
//                                     placeholder="Optional remarks"
//                                     className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
//                                 />

//                                 <div className="mt-3 flex gap-2">
//                                     <button
//                                         type="button"
//                                         onClick={
//                                             handlePaymentPending
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
//                                     >
//                                         {actionLoading
//                                             ? "Updating..."
//                                             : "Confirm"}
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={
//                                             resetActionStates
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </>
//                         )}

//                         {showPaidBox && (
//                             <>
//                                 <h3 className="mb-4 text-sm font-semibold text-gray-800">
//                                     Payment Details
//                                 </h3>

//                                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                                     <div>
//                                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                                             Payment Mode
//                                         </label>

//                                         <select
//                                             value={
//                                                 paymentMode
//                                             }
//                                             onChange={(
//                                                 event
//                                             ) =>
//                                                 setPaymentMode(
//                                                     event
//                                                         .target
//                                                         .value
//                                                 )
//                                             }
//                                             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
//                                         >
//                                             <option value="">
//                                                 Select Payment Mode
//                                             </option>

//                                             <option value="bank-transfer">
//                                                 Bank Transfer
//                                             </option>

//                                             <option value="upi">
//                                                 UPI
//                                             </option>

//                                             <option value="cash">
//                                                 Cash
//                                             </option>

//                                             <option value="cheque">
//                                                 Cheque
//                                             </option>

//                                             <option value="other">
//                                                 Other
//                                             </option>
//                                         </select>
//                                     </div>

//                                     <div>
//                                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                                             Payment Reference
//                                         </label>

//                                         <input
//                                             type="text"
//                                             value={
//                                                 paymentReference
//                                             }
//                                             onChange={(
//                                                 event
//                                             ) =>
//                                                 setPaymentReference(
//                                                     event
//                                                         .target
//                                                         .value
//                                                 )
//                                             }
//                                             placeholder="Transaction / reference number"
//                                             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="mt-4">
//                                     <label className="mb-1 block text-sm font-medium text-gray-700">
//                                         Payment Remarks
//                                     </label>

//                                     <textarea
//                                         value={
//                                             remarks
//                                         }
//                                         onChange={(
//                                             event
//                                         ) =>
//                                             setRemarks(
//                                                 event
//                                                     .target
//                                                     .value
//                                             )
//                                         }
//                                         rows={3}
//                                         placeholder="Optional payment remarks"
//                                         className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
//                                     />
//                                 </div>

//                                 <div className="mt-3 flex gap-2">
//                                     <button
//                                         type="button"
//                                         onClick={
//                                             handlePaid
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
//                                     >
//                                         {actionLoading
//                                             ? "Processing..."
//                                             : "Confirm Payment"}
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={
//                                             resetActionStates
//                                         }
//                                         disabled={
//                                             actionLoading
//                                         }
//                                         className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* =========================================================
//                 BASIC BILL DETAILS
//             ========================================================= */}

//             <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
//                 <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
//                     <h2 className="mb-5 text-lg font-semibold text-gray-800">
//                         Bill Information
//                     </h2>

//                     <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Bill Number
//                             </p>

//                             <p className="mt-1 font-medium text-gray-800">
//                                 {bill.billNumber}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Bill Date
//                             </p>

//                             <p className="mt-1 font-medium text-gray-800">
//                                 {formatDate(
//                                     bill.billDate
//                                 )}
//                             </p>
//                         </div>

//                         <div className="sm:col-span-2">
//                             <p className="text-xs text-gray-500">
//                                 Title
//                             </p>

//                             <p className="mt-1 font-medium text-gray-800">
//                                 {bill.title}
//                             </p>
//                         </div>

//                         <div className="sm:col-span-2">
//                             <p className="text-xs text-gray-500">
//                                 Description
//                             </p>

//                             <p className="mt-1 text-sm text-gray-700">
//                                 {bill.description ||
//                                     "-"}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Submitted By
//                             </p>

//                             <p className="mt-1 font-medium text-gray-800">
//                                 {bill.submittedBy
//                                     ?.name ||
//                                     "-"}
//                             </p>

//                             {bill.submittedBy
//                                 ?.email && (
//                                 <p className="text-xs text-gray-500">
//                                     {
//                                         bill
//                                             .submittedBy
//                                             .email
//                                     }
//                                 </p>
//                             )}
//                         </div>

//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Submitted At
//                             </p>

//                             <p className="mt-1 font-medium text-gray-800">
//                                 {formatDateTime(
//                                     bill.submittedAt
//                                 )}
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Total */}

//                 <div className="rounded-xl border bg-white p-5 shadow-sm">
//                     <p className="text-sm text-gray-500">
//                         Total Amount
//                     </p>

//                     <p className="mt-2 text-3xl font-bold text-gray-800">
//                         {formatAmount(
//                             bill.totalAmount,
//                             bill.currency
//                         )}
//                     </p>

//                     <div className="mt-5 border-t pt-4">
//                         <p className="text-xs text-gray-500">
//                             Currency
//                         </p>

//                         <p className="mt-1 font-medium text-gray-800">
//                             {bill.currency ||
//                                 "INR"}
//                         </p>
//                     </div>

//                     <div className="mt-4">
//                         <p className="text-xs text-gray-500">
//                             Resubmissions
//                         </p>

//                         <p className="mt-1 font-medium text-gray-800">
//                             {
//                                 bill.resubmissionCount
//                             }
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             {/* =========================================================
//                 VENDOR
//             ========================================================= */}

//             <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
//                 <h2 className="mb-5 text-lg font-semibold text-gray-800">
//                     Vendor Details
//                 </h2>

//                 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//                     <div>
//                         <p className="text-xs text-gray-500">
//                             Name
//                         </p>

//                         <p className="mt-1 text-sm font-medium text-gray-800">
//                             {bill.vendor
//                                 ?.name ||
//                                 "-"}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-xs text-gray-500">
//                             Contact
//                         </p>

//                         <p className="mt-1 text-sm font-medium text-gray-800">
//                             {bill.vendor
//                                 ?.contact ||
//                                 "-"}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-xs text-gray-500">
//                             GST Number
//                         </p>

//                         <p className="mt-1 text-sm font-medium text-gray-800">
//                             {bill.vendor
//                                 ?.gstNumber ||
//                                 "-"}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-xs text-gray-500">
//                             Address
//                         </p>

//                         <p className="mt-1 text-sm font-medium text-gray-800">
//                             {bill.vendor
//                                 ?.address ||
//                                 "-"}
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             {/* =========================================================
//                 EXPENSE ITEMS
//             ========================================================= */}

//             <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
//                 <h2 className="mb-5 text-lg font-semibold text-gray-800">
//                     Expense Items
//                 </h2>

//                 <div className="space-y-4">
//                     {bill.expenses?.map(
//                         (
//                             expense,
//                             index
//                         ) => (
//                             <div
//                                 key={
//                                     expense._id ||
//                                     index
//                                 }
//                                 className="rounded-xl border bg-gray-50 p-4"
//                             >
//                                 <div className="mb-4 flex items-center justify-between">
//                                     <h3 className="font-semibold text-gray-800">
//                                         Expense #
//                                         {index +
//                                             1}
//                                     </h3>

//                                     <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
//                                         {
//                                             expense.category
//                                         }
//                                     </span>
//                                 </div>

//                                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//                                     <div>
//                                         <p className="text-xs text-gray-500">
//                                             Amount
//                                         </p>

//                                         <p className="mt-1 font-semibold text-gray-800">
//                                             {formatAmount(
//                                                 expense.amount,
//                                                 bill.currency
//                                             )}
//                                         </p>
//                                     </div>

//                                     <div>
//                                         <p className="text-xs text-gray-500">
//                                             Expense Date
//                                         </p>

//                                         <p className="mt-1 text-sm font-medium text-gray-800">
//                                             {formatDate(
//                                                 expense.expenseDate
//                                             )}
//                                         </p>
//                                     </div>

//                                     <div className="sm:col-span-2">
//                                         <p className="text-xs text-gray-500">
//                                             Description
//                                         </p>

//                                         <p className="mt-1 text-sm text-gray-700">
//                                             {expense.description ||
//                                                 "-"}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Travel */}

//                                 {expense.category ===
//                                     "travel-expense" &&
//                                     expense.travel && (
//                                         <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
//                                             <h4 className="mb-3 text-sm font-semibold text-gray-800">
//                                                 Travel Details
//                                             </h4>

//                                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                                                 <div>
//                                                     <p className="text-xs text-gray-500">
//                                                         From
//                                                     </p>

//                                                     <p className="mt-1 text-sm font-medium text-gray-800">
//                                                         {
//                                                             expense
//                                                                 .travel
//                                                                 .from
//                                                         }
//                                                     </p>
//                                                 </div>

//                                                 <div>
//                                                     <p className="text-xs text-gray-500">
//                                                         To
//                                                     </p>

//                                                     <p className="mt-1 text-sm font-medium text-gray-800">
//                                                         {
//                                                             expense
//                                                                 .travel
//                                                                 .to
//                                                         }
//                                                     </p>
//                                                 </div>

//                                                 <div>
//                                                     <p className="text-xs text-gray-500">
//                                                         Travel Date
//                                                     </p>

//                                                     <p className="mt-1 text-sm font-medium text-gray-800">
//                                                         {formatDate(
//                                                             expense
//                                                                 .travel
//                                                                 .travelDate
//                                                         )}
//                                                     </p>
//                                                 </div>

//                                                 <div>
//                                                     <p className="text-xs text-gray-500">
//                                                         Purpose
//                                                     </p>

//                                                     <p className="mt-1 text-sm font-medium text-gray-800">
//                                                         {
//                                                             expense
//                                                                 .travel
//                                                                 .purpose
//                                                         }
//                                                     </p>
//                                                 </div>

//                                                 <div>
//                                                     <p className="text-xs text-gray-500">
//                                                         Mode of Travel
//                                                     </p>

//                                                     <p className="mt-1 text-sm font-medium text-gray-800">
//                                                         {expense
//                                                             .travel
//                                                             .modeOfTravel ||
//                                                             "-"}
//                                                     </p>
//                                                 </div>

//                                                 <div>
//                                                     <p className="text-xs text-gray-500">
//                                                         Distance
//                                                     </p>

//                                                     <p className="mt-1 text-sm font-medium text-gray-800">
//                                                         {expense
//                                                             .travel
//                                                             .distance ??
//                                                             "-"}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )}
//                             </div>
//                         )
//                     )}
//                 </div>
//             </div>

//             {/* =========================================================
//                 ATTACHMENTS
//             ========================================================= */}

//             <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
//                 <h2 className="mb-5 text-lg font-semibold text-gray-800">
//                     Attachments
//                 </h2>

//                 {!bill.attachments ||
//                 bill.attachments.length ===
//                     0 ? (
//                     <p className="text-sm text-gray-500">
//                         No attachments.
//                     </p>
//                 ) : (
//                     <div className="space-y-3">
//                         {bill.attachments.map(
//                             (
//                                 attachment,
//                                 index
//                             ) => (
//                                 <div
//                                     key={
//                                         attachment._id ||
//                                         index
//                                     }
//                                     className="flex flex-col gap-3 rounded-lg border bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
//                                 >
//                                     <div className="min-w-0">
//                                         <p className="truncate text-sm font-medium text-gray-800">
//                                             {
//                                                 attachment.fileName
//                                             }
//                                         </p>

//                                         <p className="mt-1 text-xs text-gray-500">
//                                             {attachment.mimeType ||
//                                                 "File"}
//                                         </p>
//                                     </div>

//                                     {attachment.url && (
//                                         <a
//                                             href={
//                                                 attachment.url
//                                             }
//                                             target="_blank"
//                                             rel="noreferrer"
//                                             className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
//                                         >
//                                             View File
//                                         </a>
//                                     )}
//                                 </div>
//                             )
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* =========================================================
//                 VERIFICATION
//             ========================================================= */}

//             {bill.verification
//                 ?.verifiedBy && (
//                 <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
//                     <h2 className="mb-4 text-lg font-semibold text-gray-800">
//                         Verification
//                     </h2>

//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Verified By
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-gray-800">
//                                 {bill
//                                     .verification
//                                     .verifiedBy
//                                     ?.name ||
//                                     "-"}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Verified At
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-gray-800">
//                                 {formatDateTime(
//                                     bill
//                                         .verification
//                                         .verifiedAt
//                                 )}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Remarks
//                             </p>

//                             <p className="mt-1 text-sm text-gray-700">
//                                 {bill
//                                     .verification
//                                     .remarks ||
//                                     "-"}
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* =========================================================
//                 APPROVAL
//             ========================================================= */}

//             {bill.approval
//                 ?.approvedBy && (
//                 <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
//                     <h2 className="mb-4 text-lg font-semibold text-gray-800">
//                         Approval
//                     </h2>

//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Approved By
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-gray-800">
//                                 {bill
//                                     .approval
//                                     .approvedBy
//                                     ?.name ||
//                                     "-"}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Approved At
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-gray-800">
//                                 {formatDateTime(
//                                     bill
//                                         .approval
//                                         .approvedAt
//                                 )}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-gray-500">
//                                 Remarks
//                             </p>

//                             <p className="mt-1 text-sm text-gray-700">
//                                 {bill
//                                     .approval
//                                     .remarks ||
//                                     "-"}
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* =========================================================
//                 REJECTION
//             ========================================================= */}

//             {bill.rejection
//                 ?.rejectedBy && (
//                 <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
//                     <h2 className="mb-4 text-lg font-semibold text-red-800">
//                         Rejection
//                     </h2>

//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
//                         <div>
//                             <p className="text-xs text-red-600">
//                                 Rejected By
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-red-800">
//                                 {bill
//                                     .rejection
//                                     .rejectedBy
//                                     ?.name ||
//                                     "-"}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-red-600">
//                                 Rejected At
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-red-800">
//                                 {formatDateTime(
//                                     bill
//                                         .rejection
//                                         .rejectedAt
//                                 )}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-red-600">
//                                 Stage
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-red-800">
//                                 {bill
//                                     .rejection
//                                     .stage ||
//                                     "-"}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-red-600">
//                                 Remarks
//                             </p>

//                             <p className="mt-1 text-sm text-red-800">
//                                 {bill
//                                     .rejection
//                                     .remarks ||
//                                     "-"}
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* =========================================================
//                 PAYMENT
//             ========================================================= */}

//             {bill.payment?.paidBy && (
//                 <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
//                     <h2 className="mb-4 text-lg font-semibold text-green-800">
//                         Payment Details
//                     </h2>

//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//                         <div>
//                             <p className="text-xs text-green-700">
//                                 Paid By
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-green-900">
//                                 {bill.payment
//                                     .paidBy
//                                     ?.name ||
//                                     "-"}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-green-700">
//                                 Paid At
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-green-900">
//                                 {formatDateTime(
//                                     bill
//                                         .payment
//                                         .paidAt
//                                 )}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-green-700">
//                                 Payment Mode
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-green-900">
//                                 {bill
//                                     .payment
//                                     .paymentMode ||
//                                     "-"}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-xs text-green-700">
//                                 Payment Reference
//                             </p>

//                             <p className="mt-1 text-sm font-medium text-green-900">
//                                 {bill
//                                     .payment
//                                     .paymentReference ||
//                                     "-"}
//                             </p>
//                         </div>
//                     </div>

//                     <div className="mt-4">
//                         <p className="text-xs text-green-700">
//                             Remarks
//                         </p>

//                         <p className="mt-1 text-sm text-green-900">
//                             {bill.payment
//                                 .remarks ||
//                                 "-"}
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* =========================================================
//                 BILL HISTORY
//             ========================================================= */}

//             <div className="rounded-xl border bg-white p-5 shadow-sm">
//                 <h2 className="mb-5 text-lg font-semibold text-gray-800">
//                     Bill History
//                 </h2>

//                 {history.length ===
//                 0 ? (
//                     <p className="text-sm text-gray-500">
//                         No history available.
//                     </p>
//                 ) : (
//                     <div className="space-y-4">
//                         {history.map(
//                             (
//                                 item,
//                                 index
//                             ) => (
//                                 <div
//                                     key={
//                                         item._id ||
//                                         index
//                                     }
//                                     className="relative border-l-2 border-gray-200 pl-5"
//                                 >
//                                     <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />

//                                     <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
//                                         <div>
//                                             <p className="font-medium text-gray-800">
//                                                 {item.action
//                                                     ?.replace(
//                                                         /-/g,
//                                                         " "
//                                                     )
//                                                     .replace(
//                                                         /\b\w/g,
//                                                         (
//                                                             char
//                                                         ) =>
//                                                             char.toUpperCase()
//                                                     )}
//                                             </p>

//                                             <p className="mt-1 text-sm text-gray-600">
//                                                 {item.remarks ||
//                                                     "-"}
//                                             </p>

//                                             {item.actionBy && (
//                                                 <p className="mt-1 text-xs text-gray-500">
//                                                     By:{" "}
//                                                     {
//                                                         item
//                                                             .actionBy
//                                                             .name
//                                                     }
//                                                 </p>
//                                             )}
//                                         </div>

//                                         <p className="shrink-0 text-xs text-gray-500">
//                                             {formatDateTime(
//                                                 item.actionAt ||
//                                                     item.createdAt
//                                             )}
//                                         </p>
//                                     </div>

//                                     {(item.previousStatus ||
//                                         item.newStatus) && (
//                                         <div className="mt-2 text-xs text-gray-500">
//                                             {item.previousStatus ||
//                                                 "-"}{" "}
//                                             →{" "}
//                                             {item.newStatus ||
//                                                 "-"}
//                                         </div>
//                                     )}
//                                 </div>
//                             )
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default BillDetails;


















// frontend/src/features/finance/pages/BillDetails.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import {
    getBillById,
    getBillHistory,
    submitBill,
    verifyBill,
    rejectBill,
    approveBill,
    markPaymentPending,
    markBillPaid,
} from "../services/bill.service";


const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
};


const formatDateOnly = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
};


const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
};


const formatStatus = (status) => {
    if (!status) return "-";

    return status
        .replaceAll("-", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
};


const getStatusClass = (status) => {
    switch (status) {
        case "draft":
            return "bg-gray-100 text-gray-700";

        case "verification-pending":
            return "bg-yellow-100 text-yellow-700";

        case "verified":
            return "bg-blue-100 text-blue-700";

        case "approval-pending":
            return "bg-purple-100 text-purple-700";

        case "approved":
            return "bg-green-100 text-green-700";

        case "payment-pending":
            return "bg-orange-100 text-orange-700";

        case "paid":
            return "bg-green-100 text-green-700";

        case "rejected":
            return "bg-red-100 text-red-700";

        default:
            return "bg-gray-100 text-gray-700";
    }
};


const getRoleCode = (access) => {
    return (
        access?.roles?.find(
            (role) => role?.roleCode
        )?.roleCode || null
    );
};


function BillDetails() {
    const { billId } = useParams();
    const navigate = useNavigate();

    const { user, access, isAdmin } = useAuth();

    const [bill, setBill] = useState(null);
    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [remarks, setRemarks] = useState("");

    const [paymentReference, setPaymentReference] =
        useState("");

    const [paymentMode, setPaymentMode] =
        useState("bank-transfer");

    const [error, setError] = useState("");


    const roleCode = getRoleCode(access);

    const currentUserId =
        user?._id ||
        user?.id ||
        null;

    const submittedById =
        bill?.submittedBy?._id ||
        bill?.submittedBy ||
        null;

    const isBillOwner =
        currentUserId &&
        submittedById &&
        currentUserId.toString() ===
            submittedById.toString();


    const loadBill = async () => {
        try {
            setLoading(true);
            setError("");

            const [billResponse, historyResponse] =
                await Promise.all([
                    getBillById(billId),
                    getBillHistory(billId),
                ]);

            setBill(billResponse.data);
            setHistory(historyResponse.data || []);
        } catch (err) {
            console.error(
                "Failed to load bill:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to load bill"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadBill();
    }, [billId]);


    /*
     * ============================================================
     * WORKFLOW AUTHORITY
     * ============================================================
     */

    const canSubmit =
        isBillOwner &&
        ["draft", "rejected"].includes(
            bill?.status
        );


    const canVerify =
        !isBillOwner &&
        ["aci", "cm"].includes(roleCode) &&
        bill?.status ===
            "verification-pending";


    const canApprove =
        !isBillOwner &&
        (roleCode === "cm" || isAdmin) &&
        bill?.status ===
            "approval-pending";


    const canRejectVerification =
        !isBillOwner &&
        ["aci", "cm"].includes(roleCode) &&
        bill?.status ===
            "verification-pending";


    const canRejectApproval =
        !isBillOwner &&
        (roleCode === "cm" || isAdmin) &&
        bill?.status ===
            "approval-pending";


    const canMoveToPayment =
        (roleCode === "cm" || isAdmin) &&
        bill?.status === "approved";


    const canMarkPaid =
        (roleCode === "cm" || isAdmin) &&
        bill?.status ===
            "payment-pending";


    /*
     * ============================================================
     * SUBMIT / RESUBMIT
     * ============================================================
     */

    const handleSubmit = async () => {
        if (!bill?._id) {
            return;
        }

        const confirmed = window.confirm(
            bill.status === "rejected"
                ? "Are you sure you want to resubmit this bill?"
                : "Are you sure you want to submit this bill for verification?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessing(true);
            setError("");

            await submitBill(bill._id);

            alert(
                bill.status === "rejected"
                    ? "Bill resubmitted successfully"
                    : "Bill submitted successfully"
            );

            await loadBill();
        } catch (err) {
            console.error(
                "Failed to submit bill:",
                err
            );

            alert(
                err.response?.data?.message ||
                    "Failed to submit bill"
            );
        } finally {
            setProcessing(false);
        }
    };


    /*
     * ============================================================
     * VERIFY
     * ============================================================
     */

    const handleVerify = async () => {
        if (!bill?._id) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to verify this bill?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessing(true);
            setError("");

            await verifyBill(
                bill._id,
                {
                    remarks:
                        remarks.trim() || undefined,
                }
            );

            alert(
                "Bill verified successfully"
            );

            setRemarks("");

            await loadBill();
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
            setProcessing(false);
        }
    };


    /*
     * ============================================================
     * REJECT
     * ============================================================
     */

    const handleReject = async () => {
        if (!bill?._id) {
            return;
        }

        if (!remarks.trim()) {
            alert(
                "Please enter rejection remarks"
            );

            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to reject this bill?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessing(true);
            setError("");

            await rejectBill(
                bill._id,
                {
                    remarks:
                        remarks.trim(),
                }
            );

            alert(
                "Bill rejected successfully"
            );

            setRemarks("");

            await loadBill();
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
            setProcessing(false);
        }
    };


    /*
     * ============================================================
     * APPROVE
     * ============================================================
     */

    const handleApprove = async () => {
        if (!bill?._id) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to approve this bill?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessing(true);
            setError("");

            await approveBill(
                bill._id,
                {
                    remarks:
                        remarks.trim() || undefined,
                }
            );

            alert(
                "Bill approved successfully"
            );

            setRemarks("");

            await loadBill();
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
            setProcessing(false);
        }
    };


    /*
     * ============================================================
     * PAYMENT PENDING
     * ============================================================
     */

    const handlePaymentPending = async () => {
        if (!bill?._id) {
            return;
        }

        const confirmed = window.confirm(
            "Move this bill to payment pending?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessing(true);
            setError("");

            await markPaymentPending(
                bill._id,
                {
                    remarks:
                        remarks.trim() || undefined,
                }
            );

            alert(
                "Bill moved to payment pending"
            );

            setRemarks("");

            await loadBill();
        } catch (err) {
            console.error(
                "Failed to move bill to payment pending:",
                err
            );

            alert(
                err.response?.data?.message ||
                    "Failed to move bill to payment pending"
            );
        } finally {
            setProcessing(false);
        }
    };


    /*
     * ============================================================
     * MARK PAID
     * ============================================================
     */

    const handleMarkPaid = async () => {
        if (!bill?._id) {
            return;
        }

        if (!paymentMode) {
            alert(
                "Please select payment mode"
            );

            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to mark this bill as paid?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessing(true);
            setError("");

            await markBillPaid(
                bill._id,
                {
                    paymentReference:
                        paymentReference.trim() ||
                        undefined,
                    paymentMode,
                    remarks:
                        remarks.trim() ||
                        undefined,
                }
            );

            alert(
                "Bill marked as paid successfully"
            );

            setRemarks("");
            setPaymentReference("");

            await loadBill();
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
            setProcessing(false);
        }
    };


    if (loading) {
        return (
            <div className="p-6">
                <div className="rounded-xl border bg-white p-8 text-center">
                    Loading bill...
                </div>
            </div>
        );
    }


    if (error && !bill) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/finance/bills")
                        }
                        className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        Back to Bills
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/finance/bills")
                        }
                        className="mb-3 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Bills
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Bill Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        {bill?.billNumber || "-"}
                    </p>
                </div>

                <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                        bill?.status
                    )}`}
                >
                    {formatStatus(
                        bill?.status
                    )}
                </span>
            </div>


            {/* =====================================================
                WORKFLOW ACTIONS
            ===================================================== */}

            {(canSubmit ||
                canVerify ||
                canRejectVerification ||
                canApprove ||
                canRejectApproval ||
                canMoveToPayment ||
                canMarkPaid) && (
                <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">

                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        Workflow Actions
                    </h2>


                    {/* Submit */}
                    {canSubmit && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? "Processing..."
                                : bill.status ===
                                  "rejected"
                                ? "Resubmit Bill"
                                : "Submit for Verification"}
                        </button>
                    )}


                    {/* Verification / Approval remarks */}
                    {(canVerify ||
                        canRejectVerification ||
                        canApprove ||
                        canRejectApproval) && (
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Remarks
                            </label>

                            <textarea
                                value={remarks}
                                onChange={(event) =>
                                    setRemarks(
                                        event.target.value
                                    )
                                }
                                rows={3}
                                placeholder={
                                    canRejectVerification ||
                                    canRejectApproval
                                        ? "Remarks are required for rejection"
                                        : "Optional remarks"
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                            />
                        </div>
                    )}


                    {/* Verification actions */}
                    {(canVerify ||
                        canRejectVerification) && (
                        <div className="mt-4 flex flex-wrap gap-3">

                            {canRejectVerification && (
                                <button
                                    type="button"
                                    onClick={handleReject}
                                    disabled={processing}
                                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processing
                                        ? "Processing..."
                                        : "Reject"}
                                </button>
                            )}

                            {canVerify && (
                                <button
                                    type="button"
                                    onClick={handleVerify}
                                    disabled={processing}
                                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {processing
                                        ? "Processing..."
                                        : "Verify"}
                                </button>
                            )}
                        </div>
                    )}


                    {/* Approval actions */}
                    {(canApprove ||
                        canRejectApproval) && (
                        <div className="mt-4 flex flex-wrap gap-3">

                            {canRejectApproval && (
                                <button
                                    type="button"
                                    onClick={handleReject}
                                    disabled={processing}
                                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processing
                                        ? "Processing..."
                                        : "Reject"}
                                </button>
                            )}

                            {canApprove && (
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {processing
                                        ? "Processing..."
                                        : "Approve"}
                                </button>
                            )}
                        </div>
                    )}


                    {/* Payment pending */}
                    {canMoveToPayment && (
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={
                                    handlePaymentPending
                                }
                                disabled={processing}
                                className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                            >
                                {processing
                                    ? "Processing..."
                                    : "Move to Payment Pending"}
                            </button>
                        </div>
                    )}


                    {/* Mark paid */}
                    {canMarkPaid && (
                        <div className="mt-5 border-t pt-5">

                            <h3 className="mb-3 font-semibold text-gray-800">
                                Payment Details
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Payment Reference
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            paymentReference
                                        }
                                        onChange={(event) =>
                                            setPaymentReference(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Transaction / reference number"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Payment Mode
                                    </label>

                                    <select
                                        value={
                                            paymentMode
                                        }
                                        onChange={(event) =>
                                            setPaymentMode(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    >
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
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleMarkPaid
                                }
                                disabled={processing}
                                className="mt-4 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                {processing
                                    ? "Processing..."
                                    : "Mark as Paid"}
                            </button>
                        </div>
                    )}
                </div>
            )}


            {/* =====================================================
                BILL INFORMATION
            ===================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                <div className="rounded-xl border bg-white p-5 shadow-sm">

                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        Bill Information
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>
                            <p className="text-xs text-gray-500">
                                Bill Number
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {bill?.billNumber ||
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Title
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {bill?.title || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Bill Date
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {formatDateOnly(
                                    bill?.billDate
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Total Amount
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {formatCurrency(
                                    bill?.totalAmount,
                                    bill?.currency
                                )}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500">
                                Description
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {bill?.description ||
                                    "-"}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500">
                                Submitted By
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {bill?.submittedBy
                                    ?.name ||
                                    "-"}
                                {bill?.submittedBy
                                    ?.email && (
                                    <span className="ml-2 text-gray-500">
                                        (
                                        {
                                            bill
                                                .submittedBy
                                                .email
                                        }
                                        )
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>


                {/* Vendor */}
                <div className="rounded-xl border bg-white p-5 shadow-sm">

                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        Vendor
                    </h2>

                    <div className="space-y-4">

                        <div>
                            <p className="text-xs text-gray-500">
                                Name
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {bill?.vendor?.name ||
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Contact
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {bill?.vendor?.contact ||
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Address
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {bill?.vendor?.address ||
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                GST Number
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {bill?.vendor?.gstNumber ||
                                    "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* =====================================================
                EXPENSES
            ===================================================== */}

            <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">

                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Expenses
                </h2>

                <div className="overflow-x-auto">

                    <table className="min-w-full text-sm">

                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left">
                                    #
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Category
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Date
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Description
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {bill?.expenses?.map(
                                (expense, index) => (
                                    <tr
                                        key={
                                            expense._id ||
                                            index
                                        }
                                        className="border-b"
                                    >
                                        <td className="px-4 py-3">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatStatus(
                                                expense.category
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatDateOnly(
                                                expense.expenseDate
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            {expense.description ||
                                                "-"}
                                        </td>

                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatCurrency(
                                                expense.amount,
                                                bill?.currency
                                            )}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>

                        <tfoot>
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-4 text-right font-semibold"
                                >
                                    Total
                                </td>

                                <td className="px-4 py-4 text-right font-bold">
                                    {formatCurrency(
                                        bill?.totalAmount,
                                        bill?.currency
                                    )}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>


            {/* =====================================================
                ATTACHMENTS
            ===================================================== */}

            {bill?.attachments?.length > 0 && (
                <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">

                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        Attachments
                    </h2>

                    <div className="space-y-2">

                        {bill.attachments.map(
                            (attachment, index) => (
                                <div
                                    key={
                                        attachment.publicId ||
                                        index
                                    }
                                    className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {
                                                attachment.fileName
                                            }
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {
                                                attachment.mimeType
                                            }
                                        </p>
                                    </div>

                                    {attachment.url && (
                                        <a
                                            href={
                                                attachment.url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm font-medium text-blue-600 hover:underline"
                                        >
                                            Open Attachment
                                        </a>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}


            {/* =====================================================
                VERIFICATION / APPROVAL / PAYMENT DETAILS
            ===================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

                <div className="rounded-xl border bg-white p-5 shadow-sm">

                    <h2 className="mb-4 font-semibold text-gray-900">
                        Verification
                    </h2>

                    <div className="space-y-3 text-sm">

                        <div>
                            <p className="text-xs text-gray-500">
                                Verified By
                            </p>

                            <p className="mt-1">
                                {bill?.verification
                                    ?.verifiedBy
                                    ?.name || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Verified At
                            </p>

                            <p className="mt-1">
                                {formatDate(
                                    bill?.verification
                                        ?.verifiedAt
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Remarks
                            </p>

                            <p className="mt-1">
                                {bill?.verification
                                    ?.remarks || "-"}
                            </p>
                        </div>
                    </div>
                </div>


                <div className="rounded-xl border bg-white p-5 shadow-sm">

                    <h2 className="mb-4 font-semibold text-gray-900">
                        Approval
                    </h2>

                    <div className="space-y-3 text-sm">

                        <div>
                            <p className="text-xs text-gray-500">
                                Approved By
                            </p>

                            <p className="mt-1">
                                {bill?.approval
                                    ?.approvedBy
                                    ?.name || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Approved At
                            </p>

                            <p className="mt-1">
                                {formatDate(
                                    bill?.approval
                                        ?.approvedAt
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Remarks
                            </p>

                            <p className="mt-1">
                                {bill?.approval
                                    ?.remarks || "-"}
                            </p>
                        </div>
                    </div>
                </div>


                <div className="rounded-xl border bg-white p-5 shadow-sm">

                    <h2 className="mb-4 font-semibold text-gray-900">
                        Payment
                    </h2>

                    <div className="space-y-3 text-sm">

                        <div>
                            <p className="text-xs text-gray-500">
                                Paid By
                            </p>

                            <p className="mt-1">
                                {bill?.payment
                                    ?.paidBy
                                    ?.name || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Paid At
                            </p>

                            <p className="mt-1">
                                {formatDate(
                                    bill?.payment
                                        ?.paidAt
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Payment Mode
                            </p>

                            <p className="mt-1">
                                {formatStatus(
                                    bill?.payment
                                        ?.paymentMode
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Reference
                            </p>

                            <p className="mt-1">
                                {bill?.payment
                                    ?.paymentReference ||
                                    "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* =====================================================
                REJECTION
            ===================================================== */}

            {bill?.rejection?.rejectedBy && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">

                    <h2 className="mb-3 font-semibold text-red-800">
                        Rejection
                    </h2>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">

                        <div>
                            <p className="text-xs text-red-600">
                                Rejected By
                            </p>

                            <p className="mt-1 text-red-900">
                                {bill.rejection
                                    .rejectedBy
                                    ?.name || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-red-600">
                                Stage
                            </p>

                            <p className="mt-1 text-red-900">
                                {formatStatus(
                                    bill.rejection
                                        .stage
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-red-600">
                                Rejected At
                            </p>

                            <p className="mt-1 text-red-900">
                                {formatDate(
                                    bill.rejection
                                        .rejectedAt
                                )}
                            </p>
                        </div>

                        <div className="md:col-span-3">
                            <p className="text-xs text-red-600">
                                Remarks
                            </p>

                            <p className="mt-1 text-red-900">
                                {bill.rejection
                                    .remarks ||
                                    "-"}
                            </p>
                        </div>
                    </div>
                </div>
            )}


            {/* =====================================================
                HISTORY
            ===================================================== */}

            <div className="rounded-xl border bg-white p-5 shadow-sm">

                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Bill History
                </h2>

                {history.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No history available.
                    </p>
                ) : (
                    <div className="space-y-4">

                        {history.map(
                            (item, index) => (
                                <div
                                    key={
                                        item._id ||
                                        index
                                    }
                                    className="border-l-2 border-gray-300 pl-4"
                                >
                                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">

                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {formatStatus(
                                                    item.action
                                                )}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {item
                                                    .actionBy
                                                    ?.name ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <p className="text-xs text-gray-500">
                                            {formatDate(
                                                item.actionAt ||
                                                    item.createdAt
                                            )}
                                        </p>
                                    </div>

                                    {item.remarks && (
                                        <p className="mt-2 text-sm text-gray-700">
                                            {
                                                item.remarks
                                            }
                                        </p>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


export default BillDetails;