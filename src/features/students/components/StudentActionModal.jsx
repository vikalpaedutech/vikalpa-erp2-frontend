import React from "react";

function StudentActionModal({
    open,
    actionType,
    student,
    districts,
    blocks,
    centers,
    selectedDistrictId,
    selectedBlockId,
    selectedCenterId,
    requestReason,
    loading,
    onDistrictChange,
    onBlockChange,
    onCenterChange,
    onReasonChange,
    onClose,
    onSubmit,
}) {
    if (!open) {
        return null;
    }

    const getTitle = () => {
        if (actionType === "remove") {
            return "Request Student Removal";
        }

        if (actionType === "slc") {
            return "Request SLC";
        }

        if (actionType === "transfer") {
            return "Request Student Transfer";
        }

        return "Student Action";
    };

    const getButtonText = () => {
        if (loading) {
            return "Submitting...";
        }

        if (actionType === "remove") {
            return "Submit Remove Request";
        }

        if (actionType === "slc") {
            return "Submit SLC Request";
        }

        if (actionType === "transfer") {
            return "Submit Transfer Request";
        }

        return "Submit Request";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {getTitle()}
                        </h2>

                        {student && (
                            <p className="mt-1 text-sm text-gray-500">
                                {student.student?.name || "-"}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-gray-500 hover:text-gray-800"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5 p-6">

                    {actionType === "transfer" && (
                        <div className="space-y-4">

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    District
                                </label>

                                <select
                                    value={selectedDistrictId}
                                    onChange={(e) =>
                                        onDistrictChange(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        Select District
                                    </option>

                                    {districts.map((district) => (
                                        <option
                                            key={district._id}
                                            value={district._id}
                                        >
                                            {district.districtName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Block
                                </label>

                                <select
                                    value={selectedBlockId}
                                    onChange={(e) =>
                                        onBlockChange(e.target.value)
                                    }
                                    disabled={!selectedDistrictId}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none disabled:bg-gray-100 focus:border-blue-500"
                                >
                                    <option value="">
                                        Select Block
                                    </option>

                                    {blocks.map((block) => (
                                        <option
                                            key={block._id}
                                            value={block._id}
                                        >
                                            {block.blockName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Center
                                </label>

                                <select
                                    value={selectedCenterId}
                                    onChange={(e) =>
                                        onCenterChange(e.target.value)
                                    }
                                    disabled={!selectedBlockId}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none disabled:bg-gray-100 focus:border-blue-500"
                                >
                                    <option value="">
                                        Select Center
                                    </option>

                                    {centers.map((center) => (
                                        <option
                                            key={center._id}
                                            value={center._id}
                                        >
                                            {center.centerName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Request Reason
                        </label>

                        <textarea
                            value={requestReason}
                            onChange={(e) =>
                                onReasonChange(e.target.value)
                            }
                            rows={4}
                            placeholder="Enter reason for this request..."
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {getButtonText()}
                    </button>

                </div>

            </div>
        </div>
    );
}

export default StudentActionModal;