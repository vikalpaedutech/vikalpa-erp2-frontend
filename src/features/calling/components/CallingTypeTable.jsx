import { useState } from "react";

import {
    deleteCallingType,
} from "../services/calling.service";


const CallingTypeTable = ({
    callingTypes = [],
    loading = false,
    onEdit,
    onRefresh,
}) => {
    const [deletingId, setDeletingId] =
        useState(null);

    const handleDelete = async (callingType) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${callingType.callingTitle}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(callingType._id);

            await deleteCallingType(
                callingType._id
            );

            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            window.alert(
                error.response?.data?.message ||
                "Failed to delete calling type"
            );
        } finally {
            setDeletingId(null);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                Loading calling types...
            </div>
        );
    }


    if (!callingTypes.length) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
                <p className="text-sm font-medium text-gray-700">
                    No calling types found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                    Create a calling type to get started.
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
                            Calling Title
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Code
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Calling To
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Calling Status
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Connected Remarks
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Not Connected Remarks
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Status
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Actions
                        </th>
                    </tr>
                </thead>


                <tbody className="divide-y divide-gray-200 bg-white">
                    {callingTypes.map(
                        (callingType, index) => (
                            <tr
                                key={
                                    callingType._id
                                }
                                className="hover:bg-gray-50"
                            >

                                {/* Number */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                    {index + 1}
                                </td>


                                {/* Title */}
                                <td className="px-4 py-3">
                                    <div className="max-w-xs">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {
                                                callingType.callingTitle
                                            }
                                        </p>

                                        {callingType.description && (
                                            <p className="mt-1 truncate text-xs text-gray-500">
                                                {
                                                    callingType.description
                                                }
                                            </p>
                                        )}
                                    </div>
                                </td>


                                {/* Code */}
                                <td className="whitespace-nowrap px-4 py-3">
                                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                        {
                                            callingType.callingTypeCode
                                        }
                                    </span>
                                </td>


                                {/* Calling To */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                    {
                                        callingType.callingTo ||
                                        "-"
                                    }
                                </td>


                                {/* Calling Status */}
                                <td className="px-4 py-3">
                                    <div className="flex max-w-xs flex-wrap gap-1">
                                        {callingType.callingStatus?.length ? (
                                            callingType.callingStatus.map(
                                                (
                                                    status
                                                ) => (
                                                    <span
                                                        key={
                                                            status
                                                        }
                                                        className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                                                    >
                                                        {
                                                            status
                                                        }
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                -
                                            </span>
                                        )}
                                    </div>
                                </td>


                                {/* Connected Remarks */}
                                <td className="px-4 py-3">
                                    <div className="max-w-xs space-y-1">
                                        {callingType.callingRemark?.connected?.length ? (
                                            callingType.callingRemark.connected.map(
                                                (
                                                    remark,
                                                    remarkIndex
                                                ) => (
                                                    <div
                                                        key={`${remark}-${remarkIndex}`}
                                                        className="text-sm text-gray-700"
                                                    >
                                                        •{" "}
                                                        {
                                                            remark
                                                        }
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                -
                                            </span>
                                        )}
                                    </div>
                                </td>


                                {/* Not Connected Remarks */}
                                <td className="px-4 py-3">
                                    <div className="max-w-xs space-y-1">
                                        {callingType.callingRemark?.notConnected?.length ? (
                                            callingType.callingRemark.notConnected.map(
                                                (
                                                    remark,
                                                    remarkIndex
                                                ) => (
                                                    <div
                                                        key={`${remark}-${remarkIndex}`}
                                                        className="text-sm text-gray-700"
                                                    >
                                                        •{" "}
                                                        {
                                                            remark
                                                        }
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                -
                                            </span>
                                        )}
                                    </div>
                                </td>


                                {/* Active Status */}
                                <td className="whitespace-nowrap px-4 py-3">
                                    {callingType.isActive ? (
                                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                                            Inactive
                                        </span>
                                    )}
                                </td>


                                {/* Actions */}
                                <td className="whitespace-nowrap px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onEdit?.(
                                                    callingType
                                                )
                                            }
                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    callingType
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                callingType._id
                                            }
                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deletingId ===
                                            callingType._id
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


export default CallingTypeTable;