// import { useEffect, useMemo, useState } from "react";

// import {
//     createBill,
//     updateBill,
// } from "../services/bill.service";

// const EXPENSE_CATEGORIES = [
//     {
//         value: "office-expense",
//         label: "Office Expense",
//     },
//     {
//         value: "travel-expense",
//         label: "Travel Expense",
//     },
//     {
//         value: "orientation",
//         label: "Orientation",
//     },
//     {
//         value: "stationery",
//         label: "Stationery",
//     },
// ];

// const createEmptyExpense = () => ({
//     category: "office-expense",
//     amount: "",
//     expenseDate: "",
//     description: "",

//     travel: {
//         from: "",
//         to: "",
//         travelDate: "",
//         purpose: "",
//         modeOfTravel: "",
//         distance: "",
//     },
// });

// const initialVendor = {
//     name: "",
//     contact: "",
//     address: "",
//     gstNumber: "",
// };

// const formatDateForInput = (date) => {
//     if (!date) {
//         return "";
//     }

//     const parsedDate = new Date(date);

//     if (Number.isNaN(parsedDate.getTime())) {
//         return "";
//     }

//     return parsedDate
//         .toISOString()
//         .split("T")[0];
// };

// const normalizeExpense = (expense) => ({
//     category:
//         expense?.category ||
//         "office-expense",

//     amount:
//         expense?.amount ??
//         "",

//     expenseDate:
//         formatDateForInput(
//             expense?.expenseDate
//         ),

//     description:
//         expense?.description ||
//         "",

//     travel: {
//         from:
//             expense?.travel?.from ||
//             "",

//         to:
//             expense?.travel?.to ||
//             "",

//         travelDate:
//             formatDateForInput(
//                 expense?.travel?.travelDate
//             ),

//         purpose:
//             expense?.travel?.purpose ||
//             "",

//         modeOfTravel:
//             expense?.travel?.modeOfTravel ||
//             "",

//         distance:
//             expense?.travel?.distance ??
//             "",
//     },
// });

// const getInitialBillData = (bill) => {
//     if (!bill) {
//         return {
//             billNumber: "",
//             title: "",
//             description: "",
//             billDate: "",
//             currency: "INR",

//             vendor: {
//                 ...initialVendor,
//             },

//             expenses: [
//                 createEmptyExpense(),
//             ],
//         };
//     }

//     return {
//         billNumber:
//             bill.billNumber ||
//             "",

//         title:
//             bill.title ||
//             "",

//         description:
//             bill.description ||
//             "",

//         billDate:
//             formatDateForInput(
//                 bill.billDate
//             ),

//         currency:
//             bill.currency ||
//             "INR",

//         vendor: {
//             name:
//                 bill.vendor?.name ||
//                 "",

//             contact:
//                 bill.vendor?.contact ||
//                 "",

//             address:
//                 bill.vendor?.address ||
//                 "",

//             gstNumber:
//                 bill.vendor?.gstNumber ||
//                 "",
//         },

//         expenses:
//             Array.isArray(
//                 bill.expenses
//             ) &&
//             bill.expenses.length > 0
//                 ? bill.expenses.map(
//                       normalizeExpense
//                   )
//                 : [
//                       createEmptyExpense(),
//                   ],
//     };
// };

// const BillForm = ({
//     bill = null,
//     isEditMode = false,
//     onSuccess,
//     onCancel,
// }) => {
//     const [
//         billData,
//         setBillData,
//     ] = useState(
//         getInitialBillData(bill)
//     );

//     const [
//         attachments,
//         setAttachments,
//     ] = useState([]);

//     const [
//         existingAttachments,
//         setExistingAttachments,
//     ] = useState(
//         bill?.attachments || []
//     );

//     const [
//         loading,
//         setLoading,
//     ] = useState(false);

//     const [
//         error,
//         setError,
//     ] = useState("");

//     const [
//         successMessage,
//         setSuccessMessage,
//     ] = useState("");

//     /*
//      |--------------------------------------------------------------------------
//      | LOAD BILL DATA FOR EDIT
//      |--------------------------------------------------------------------------
//      */

//     useEffect(() => {
//         if (
//             isEditMode &&
//             bill
//         ) {
//             setBillData(
//                 getInitialBillData(
//                     bill
//                 )
//             );

//             setExistingAttachments(
//                 bill.attachments ||
//                     []
//             );

//             setAttachments([]);

//             setError("");

//             setSuccessMessage("");
//         }
//     }, [
//         bill,
//         isEditMode,
//     ]);

//     /*
//      |--------------------------------------------------------------------------
//      | TOTAL AMOUNT
//      |--------------------------------------------------------------------------
//      */

//     const totalAmount = useMemo(() => {
//         return billData.expenses.reduce(
//             (
//                 total,
//                 expense
//             ) => {
//                 return (
//                     total +
//                     Number(
//                         expense.amount ||
//                             0
//                     )
//                 );
//             },
//             0
//         );
//     }, [
//         billData.expenses,
//     ]);

//     /*
//      |--------------------------------------------------------------------------
//      | BILL FIELD CHANGE
//      |--------------------------------------------------------------------------
//      */

//     const handleBillChange = (
//         event
//     ) => {
//         const {
//             name,
//             value,
//         } = event.target;

//         setBillData(
//             (previous) => ({
//                 ...previous,

//                 [name]: value,
//             })
//         );
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | VENDOR FIELD CHANGE
//      |--------------------------------------------------------------------------
//      */

//     const handleVendorChange = (
//         event
//     ) => {
//         const {
//             name,
//             value,
//         } = event.target;

//         setBillData(
//             (previous) => ({
//                 ...previous,

//                 vendor: {
//                     ...previous.vendor,

//                     [name]: value,
//                 },
//             })
//         );
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | EXPENSE FIELD CHANGE
//      |--------------------------------------------------------------------------
//      */

//     const handleExpenseChange = (
//         expenseIndex,
//         field,
//         value
//     ) => {
//         setBillData(
//             (previous) => {
//                 const expenses = [
//                     ...previous.expenses,
//                 ];

//                 expenses[
//                     expenseIndex
//                 ] = {
//                     ...expenses[
//                         expenseIndex
//                     ],

//                     [field]: value,
//                 };

//                 return {
//                     ...previous,

//                     expenses,
//                 };
//             }
//         );
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | TRAVEL FIELD CHANGE
//      |--------------------------------------------------------------------------
//      */

//     const handleTravelChange = (
//         expenseIndex,
//         field,
//         value
//     ) => {
//         setBillData(
//             (previous) => {
//                 const expenses = [
//                     ...previous.expenses,
//                 ];

//                 expenses[
//                     expenseIndex
//                 ] = {
//                     ...expenses[
//                         expenseIndex
//                     ],

//                     travel: {
//                         ...expenses[
//                             expenseIndex
//                         ].travel,

//                         [field]: value,
//                     },
//                 };

//                 return {
//                     ...previous,

//                     expenses,
//                 };
//             }
//         );
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | ADD EXPENSE
//      |--------------------------------------------------------------------------
//      */

//     const handleAddExpense = () => {
//         setBillData(
//             (previous) => ({
//                 ...previous,

//                 expenses: [
//                     ...previous.expenses,

