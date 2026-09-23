import React from "react";

function StudentTable({
    students,
    loading,
    pagination,
    onViewStudent,
}) {
    // ============================================================
    // HELPERS
    // ============================================================

    const getStudentName = (student) => {
        return (
            student?.name ||
            student?.student?.name ||
            "-"
        );
    };

    const getStudentSrn = (student) => {
        return (
            student?.studentSrn ||
            student?.student?.studentSrn ||
            "-"
        );
    };

    const getRollNumber = (student) => {
        return (
            student?.rollNumber ||
            student?.student?.rollNumber ||
            "-"
        );
    };

    const getEnrollment = (student) => {
        if (
            Array.isArray(student?.enrollments) &&
            student.enrollments.length > 0
        ) {
            return student.enrollments[0];
        }

        if (student?.enrollment) {
            return student.enrollment;
        }

        return null;
    };

    const getProgramName = (student) => {
        const enrollment = getEnrollment(student);

        return (
            enrollment?.programId?.programName ||
            enrollment?.program?.programName ||
            "-"
        );
    };

    const getBatchName = (student) => {
        const enrollment = getEnrollment(student);

        return (
            enrollment?.batchId?.batchName ||
            enrollment?.batch?.batchName ||
            "-"
        );
    };

    const getCenterName = (student) => {
        const enrollment = getEnrollment(student);

        return (
            enrollment?.centerId?.centerName ||
            enrollment?.center?.centerName ||
            "-"
        );
    };

    const getClass = (student) => {
        const enrollment = getEnrollment(student);

        return enrollment?.class || "-";
    };

    const getStatus = (student) => {
        const enrollment = getEnrollment(student);

        return enrollment?.status || "-";
    };

    const getStatusClass = (studentStatus) => {
        if (studentStatus === "active") {
            return "bg-green-100 text-green-700";
        }

        if (
            studentStatus === "left" ||
            studentStatus === "completed"
        ) {
            return "bg-gray-100 text-gray-700";
        }

        if (studentStatus?.includes("request")) {
            return "bg-yellow-100 text-yellow-700";
        }

        return "bg-blue-100 text-blue-700";
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                #
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                SRN
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                Roll No.
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                Student
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                Program
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                Batch
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                Center
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                Class
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                Status
                            </th>

                            <th className="px-4 py-3 text-right font-semibold text-gray-600">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="10"
                                    className="px-4 py-10 text-center text-gray-500"
                                >
                                    Loading students...
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="10"
                                    className="px-4 py-10 text-center text-gray-500"
                                >
                                    No students found.
                                </td>
                            </tr>
                        ) : (
                            students.map((student, index) => {
                                const studentStatus =
                                    getStatus(student);

                                return (
                                    <tr
                                        key={
                                            student._id ||
                                            student.student?._id
                                        }
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-gray-500">
                                            {(pagination.page - 1) *
                                                pagination.limit +
                                                index +
                                                1}
                                        </td>

                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {getStudentSrn(student)}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {getRollNumber(student)}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">
                                                {getStudentName(student)}
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                {student?.fatherName ||
                                                    student?.student
                                                        ?.fatherName ||
                                                    "-"}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {getProgramName(student)}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {getBatchName(student)}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {getCenterName(student)}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {getClass(student)}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                    studentStatus
                                                )}`}
                                            >
                                                {studentStatus}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onViewStudent(
                                                        student._id ||
                                                            student
                                                                .student?._id
                                                    )
                                                }
                                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StudentTable;