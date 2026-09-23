import React from "react";

function StudentDetailsModal({
    open,
    student,
    loading,
    onClose,
    onAction,
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Student Details
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-gray-500 hover:text-gray-800"
                    >
                        ×
                    </button>
                </div>

                {/* ==================================================
                    LOADING
                ================================================== */}

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading student details...
                    </div>
                ) : student ? (
                    <div className="space-y-6 p-6">

                        {/* ==================================================
                            PERSONAL DETAILS
                        ================================================== */}

                        <div>
                            <h3 className="mb-3 font-semibold text-gray-800">
                                Personal Details
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Name
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.name || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        SRN
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.studentSrn || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Roll Number
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.rollNumber || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Father Name
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.fatherName || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Mother Name
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.motherName || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Gender
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.gender || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Date of Birth
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.dob
                                            ? new Date(
                                                student.student.dob
                                            ).toLocaleDateString()
                                            : "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Category
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.category || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Parent Contact
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.parentContact || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Personal Contact
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.personalContact || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Other Contact
                                    </p>

                                    <p className="font-medium">
                                        {student.student?.otherContact || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Student Status
                                    </p>

                                    <span
                                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                                            student.student?.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {student.student?.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ==================================================
                            STUDENT ACTIONS
                        ================================================== */}

                        <div className="border-t border-gray-200 pt-5">
                            <h3 className="mb-3 font-semibold text-gray-800">
                                Student Actions
                            </h3>

                            <div className="flex flex-wrap gap-3">

                                <button
                                    type="button"
                                    onClick={() => onAction("remove")}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Request Remove
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onAction("slc")}
                                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                                >
                                    Request SLC
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onAction("transfer")}
                                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                                >
                                    Request Transfer
                                </button>

                            </div>
                        </div>

                        {/* ==================================================
                            ENROLLMENTS
                        ================================================== */}

                        <div>
                            <h3 className="mb-3 font-semibold text-gray-800">
                                Enrollments
                            </h3>

                            {Array.isArray(student.enrollments) &&
                            student.enrollments.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left">
                                                    Program
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Batch
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    District
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Block
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Center
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Class
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    Status
                                                </th>

                                                <th className="px-4 py-3 text-left">
                                                    SLC
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {student.enrollments.map(
                                                (enrollment) => (
                                                    <tr
                                                        key={
                                                            enrollment._id
                                                        }
                                                    >
                                                        <td className="px-4 py-3">
                                                            {enrollment
                                                                .programId
                                                                ?.programName ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {enrollment
                                                                .batchId
                                                                ?.batchName ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {enrollment
                                                                .districtId
                                                                ?.districtName ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {enrollment
                                                                .blockId
                                                                ?.blockName ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {enrollment
                                                                .centerId
                                                                ?.centerName ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {enrollment.class ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {enrollment.status ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {enrollment.slcSubmitted
                                                                ? "Submitted"
                                                                : "Not Submitted"}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No enrollments found.
                                </p>
                            )}
                        </div>

                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default StudentDetailsModal;