import { useState } from "react";

import {
    deleteCallingDetails,
} from "../services/calling.service";


const CallingDetailsTable = ({
    callingDetails = [],
    loading = false,
    onView,
    onEdit,
    onRefresh,
}) => {
    const [deletingId, setDeletingId] =
        useState(null);


    const handleDelete = async (callingDetail) => {
        if (!callingDetail?._id) {
            window.alert(
                "Unable to delete calling details because the record ID is missing."
            );
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this calling detail?"
            );

        if (!confirmed) {
            return;
        }


        try {
            setDeletingId(
                callingDetail._id
            );

            await deleteCallingDetails(
                callingDetail._id
            );

            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            window.alert(
                error.response?.data?.message ||
                "Failed to delete calling details"
            );
        } finally {
            setDeletingId(null);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                Loading calling details...
            </div>
        );
    }


    if (!Array.isArray(callingDetails) || !callingDetails.length) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
                <p className="text-sm font-medium text-gray-700">
                    No calling details found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                    No calling records are available.
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
                            Called To
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Father
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Contact 1
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Contact 2
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Status
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Assigned To
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Actions
                        </th>

                    </tr>
                </thead>


                <tbody className="divide-y divide-gray-200 bg-white">

                    {callingDetails.map(
                        (
                            callingDetail,
                            index
                        ) => {

                            /*
                             * Safely handle unexpected null records.
                             */
                            if (!callingDetail) {
                                return (
                                    <tr
                                        key={`empty-calling-detail-${index}`}
                                        className="hover:bg-gray-50"
                                    >
                                        <td
                                            colSpan={9}
                                            className="px-4 py-3 text-center text-sm text-gray-400"
                                        >
                                            Invalid calling record
                                        </td>
                                    </tr>
                                );
                            }


                            /*
                             * callingTypeId can be:
                             *
                             * 1. Populated object
                             * 2. ObjectId/string
                             * 3. null
                             *
                             * Never directly access a property
                             * without checking that the object exists.
                             */
                            const callingType =
                                callingDetail.callingTypeId;

                            const isCallingTypeObject =
                                callingType !== null &&
                                callingType !== undefined &&
                                typeof callingType === "object";


                            const callingTitle =
                                isCallingTypeObject
                                    ? callingType.callingTitle || "-"
                                    : callingType || "-";


                            const callingTypeCode =
                                isCallingTypeObject
                                    ? callingType.callingTypeCode || ""
                                    : "";


                            /*
                             * assignedTo can be:
                             *
                             * - array
                             * - null
                             * - undefined
                             *
                             * Normalize everything to an array.
                             */
                            const assignedUsers =
                                Array.isArray(
                                    callingDetail.assignedTo
                                )
                                    ? callingDetail.assignedTo
                                    : [];


                            return (
                                <tr
                                    key={
                                        callingDetail._id ||
                                        `calling-detail-${index}`
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
                                                {callingTitle}
                                            </p>

                                            {callingTypeCode && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {callingTypeCode}
                                                </p>
                                            )}
                                        </div>
                                    </td>


                                    {/* Called To */}
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                        {
                                            callingDetail.calledTo ||
                                            "-"
                                        }
                                    </td>


                                    {/* Father */}
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                        {
                                            callingDetail.father ||
                                            "-"
                                        }
                                    </td>


                                    {/* Contact 1 */}
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                        {
                                            callingDetail.contact1 ||
                                            "-"
                                        }
                                    </td>


                                    {/* Contact 2 */}
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                        {
                                            callingDetail.contact2 ||
                                            "-"
                                        }
                                    </td>


                                    {/* Calling Status */}
                                    <td className="whitespace-nowrap px-4 py-3">

                                        {callingDetail.callingStatus ? (
                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                {
                                                    callingDetail.callingStatus
                                                }
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                -
                                            </span>
                                        )}

                                    </td>


                                    {/* Assigned To */}
                                    <td className="px-4 py-3">

                                        {assignedUsers.length ? (
                                            <div className="space-y-1">
                                                {assignedUsers.map(
                                                    (
                                                        user,
                                                        userIndex
                                                    ) => {

                                                        if (
                                                            user === null ||
                                                            user === undefined
                                                        ) {
                                                            return (
                                                                <p
                                                                    key={`empty-user-${userIndex}`}
                                                                    className="text-sm text-gray-400"
                                                                >
                                                                    -
                                                                </p>
                                                            );
                                                        }


                                                        const isUserObject =
                                                            typeof user ===
                                                            "object";


                                                        const userName =
                                                            isUserObject
                                                                ? user.name ||
                                                                  user.email ||
                                                                  "-"
                                                                : user;


                                                        return (
                                                            <p
                                                                key={
                                                                    isUserObject &&
                                                                    user._id
                                                                        ? user._id
                                                                        : userIndex
                                                                }
                                                                className="text-sm text-gray-700"
                                                            >
                                                                {userName}
                                                            </p>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                Not Assigned
                                            </span>
                                        )}

                                    </td>


                                    {/* Actions */}
                                    <td className="whitespace-nowrap px-4 py-3 text-right">

                                        <div className="flex justify-end gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onView?.(
                                                        callingDetail
                                                    )
                                                }
                                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                View
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEdit?.(
                                                        callingDetail
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
                                                        callingDetail
                                                    )
                                                }
                                                disabled={
                                                    !callingDetail._id ||
                                                    deletingId ===
                                                    callingDetail._id
                                                }
                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deletingId ===
                                                callingDetail._id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>

                                        </div>

                                    </td>

                                </tr>
                            );
                        }
                    )}

                </tbody>

            </table>
        </div>
    );
};


export default CallingDetailsTable;