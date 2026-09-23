import { useEffect, useState } from "react";

import {
    createCallingType,
    updateCallingType,
} from "../services/calling.service";


const defaultFormData = {
    callingTitle: "",
    callingTypeCode: "",
    callingTo: "",
    description: "",
    callingStatus: [],
    callingRemark: {
        connected: [],
        notConnected: [],
    },
    isActive: true,
};


const availableStatuses = [
    "Connected",
    "Not Connected",
    "Wrong Number",
];


const CallingTypeForm = ({
    callingType = null,
    onSuccess,
    onCancel,
}) => {
    const isEditMode = Boolean(callingType);

    const [formData, setFormData] = useState(
        defaultFormData
    );

    const [connectedRemark, setConnectedRemark] =
        useState("");

    const [notConnectedRemark, setNotConnectedRemark] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);


    useEffect(() => {
        if (!callingType) {
            setFormData(defaultFormData);
            setConnectedRemark("");
            setNotConnectedRemark("");
            return;
        }

        setFormData({
            callingTitle:
                callingType.callingTitle || "",

            callingTypeCode:
                callingType.callingTypeCode || "",

            callingTo:
                callingType.callingTo || "",

            description:
                callingType.description || "",

            callingStatus:
                callingType.callingStatus || [],

            callingRemark: {
                connected:
                    callingType.callingRemark
                        ?.connected || [],

                notConnected:
                    callingType.callingRemark
                        ?.notConnected || [],
            },

            isActive:
                callingType.isActive !== undefined
                    ? callingType.isActive
                    : true,
        });

        setConnectedRemark("");
        setNotConnectedRemark("");
        setError(null);
    }, [callingType]);


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


    const handleStatusChange = (status) => {
        setFormData((previous) => {
            const alreadySelected =
                previous.callingStatus.includes(
                    status
                );

            return {
                ...previous,

                callingStatus:
                    alreadySelected
                        ? previous.callingStatus.filter(
                            (item) =>
                                item !== status
                        )
                        : [
                            ...previous.callingStatus,
                            status,
                        ],
            };
        });
    };


    const addConnectedRemark = () => {
        const value =
            connectedRemark.trim();

        if (!value) {
            return;
        }

        setFormData((previous) => ({
            ...previous,

            callingRemark: {
                ...previous.callingRemark,

                connected: [
                    ...previous.callingRemark.connected,
                    value,
                ],
            },
        }));

        setConnectedRemark("");
    };


    const removeConnectedRemark = (index) => {
        setFormData((previous) => ({
            ...previous,

            callingRemark: {
                ...previous.callingRemark,

                connected:
                    previous.callingRemark.connected.filter(
                        (_, itemIndex) =>
                            itemIndex !== index
                    ),
            },
        }));
    };


    const addNotConnectedRemark = () => {
        const value =
            notConnectedRemark.trim();

        if (!value) {
            return;
        }

        setFormData((previous) => ({
            ...previous,

            callingRemark: {
                ...previous.callingRemark,

                notConnected: [
                    ...previous.callingRemark.notConnected,
                    value,
                ],
            },
        }));

        setNotConnectedRemark("");
    };


    const removeNotConnectedRemark = (index) => {
        setFormData((previous) => ({
            ...previous,

            callingRemark: {
                ...previous.callingRemark,

                notConnected:
                    previous.callingRemark.notConnected.filter(
                        (_, itemIndex) =>
                            itemIndex !== index
                    ),
            },
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError(null);


            const payload = {
                callingTitle:
                    formData.callingTitle.trim(),

                callingTypeCode:
                    formData.callingTypeCode.trim(),

                callingTo:
                    formData.callingTo.trim(),

                description:
                    formData.description.trim(),

                callingStatus:
                    formData.callingStatus,

                callingRemark:
                    formData.callingRemark,

                isActive:
                    formData.isActive,
            };


            let response;

            if (isEditMode) {
                response =
                    await updateCallingType(
                        callingType._id,
                        payload
                    );
            } else {
                response =
                    await createCallingType(
                        payload
                    );
            }


            if (onSuccess) {
                onSuccess(response);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save calling type"
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}


            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Calling Title */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Calling Title
                    </label>

                    <input
                        type="text"
                        name="callingTitle"
                        value={
                            formData.callingTitle
                        }
                        onChange={handleChange}
                        required
                        placeholder="Enter calling title"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>


                {/* Calling Type Code */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Calling Type Code
                    </label>

                    <input
                        type="text"
                        name="callingTypeCode"
                        value={
                            formData.callingTypeCode
                        }
                        onChange={handleChange}
                        required
                        placeholder="e.g. ABSENT"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>


                {/* Calling To */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Calling To
                    </label>

                    <input
                        type="text"
                        name="callingTo"
                        value={
                            formData.callingTo
                        }
                        onChange={handleChange}
                        required
                        placeholder="e.g. Student / Parent"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>


                {/* Active */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Status
                    </label>

                    <select
                        name="isActive"
                        value={
                            formData.isActive
                                ? "true"
                                : "false"
                        }
                        onChange={(event) =>
                            setFormData(
                                (previous) => ({
                                    ...previous,
                                    isActive:
                                        event.target.value ===
                                        "true",
                                })
                            )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="true">
                            Active
                        </option>

                        <option value="false">
                            Inactive
                        </option>
                    </select>
                </div>
            </div>


            {/* Description */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                </label>

                <textarea
                    name="description"
                    value={
                        formData.description
                    }
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter description"
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>


            {/* Calling Status */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Calling Status
                </label>

                <div className="flex flex-wrap gap-3">
                    {availableStatuses.map(
                        (status) => (
                            <label
                                key={status}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.callingStatus.includes(
                                        status
                                    )}
                                    onChange={() =>
                                        handleStatusChange(
                                            status
                                        )
                                    }
                                />

                                <span>
                                    {status}
                                </span>
                            </label>
                        )
                    )}
                </div>
            </div>


            {/* Connected Remarks */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Connected Remarks
                </label>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={
                            connectedRemark
                        }
                        onChange={(event) =>
                            setConnectedRemark(
                                event.target.value
                            )
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                "Enter"
                            ) {
                                event.preventDefault();
                                addConnectedRemark();
                            }
                        }}
                        placeholder="Enter connected remark"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    <button
                        type="button"
                        onClick={
                            addConnectedRemark
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>


                {formData.callingRemark.connected.length >
                    0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {formData.callingRemark.connected.map(
                            (
                                remark,
                                index
                            ) => (
                                <div
                                    key={`${remark}-${index}`}
                                    className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                                >
                                    <span>
                                        {remark}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeConnectedRemark(
                                                index
                                            )
                                        }
                                        className="font-bold text-blue-500 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>


            {/* Not Connected Remarks */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Not Connected Remarks
                </label>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={
                            notConnectedRemark
                        }
                        onChange={(event) =>
                            setNotConnectedRemark(
                                event.target.value
                            )
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                "Enter"
                            ) {
                                event.preventDefault();
                                addNotConnectedRemark();
                            }
                        }}
                        placeholder="Enter not connected remark"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    <button
                        type="button"
                        onClick={
                            addNotConnectedRemark
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>


                {formData.callingRemark.notConnected.length >
                    0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {formData.callingRemark.notConnected.map(
                            (
                                remark,
                                index
                            ) => (
                                <div
                                    key={`${remark}-${index}`}
                                    className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                                >
                                    <span>
                                        {remark}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeNotConnectedRemark(
                                                index
                                            )
                                        }
                                        className="font-bold text-gray-500 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}
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
                            ? "Update Calling Type"
                            : "Create Calling Type"}
                </button>
            </div>
        </form>
    );
};


export default CallingTypeForm;