//                     createEmptyExpense(),
//                 ],
//             })
//         );
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | REMOVE EXPENSE
//      |--------------------------------------------------------------------------
//      */

//     const handleRemoveExpense = (
//         expenseIndex
//     ) => {
//         if (
//             billData.expenses.length ===
//             1
//         ) {
//             return;
//         }

//         setBillData(
//             (previous) => ({
//                 ...previous,

//                 expenses:
//                     previous.expenses.filter(
//                         (
//                             _,
//                             index
//                         ) =>
//                             index !==
//                             expenseIndex
//                     ),
//             })
//         );
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | ATTACHMENT CHANGE
//      |--------------------------------------------------------------------------
//      */

//     const handleAttachmentChange = (
//         event
//     ) => {
//         const selectedFiles =
//             Array.from(
//                 event.target.files ||
//                     []
//             );

//         const totalAttachments =
//             existingAttachments.length +
//             attachments.length +
//             selectedFiles.length;

//         if (
//             totalAttachments >
//             10
//         ) {
//             setError(
//                 "Maximum 10 attachments are allowed"
//             );

//             event.target.value =
//                 "";

//             return;
//         }

//         setError("");

//         setAttachments(
//             (previous) => [
//                 ...previous,
//                 ...selectedFiles,
//             ]
//         );

//         event.target.value =
//             "";
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | REMOVE NEW ATTACHMENT
//      |--------------------------------------------------------------------------
//      */

//     const handleRemoveAttachment = (
//         attachmentIndex
//     ) => {
//         setAttachments(
//             (previous) =>
//                 previous.filter(
//                     (
//                         _,
//                         index
//                     ) =>
//                         index !==
//                         attachmentIndex
//                 )
//         );
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | VALIDATION
//      |--------------------------------------------------------------------------
//      */

//     const validateForm = () => {
//         if (
//             !billData.billNumber.trim()
//         ) {
//             return "Bill number is required";
//         }

//         if (
//             !billData.title.trim()
//         ) {
//             return "Bill title is required";
//         }

//         if (!billData.billDate) {
//             return "Bill date is required";
//         }

//         if (
//             !billData.expenses ||
//             billData.expenses.length ===
//                 0
//         ) {
//             return "At least one expense item is required";
//         }

//         for (
//             let index = 0;
//             index <
//             billData.expenses.length;
//             index++
//         ) {
//             const expense =
//                 billData.expenses[
//                     index
//                 ];

//             const expenseNumber =
//                 index + 1;

//             if (
//                 !expense.category
//             ) {
//                 return `Expense ${expenseNumber}: category is required`;
//             }

//             if (
//                 expense.amount ===
//                     "" ||
//                 expense.amount ===
//                     null ||
//                 Number(
//                     expense.amount
//                 ) < 0
//             ) {
//                 return `Expense ${expenseNumber}: valid amount is required`;
//             }

//             if (
//                 !expense.expenseDate
//             ) {
//                 return `Expense ${expenseNumber}: expense date is required`;
//             }

//             /*
//              * Travel validation
//              */

//             if (
//                 expense.category ===
//                 "travel-expense"
//             ) {
//                 if (
//                     !expense.travel?.from?.trim()
//                 ) {
//                     return `Expense ${expenseNumber}: from is required for travel expense`;
//                 }

//                 if (
//                     !expense.travel?.to?.trim()
//                 ) {
//                     return `Expense ${expenseNumber}: to is required for travel expense`;
//                 }

//                 if (
//                     !expense.travel?.travelDate
//                 ) {
//                     return `Expense ${expenseNumber}: travel date is required`;
//                 }

//                 if (
//                     !expense.travel?.purpose?.trim()
//                 ) {
//                     return `Expense ${expenseNumber}: purpose is required for travel expense`;
//                 }
//             }
//         }

//         if (
//             existingAttachments.length +
//                 attachments.length >
//             10
//         ) {
//             return "Maximum 10 attachments are allowed";
//         }

//         return null;
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | SUBMIT
//      |--------------------------------------------------------------------------
//      */

//     const handleSubmit = async (
//         event
//     ) => {
//         event.preventDefault();

//         setError("");

//         setSuccessMessage("");

//         const validationError =
//             validateForm();

//         if (validationError) {
//             setError(
//                 validationError
//             );

//             return;
//         }

//         try {
//             setLoading(true);

//             const formData =
//                 new FormData();

//             /*
//              * Basic bill fields
//              */

//             formData.append(
//                 "billNumber",
//                 billData.billNumber.trim()
//             );

//             formData.append(
//                 "title",
//                 billData.title.trim()
//             );

//             formData.append(
//                 "description",
//                 billData.description.trim()
//             );

//             formData.append(
//                 "billDate",
//                 billData.billDate
//             );

//             formData.append(
//                 "currency",
//                 billData.currency ||
//                     "INR"
//             );

//             /*
//              * Expenses
//              */

//             formData.append(
//                 "expenses",
//                 JSON.stringify(
//                     billData.expenses
//                 )
//             );

//             /*
//              * Vendor
//              */

//             formData.append(
//                 "vendor",
//                 JSON.stringify(
//                     billData.vendor
//                 )
//             );

//             /*
//              * New attachments
//              */

//             attachments.forEach(
//                 (file) => {
//                     formData.append(
//                         "attachments",
//                         file
//                     );
//                 }
//             );

//             let response;

//             /*
//              * CREATE
//              */

//             if (
//                 !isEditMode
//             ) {
//                 response =
//                     await createBill(
//                         formData
//                     );
//             }

//             /*
//              * UPDATE
//              */

//             if (
//                 isEditMode &&
//                 bill?._id
//             ) {
//                 response =
//                     await updateBill(
//                         bill._id,
//                         formData
//                     );
//             }

//             setSuccessMessage(
//                 response?.message ||
//                     (isEditMode
//                         ? "Bill updated successfully"
//                         : "Bill created successfully")
//             );

//             /*
//              * Notify parent.
//              */

//             if (onSuccess) {
//                 await onSuccess(
//                     response?.data
//                 );
//             }

//             /*
//              * Only reset the form
//              * after creating a new bill.
//              *
//              * For edit mode the parent
//              * normally closes the form.
//              */

//             if (
//                 !isEditMode
//             ) {
//                 setBillData({
//                     billNumber:
//                         "",
//                     title: "",
//                     description:
//                         "",
//                     billDate: "",
//                     currency:
//                         "INR",

//                     vendor: {
//                         ...initialVendor,
//                     },

//                     expenses: [
//                         createEmptyExpense(),
//                     ],
//                 });

//                 setAttachments([]);
//             }
//         } catch (err) {
//             console.error(
//                 isEditMode
//                     ? "UPDATE BILL ERROR:"
//                     : "CREATE BILL ERROR:",
//                 err
//             );

//             setError(
//                 err.response?.data
//                     ?.message ||
//                     (isEditMode
//                         ? "Failed to update bill"
//                         : "Failed to create bill")
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | CANCEL
//      |--------------------------------------------------------------------------
//      */

//     const handleCancel = () => {
//         if (onCancel) {
//             onCancel();
//         }
//     };

//     /*
//      |--------------------------------------------------------------------------
//      | RENDER
//      |--------------------------------------------------------------------------
//      */

