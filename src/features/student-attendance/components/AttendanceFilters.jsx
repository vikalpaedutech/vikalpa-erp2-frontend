// src/features/student-attendance/components/AttendanceFilters.jsx

import React from "react";

function AttendanceFilters({
    date,
    programId,
    batchId,
    districtId,
    blockId,
    centerId,

    programs,
    batches,
    districts,
    blocks,
    centers,

    showProgramFilter,
    showDistrictFilter,
    showBlockFilter,
    showCenterFilter,

    blockLoading,
    centerLoading,

    onDateChange,
    onProgramChange,
    onBatchChange,
    onDistrictChange,
    onBlockChange,
    onCenterChange,
    onSearch,
    onReset,
}) {
    const filterCount =
        3 +
        (showDistrictFilter ? 1 : 0) +
        (showBlockFilter ? 1 : 0) +
        (showCenterFilter ? 1 : 0);

    const gridColumns =
        filterCount >= 6
            ? "lg:grid-cols-4"
            : "lg:grid-cols-3";

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">
                        Attendance Filters
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Select the required filters to view attendance
                    </p>
                </div>

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={onReset}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={onSearch}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                    >
                        Search
                    </button>

                </div>
            </div>

            <div
                className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${gridColumns}`}
            >

                {/* ==================================================
                    DATE
                ================================================== */}

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Date
                    </label>

                    <input
                        type="date"
                        value={date}
                        onChange={(event) =>
                            onDateChange(
                                event.target.value
                            )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                {/* ==================================================
                    PROGRAM
                ================================================== */}

                {showProgramFilter && (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Program
                        </label>

                        <select
                            value={programId}
                            onChange={(event) =>
                                onProgramChange(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">
                                Select Program
                            </option>

                            {programs.map(
                                (program) => (
                                    <option
                                        key={
                                            program._id
                                        }
                                        value={
                                            program._id
                                        }
                                    >
                                        {
                                            program.programName
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                )}

                {/* ==================================================
                    BATCH
                ================================================== */}

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Batch
                    </label>

                    <select
                        value={batchId}
                        onChange={(event) =>
                            onBatchChange(
                                event.target.value
                            )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">
                            Select Batch
                        </option>

                        {batches.map(
                            (batch) => (
                                <option
                                    key={
                                        batch._id
                                    }
                                    value={
                                        batch._id
                                    }
                                >
                                    {
                                        batch.batchName
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* ==================================================
                    DISTRICT
                ================================================== */}

                {showDistrictFilter && (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            District
                        </label>

                        <select
                            value={districtId}
                            onChange={(event) =>
                                onDistrictChange(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">
                                Select District
                            </option>

                            {districts.map(
                                (district) => (
                                    <option
                                        key={
                                            district._id
                                        }
                                        value={
                                            district._id
                                        }
                                    >
                                        {
                                            district.districtName
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                )}

                {/* ==================================================
                    BLOCK
                ================================================== */}

                {showBlockFilter && (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Block
                        </label>

                        <select
                            value={blockId}
                            onChange={(event) =>
                                onBlockChange(
                                    event.target.value
                                )
                            }
                            disabled={
                                blockLoading ||
                                (
                                    showDistrictFilter &&
                                    !districtId
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none disabled:bg-gray-100 focus:border-blue-500"
                        >
                            <option value="">
                                {blockLoading
                                    ? "Loading blocks..."
                                    : "Select Block"}
                            </option>

                            {blocks.map(
                                (block) => (
                                    <option
                                        key={
                                            block._id
                                        }
                                        value={
                                            block._id
                                        }
                                    >
                                        {
                                            block.blockName
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                )}

                {/* ==================================================
                    CENTER
                ================================================== */}

                {showCenterFilter && (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Center
                        </label>

                        <select
                            value={centerId}
                            onChange={(event) =>
                                onCenterChange(
                                    event.target.value
                                )
                            }
                            disabled={
                                centerLoading ||
                                (
                                    showBlockFilter &&
                                    !blockId
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none disabled:bg-gray-100 focus:border-blue-500"
                        >
                            <option value="">
                                {centerLoading
                                    ? "Loading centers..."
                                    : "Select Center"}
                            </option>

                            {centers.map(
                                (center) => (
                                    <option
                                        key={
                                            center._id
                                        }
                                        value={
                                            center._id
                                        }
                                    >
                                        {
                                            center.centerName
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                )}

            </div>
        </div>
    );
}

export default AttendanceFilters;