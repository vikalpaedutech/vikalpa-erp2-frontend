import { useEffect, useState } from "react";

import {
    createCallLog,
    updateCallLog,
} from "../services/calling.service";


const defaultFormData = {
    callingStatus: "",
    remark: "",
    followUpDate: "",
    comment: "",
};


const CallLogForm = ({
    callingTypeId,
    callingDetailId,
    callLog = null,
    availableStatuses = [],
    availableRemarks = [],
    onSuccess,
    onCancel,
}) => {
    const isEditMode = Boolean(callLog);

    const [formData, setFormData] =
        useState(defaultFormData);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);


    useEffect(() => {
        if (!callLog) {
            setFormData(defaultFormData);
            setError(null);
            return;
        }

        setFormData({
            callingStatus:
                callLog.callingStatus || "",

            remark:
                callLog.remark || "",

            followUpDate:
                callLog.followUpDate
                    ? new Date(
                        callLog.followUpDate
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",

            comment:
                callLog.comment || "",
        });

        setError(null);
    }, [callLog]);


    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError(null);


            if (!formData.callingStatus) {
                setError(
                    "Please select calling status"
                );

                return;
            }


            const payload = {
                callingTypeId,
                callingDetailId,

                callingStatus:
                    formData.callingStatus,

                remark:
                    formData.remark.trim(),

                followUpDate:
                    formData.followUpDate
                        ? formData.followUpDate
                        : null,

                comment:
                    formData.comment.trim(),
            };


            let response;


            if (isEditMode) {
                response =
                    await updateCallLog(
                        callLog._id,
                        payload
                    );
            } else {
                response =
                    await createCallLog(
                        payload
                    );
            }


            if (onSuccess) {
                onSuccess(response);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save call log"
            );
        } finally {
            setLoading(false);
        }
    };


    const remarks =
        availableRemarks.length
            ? availableRemarks
            : [];


    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}


            {/* Calling Status */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Calling Status
                </label>

                <select
                    name="callingStatus"
                    value={
                        formData.callingStatus
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    <option value="">
                        Select calling status
                    </option>

                    {availableStatuses.map(
                        (status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>
                        )
                    )}
                </select>
            </div>


            {/* Remark */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Remark
                </label>

                {remarks.length > 0 ? (
                    <select
                        name="remark"
                        value={
                            formData.remark
                        }
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">
                            Select remark
                        </option>

                        {remarks.map(
                            (remark) => (
                                <option
                                    key={remark}
                                    value={remark}
                                >
                                    {remark}
                                </option>
                            )
                        )}
                    </select>
                ) : (
                    <input
                        type="text"
                        name="remark"
                        value={
                            formData.remark
                        }
                        onChange={handleChange}
                        placeholder="Enter remark"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                )}
            </div>


            {/* Follow Up Date */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Follow-up Date
                </label>

                <input
                    type="date"
                    name="followUpDate"
                    value={
                        formData.followUpDate
                    }
                    onChange={handleChange}
                    min={
                        new Date()
                            .toISOString()
                            .split("T")[0]
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>


            {/* Comment */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Comment
                </label>

                <textarea
                    name="comment"
                    value={
                        formData.comment
                    }
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter comment"
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>


            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Saving..."
                        : isEditMode
                            ? "Update Call Log"
                            : "Save Call Log"}
                </button>

            </div>

        </form>
    );
};


export default CallLogForm;