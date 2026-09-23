// src/features/student-attendance/pages/StudentAttendance.jsx

import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import AttendanceFilters from "../components/AttendanceFilters";
import AttendanceSummary from "../components/AttendanceSummary";
import AttendanceTable from "../components/AttendanceTable";

import useAttendanceScope from "../hooks/useAttendanceScope";

import {
    getAttendance,
    markAttendance,
    bulkMarkAttendance,
} from "../services/studentAttendance.service";

import {
    getDistricts,
} from "../../../services/district.service";

import {
    getBlocks,
} from "../../../services/block.service";

import {
    getCenters,
} from "../../../services/center.service";

function StudentAttendance() {
    const {
        access,
        isAdmin,
        hasGlobalAccess,
        programs: scopedPrograms,
        batches: scopedBatches,
        regionAccess,
        districtIds,
        blockIds,
        centerIds,
    } = useAttendanceScope();

    /*
     * ----------------------------------------------------------
     * ACCESS SCOPE ANALYSIS
     * ----------------------------------------------------------
     */

    const isGlobalScope = useMemo(() => {
        return (
            isAdmin ||
            hasGlobalAccess ||
            (regionAccess || []).some(
                (region) =>
                    region.scope === "global"
            )
        );
    }, [
        isAdmin,
        hasGlobalAccess,
        regionAccess,
    ]);

    const hasDistrictScope = useMemo(() => {
        return (regionAccess || []).some(
            (region) =>
                region.scope === "district"
        );
    }, [regionAccess]);

    const hasBlockScope = useMemo(() => {
        return (regionAccess || []).some(
            (region) =>
                region.scope === "block"
        );
    }, [regionAccess]);

    /*
     * ----------------------------------------------------------
     * FILTER VISIBILITY
     * ----------------------------------------------------------
     */

    const showDistrictFilter =
        isGlobalScope ||
        hasDistrictScope;

    const showBlockFilter =
        isGlobalScope ||
        hasDistrictScope ||
        hasBlockScope;

    const showCenterFilter = true;

    /*
     * ----------------------------------------------------------
     * DATE & FILTERS
     * ----------------------------------------------------------
     */

    const [date, setDate] = useState(
        new Date()
            .toISOString()
            .split("T")[0]
    );

    const [programId, setProgramId] =
        useState("");

    const [batchId, setBatchId] =
        useState("");

    const [districtId, setDistrictId] =
        useState("");

    const [blockId, setBlockId] =
        useState("");

    const [centerId, setCenterId] =
        useState("");

    /*
     * ----------------------------------------------------------
     * SEARCH STATE
     * ----------------------------------------------------------
     */

    const [hasSearched, setHasSearched] =
        useState(false);

    /*
     * ----------------------------------------------------------
     * REGION DATA
     * ----------------------------------------------------------
     */

    const [districts, setDistricts] =
        useState([]);

    const [blocks, setBlocks] =
        useState([]);

    const [centers, setCenters] =
        useState([]);

    const [blockLoading, setBlockLoading] =
        useState(false);

    const [centerLoading, setCenterLoading] =
        useState(false);

    /*
     * ----------------------------------------------------------
     * ATTENDANCE DATA
     * ----------------------------------------------------------
     */

    const [students, setStudents] =
        useState([]);

    const [summary, setSummary] =
        useState({});

    const [loading, setLoading] =
        useState(false);

    const [bulkLoading, setBulkLoading] =
        useState(false);

    const [
        updatingEnrollmentIds,
        setUpdatingEnrollmentIds,
    ] = useState([]);

    const [error, setError] =
        useState("");

    /*
     * ----------------------------------------------------------
     * PROGRAMS
     * ----------------------------------------------------------
     */

    const programs = useMemo(() => {
        return scopedPrograms || [];
    }, [scopedPrograms]);

    /*
     * ----------------------------------------------------------
     * PROGRAM FILTER
     *
     * One program:
     *   automatically selected
     *   filter hidden
     *
     * Multiple programs:
     *   filter visible
     * ----------------------------------------------------------
     */

    const showProgramFilter =
        programs.length > 1;

    useEffect(() => {
        if (programs.length === 1) {
            const onlyProgramId =
                String(
                    programs[0]._id
                );

            setProgramId(
                (previous) =>
                    previous ===
                    onlyProgramId
                        ? previous
                        : onlyProgramId
            );

            return;
        }

        if (
            programs.length > 1 &&
            programId &&
            !programs.some(
                (program) =>
                    String(
                        program._id
                    ) ===
                    String(programId)
            )
        ) {
            setProgramId("");
        }
    }, [
        programs,
        programId,
    ]);

    /*
     * ----------------------------------------------------------
     * BATCHES
     * ----------------------------------------------------------
     */

    const batches = useMemo(() => {
        if (!programId) {
            return scopedBatches || [];
        }

        return (
            scopedBatches || []
        ).filter(
            (batch) =>
                String(
                    batch.programId
                ) ===
                String(programId)
        );
    }, [
        scopedBatches,
        programId,
    ]);

    /*
     * ----------------------------------------------------------
     * ACCESSIBLE CENTERS
     * ----------------------------------------------------------
     */

    const centersFromAccess =
        useMemo(() => {
            const centerMap =
                new Map();

            (
                regionAccess || []
            ).forEach(
                (region) => {
                    if (
                        !region.centerId
                    ) {
                        return;
                    }

                    const center =
                        typeof region.centerId ===
                        "object"
                            ? region.centerId
                            : null;

                    const id =
                        center?._id ||
                        region.centerId;

                    if (!id) {
                        return;
                    }

                    centerMap.set(
                        String(id),
                        center || {
                            _id: id,
                            centerName:
                                "Center",
                        }
                    );
                }
            );

            return Array.from(
                centerMap.values()
            );
        }, [
            regionAccess,
        ]);

    /*
     * ----------------------------------------------------------
     * LOAD DISTRICTS
     * ----------------------------------------------------------
     */

    useEffect(() => {
        if (!showDistrictFilter) {
            setDistricts([]);
            setDistrictId("");
            return;
        }

        const loadDistricts =
            async () => {
                try {
                    const response =
                        await getDistricts({
                            page: 1,
                            limit: 1000,
                        });

                    const districtData =
                        response?.data
                            ?.districts ||
                        response?.data ||
                        [];

                    setDistricts(
                        districtData
                    );
                } catch (error) {
                    console.error(
                        "Failed to load districts:",
                        error
                    );

                    setDistricts([]);
                }
            };

        loadDistricts();
    }, [
        showDistrictFilter,
    ]);

    /*
     * ----------------------------------------------------------
     * VISIBLE DISTRICTS
     * ----------------------------------------------------------
     */

    const visibleDistricts =
        useMemo(() => {
            if (isGlobalScope) {
                return districts;
            }

            return districts.filter(
                (district) =>
                    districtIds.includes(
                        String(
                            district._id
                        )
                    )
            );
        }, [
            districts,
            isGlobalScope,
            districtIds,
        ]);

    /*
     * ----------------------------------------------------------
     * ACCESSIBLE BLOCKS
     * ----------------------------------------------------------
     */

    const accessibleBlocksFromAccess =
        useMemo(() => {
            const blockMap =
                new Map();

            (
                regionAccess || []
            ).forEach(
                (region) => {
                    if (
                        !region.blockId
                    ) {
                        return;
                    }

                    const block =
                        typeof region.blockId ===
                        "object"
                            ? region.blockId
                            : null;

                    const id =
                        block?._id ||
                        region.blockId;

                    if (!id) {
                        return;
                    }

                    blockMap.set(
                        String(id),
                        block || {
                            _id: id,
                            blockName:
                                "Block",
                        }
                    );
                }
            );

            return Array.from(
                blockMap.values()
            );
        }, [
            regionAccess,
        ]);

    /*
     * ----------------------------------------------------------
     * LOAD BLOCKS
     * ----------------------------------------------------------
     */

    useEffect(() => {
        /*
         * Block scope without district filter:
         * use blocks from accessScope.
         */
        if (
            !showDistrictFilter &&
            hasBlockScope
        ) {
            setBlocks(
                accessibleBlocksFromAccess
            );

            return;
        }

        /*
         * Center-only users do not need block.
         */
        if (!showBlockFilter) {
            setBlocks([]);
            setBlockId("");
            return;
        }

        /*
         * District filter visible:
         * district must be selected first.
         */
        if (!districtId) {
            setBlocks([]);
            setBlockId("");
            return;
        }

        const loadBlocks =
            async () => {
                try {
                    setBlockLoading(
                        true
                    );

                    const response =
                        await getBlocks({
                            districtId,
                            page: 1,
                            limit: 1000,
                        });

                    const blockData =
                        response?.data
                            ?.blocks ||
                        response?.data ||
                        [];

                    if (isGlobalScope) {
                        setBlocks(
                            blockData
                        );
                    } else {
                        setBlocks(
                            blockData.filter(
                                (
                                    block
                                ) =>
                                    blockIds.includes(
                                        String(
                                            block._id
                                        )
                                    )
                            )
                        );
                    }
                } catch (error) {
                    console.error(
                        "Failed to load blocks:",
                        error
                    );

                    setBlocks([]);
                } finally {
                    setBlockLoading(
                        false
                    );
                }
            };

        loadBlocks();
    }, [
        showDistrictFilter,
        showBlockFilter,
        hasBlockScope,
        accessibleBlocksFromAccess,
        districtId,
        isGlobalScope,
        blockIds,
    ]);

    /*
     * ----------------------------------------------------------
     * VISIBLE BLOCKS
     * ----------------------------------------------------------
     */

    const visibleBlocks =
        useMemo(() => {
            if (!showBlockFilter) {
                return [];
            }

            if (
                !showDistrictFilter &&
                hasBlockScope
            ) {
                return blocks;
            }

            if (isGlobalScope) {
                return blocks;
            }

            return blocks.filter(
                (block) =>
                    blockIds.includes(
                        String(
                            block._id
                        )
                    )
            );
        }, [
            blocks,
            showBlockFilter,
            showDistrictFilter,
            hasBlockScope,
            isGlobalScope,
            blockIds,
        ]);

    /*
     * ----------------------------------------------------------
     * LOAD CENTERS
     * ----------------------------------------------------------
     */

    useEffect(() => {
        /*
         * Center-only scope:
         * centers directly from accessScope.
         */
        if (!showBlockFilter) {
            setCenters(
                centersFromAccess
            );

            return;
        }

        /*
         * Block/District/Global:
         * center depends on selected block.
         */
        if (!blockId) {
            setCenters([]);
            setCenterId("");
            return;
        }

        const loadCenters =
            async () => {
                try {
                    setCenterLoading(
                        true
                    );

                    const response =
                        await getCenters({
                            blockId,
                            page: 1,
                            limit: 1000,
                        });

                    const centerData =
                        response?.data
                            ?.centers ||
                        response?.data ||
                        [];

                    if (
                        isGlobalScope
                    ) {
                        setCenters(
                            centerData
                        );
                    } else {
                        setCenters(
                            centerData.filter(
                                (
                                    center
                                ) =>
                                    centerIds.includes(
                                        String(
                                            center._id
                                        )
                                    )
                            )
                        );
                    }
                } catch (error) {
                    console.error(
                        "Failed to load centers:",
                        error
                    );

                    setCenters([]);
                } finally {
                    setCenterLoading(
                        false
                    );
                }
            };

        loadCenters();
    }, [
        blockId,
        showBlockFilter,
        centersFromAccess,
        isGlobalScope,
        centerIds,
    ]);

    /*
     * ----------------------------------------------------------
     * FILTER HANDLERS
     * ----------------------------------------------------------
     */

    const handleProgramChange =
        (value) => {
            setProgramId(value);
            setBatchId("");

            setHasSearched(false);
            setStudents([]);
            setSummary({});
        };

    const handleBatchChange =
        (value) => {
            setBatchId(value);

            setHasSearched(false);
            setStudents([]);
            setSummary({});
        };

    const handleDistrictChange =
        (value) => {
            setDistrictId(value);
            setBlockId("");
            setCenterId("");

            setBlocks([]);
            setCenters([]);

            setHasSearched(false);
            setStudents([]);
            setSummary({});
        };

    const handleBlockChange =
        (value) => {
            setBlockId(value);
            setCenterId("");
            setCenters([]);

            setHasSearched(false);
            setStudents([]);
            setSummary({});
        };

    const handleDateChange =
        (value) => {
            setDate(value);

            setHasSearched(false);
            setStudents([]);
            setSummary({});
        };

    /*
     * ----------------------------------------------------------
     * ATTENDANCE API
     * ----------------------------------------------------------
     */

    const loadAttendance =
        async () => {
            try {
                setLoading(true);
                setError("");

                const params = {
                    date,
                };

                if (programId) {
                    params.programId =
                        programId;
                }

                if (batchId) {
                    params.batchId =
                        batchId;
                }

                if (
                    showDistrictFilter &&
                    districtId
                ) {
                    params.districtId =
                        districtId;
                }

                if (
                    showBlockFilter &&
                    blockId
                ) {
                    params.blockId =
                        blockId;
                }

                if (centerId) {
                    params.centerId =
                        centerId;
                }

                /*
                 * No class filter.
                 * No attendance status filter.
                 *
                 * Backend should use active
                 * enrollments only.
                 */

                const response =
                    await getAttendance(
                        params
                    );

                setStudents(
                    response?.data
                        ?.students ||
                        []
                );

                setSummary(
                    response?.data
                        ?.summary ||
                        {}
                );

                setHasSearched(true);
            } catch (error) {
                console.error(
                    "Failed to load attendance:",
                    error
                );

                setStudents([]);
                setSummary({});

                setError(
                    error?.response
                        ?.data
                        ?.message ||
                    "Failed to load attendance."
                );
            } finally {
                setLoading(false);
            }
        };

    /*
     * ----------------------------------------------------------
     * SEARCH
     *
     * IMPORTANT:
     * This is now the ONLY place from where
     * attendance is initially fetched.
     * ----------------------------------------------------------
     */

    const handleSearch =
        async () => {
            setError("");

            if (!date) {
                setError(
                    "Please select date."
                );
                return;
            }

            if (!programId) {
                setError(
                    "Please select program."
                );
                return;
            }

            if (!batchId) {
                setError(
                    "Please select batch."
                );
                return;
            }

            /*
             * Center-only scope
             */
            if (
                !showBlockFilter &&
                !centerId
            ) {
                setError(
                    "Please select center."
                );
                return;
            }

            /*
             * Block scope
             */
            if (
                showBlockFilter &&
                !showDistrictFilter &&
                !blockId
            ) {
                setError(
                    "Please select block."
                );
                return;
            }

            /*
             * District scope / Global
             *
             * District is required when
             * district filter is visible.
             */
            if (
                showDistrictFilter &&
                !districtId
            ) {
                setError(
                    "Please select district."
                );
                return;
            }

            await loadAttendance();
        };

    /*
     * ----------------------------------------------------------
     * NO AUTO FETCH
     * ----------------------------------------------------------
     *
     * IMPORTANT:
     * There is intentionally NO useEffect
     * calling loadAttendance().
     *
     * Attendance API runs only after Search.
     * ----------------------------------------------------------
     */

    /*
     * ----------------------------------------------------------
     * UPDATE SUMMARY LOCALLY
     * ----------------------------------------------------------
     */

    const updateSummaryAfterAttendance =
        (
            oldStatus,
            newStatus
        ) => {
            if (
                oldStatus ===
                newStatus
            ) {
                return;
            }

            setSummary(
                (previous) => {
                    const total =
                        Number(
                            previous?.total ||
                            0
                        );

                    let present =
                        Number(
                            previous?.present ||
                            0
                        );

                    let absent =
                        Number(
                            previous?.absent ||
                            0
                        );

                    if (
                        oldStatus ===
                            "Absent" &&
                        newStatus ===
                            "Present"
                    ) {
                        present += 1;
                        absent -= 1;
                    }

                    if (
                        oldStatus ===
                            "Present" &&
                        newStatus ===
                            "Absent"
                    ) {
                        present -= 1;
                        absent += 1;
                    }

                    const attendancePercentage =
                        total > 0
                            ? Number(
                                  (
                                      (present /
                                          total) *
                                      100
                                  ).toFixed(
                                      2
                                  )
                              )
                            : 0;

                    return {
                        ...previous,
                        total,
                        present,
                        absent,
                        attendancePercentage,
                    };
                }
            );
        };

    /*
     * ----------------------------------------------------------
     * SINGLE ATTENDANCE TOGGLE
     * ----------------------------------------------------------
     */

    const handleMarkAttendance =
        async (
            student,
            attendanceStatus
        ) => {
            const enrollmentId =
                student?.enrollmentId;

            if (!enrollmentId) {
                return;
            }

            const oldStatus =
                student?.attendance
                    ?.status ||
                "Absent";

            if (
                oldStatus ===
                attendanceStatus
            ) {
                return;
            }

            setError("");

            setUpdatingEnrollmentIds(
                (previous) => [
                    ...previous,
                    String(
                        enrollmentId
                    ),
                ]
            );

            /*
             * Optimistic UI
             */

            setStudents(
                (previous) =>
                    previous.map(
                        (item) => {
                            if (
                                String(
                                    item.enrollmentId
                                ) !==
                                String(
                                    enrollmentId
                                )
                            ) {
                                return item;
                            }

                            return {
                                ...item,
                                attendance:
                                    {
                                        ...item.attendance,
                                        status:
                                            attendanceStatus,
                                        date,
                                    },
                            };
                        }
                    )
            );

            updateSummaryAfterAttendance(
                oldStatus,
                attendanceStatus
            );

            try {
                await markAttendance({
                    enrollmentId,
                    date,
                    status:
                        attendanceStatus,
                });
            } catch (error) {
                /*
                 * Rollback
                 */

                setStudents(
                    (previous) =>
                        previous.map(
                            (item) => {
                                if (
                                    String(
                                        item.enrollmentId
                                    ) !==
                                    String(
                                        enrollmentId
                                    )
                                ) {
                                    return item;
                                }

                                return {
                                    ...item,
                                    attendance:
                                        {
                                            ...item.attendance,
                                            status:
                                                oldStatus,
                                            date,
                                        },
                                };
                            }
                        )
                );

                updateSummaryAfterAttendance(
                    attendanceStatus,
                    oldStatus
                );

                setError(
                    error?.response
                        ?.data
                        ?.message ||
                    "Failed to mark attendance."
                );
            } finally {
                setUpdatingEnrollmentIds(
                    (previous) =>
                        previous.filter(
                            (id) =>
                                id !==
                                String(
                                    enrollmentId
                                )
                        )
                );
            }
        };

    /*
     * ----------------------------------------------------------
     * BULK MARK ALL PRESENT
     * ----------------------------------------------------------
     */

    const handleBulkMarkPresent =
        async () => {
            if (!students.length) {
                return;
            }

            const enrollmentIds =
                students
                    .map(
                        (student) =>
                            student?.enrollmentId
                    )
                    .filter(Boolean);

            if (
                !enrollmentIds.length
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Mark all ${enrollmentIds.length} students as Present?`
                );

            if (!confirmed) {
                return;
            }

            try {
                setBulkLoading(
                    true
                );

                setError("");

                await bulkMarkAttendance(
                    {
                        date,
                        enrollmentIds,
                    }
                );

                setStudents(
                    (previous) =>
                        previous.map(
                            (
                                student
                            ) => ({
                                ...student,
                                attendance:
                                    {
                                        ...student.attendance,
                                        date,
                                        status:
                                            "Present",
                                    },
                            })
                        )
                );

                setSummary(
                    (previous) => ({
                        ...previous,
                        total:
                            Number(
                                previous?.total ||
                                0
                            ),
                        present:
                            Number(
                                previous?.total ||
                                0
                            ),
                        absent: 0,
                        attendancePercentage:
                            Number(
                                previous?.total ||
                                0
                            ) > 0
                                ? 100
                                : 0,
                    })
                );
            } catch (error) {
                console.error(
                    "Failed to bulk mark attendance:",
                    error
                );

                setError(
                    error?.response
                        ?.data
                        ?.message ||
                    "Failed to bulk mark attendance."
                );
            } finally {
                setBulkLoading(
                    false
                );
            }
        };

    /*
     * ----------------------------------------------------------
     * RESET
     * ----------------------------------------------------------
     */

    const handleReset = () => {
        setDate(
            new Date()
                .toISOString()
                .split("T")[0]
        );

        if (programs.length === 1) {
            setProgramId(
                String(
                    programs[0]._id
                )
            );
        } else {
            setProgramId("");
        }

        setBatchId("");
        setDistrictId("");
        setBlockId("");
        setCenterId("");

        setBlocks([]);
        setCenters([]);

        setStudents([]);
        setSummary({});
        setError("");
        setHasSearched(false);
    };

    return (
        <div className="space-y-6">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Student Attendance
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View and manage daily student attendance.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={
                        handleBulkMarkPresent
                    }
                    disabled={
                        bulkLoading ||
                        loading ||
                        !students.length
                    }
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {bulkLoading
                        ? "Marking..."
                        : "Mark All Present"}
                </button>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* ==================================================
                FILTERS
            ================================================== */}

            <AttendanceFilters
                date={date}
                programId={programId}
                batchId={batchId}
                districtId={districtId}
                blockId={blockId}
                centerId={centerId}

                programs={programs}
                batches={batches}
                districts={visibleDistricts}
                blocks={visibleBlocks}
                centers={
                    !showBlockFilter
                        ? centersFromAccess
                        : centers
                }

                showProgramFilter={
                    showProgramFilter
                }

                showDistrictFilter={
                    showDistrictFilter
                }

                showBlockFilter={
                    showBlockFilter
                }

                showCenterFilter={
                    showCenterFilter
                }

                blockLoading={
                    blockLoading
                }

                centerLoading={
                    centerLoading
                }

                onDateChange={
                    handleDateChange
                }

                onProgramChange={
                    handleProgramChange
                }

                onBatchChange={
                    handleBatchChange
                }

                onDistrictChange={
                    handleDistrictChange
                }

                onBlockChange={
                    handleBlockChange
                }

                onCenterChange={
                    (value) => {
                        setCenterId(
                            value
                        );

                        setHasSearched(
                            false
                        );
                        setStudents([]);
                        setSummary({});
                    }
                }

                onSearch={
                    handleSearch
                }

                onReset={
                    handleReset
                }
            />

            {/* ==================================================
                INITIAL STATE / SUMMARY
            ================================================== */}

            {!hasSearched ? (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    <p className="text-sm font-medium text-gray-700">
                        Select filters to view attendance
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Select the required filters and click Search.
                    </p>
                </div>
            ) : (
                <>
                    {/* ==================================================
                        SUMMARY
                    ================================================== */}

                    <AttendanceSummary
                        summary={summary}
                    />

                    {/* ==================================================
                        ATTENDANCE TABLE
                    ================================================== */}

                    <AttendanceTable
                        students={students}
                        loading={loading}
                        updatingEnrollmentIds={
                            updatingEnrollmentIds
                        }
                        onMarkAttendance={
                            handleMarkAttendance
                        }
                    />
                </>
            )}

        </div>
    );
}

export default StudentAttendance;