//     return (
//         <form
//             onSubmit={
//                 handleSubmit
//             }
//             className="space-y-6"
//         >
//             {/* =========================================================
//                 ERROR
//             ========================================================= */}

//             {error && (
//                 <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//                     {error}
//                 </div>
//             )}

//             {/* =========================================================
//                 SUCCESS
//             ========================================================= */}

//             {successMessage && (
//                 <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
//                     {
//                         successMessage
//                     }
//                 </div>
//             )}

//             {/* =========================================================
//                 BILL INFORMATION
//             ========================================================= */}

//             <div className="rounded-xl border bg-white p-5 shadow-sm">

//                 <div className="mb-5">

//                     <h2 className="text-lg font-semibold text-gray-800">
//                         {isEditMode
//                             ? "Edit Bill"
//                             : "Bill Information"}
//                     </h2>

//                     <p className="mt-1 text-sm text-gray-500">
//                         {isEditMode
//                             ? "Update the bill details and save your changes."
//                             : "Enter the basic details of the bill."}
//                     </p>

//                 </div>


//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

//                     {/* Bill Number */}

//                     <div>

//                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Bill Number

//                             <span className="text-red-500">
//                                 {" "}
//                                 *
//                             </span>
//                         </label>

//                         <input
//                             type="text"
//                             name="billNumber"
//                             value={
//                                 billData.billNumber
//                             }
//                             onChange={
//                                 handleBillChange
//                             }
//                             placeholder="Enter bill number"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
//                         />

//                     </div>


//                     {/* Bill Date */}

//                     <div>

//                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Bill Date

//                             <span className="text-red-500">
//                                 {" "}
//                                 *
//                             </span>
//                         </label>

//                         <input
//                             type="date"
//                             name="billDate"
//                             value={
//                                 billData.billDate
//                             }
//                             onChange={
//                                 handleBillChange
//                             }
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
//                         />

//                     </div>


//                     {/* Title */}

//                     <div className="md:col-span-2">

//                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Bill Title

//                             <span className="text-red-500">
//                                 {" "}
//                                 *
//                             </span>
//                         </label>

//                         <input
//                             type="text"
//                             name="title"
//                             value={
//                                 billData.title
//                             }
//                             onChange={
//                                 handleBillChange
//                             }
//                             placeholder="Enter bill title"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
//                         />

//                     </div>


//                     {/* Description */}

//                     <div className="md:col-span-2">

//                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Description
//                         </label>

//                         <textarea
//                             name="description"
//                             value={
//                                 billData.description
//                             }
//                             onChange={
//                                 handleBillChange
//                             }
//                             rows={3}
//                             placeholder="Enter bill description"
//                             className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
//                         />

//                     </div>


//                     {/* Currency */}

//                     <div>

//                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Currency
//                         </label>

//                         <input
//                             type="text"
//                             name="currency"
//                             value={
//                                 billData.currency
//                             }
//                             onChange={
//                                 handleBillChange
//                             }
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500"
//                         />

//                     </div>

//                 </div>

//             </div>


//             {/* =========================================================
//                 VENDOR
//             ========================================================= */}

//             <div className="rounded-xl border bg-white p-5 shadow-sm">

//                 <div className="mb-5">

//                     <h2 className="text-lg font-semibold text-gray-800">
//                         Vendor Details
//                     </h2>

//                     <p className="mt-1 text-sm text-gray-500">
//                         Vendor information is optional.
//                     </p>

//                 </div>


//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

//                     {/* Vendor Name */}

//                     <div>

//                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Vendor Name
//                         </label>

//                         <input
//                             type="text"
//                             name="name"
//                             value={
//                                 billData.vendor
//                                     .name
//                             }
//                             onChange={
//                                 handleVendorChange
//                             }
//                             placeholder="Enter vendor name"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
//                         />

//                     </div>


//                     {/* Vendor Contact */}

//                     <div>

//                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Vendor Contact
//                         </label>

//                         <input
//                             type="text"
//                             name="contact"
//                             value={
//                                 billData.vendor
//                                     .contact
//                             }
//                             onChange={
//                                 handleVendorChange
//                             }
//                             placeholder="Enter vendor contact"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
//                         />

//                     </div>


//                     {/* GST */}

//                     <div>

//                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                             GST Number
//                         </label>

//                         <input
//                             type="text"
//                             name="gstNumber"
//                             value={
//                                 billData.vendor
//                                     .gstNumber
//                             }
//                             onChange={
//                                 handleVendorChange
//                             }
//                             placeholder="Enter GST number"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500"
//                         />

//                     </div>


//                     {/* Address */}

//                     <div>

//                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Vendor Address
//                         </label>

//                         <input
//                             type="text"
//                             name="address"
//                             value={
//                                 billData.vendor
//                                     .address
//                             }
//                             onChange={
//                                 handleVendorChange
//                             }
//                             placeholder="Enter vendor address"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
//                         />

//                     </div>

//                 </div>

//             </div>


//             {/* =========================================================
//                 EXPENSES
//             ========================================================= */}

//             <div className="rounded-xl border bg-white p-5 shadow-sm">

//                 <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

//                     <div>

//                         <h2 className="text-lg font-semibold text-gray-800">
//                             Expense Items
//                         </h2>

//                         <p className="mt-1 text-sm text-gray-500">
//                             Add one or more expense items to this bill.
//                         </p>

//                     </div>


//                     <button
//                         type="button"
//                         onClick={
//                             handleAddExpense
//                         }
//                         className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//                     >
//                         + Add Expense
//                     </button>

//                 </div>


//                 <div className="space-y-5">

//                     {billData.expenses.map(
//                         (
//                             expense,
//                             expenseIndex
//                         ) => (

//                             <div
//                                 key={
//                                     expenseIndex
//                                 }
//                                 className="rounded-xl border border-gray-200 bg-gray-50 p-4"
//                             >

//                                 {/* Expense Header */}

//                                 <div className="mb-4 flex items-center justify-between">

//                                     <h3 className="text-sm font-semibold text-gray-800">
//                                         Expense #
//                                         {
//                                             expenseIndex +
//                                             1
//                                         }
//                                     </h3>


//                                     {billData
//                                         .expenses
//                                         .length >
//                                         1 && (

//                                         <button
//                                             type="button"
//                                             onClick={() =>
//                                                 handleRemoveExpense(
//                                                     expenseIndex
//                                                 )
//                                             }
//                                             className="text-sm font-medium text-red-600 hover:text-red-700"
//                                         >
//                                             Remove
//                                         </button>

//                                     )}

//                                 </div>


//                                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

//                                     {/* Category */}

//                                     <div>

//                                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                                             Category

//                                             <span className="text-red-500">
//                                                 {" "}
//                                                 *
//                                             </span>
//                                         </label>

//                                         <select
//                                             value={
//                                                 expense.category
//                                             }
//                                             onChange={(
//                                                 event
//                                             ) =>
//                                                 handleExpenseChange(
//                                                     expenseIndex,
//                                                     "category",
//                                                     event
//                                                         .target
//                                                         .value
//                                                 )
//                                             }
//                                             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                         >

