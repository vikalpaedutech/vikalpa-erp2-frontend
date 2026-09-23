import { useState } from "react";

import { getCallLogs } from "../services/calling.service";


const CallingDetailsView = ({
    callingDetails,
    onClose,
}) => {
    const [callLogs, setCallLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [logsLoaded, setLogsLoaded] = useState(false);
    const [error, setError] = useState(null);


    if (!callingDetails) {
        return (
            <div className="py-12 text-center">
                <p className="text-sm text-gray-500">
                    Calling details not found.
                </p>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Back
                    </button>
                )}
            </div>
        );
    }


    const callingType =
        callingDetails.callingTypeId;

    const assignedTo =
        Array.isArray(
            callingDetails.assignedTo
        )
            ? callingDetails.assignedTo
            : [];


    const getValue = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        if (
            typeof value === "object"
        ) {
            return (
                value.name ||
                value.email ||
                value._id ||
                "-"
            );
        }

        return value;
    };


    const getCallingTypeName = () => {
        if (!callingType) {
            return "-";
        }

        if (
            typeof callingType ===
            "string"
        ) {
            return callingType;
        }

        return (
            callingType.callingTitle ||
            callingType.callingTypeCode ||
            "-"
        );
    };


    const getUserName = (user) => {
        if (!user) {
            return "-";
        }

        if (
            typeof user ===
            "string"
        ) {
            return user;
        }

        return (
            user.name ||
            user.email ||
            user._id ||
            "-"
        );
    };


    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    const handleLoadCallLogs =
        async () => {
            if (logsLoaded) {
                return;
            }

            try {
                setLoadingLogs(true);
                setError(null);

                const response =
                    await getCallLogs({
                        callingDetailId:
                            callingDetails._id,
                        page: 1,
                        limit: 100,
                    });

                setCallLogs(
                    response.data?.callLogs ||
                    []
                );

                setLogsLoaded(true);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load call history"
                );
            } finally {
                setLoadingLogs(false);
            }
        };


    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">

                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Calling Details
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Complete information about this calling record.
                    </p>
                </div>


                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Back
                    </button>
                )}

            </div>


            {/* Calling Information */}
            <section>
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                    Calling Information
                </h3>


                <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-2 lg:grid-cols-3">

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Calling Type
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {getCallingTypeName()}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Calling Type Code
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                            {getValue(
                                callingType?.callingTypeCode
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Called To
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {getValue(
                                callingDetails.calledTo
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Calling Status
                        </p>

                        <p className="mt-1">
                            {callingDetails.callingStatus ? (
                                <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    {
                                        callingDetails.callingStatus
                                    }
                                </span>
                            ) : (
                                <span className="text-sm text-gray-400">
                                    -
                                </span>
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Created
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                            {formatDateTime(
                                callingDetails.createdAt
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Last Updated
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                            {formatDateTime(
                                callingDetails.updatedAt
                            )}
                        </p>
                    </div>

                </div>
            </section>


            {/* Student / Location Information */}
            <section>
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                    Student & Location Information
                </h3>


                <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-3">

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Student
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                            {getValue(
                                callingDetails.studentId
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Enrollment
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                            {getValue(
                                callingDetails.enrollmentId
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Father
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                            {getValue(
                                callingDetails.father
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            District
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                            {getValue(
                                callingDetails.calledDistrict
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Block
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                            {getValue(
                                callingDetails.calledBlock
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Center
                        </p>

                        <p className="mt-1 text-sm text-gray-900">
                            {getValue(
                                callingDetails.calledCenter
                            )}
                        </p>
                    </div>

                </div>
            </section>


            {/* Contact Information */}
            <section>
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                    Contact Information
                </h3>


                <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Contact 1
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {getValue(
                                callingDetails.contact1
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Contact 2
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {getValue(
                                callingDetails.contact2
                            )}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Contact 3
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {getValue(
                                callingDetails.contact3
                            )}
                        </p>
                    </div>

                </div>
            </section>


            {/* Assignment */}
            <section>
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                    Assigned Users
                </h3>


                <div className="rounded-xl border border-gray-200 bg-white p-4">

                    {assignedTo.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No users assigned.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">

                            {assignedTo.map(
                                (user, index) => (
                                    <span
                                        key={
                                            typeof user ===
                                            "object"
                                                ? user._id ||
                                                  index
                                                : user ||
                                                  index
                                        }
                                        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                                    >
                                        {getUserName(
                                            user
                                        )}
                                    </span>
                                )
                            )}

                        </div>
                    )}

                </div>
            </section>


            {/* Remark & Comment */}
            <section>
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                    Remarks & Comments
                </h3>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Remark
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                            {getValue(
                                callingDetails.remark
                            )}
                        </p>

                    </div>


                    <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Comment
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                            {getValue(
                                callingDetails.comment
                            )}
                        </p>

                    </div>

                </div>
            </section>


            {/* Additional Information */}
            <section>
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                    Additional Information
                </h3>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {Array.from(
                        { length: 10 },
                        (_, index) => {
                            const fieldName =
                                `additionalInformation${
                                    index + 1
                                }`;

                            const value =
                                callingDetails[
                                    fieldName
                                ];

                            if (
                                value === null ||
                                value === undefined
                            ) {
                                return null;
                            }

                            return (
                                <div
                                    key={
                                        fieldName
                                    }
                                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        {fieldName}
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">
                                        {typeof value ===
                                        "object"
                                            ? JSON.stringify(
                                                  value,
                                                  null,
                                                  2
                                              )
                                            : String(
                                                  value
                                              )}
                                    </p>
                                </div>
                            );
                        }
                    )}

                    {callingDetails.additionalInfo !==
                        null &&
                        callingDetails.additionalInfo !==
                            undefined && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Additional Info
                                </p>

                                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">
                                    {typeof callingDetails.additionalInfo ===
                                    "object"
                                        ? JSON.stringify(
                                              callingDetails.additionalInfo,
                                              null,
                                              2
                                          )
                                        : String(
                                              callingDetails.additionalInfo
                                          )}
                                </p>

                            </div>
                        )}

                    {callingDetails.callingData !==
                        null &&
                        callingDetails.callingData !==
                            undefined && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Calling Data
                                </p>

                                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">
                                    {typeof callingDetails.callingData ===
                                    "object"
                                        ? JSON.stringify(
                                              callingDetails.callingData,
                                              null,
                                              2
                                          )
                                        : String(
                                              callingDetails.callingData
                                          )}
                                </p>

                            </div>
                        )}

                </div>
            </section>


            {/* Call History */}
            <section>

                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Call History
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Previous calls made for this calling record.
                        </p>
                    </div>


                    {!logsLoaded && (
                        <button
                            type="button"
                            onClick={
                                handleLoadCallLogs
                            }
                            disabled={
                                loadingLogs
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loadingLogs
                                ? "Loading..."
                                : "Load Call History"}
                        </button>
                    )}

                </div>


                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}


                {logsLoaded && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">

                        {callLogs.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <p className="text-sm text-gray-500">
                                    No call history found.
                                </p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">

                                <thead className="bg-gray-50">
                                    <tr>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            #
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Remark
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Follow-up
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Comment
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Called By
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Date
                                        </th>

                                    </tr>
                                </thead>


                                <tbody className="divide-y divide-gray-200 bg-white">

                                    {callLogs.map(
                                        (
                                            log,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    log._id
                                                }
                                                className="hover:bg-gray-50"
                                            >

                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                    {index +
                                                        1}
                                                </td>


                                                <td className="whitespace-nowrap px-4 py-3">

                                                    {log.callingStatus ? (
                                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                            {
                                                                log.callingStatus
                                                            }
                                                        </span>
                                                    ) : (
                                                        "-"
                                                    )}

                                                </td>


                                                <td className="max-w-xs px-4 py-3 text-sm text-gray-700">
                                                    {getValue(
                                                        log.remark
                                                    )}
                                                </td>


                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                                    {formatDate(
                                                        log.followUpDate
                                                    )}
                                                </td>


                                                <td className="max-w-xs px-4 py-3 text-sm text-gray-700">
                                                    {getValue(
                                                        log.comment
                                                    )}
                                                </td>


                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                                    {getUserName(
                                                        log.calledBy
                                                    )}
                                                </td>


                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                    {formatDateTime(
                                                        log.createdAt
                                                    )}
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>
                        )}

                    </div>
                )}

            </section>


            {/* Footer */}
            <div className="flex justify-end border-t border-gray-200 pt-5">

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                )}

            </div>

        </div>
    );
};


export default CallingDetailsView;