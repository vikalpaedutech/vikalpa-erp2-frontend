import React from "react";

function AttendanceTable({
    students = [],
    loading = false,
    updatingEnrollmentIds = [],
    onMarkAttendance,
}) {
    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                    Loading attendance...
                </p>
            </div>
        );
    }

    if (!students.length) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-medium text-gray-600">
                    No students found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                    Try changing the selected filters.
                </p>
            </div>
        );
    }

    const isUpdating = (enrollmentId) => {
        return updatingEnrollmentIds.includes(
            String(enrollmentId)
        );
    };

    const getStudentName = (student) => {
        return (
            student?.student?.name ||
            student?.student?.studentName ||
            "-"
        );
    };

    const getFatherName = (student) => {
        return (
            student?.student?.fatherName ||
            "-"
        );
    };

    const getStatus = (student) => {
        return student?.attendance?.status || "Absent";
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Student
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Father Name
                            </th>

                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Attendance
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                        {students.map((student, index) => {
                            const status = getStatus(student);

                            const enrollmentId =
                                student?.enrollmentId;

                            const updating =
                                isUpdating(enrollmentId);

                            const isPresent =
                                status === "Present";

                            return (
                                <tr
                                    key={
                                        enrollmentId ||
                                        student?.studentId ||
                                        index
                                    }
                                    className="hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-800">
                                        {getStudentName(student)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">
                                        {getFatherName(student)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-3 text-center">
                                        <button
                                            type="button"
                                            disabled={updating}
                                            onClick={() =>
                                                onMarkAttendance?.(
                                                    student,
                                                    isPresent
                                                        ? "Absent"
                                                        : "Present"
                                                )
                                            }
                                            title={
                                                isPresent
                                                    ? "Click to mark Absent"
                                                    : "Click to mark Present"
                                            }
                                            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                                                isPresent
                                                    ? "bg-green-600 text-white hover:bg-green-700"
                                                    : "bg-red-600 text-white hover:bg-red-700"
                                            } ${
                                                updating
                                                    ? "cursor-not-allowed opacity-50"
                                                    : ""
                                            }`}
                                        >
                                            {updating
                                                ? "..."
                                                : isPresent
                                                ? "P"
                                                : "A"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AttendanceTable;