//                                             {EXPENSE_CATEGORIES.map(
//                                                 (
//                                                     category
//                                                 ) => (

//                                                     <option
//                                                         key={
//                                                             category.value
//                                                         }
//                                                         value={
//                                                             category.value
//                                                         }
//                                                     >
//                                                         {
//                                                             category.label
//                                                         }
//                                                     </option>

//                                                 )
//                                             )}

//                                         </select>

//                                     </div>


//                                     {/* Amount */}

//                                     <div>

//                                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                                             Amount

//                                             <span className="text-red-500">
//                                                 {" "}
//                                                 *
//                                             </span>
//                                         </label>

//                                         <input
//                                             type="number"
//                                             min="0"
//                                             step="0.01"
//                                             value={
//                                                 expense.amount
//                                             }
//                                             onChange={(
//                                                 event
//                                             ) =>
//                                                 handleExpenseChange(
//                                                     expenseIndex,
//                                                     "amount",
//                                                     event
//                                                         .target
//                                                         .value
//                                                 )
//                                             }
//                                             placeholder="Enter amount"
//                                             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                         />

//                                     </div>


//                                     {/* Expense Date */}

//                                     <div>

//                                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                                             Expense Date

//                                             <span className="text-red-500">
//                                                 {" "}
//                                                 *
//                                             </span>
//                                         </label>

//                                         <input
//                                             type="date"
//                                             value={
//                                                 expense.expenseDate
//                                             }
//                                             onChange={(
//                                                 event
//                                             ) =>
//                                                 handleExpenseChange(
//                                                     expenseIndex,
//                                                     "expenseDate",
//                                                     event
//                                                         .target
//                                                         .value
//                                                 )
//                                             }
//                                             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                         />

//                                     </div>


//                                     {/* Expense Description */}

//                                     <div>

//                                         <label className="mb-1 block text-sm font-medium text-gray-700">
//                                             Description
//                                         </label>

//                                         <input
//                                             type="text"
//                                             value={
//                                                 expense.description
//                                             }
//                                             onChange={(
//                                                 event
//                                             ) =>
//                                                 handleExpenseChange(
//                                                     expenseIndex,
//                                                     "description",
//                                                     event
//                                                         .target
//                                                         .value
//                                                 )
//                                             }
//                                             placeholder="Enter expense description"
//                                             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                         />

//                                     </div>

//                                 </div>


//                                 {/* =========================================
//                                     TRAVEL DETAILS
//                                 ========================================= */}

//                                 {expense.category ===
//                                     "travel-expense" && (

//                                     <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">

//                                         <h4 className="mb-4 text-sm font-semibold text-gray-800">
//                                             Travel Details
//                                         </h4>


//                                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

//                                             {/* From */}

//                                             <div>

//                                                 <label className="mb-1 block text-sm font-medium text-gray-700">
//                                                     From

//                                                     <span className="text-red-500">
//                                                         {" "}
//                                                         *
//                                                     </span>
//                                                 </label>

//                                                 <input
//                                                     type="text"
//                                                     value={
//                                                         expense
//                                                             .travel
//                                                             .from
//                                                     }
//                                                     onChange={(
//                                                         event
//                                                     ) =>
//                                                         handleTravelChange(
//                                                             expenseIndex,
//                                                             "from",
//                                                             event
//                                                                 .target
//                                                                 .value
//                                                         )
//                                                     }
//                                                     placeholder="Starting location"
//                                                     className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                                 />

//                                             </div>


//                                             {/* To */}

//                                             <div>

//                                                 <label className="mb-1 block text-sm font-medium text-gray-700">
//                                                     To

//                                                     <span className="text-red-500">
//                                                         {" "}
//                                                         *
//                                                     </span>
//                                                 </label>

//                                                 <input
//                                                     type="text"
//                                                     value={
//                                                         expense
//                                                             .travel
//                                                             .to
//                                                     }
//                                                     onChange={(
//                                                         event
//                                                     ) =>
//                                                         handleTravelChange(
//                                                             expenseIndex,
//                                                             "to",
//                                                             event
//                                                                 .target
//                                                                 .value
//                                                         )
//                                                     }
//                                                     placeholder="Destination"
//                                                     className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                                 />

//                                             </div>


//                                             {/* Travel Date */}

//                                             <div>

//                                                 <label className="mb-1 block text-sm font-medium text-gray-700">
//                                                     Travel Date

//                                                     <span className="text-red-500">
//                                                         {" "}
//                                                         *
//                                                     </span>
//                                                 </label>

//                                                 <input
//                                                     type="date"
//                                                     value={
//                                                         expense
//                                                             .travel
//                                                             .travelDate
//                                                     }
//                                                     onChange={(
//                                                         event
//                                                     ) =>
//                                                         handleTravelChange(
//                                                             expenseIndex,
//                                                             "travelDate",
//                                                             event
//                                                                 .target
//                                                                 .value
//                                                         )
//                                                     }
//                                                     className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                                 />

//                                             </div>


//                                             {/* Mode of Travel */}

//                                             <div>

//                                                 <label className="mb-1 block text-sm font-medium text-gray-700">
//                                                     Mode of Travel
//                                                 </label>

//                                                 <input
//                                                     type="text"
//                                                     value={
//                                                         expense
//                                                             .travel
//                                                             .modeOfTravel
//                                                     }
//                                                     onChange={(
//                                                         event
//                                                     ) =>
//                                                         handleTravelChange(
//                                                             expenseIndex,
//                                                             "modeOfTravel",
//                                                             event
//                                                                 .target
//                                                                 .value
//                                                         )
//                                                     }
//                                                     placeholder="Bus, Train, Cab, etc."
//                                                     className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                                 />

//                                             </div>


//                                             {/* Distance */}

//                                             <div>

//                                                 <label className="mb-1 block text-sm font-medium text-gray-700">
//                                                     Distance
//                                                 </label>

//                                                 <input
//                                                     type="number"
//                                                     min="0"
//                                                     step="0.01"
//                                                     value={
//                                                         expense
//                                                             .travel
//                                                             .distance
//                                                     }
//                                                     onChange={(
//                                                         event
//                                                     ) =>
//                                                         handleTravelChange(
//                                                             expenseIndex,
//                                                             "distance",
//                                                             event
//                                                                 .target
//                                                                 .value
//                                                         )
//                                                     }
//                                                     placeholder="Distance"
//                                                     className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                                 />

//                                             </div>


//                                             {/* Purpose */}

//                                             <div>

//                                                 <label className="mb-1 block text-sm font-medium text-gray-700">
//                                                     Purpose

//                                                     <span className="text-red-500">
//                                                         {" "}
//                                                         *
//                                                     </span>
//                                                 </label>

//                                                 <input
//                                                     type="text"
//                                                     value={
//                                                         expense
//                                                             .travel
//                                                             .purpose
//                                                     }
//                                                     onChange={(
//                                                         event
//                                                     ) =>
//                                                         handleTravelChange(
//                                                             expenseIndex,
//                                                             "purpose",
//                                                             event
//                                                                 .target
//                                                                 .value
//                                                         )
//                                                     }
//                                                     placeholder="Purpose of travel"
//                                                     className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
//                                                 />

//                                             </div>

//                                         </div>

//                                     </div>

//                                 )}

