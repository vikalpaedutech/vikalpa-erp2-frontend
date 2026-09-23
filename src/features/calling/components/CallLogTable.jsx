import { useState } from "react";

import {
    deleteCallLog,
} from "../services/calling.service";


const CallLogTable = ({
    callLogs = [],
    loading = false,
    onEdit,
    onRefresh,
}) => {
    const [deletingId, setDeletingId] =
        useState(null);


    const handleDelete = async (callLog) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this call log?"
            );

        if (!confirmed) {
            return;
        }


        try {
            setDeletingId(
                callLog._id
            );

            await deleteCallLog(
                callLog._id
            );

            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            window.alert(
                error.response?.data?.message ||
                "Failed to delete call log"
            );
        } finally {
            setDeletingId(null);
        }
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


    const getCallingTypeName = (
        callingType
    ) => {
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


    const getCalledByName = (
        calledBy
    ) => {
        if (!calledBy) {
            return "-";
        }

        if (
            typeof calledBy ===
            "string"
        ) {
            return calledBy;
        }

        return (
            calledBy.name ||
            calledBy.email ||
            "-"
        );
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                Loading call logs...
            </div>
        );
    }


    if (!callLogs.length) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
                <p className="text-sm font-medium text-gray-700">
                    No call logs found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                    No call history is available.
                </p>
            </div>
        );
    }


    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">
                    <tr>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            #
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Calling Type
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Status
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Remark
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Follow-up Date
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Comment
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Called By
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Call Date
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Actions
                        </th>

                    </tr>
                </thead>


                <tbody className="divide-y divide-gray-200 bg-white">

                    {callLogs.map(
                        (
                            callLog,
                            index
                        ) => (
                            <tr
                                key={
                                    callLog._id
                                }
                                className="hover:bg-gray-50"
                            >

                                {/* Number */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                    {index + 1}
                                </td>


                                {/* Calling Type */}
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {getCallingTypeName(
                                                callLog.callingTypeId
                                            )}
                                        </p>

                                        {callLog.callingTypeId &&
                                            typeof callLog.callingTypeId ===
                                                "object" &&
                                            callLog.callingTypeId
                                                .callingTypeCode && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {
                                                        callLog.callingTypeId
                                                            .callingTypeCode
                                                    }
                                                </p>
                                            )}
                                    </div>
                                </td>


                                {/* Status */}
                                <td className="whitespace-nowrap px-4 py-3">
                                    {callLog.callingStatus ? (
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                            {
                                                callLog.callingStatus
                                            }
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400">
                                            -
                                        </span>
                                    )}
                                </td>


                                {/* Remark */}
                                <td className="px-4 py-3">
                                    <p className="max-w-xs truncate text-sm text-gray-700">
                                        {
                                            callLog.remark ||
                                            "-"
                                        }
                                    </p>
                                </td>


                                {/* Follow-up Date */}
                                <td className="whitespace-nowrap px-4 py-3">
                                    {callLog.followUpDate ? (
                                        <span className="text-sm font-medium text-gray-700">
                                            {formatDate(
                                                callLog.followUpDate
                                            )}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400">
                                            No follow-up
                                        </span>
                                    )}
                                </td>


                                {/* Comment */}
                                <td className="px-4 py-3">
                                    <p className="max-w-xs truncate text-sm text-gray-700">
                                        {
                                            callLog.comment ||
                                            "-"
                                        }
                                    </p>
                                </td>


                                {/* Called By */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                    {getCalledByName(
                                        callLog.calledBy
                                    )}
                                </td>


                                {/* Call Date */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                    {formatDateTime(
                                        callLog.createdAt
                                    )}
                                </td>


                                {/* Actions */}
                                <td className="whitespace-nowrap px-4 py-3 text-right">

                                    <div className="flex justify-end gap-2">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onEdit?.(
                                                    callLog
                                                )
                                            }
                                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                        >
                                            Edit
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    callLog
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                callLog._id
                                            }
                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deletingId ===
                                            callLog._id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>

                                    </div>

                                </td>

                            </tr>
                        )
                    )}

                </tbody>

            </table>
        </div>
    );
};


export default CallLogTable;