//                             </div>

//                         )
//                     )}

//                 </div>


//                 {/* Total */}

//                 <div className="mt-5 flex justify-end">

//                     <div className="rounded-lg bg-gray-100 px-5 py-3">

//                         <span className="mr-4 text-sm text-gray-600">
//                             Total Amount
//                         </span>

//                         <span className="text-lg font-bold text-gray-800">
//                             ₹{" "}
//                             {totalAmount.toFixed(
//                                 2
//                             )}
//                         </span>

//                     </div>

//                 </div>

//             </div>


//             {/* =========================================================
//                 ATTACHMENTS
//             ========================================================= */}

//             <div className="rounded-xl border bg-white p-5 shadow-sm">

//                 <div className="mb-5">

//                     <h2 className="text-lg font-semibold text-gray-800">
//                         Attachments
//                     </h2>

//                     <p className="mt-1 text-sm text-gray-500">
//                         Upload supporting PDF or image documents. Maximum 10 files.
//                     </p>

//                 </div>


//                 {/* Existing attachments */}

//                 {isEditMode &&
//                     existingAttachments.length >
//                         0 && (

//                     <div className="mb-5">

//                         <p className="mb-3 text-sm font-medium text-gray-700">
//                             Existing Attachments
//                         </p>


//                         <div className="space-y-2">

//                             {existingAttachments.map(
//                                 (
//                                     attachment,
//                                     index
//                                 ) => (

//                                     <div
//                                         key={
//                                             attachment._id ||
//                                             index
//                                         }
//                                         className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
//                                     >

//                                         <span className="text-gray-700">
//                                             {
//                                                 attachment.fileName
//                                             }
//                                         </span>

//                                     </div>

//                                 )
//                             )}

//                         </div>

//                     </div>
//                 )}


//                 <input
//                     type="file"
//                     multiple
//                     accept=".pdf,.jpg,.jpeg,.png,.webp"
//                     onChange={
//                         handleAttachmentChange
//                     }
//                     className="block w-full rounded-lg border border-gray-300 bg-white text-sm file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm"
//                 />


//                 {/* New attachments */}

//                 {attachments.length >
//                     0 && (

//                     <div className="mt-4 space-y-2">

//                         <p className="text-sm font-medium text-gray-700">
//                             New Attachments
//                         </p>


//                         {attachments.map(
//                             (
//                                 file,
//                                 index
//                             ) => (

//                                 <div
//                                     key={`${file.name}-${index}`}
//                                     className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
//                                 >

//                                     <span className="truncate text-gray-700">
//                                         {
//                                             file.name
//                                         }
//                                     </span>


//                                     <div className="ml-3 flex items-center gap-3">

//                                         <span className="shrink-0 text-xs text-gray-500">
//                                             {(
//                                                 file.size /
//                                                 1024 /
//                                                 1024
//                                             ).toFixed(
//                                                 2
//                                             )}{" "}
//                                             MB
//                                         </span>


//                                         <button
//                                             type="button"
//                                             onClick={() =>
//                                                 handleRemoveAttachment(
//                                                     index
//                                                 )
//                                             }
//                                             className="text-xs font-medium text-red-600 hover:text-red-700"
//                                         >
//                                             Remove
//                                         </button>

//                                     </div>

//                                 </div>

//                             )
//                         )}

//                     </div>
//                 )}

//             </div>


//             {/* =========================================================
//                 ACTIONS
//             ========================================================= */}

//             <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

//                 {onCancel && (

//                     <button
//                         type="button"
//                         onClick={
//                             handleCancel
//                         }
//                         disabled={loading}
//                         className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                         Cancel
//                     </button>

//                 )}


//                 <button
//                     type="submit"
//                     disabled={loading}
//                     className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                     {loading
//                         ? isEditMode
//                             ? "Saving..."
//                             : "Creating..."
//                         : isEditMode
//                         ? "Save Changes"
//                         : "Create Bill Draft"}
//                 </button>

//             </div>

//         </form>
//     );
// };

// export default BillForm;











// frontend/src/features/finance/components/BillForm.jsx

import { useEffect, useMemo, useState } from "react";

import {
    createBill,
    updateBill,
} from "../services/bill.service";

const EXPENSE_CATEGORIES = [
    {
        value: "office-expense",
        label: "Office Expense",
    },
    {
        value: "travel-expense",
        label: "Travel Expense",
    },
    {
        value: "orientation",
        label: "Orientation",
    },
    {
        value: "stationery",
        label: "Stationery",
    },
];

const createEmptyExpense = () => ({
    category: "office-expense",
    amount: "",
    expenseDate: "",
    description: "",

    travel: {
        from: "",
        to: "",
        travelDate: "",
        purpose: "",
        modeOfTravel: "",
        distance: "",
    },
});

const initialVendor = {
    name: "",
    contact: "",
    address: "",
    gstNumber: "",
};

const formatDateForInput = (date) => {
    if (!date) {
        return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate
        .toISOString()
        .split("T")[0];
};

const normalizeExpense = (expense) => ({
    category:
        expense?.category ||
        "office-expense",

    amount:
        expense?.amount ??
        "",

    expenseDate:
        formatDateForInput(
            expense?.expenseDate
        ),

    description:
        expense?.description ||
        "",

    travel: {
        from:
            expense?.travel?.from ||
            "",

        to:
            expense?.travel?.to ||
            "",

        travelDate:
            formatDateForInput(
                expense?.travel?.travelDate
            ),

        purpose:
            expense?.travel?.purpose ||
            "",

        modeOfTravel:
            expense?.travel?.modeOfTravel ||
            "",

        distance:
            expense?.travel?.distance ??
            "",
    },
});

const getInitialBillData = (bill) => {
    if (!bill) {
        return {
            billNumber: "",
            title: "",
            description: "",
            billDate: "",
            currency: "INR",

            vendor: {
                ...initialVendor,
            },

            expenses: [
                createEmptyExpense(),
            ],
        };
    }

    return {
        billNumber:
            bill.billNumber ||
            "",

        title:
            bill.title ||
            "",

        description:
            bill.description ||
            "",

        billDate:
            formatDateForInput(
                bill.billDate
            ),

        currency:
            bill.currency ||
            "INR",

        vendor: {
            name:
                bill.vendor?.name ||
                "",

            contact:
                bill.vendor?.contact ||
                "",

            address:
                bill.vendor?.address ||
                "",

            gstNumber:
                bill.vendor?.gstNumber ||
                "",
        },

        expenses:
            Array.isArray(
                bill.expenses
            ) &&
            bill.expenses.length > 0
                ? bill.expenses.map(
                      normalizeExpense
                  )
                : [
                      createEmptyExpense(),
                  ],
    };
};

const BillForm = ({
    bill = null,
    isEditMode = false,
    onSuccess,
    onCancel,
}) => {
    const [
        billData,
        setBillData,
    ] = useState(
        getInitialBillData(bill)
    );

    const [
        attachments,
        setAttachments,
    ] = useState([]);

    const [
        existingAttachments,
        setExistingAttachments,
    ] = useState(
        bill?.attachments || []
    );

    /*
     * Existing attachment IDs which
     * user has selected for removal.
     *
     * Actual deletion happens only
     * after Save Changes.
     */
    const [
        removedAttachmentIds,
        setRemovedAttachmentIds,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    /*
     |--------------------------------------------------------------------------
     | LOAD BILL DATA FOR EDIT
     |--------------------------------------------------------------------------
     */

    useEffect(() => {
        if (
            isEditMode &&
            bill
        ) {
            setBillData(
                getInitialBillData(
                    bill
                )
            );

            setExistingAttachments(
                bill.attachments ||
                    []
            );

            setAttachments([]);

            setRemovedAttachmentIds([]);

            setError("");

            setSuccessMessage("");
        }
    }, [
        bill,
        isEditMode,
    ]);

    /*
     |--------------------------------------------------------------------------
     | TOTAL AMOUNT
     |--------------------------------------------------------------------------
     */

    const totalAmount = useMemo(() => {
        return billData.expenses.reduce(
            (
                total,
                expense
            ) => {
                return (
                    total +
                    Number(
                        expense.amount ||
                            0
                    )
                );
            },
            0
        );
    }, [
        billData.expenses,
    ]);

    /*
     |--------------------------------------------------------------------------
     | BILL FIELD CHANGE
     |--------------------------------------------------------------------------
     */

    const handleBillChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setBillData(
            (previous) => ({
                ...previous,

                [name]: value,
            })
        );
    };

    /*
     |--------------------------------------------------------------------------
     | VENDOR FIELD CHANGE
     |--------------------------------------------------------------------------
     */

    const handleVendorChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setBillData(
            (previous) => ({
                ...previous,

                vendor: {
                    ...previous.vendor,

                    [name]: value,
                },
            })
        );
    };

    /*
     |--------------------------------------------------------------------------
     | EXPENSE FIELD CHANGE
     |--------------------------------------------------------------------------
     */

    const handleExpenseChange = (
        expenseIndex,
        field,
        value
    ) => {
        setBillData(
            (previous) => {
                const expenses = [
                    ...previous.expenses,
                ];

                expenses[
                    expenseIndex
                ] = {
                    ...expenses[
                        expenseIndex
                    ],

                    [field]: value,
                };

                return {
                    ...previous,

                    expenses,
                };
            }
        );
    };

    /*
     |--------------------------------------------------------------------------
     | TRAVEL FIELD CHANGE
     |--------------------------------------------------------------------------
     */

    const handleTravelChange = (
        expenseIndex,
        field,
        value
    ) => {
        setBillData(
            (previous) => {
                const expenses = [
                    ...previous.expenses,
                ];

                expenses[
                    expenseIndex
                ] = {
                    ...expenses[
                        expenseIndex
                    ],

                    travel: {
                        ...expenses[
                            expenseIndex
                        ].travel,

                        [field]: value,
                    },
                };

                return {
                    ...previous,

                    expenses,
                };
            }
        );
    };

    /*
     |--------------------------------------------------------------------------
     | ADD EXPENSE
     |--------------------------------------------------------------------------
     */

    const handleAddExpense = () => {
        setBillData(
            (previous) => ({
                ...previous,

                expenses: [
                    ...previous.expenses,

                    createEmptyExpense(),
                ],
            })
        );
    };

    /*
     |--------------------------------------------------------------------------
     | REMOVE EXPENSE
     |--------------------------------------------------------------------------
     */

    const handleRemoveExpense = (
        expenseIndex
    ) => {
        if (
            billData.expenses.length ===
            1
        ) {
            return;
        }

        setBillData(
            (previous) => ({
                ...previous,

                expenses:
                    previous.expenses.filter(
                        (
                            _,
                            index
                        ) =>
                            index !==
                            expenseIndex
                    ),
            })
        );
    };

    /*
     |--------------------------------------------------------------------------
     | ATTACHMENT CHANGE
     |--------------------------------------------------------------------------
     */

    const handleAttachmentChange = (
        event
    ) => {
        const selectedFiles =
            Array.from(
                event.target.files ||
                    []
            );

        const totalAttachments =
            existingAttachments.length +
            attachments.length +
            selectedFiles.length;

        if (
            totalAttachments >
            10
        ) {
            setError(
                "Maximum 10 attachments are allowed"
            );

            event.target.value =
                "";

            return;
        }

        setError("");

        setAttachments(
            (previous) => [
                ...previous,
                ...selectedFiles,
            ]
        );

        event.target.value =
            "";
    };

    /*
     |--------------------------------------------------------------------------
     | REMOVE NEW ATTACHMENT
     |--------------------------------------------------------------------------
     */

    const handleRemoveAttachment = (
        attachmentIndex
    ) => {
        setAttachments(
            (previous) =>
                previous.filter(
                    (
                        _,
                        index
                    ) =>
                        index !==
                        attachmentIndex
                )
        );
    };

    /*
     |--------------------------------------------------------------------------
     | REMOVE EXISTING ATTACHMENT
     |--------------------------------------------------------------------------
     |
     | This only marks the attachment
     | for deletion.
     |
     | Actual Spaces + MongoDB deletion
     | happens when Save Changes is clicked.
     |
     */

    const handleRemoveExistingAttachment = (
        attachment
    ) => {
        if (!attachment?._id) {
            return;
        }

        setExistingAttachments(
            (previous) =>
                previous.filter(
                    (item) =>
                        item._id !==
                        attachment._id
                )
        );

        setRemovedAttachmentIds(
            (previous) => {
                if (
                    previous.includes(
                        attachment._id
                    )
                ) {
                    return previous;
                }

                return [
                    ...previous,
                    attachment._id,
                ];
            }
        );
    };

    /*
     |--------------------------------------------------------------------------
     | VALIDATION
     |--------------------------------------------------------------------------
     */

    const validateForm = () => {
        if (
            !billData.billNumber.trim()
        ) {
            return "Bill number is required";
        }

        if (
            !billData.title.trim()
        ) {
            return "Bill title is required";
        }

        if (!billData.billDate) {
            return "Bill date is required";
        }

        if (
            !billData.expenses ||
            billData.expenses.length ===
                0
        ) {
            return "At least one expense item is required";
        }

        for (
            let index = 0;
            index <
            billData.expenses.length;
            index++
        ) {
            const expense =
                billData.expenses[
                    index
                ];

            const expenseNumber =
                index + 1;

            if (
                !expense.category
            ) {
                return `Expense ${expenseNumber}: category is required`;
            }

            if (
                expense.amount ===
                    "" ||
                expense.amount ===
                    null ||
                Number(
                    expense.amount
                ) < 0
            ) {
                return `Expense ${expenseNumber}: valid amount is required`;
            }

            if (
                !expense.expenseDate
            ) {
                return `Expense ${expenseNumber}: expense date is required`;
            }

            if (
                expense.category ===
                "travel-expense"
            ) {
                if (
                    !expense.travel?.from?.trim()
                ) {
                    return `Expense ${expenseNumber}: from is required for travel expense`;
                }

                if (
                    !expense.travel?.to?.trim()
                ) {
                    return `Expense ${expenseNumber}: to is required for travel expense`;
                }

                if (
                    !expense.travel?.travelDate
                ) {
                    return `Expense ${expenseNumber}: travel date is required`;
                }

                if (
                    !expense.travel?.purpose?.trim()
                ) {
                    return `Expense ${expenseNumber}: purpose is required for travel expense`;
                }
            }
        }

        if (
            existingAttachments.length +
                attachments.length >
            10
        ) {
            return "Maximum 10 attachments are allowed";
        }

        return null;
    };

    /*
     |--------------------------------------------------------------------------
     | SUBMIT
     |--------------------------------------------------------------------------
     */

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError("");

        setSuccessMessage("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(
                validationError
            );

            return;
        }

        try {
            setLoading(true);

            const formData =
                new FormData();

            /*
             * Basic bill fields
             */

            formData.append(
                "billNumber",
                billData.billNumber.trim()
            );

            formData.append(
                "title",
                billData.title.trim()
            );

            formData.append(
                "description",
                billData.description.trim()
            );

            formData.append(
                "billDate",
                billData.billDate
            );

            formData.append(
                "currency",
                billData.currency ||
                    "INR"
            );

            /*
             * Expenses
             */

            formData.append(
                "expenses",
                JSON.stringify(
                    billData.expenses
                )
            );

            /*
             * Vendor
             */

            formData.append(
                "vendor",
                JSON.stringify(
                    billData.vendor
                )
            );

            /*
             * Existing attachments
             * selected for removal.
             */

            if (
                isEditMode &&
                removedAttachmentIds.length >
                    0
            ) {
                formData.append(
                    "removedAttachmentIds",
                    JSON.stringify(
                        removedAttachmentIds
                    )
                );
            }

            /*
             * New attachments
             */

            attachments.forEach(
                (file) => {
                    formData.append(
                        "attachments",
                        file
                    );
                }
            );

            let response;

            /*
             * CREATE
             */

            if (
                !isEditMode
            ) {
                response =
                    await createBill(
                        formData
                    );
            }

            /*
             * UPDATE
             */

            if (
                isEditMode &&
                bill?._id
            ) {
                response =
                    await updateBill(
                        bill._id,
                        formData
                    );
            }

            setSuccessMessage(
                response?.message ||
                    (isEditMode
                        ? "Bill updated successfully"
                        : "Bill created successfully")
            );

            /*
             * Notify parent.
             */

            if (onSuccess) {
                await onSuccess(
                    response?.data
                );
            }

            /*
             * Reset only after
             * creating a new bill.
             */

            if (
                !isEditMode
            ) {
                setBillData({
                    billNumber:
                        "",
                    title:
                        "",
                    description:
                        "",
                    billDate:
                        "",
                    currency:
                        "INR",

                    vendor: {
                        ...initialVendor,
                    },

                    expenses: [
                        createEmptyExpense(),
                    ],
                });

                setAttachments([]);

                setExistingAttachments([]);

                setRemovedAttachmentIds([]);
            }
        } catch (err) {
            console.error(
                isEditMode
                    ? "UPDATE BILL ERROR:"
                    : "CREATE BILL ERROR:",
                err
            );

            setError(
                err.response?.data
                    ?.message ||
                    (isEditMode
                        ? "Failed to update bill"
                        : "Failed to create bill")
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     |--------------------------------------------------------------------------
     | CANCEL
     |--------------------------------------------------------------------------
     */

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    /*
     |--------------------------------------------------------------------------
     | RENDER
     |--------------------------------------------------------------------------
     */

    return (
        <form
            onSubmit={
                handleSubmit
            }
            className="space-y-6"
        >
            {/* =========================================================
                ERROR
            ========================================================= */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* =========================================================
                SUCCESS
            ========================================================= */}

            {successMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {
                        successMessage
                    }
                </div>
            )}

            {/* =========================================================
                BILL INFORMATION
            ========================================================= */}

            <div className="rounded-xl border bg-white p-5 shadow-sm">

                <div className="mb-5">

                    <h2 className="text-lg font-semibold text-gray-800">
                        {isEditMode
                            ? "Edit Bill"
                            : "Bill Information"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {isEditMode
                            ? "Update the bill details and save your changes."
                            : "Enter the basic details of the bill."}
                    </p>

                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Bill Number */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Bill Number

                            <span className="text-red-500">
                                {" "}
                                *
                            </span>
                        </label>

                        <input
                            type="text"
                            name="billNumber"
                            value={
                                billData.billNumber
                            }
                            onChange={
                                handleBillChange
                            }
                            placeholder="Enter bill number"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                    </div>

                    {/* Bill Date */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Bill Date

                            <span className="text-red-500">
                                {" "}
                                *
                            </span>
                        </label>

                        <input
                            type="date"
                            name="billDate"
                            value={
                                billData.billDate
                            }
                            onChange={
                                handleBillChange
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                    </div>

                    {/* Title */}

                    <div className="md:col-span-2">

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Bill Title

                            <span className="text-red-500">
                                {" "}
                                *
                            </span>
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={
                                billData.title
                            }
                            onChange={
                                handleBillChange
                            }
                            placeholder="Enter bill title"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                    </div>

                    {/* Description */}

                    <div className="md:col-span-2">

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                billData.description
                            }
                            onChange={
                                handleBillChange
                            }
                            rows={3}
                            placeholder="Enter bill description"
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                    </div>

                    {/* Currency */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Currency
                        </label>

                        <input
                            type="text"
                            name="currency"
                            value={
                                billData.currency
                            }
                            onChange={
                                handleBillChange
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500"
                        />

                    </div>

                </div>

            </div>

            {/* =========================================================
                VENDOR
            ========================================================= */}

            <div className="rounded-xl border bg-white p-5 shadow-sm">

                <div className="mb-5">

                    <h2 className="text-lg font-semibold text-gray-800">
                        Vendor Details
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Vendor information is optional.
                    </p>

                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Vendor Name */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Vendor Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={
                                billData.vendor
                                    .name
                            }
                            onChange={
                                handleVendorChange
                            }
                            placeholder="Enter vendor name"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                    </div>

                    {/* Vendor Contact */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Vendor Contact
                        </label>

                        <input
                            type="text"
                            name="contact"
                            value={
                                billData.vendor
                                    .contact
                            }
                            onChange={
                                handleVendorChange
                            }
                            placeholder="Enter vendor contact"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                    </div>

                    {/* GST */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            GST Number
                        </label>

                        <input
                            type="text"
                            name="gstNumber"
                            value={
                                billData.vendor
                                    .gstNumber
                            }
                            onChange={
                                handleVendorChange
                            }
                            placeholder="Enter GST number"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500"
                        />

                    </div>

                    {/* Address */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Vendor Address
                        </label>

                        <input
                            type="text"
                            name="address"
                            value={
                                billData.vendor
                                    .address
                            }
                            onChange={
                                handleVendorChange
                            }
                            placeholder="Enter vendor address"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                    </div>

                </div>

            </div>

            {/* =========================================================
                EXPENSES
            ========================================================= */}

            <div className="rounded-xl border bg-white p-5 shadow-sm">

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h2 className="text-lg font-semibold text-gray-800">
                            Expense Items
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Add one or more expense items to this bill.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={
                            handleAddExpense
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Add Expense
                    </button>

                </div>

                <div className="space-y-5">

                    {billData.expenses.map(
                        (
                            expense,
                            expenseIndex
                        ) => (

                            <div
                                key={
                                    expenseIndex
                                }
                                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                            >

                                <div className="mb-4 flex items-center justify-between">

                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Expense #
                                        {
                                            expenseIndex +
                                            1
                                        }
                                    </h3>

                                    {billData
                                        .expenses
                                        .length >
                                        1 && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveExpense(
                                                    expenseIndex
                                                )
                                            }
                                            className="text-sm font-medium text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>

                                    )}

                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    {/* Category */}

                                    <div>

                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Category

                                            <span className="text-red-500">
                                                {" "}
                                                *
                                            </span>
                                        </label>

                                        <select
                                            value={
                                                expense.category
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleExpenseChange(
                                                    expenseIndex,
                                                    "category",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        >

                                            {EXPENSE_CATEGORIES.map(
                                                (
                                                    category
                                                ) => (

                                                    <option
                                                        key={
                                                            category.value
                                                        }
                                                        value={
                                                            category.value
                                                        }
                                                    >
                                                        {
                                                            category.label
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                    {/* Amount */}

                                    <div>

                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Amount

                                            <span className="text-red-500">
                                                {" "}
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                expense.amount
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleExpenseChange(
                                                    expenseIndex,
                                                    "amount",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter amount"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />

                                    </div>

                                    {/* Expense Date */}

                                    <div>

                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Expense Date

                                            <span className="text-red-500">
                                                {" "}
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                expense.expenseDate
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleExpenseChange(
                                                    expenseIndex,
                                                    "expenseDate",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />

                                    </div>

                                    {/* Expense Description */}

                                    <div>

                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Description
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                expense.description
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleExpenseChange(
                                                    expenseIndex,
                                                    "description",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter expense description"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />

                                    </div>

                                </div>

                                {/* TRAVEL DETAILS */}

                                {expense.category ===
                                    "travel-expense" && (

                                    <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">

                                        <h4 className="mb-4 text-sm font-semibold text-gray-800">
                                            Travel Details
                                        </h4>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                            {/* From */}

                                            <div>

                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    From

                                                    <span className="text-red-500">
                                                        {" "}
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="text"
                                                    value={
                                                        expense
                                                            .travel
                                                            .from
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleTravelChange(
                                                            expenseIndex,
                                                            "from",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Starting location"
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />

                                            </div>

                                            {/* To */}

                                            <div>

                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    To

                                                    <span className="text-red-500">
                                                        {" "}
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="text"
                                                    value={
                                                        expense
                                                            .travel
                                                            .to
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleTravelChange(
                                                            expenseIndex,
                                                            "to",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Destination"
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />

                                            </div>

                                            {/* Travel Date */}

                                            <div>

                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Travel Date

                                                    <span className="text-red-500">
                                                        {" "}
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="date"
                                                    value={
                                                        expense
                                                            .travel
                                                            .travelDate
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleTravelChange(
                                                            expenseIndex,
                                                            "travelDate",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />

                                            </div>

                                            {/* Mode */}

                                            <div>

                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Mode of Travel
                                                </label>

                                                <input
                                                    type="text"
                                                    value={
                                                        expense
                                                            .travel
                                                            .modeOfTravel
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleTravelChange(
                                                            expenseIndex,
                                                            "modeOfTravel",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Bus, Train, Cab, etc."
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />

                                            </div>

                                            {/* Distance */}

                                            <div>

                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Distance
                                                </label>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        expense
                                                            .travel
                                                            .distance
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleTravelChange(
                                                            expenseIndex,
                                                            "distance",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Distance"
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />

                                            </div>

                                            {/* Purpose */}

                                            <div>

                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Purpose

                                                    <span className="text-red-500">
                                                        {" "}
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="text"
                                                    value={
                                                        expense
                                                            .travel
                                                            .purpose
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleTravelChange(
                                                            expenseIndex,
                                                            "purpose",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Purpose of travel"
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />

                                            </div>

                                        </div>

                                    </div>

                                )}

                            </div>

                        )
                    )}

                </div>

                {/* TOTAL */}

                <div className="mt-5 flex justify-end">

                    <div className="rounded-lg bg-gray-100 px-5 py-3">

                        <span className="mr-4 text-sm text-gray-600">
                            Total Amount
                        </span>

                        <span className="text-lg font-bold text-gray-800">
                            ₹{" "}
                            {totalAmount.toFixed(
                                2
                            )}
                        </span>

                    </div>

                </div>

            </div>

            {/* =========================================================
                ATTACHMENTS
            ========================================================= */}

            <div className="rounded-xl border bg-white p-5 shadow-sm">

                <div className="mb-5">

                    <h2 className="text-lg font-semibold text-gray-800">
                        Attachments
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Upload supporting PDF or image documents. Maximum 10 files.
                    </p>

                </div>

                {/* Existing attachments */}

                {isEditMode &&
                    existingAttachments.length >
                        0 && (

                    <div className="mb-5">

                        <p className="mb-3 text-sm font-medium text-gray-700">
                            Existing Attachments
                        </p>

                        <div className="space-y-2">

                            {existingAttachments.map(
                                (
                                    attachment,
                                    index
                                ) => (

                                    <div
                                        key={
                                            attachment._id ||
                                            index
                                        }
                                        className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"
                                    >

                                        <span className="min-w-0 truncate text-gray-700">
                                            {
                                                attachment.fileName
                                            }
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveExistingAttachment(
                                                    attachment
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                            className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    </div>
                )}

                {/* Message when all existing
                    attachments were removed */}

                {isEditMode &&
                    bill?.attachments?.length >
                        0 &&
                    existingAttachments.length ===
                        0 &&
                    removedAttachmentIds.length >
                        0 && (

                    <div className="mb-5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
                        All existing attachments have been marked for removal. Click "Save Changes" to permanently delete them.
                    </div>
                )}

                <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={
                        handleAttachmentChange
                    }
                    className="block w-full rounded-lg border border-gray-300 bg-white text-sm file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm"
                />

                {/* New attachments */}

                {attachments.length >
                    0 && (

                    <div className="mt-4 space-y-2">

                        <p className="text-sm font-medium text-gray-700">
                            New Attachments
                        </p>

                        {attachments.map(
                            (
                                file,
                                index
                            ) => (

                                <div
                                    key={`${file.name}-${index}`}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                                >

                                    <span className="truncate text-gray-700">
                                        {
                                            file.name
                                        }
                                    </span>

                                    <div className="ml-3 flex items-center gap-3">

                                        <span className="shrink-0 text-xs text-gray-500">
                                            {(
                                                file.size /
                                                1024 /
                                                1024
                                            ).toFixed(
                                                2
                                            )}{" "}
                                            MB
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveAttachment(
                                                    index
                                                )
                                            }
                                            className="text-xs font-medium text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>
                )}

            </div>

            {/* =========================================================
                ACTIONS
            ========================================================= */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                {onCancel && (

                    <button
                        type="button"
                        onClick={
                            handleCancel
                        }
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? isEditMode
                            ? "Saving..."
                            : "Creating..."
                        : isEditMode
                        ? "Save Changes"
                        : "Create Bill Draft"}
                </button>

            </div>

        </form>
    );
};

export default BillForm;