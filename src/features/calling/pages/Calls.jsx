import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../context/AuthContext";

import {
    getMyCallingTypeSummary,
    getCallingDetails,
    getCallLogs,
    createCallAttempt,
} from "../services/calling.service";


const Calls = () => {
    // ============================================================
    // AUTH
    // ============================================================

    const { user } = useAuth();


    // ============================================================
    // CALLING TYPE SUMMARY
    // ============================================================

    const [callingTypeSummary, setCallingTypeSummary] =
        useState([]);

    const [summaryLoading, setSummaryLoading] =
        useState(false);

    const [summaryError, setSummaryError] =
        useState("");


    // ============================================================
    // SELECTED CALLING TYPE
    // ============================================================

    const [selectedCallingType, setSelectedCallingType] =
        useState(null);

    const [showCalls, setShowCalls] =
        useState(false);


    // ============================================================
    // CALLING DETAILS
    // ============================================================

    const [calls, setCalls] =
        useState([]);

    const [callsLoading, setCallsLoading] =
        useState(false);

    const [callsError, setCallsError] =
        useState("");


    // ============================================================
    // SEARCH
    // ============================================================

    const [search, setSearch] =
        useState("");


    // ============================================================
    // SELECTED CALL FOR ATTEMPT
    // ============================================================

    const [selectedCall, setSelectedCall] =
        useState(null);


    // ============================================================
    // ATTEMPT FORM
    // ============================================================

    const [attemptStatus, setAttemptStatus] =
        useState("");

    const [attemptRemark, setAttemptRemark] =
        useState("");

    const [attemptComment, setAttemptComment] =
        useState("");

    const [followUpDate, setFollowUpDate] =
        useState("");

    const [submittingAttempt, setSubmittingAttempt] =
        useState(false);

    const [attemptError, setAttemptError] =
        useState("");

    const [attemptSuccess, setAttemptSuccess] =
        useState("");


    // ============================================================
    // CALL HISTORY MODAL
    // ============================================================

    const [historyCall, setHistoryCall] =
        useState(null);

    const [historyLogs, setHistoryLogs] =
        useState([]);

    const [historyLoading, setHistoryLoading] =
        useState(false);

    const [historyError, setHistoryError] =
        useState("");


    // ============================================================
    // LOAD CALLING TYPE SUMMARY
    // ============================================================

    const loadCallingTypeSummary = async () => {
        try {
            setSummaryLoading(true);
            setSummaryError("");

            const response =
                await getMyCallingTypeSummary();

            setCallingTypeSummary(
                response.data?.summary || []
            );
        } catch (error) {
            console.error(
                "Failed to load calling type summary:",
                error
            );

            setSummaryError(
                error.response?.data?.message ||
                "Failed to load calling types."
            );
        } finally {
            setSummaryLoading(false);
        }
    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        if (user?._id) {
            loadCallingTypeSummary();
        }
    }, [user?._id]);


    // ============================================================
    // AVAILABLE STATUSES
    // ============================================================

    const availableStatuses = useMemo(() => {
        if (!selectedCallingType) {
            return [];
        }

        return Array.isArray(
            selectedCallingType.callingStatus
        )
            ? selectedCallingType.callingStatus
            : [];
    }, [selectedCallingType]);


    // ============================================================
    // AVAILABLE REMARKS
    // ============================================================

    const availableRemarks = useMemo(() => {
        if (
            !selectedCallingType ||
            !attemptStatus
        ) {
            return [];
        }

        if (
            attemptStatus === "Connected"
        ) {
            return Array.isArray(
                selectedCallingType.callingRemark?.connected
            )
                ? selectedCallingType.callingRemark.connected
                : [];
        }

        if (
            attemptStatus === "Not Connected"
        ) {
            return Array.isArray(
                selectedCallingType.callingRemark?.notConnected
            )
                ? selectedCallingType.callingRemark.notConnected
                : [];
        }

        return [];
    }, [
        selectedCallingType,
        attemptStatus,
    ]);


    // ============================================================
    // LOAD CALLS
    // ============================================================

    const loadCalls = async (
        callingTypeId,
        searchValue = ""
    ) => {
        try {
            setCallsLoading(true);
            setCallsError("");

            const params = {
                page: 1,
                limit: 100,
                callingTypeId,
                assignedTo: user?._id,
            };

            if (searchValue.trim()) {
                params.search =
                    searchValue.trim();
            }

            const response =
                await getCallingDetails(
                    params
                );

            setCalls(
                response.data?.callingDetails ||
                []
            );
        } catch (error) {
            console.error(
                "Failed to load calls:",
                error
            );

            setCallsError(
                error.response?.data?.message ||
                "Failed to load calls."
            );
        } finally {
            setCallsLoading(false);
        }
    };


    // ============================================================
    // OPEN CALLING TYPE
    // ============================================================

    const handleAttemptCalls = async (
        callingType
    ) => {
        setSelectedCallingType(
            callingType
        );

        setShowCalls(true);

        setSelectedCall(null);

        setSearch("");

        setAttemptStatus("");
        setAttemptRemark("");
        setAttemptComment("");
        setFollowUpDate("");

        setAttemptError("");
        setAttemptSuccess("");

        await loadCalls(
            callingType.callingTypeId
        );
    };


    // ============================================================
    // BACK TO CALLING TYPES
    // ============================================================

    const handleBackToCallingTypes = () => {
        setShowCalls(false);

        setSelectedCallingType(null);

        setSelectedCall(null);

        setSearch("");

        setAttemptStatus("");
        setAttemptRemark("");
        setAttemptComment("");
        setFollowUpDate("");

        setAttemptError("");
        setAttemptSuccess("");
    };


    // ============================================================
    // SELECT CALL
    // ============================================================

    const handleSelectCall = (
        call
    ) => {
        setSelectedCall(call);

        setAttemptStatus(
            call.callingStatus || ""
        );

        setAttemptRemark(
            call.remark || ""
        );

        setAttemptComment(
            call.comment || ""
        );

        setFollowUpDate("");

        setAttemptError("");
        setAttemptSuccess("");
    };


    // ============================================================
    // CANCEL ATTEMPT
    // ============================================================

    const handleCancelAttempt = () => {
        setSelectedCall(null);

        setAttemptStatus("");
        setAttemptRemark("");
        setAttemptComment("");
        setFollowUpDate("");

        setAttemptError("");
        setAttemptSuccess("");
    };


    // ============================================================
    // SEARCH
    // ============================================================

    const handleSearch = async (
        event
    ) => {
        event.preventDefault();

        if (!selectedCallingType) {
            return;
        }

        await loadCalls(
            selectedCallingType.callingTypeId,
            search
        );
    };


    // ============================================================
    // RESET SEARCH
    // ============================================================

    const handleResetSearch = async () => {
        setSearch("");

        if (!selectedCallingType) {
            return;
        }

        await loadCalls(
            selectedCallingType.callingTypeId
        );
    };


    // ============================================================
    // SUBMIT CALL ATTEMPT
    // ============================================================

    // ============================================================
// SUBMIT CALL ATTEMPT
// ============================================================

const handleSubmitAttempt = async (
    event
) => {
    event.preventDefault();

    if (!selectedCall) {
        setAttemptError(
            "Please select a call first."
        );

        return;
    }

    if (!attemptStatus) {
        setAttemptError(
            "Please select calling status."
        );

        return;
    }


    // ------------------------------------------------------------
    // SAVE CURRENT SCROLL POSITION
    // ------------------------------------------------------------

    const currentScrollPosition =
        window.scrollY;


    try {
        setSubmittingAttempt(true);

        setAttemptError("");
        setAttemptSuccess("");


        const response =
            await createCallAttempt({
                callingDetailId:
                    selectedCall._id,

                callingStatus:
                    attemptStatus,

                remark:
                    attemptRemark,

                comment:
                    attemptComment,

                followUpDate:
                    followUpDate || null,
            });


        setAttemptSuccess(
            "Call attempt recorded successfully."
        );


        // --------------------------------------------------------
        // REFRESH CALLING TYPE SUMMARY
        // --------------------------------------------------------

        await loadCallingTypeSummary();


        // --------------------------------------------------------
        // REFRESH CURRENT CALLS
        // --------------------------------------------------------

        if (selectedCallingType) {
            await loadCalls(
                selectedCallingType.callingTypeId,
                search
            );
        }


        // --------------------------------------------------------
        // REFRESH HISTORY IF MODAL IS OPEN
        // --------------------------------------------------------

        if (
            historyCall &&
            historyCall._id ===
                selectedCall._id
        ) {
            await loadCallHistory(
                selectedCall._id
            );
        }


        // --------------------------------------------------------
        // RESET SELECTED CALL / FORM
        // --------------------------------------------------------

        setSelectedCall(null);

        setAttemptStatus("");
        setAttemptRemark("");
        setAttemptComment("");
        setFollowUpDate("");


       // --------------------------------------------------------
// RESTORE SCROLL POSITION
// --------------------------------------------------------

requestAnimationFrame(() => {
    window.scrollTo(
        0,
        currentScrollPosition
    );
});

    } catch (error) {
        console.error(
            "Failed to record call attempt:",
            error
        );

        setAttemptError(
            error.response?.data?.message ||
            "Failed to record call attempt."
        );
    } finally {
        setSubmittingAttempt(false);
    }
};

    // ============================================================
    // LOAD CALL HISTORY
    // ============================================================

    const loadCallHistory = async (
        callingDetailId
    ) => {
        try {
            setHistoryLoading(true);
            setHistoryError("");

            const response =
                await getCallLogs({
                    page: 1,
                    limit: 100,
                    callingDetailId,
                });

            setHistoryLogs(
                response.data?.callLogs ||
                []
            );
        } catch (error) {
            console.error(
                "Failed to load call history:",
                error
            );

            setHistoryError(
                error.response?.data?.message ||
                "Failed to load call history."
            );

            setHistoryLogs([]);
        } finally {
            setHistoryLoading(false);
        }
    };


    // ============================================================
    // OPEN HISTORY
    // ============================================================

    const handleShowHistory = async (
        call
    ) => {
        setHistoryCall(call);

        setHistoryLogs([]);

        setHistoryError("");

        await loadCallHistory(
            call._id
        );
    };


    // ============================================================
    // CLOSE HISTORY
    // ============================================================

    const handleCloseHistory = () => {
        setHistoryCall(null);

        setHistoryLogs([]);

        setHistoryError("");

        setHistoryLoading(false);
    };


    // ============================================================
    // REFRESH CURRENT PAGE
    // ============================================================

    const handleRefresh = async () => {
        await loadCallingTypeSummary();

        if (
            selectedCallingType
        ) {
            await loadCalls(
                selectedCallingType.callingTypeId,
                search
            );
        }
    };


    // ============================================================
    // CALLING TYPE DASHBOARD
    // ============================================================

    if (!showCalls) {
        return (
            <div className="min-h-full bg-gray-50 p-4 md:p-6">

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Calls
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Select a calling type to start your calling attempts.
                        </p>
                    </div>


                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            summaryLoading
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Refresh
                    </button>

                </div>


                {summaryError && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {summaryError}
                    </div>
                )}


                {summaryLoading ? (

                    <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">
                        Loading calling types...
                    </div>

                ) : callingTypeSummary.length === 0 ? (

                    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

                        <p className="text-sm font-medium text-gray-700">
                            No calling tasks assigned to you.
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Calling types assigned to you will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {callingTypeSummary.map(
                            (callingType) => (

                                <div
                                    key={
                                        callingType.callingTypeId
                                    }
                                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                >

                                    <div className="mb-5 flex items-start justify-between gap-3">

                                        <div>

                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {
                                                    callingType.callingTitle
                                                }
                                            </h2>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {
                                                    callingType.callingTypeCode
                                                }
                                            </p>

                                        </div>


                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                            {
                                                callingType.total
                                            }{" "}
                                            Calls
                                        </span>

                                    </div>


                                    <div className="grid grid-cols-2 gap-3">

                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <p className="text-xs text-gray-500">
                                                Pending
                                            </p>

                                            <p className="mt-1 text-xl font-semibold text-gray-900">
                                                {
                                                    callingType.pending
                                                }
                                            </p>
                                        </div>


                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <p className="text-xs text-gray-500">
                                                Total
                                            </p>

                                            <p className="mt-1 text-xl font-semibold text-gray-900">
                                                {
                                                    callingType.total
                                                }
                                            </p>
                                        </div>


                                        <div className="rounded-lg bg-green-50 p-3">
                                            <p className="text-xs text-green-700">
                                                Connected
                                            </p>

                                            <p className="mt-1 text-xl font-semibold text-green-800">
                                                {
                                                    callingType.connected
                                                }
                                            </p>
                                        </div>


                                        <div className="rounded-lg bg-yellow-50 p-3">
                                            <p className="text-xs text-yellow-700">
                                                Not Connected
                                            </p>

                                            <p className="mt-1 text-xl font-semibold text-yellow-800">
                                                {
                                                    callingType.notConnected
                                                }
                                            </p>
                                        </div>


                                        <div className="col-span-2 rounded-lg bg-red-50 p-3">
                                            <p className="text-xs text-red-700">
                                                Wrong Number
                                            </p>

                                            <p className="mt-1 text-xl font-semibold text-red-800">
                                                {
                                                    callingType.wrongNumber
                                                }
                                            </p>
                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleAttemptCalls(
                                                callingType
                                            )
                                        }
                                        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Attempt Calls
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>
        );
    }


    // ============================================================
    // CALLS VIEW
    // ============================================================

    return (
        <div className="min-h-full bg-gray-50 p-4 md:p-6">

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <button
                        type="button"
                        onClick={
                            handleBackToCallingTypes
                        }
                        className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        ← Back to Calling Types
                    </button>


                    <h1 className="text-2xl font-semibold text-gray-900">
                        {
                            selectedCallingType?.callingTitle
                        }
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Attempt calls assigned to you.
                    </p>

                </div>


                <div className="flex items-center gap-2">

                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                        {
                            calls.length
                        }{" "}
                        Calls
                    </span>


                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            callsLoading
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Refresh
                    </button>

                </div>

            </div>


            {/* ================================================== */}
            {/* SEARCH */}
            {/* ================================================== */}

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                <form
                    onSubmit={
                        handleSearch
                    }
                    className="flex flex-col gap-3 md:flex-row"
                >

                    <input
                        type="text"
                        value={
                            search
                        }
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search by name, contact, father..."
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />


                    <button
                        type="submit"
                        disabled={
                            callsLoading
                        }
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Search
                    </button>


                    <button
                        type="button"
                        onClick={
                            handleResetSearch
                        }
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Reset
                    </button>

                </form>

            </div>


            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {callsError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {callsError}
                </div>
            )}


            {/* ================================================== */}
            {/* CALLS */}
            {/* ================================================== */}

            {callsLoading ? (

                <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">
                    Loading calls...
                </div>

            ) : calls.length === 0 ? (

                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

                    <p className="text-sm font-medium text-gray-700">
                        No calls found.
                    </p>

                </div>

            ) : (

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    {calls.map(
                        (call) => {

                            const isSelected =
                                selectedCall?._id ===
                                call._id;


                            const contacts = [
                                call.contact1,
                                call.contact2,
                                call.contact3,
                            ].filter(Boolean);


                            // ------------------------------------------------
                            // ADDITIONAL INFORMATION 1-10
                            // ------------------------------------------------

                            const additionalInformation = [
                                call.additionalInformation1,
                                call.additionalInformation2,
                                call.additionalInformation3,
                                call.additionalInformation4,
                                call.additionalInformation5,
                                call.additionalInformation6,
                                call.additionalInformation7,
                                call.additionalInformation8,
                                call.additionalInformation9,
                                call.additionalInformation10,
                            ]
                                .map(
                                    (value, index) => ({
                                        number:
                                            index + 1,
                                        value,
                                    })
                                )
                                .filter(
                                    ({ value }) =>
                                        value !== null &&
                                        value !== undefined &&
                                        value !== ""
                                );


                            // ------------------------------------------------
// CARD STATUS COLOR
// ------------------------------------------------

let cardColor =
    "border-gray-200 bg-white";

if (
    call.callingStatus ===
    "Connected"
) {
    cardColor =
        "border-green-200 bg-green-100";
} else if (
    call.callingStatus ===
    "Not Connected"
) {
    cardColor =
        "border-orange-200 bg-orange-100";
} else if (
    call.callingStatus ===
    "Wrong Number"
) {
    cardColor =
        "border-red-200 bg-red-100";
}

                            return (
                                <div
                                    key={
                                        call._id
                                    }
                                    className={`rounded-xl border p-5 shadow-sm transition ${
                                        cardColor
                                    } ${
                                        isSelected
                                            ? "border-blue-500 ring-1 ring-blue-500"
                                            : ""
                                    }`}
                                >

                                    {/* -------------------------------- */}
                                    {/* CALL HEADER */}
                                    {/* -------------------------------- */}

                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <h2 className="text-base font-semibold text-gray-900">
                                                {
                                                    call.calledTo ||
                                                    "Unknown"
                                                }
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Father:{" "}
                                                {
                                                    call.father ||
                                                    "-"
                                                }
                                            </p>

                                        </div>


                                        {call.callingStatus ? (

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    call.callingStatus ===
                                                    "Connected"
                                                        ? "bg-green-100 text-green-700"
                                                        : call.callingStatus ===
                                                          "Not Connected"
                                                            ? "bg-orange-100 text-orange-700"
                                                            : call.callingStatus ===
                                                              "Wrong Number"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-blue-50 text-blue-700"
                                                }`}
                                            >
                                                {
                                                    call.callingStatus
                                                }
                                            </span>

                                        ) : (

                                            <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                Pending
                                            </span>

                                        )}

                                    </div>


                                    {/* -------------------------------- */}
                                    {/* LOCATION */}
                                    {/* -------------------------------- */}

                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                District
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-700">
                                                {
                                                    call.calledDistrict ||
                                                    "-"
                                                }
                                            </p>
                                        </div>


                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Block
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-700">
                                                {
                                                    call.calledBlock ||
                                                    "-"
                                                }
                                            </p>
                                        </div>


                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Center
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-700">
                                                {
                                                    call.calledCenter ||
                                                    "-"
                                                }
                                            </p>
                                        </div>

                                    </div>


                                    {/* -------------------------------- */}
                                    {/* CONTACT NUMBERS */}
                                    {/* -------------------------------- */}

                                    <div className="mt-4 border-t border-gray-100 pt-4">

                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Contact Numbers
                                        </p>


                                        <div className="flex flex-wrap gap-2">

                                            {contacts.length === 0 ? (

                                                <span className="text-sm text-gray-500">
                                                    No contact number
                                                </span>

                                            ) : (

                                                contacts.map(
                                                    (
                                                        contact,
                                                        index
                                                    ) => (

                                                        <a
                                                            key={`${call._id}-${index}`}
                                                            href={`tel:${contact}`}
                                                            className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                                                        >
                                                            📞{" "}
                                                            {
                                                                contact
                                                            }
                                                        </a>

                                                    )
                                                )

                                            )}

                                        </div>

                                    </div>


                                    {/* -------------------------------- */}
                                    {/* ADDITIONAL INFORMATION */}
                                    {/* -------------------------------- */}

                                    {additionalInformation.length > 0 && (

                                        <div className="mt-4">

                                            <div className="space-y-2">

                                                {additionalInformation.map(
                                                    ({
                                                        number,
                                                        value,
                                                    }) => {

                                                        let displayValue =
                                                            value;

                                                        if (
                                                            typeof value ===
                                                            "object"
                                                        ) {
                                                            try {
                                                                displayValue =
                                                                    JSON.stringify(
                                                                        value
                                                                    );
                                                            } catch {
                                                                displayValue =
                                                                    String(
                                                                        value
                                                                    );
                                                            }
                                                        }

                                                        return (
                                                            <div
                                                                key={`${call._id}-additional-${number}`}
                                                                className="flex items-start gap-2 text-sm text-gray-700"
                                                            >

                                                                <span className="min-w-[20px] font-medium text-gray-500">
                                                                    {
                                                                        number
                                                                    }.
                                                                </span>

                                                                <span className="break-words">
                                                                    {
                                                                        displayValue
                                                                    }
                                                                </span>

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>

                                        </div>

                                    )}


                                    {/* -------------------------------- */}
                                    {/* LAST REMARK */}
                                    {/* -------------------------------- */}

                                    {call.remark && (

                                        <div className="mt-4 border-t border-gray-200 pt-4">

                                            <div className="rounded-lg bg-white/70 p-3">

                                                <p className="text-xs font-medium text-gray-400">
                                                    Last Remark
                                                </p>

                                                <p className="mt-1 text-sm text-gray-700">
                                                    {
                                                        call.remark
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    )}


                                    {/* -------------------------------- */}
                                    {/* ACTIONS */}
                                    {/* -------------------------------- */}

                                    <div className="mt-5 flex flex-wrap gap-2">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSelectCall(
                                                    call
                                                )
                                            }
                                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            Attempt Call
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleShowHistory(
                                                    call
                                                )
                                            }
                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Call History
                                        </button>

                                    </div>


                                    {/* -------------------------------- */}
                                    {/* ATTEMPT FORM */}
                                    {/* -------------------------------- */}

                                    {isSelected && (

                                        <div className="mt-5 border-t border-gray-200 pt-5">

                                            <h3 className="text-base font-semibold text-gray-900">
                                                Record Call Attempt
                                            </h3>


                                            <form
                                                onSubmit={
                                                    handleSubmitAttempt
                                                }
                                                className="mt-4 space-y-4"
                                            >

                                                {/* STATUS */}

                                                <div>

                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        Calling Status
                                                    </label>


                                                    <select
                                                        value={
                                                            attemptStatus
                                                        }
                                                        onChange={(event) => {

                                                            setAttemptStatus(
                                                                event.target.value
                                                            );

                                                            setAttemptRemark(
                                                                ""
                                                            );

                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                    >

                                                        <option value="">
                                                            Select Status
                                                        </option>


                                                        {availableStatuses.map(
                                                            (
                                                                status
                                                            ) => (

                                                                <option
                                                                    key={
                                                                        status
                                                                    }
                                                                    value={
                                                                        status
                                                                    }
                                                                >
                                                                    {
                                                                        status
                                                                    }
                                                                </option>

                                                            )
                                                        )}

                                                    </select>

                                                </div>


                                                {/* REMARK */}

                                                {availableRemarks.length > 0 && (

                                                    <div>

                                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                                            Remark
                                                        </label>


                                                        <select
                                                            value={
                                                                attemptRemark
                                                            }
                                                            onChange={(event) =>
                                                                setAttemptRemark(
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                        >

                                                            <option value="">
                                                                Select Remark
                                                            </option>


                                                            {availableRemarks.map(
                                                                (
                                                                    remark,
                                                                    index
                                                                ) => (

                                                                    <option
                                                                        key={`${remark}-${index}`}
                                                                        value={
                                                                            remark
                                                                        }
                                                                    >
                                                                        {
                                                                            remark
                                                                        }
                                                                    </option>

                                                                )
                                                            )}

                                                        </select>

                                                    </div>

                                                )}


                                                {/* COMMENT */}

                                                <div>

                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        Comment
                                                    </label>


                                                    <textarea
                                                        value={
                                                            attemptComment
                                                        }
                                                        onChange={(event) =>
                                                            setAttemptComment(
                                                                event.target.value
                                                            )
                                                        }
                                                        rows={3}
                                                        placeholder="Enter comment..."
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                    />

                                                </div>


                                                {/* FOLLOW UP */}

                                                <div>

                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        Follow-up Date
                                                    </label>


                                                    <input
                                                        type="date"
                                                        value={
                                                            followUpDate
                                                        }
                                                        onChange={(event) =>
                                                            setFollowUpDate(
                                                                event.target.value
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                    />

                                                </div>


                                                {/* ERROR */}

                                                {attemptError && (

                                                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                                        {
                                                            attemptError
                                                        }
                                                    </div>

                                                )}


                                                {/* SUCCESS */}

                                                {attemptSuccess && (

                                                    <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
                                                        {
                                                            attemptSuccess
                                                        }
                                                    </div>

                                                )}


                                                {/* BUTTONS */}

                                                <div className="flex gap-2">

                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            submittingAttempt
                                                        }
                                                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {submittingAttempt
                                                            ? "Saving..."
                                                            : "Submit Call"}
                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleCancelAttempt
                                                        }
                                                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </form>

                                        </div>

                                    )}

                                </div>
                            );
                        }
                    )}

                </div>

            )}


            {/* ================================================== */}
            {/* CALL HISTORY MODAL */}
            {/* ================================================== */}

            {historyCall && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">

                        {/* MODAL HEADER */}

                        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">

                            <div>

                                <h2 className="text-lg font-semibold text-gray-900">
                                    Call History
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {
                                        historyCall.calledTo ||
                                        "Unknown"
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseHistory
                                }
                                className="rounded-lg px-3 py-1.5 text-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <div className="overflow-y-auto p-5">

                            {historyLoading ? (

                                <div className="py-12 text-center text-sm text-gray-500">
                                    Loading call history...
                                </div>

                            ) : historyError ? (

                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {
                                        historyError
                                    }
                                </div>

                            ) : historyLogs.length === 0 ? (

                                <div className="rounded-lg border border-dashed border-gray-300 px-5 py-12 text-center">

                                    <p className="text-sm font-medium text-gray-700">
                                        No call history found.
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        No call attempt has been recorded yet.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {historyLogs.map(
                                        (log) => (

                                            <div
                                                key={
                                                    log._id
                                                }
                                                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                                            >

                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                    <div>

                                                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                            {
                                                                log.callingStatus ||
                                                                "-"
                                                            }
                                                        </span>

                                                        <p className="mt-2 text-sm text-gray-600">
                                                            Called by:{" "}
                                                            <span className="font-medium text-gray-800">
                                                                {
                                                                    log.calledBy?.name ||
                                                                    log.calledBy?.email ||
                                                                    "-"
                                                                }
                                                            </span>
                                                        </p>

                                                    </div>


                                                    <p className="text-xs text-gray-500">
                                                        {
                                                            log.createdAt
                                                                ? new Date(
                                                                    log.createdAt
                                                                ).toLocaleString()
                                                                : "-"
                                                        }
                                                    </p>

                                                </div>


                                                {log.remark && (

                                                    <div className="mt-3">

                                                        <p className="text-xs font-medium text-gray-400">
                                                            Remark
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-700">
                                                            {
                                                                log.remark
                                                            }
                                                        </p>

                                                    </div>

                                                )}


                                                {log.comment && (

                                                    <div className="mt-3">

                                                        <p className="text-xs font-medium text-gray-400">
                                                            Comment
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-700">
                                                            {
                                                                log.comment
                                                            }
                                                        </p>

                                                    </div>

                                                )}


                                                {log.followUpDate && (

                                                    <div className="mt-3">

                                                        <p className="text-xs font-medium text-gray-400">
                                                            Follow-up Date
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                                            {
                                                                new Date(
                                                                    log.followUpDate
                                                                ).toLocaleDateString()
                                                            }
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* MODAL FOOTER */}

                        <div className="flex justify-end border-t border-gray-200 px-5 py-4">

                            <button
                                type="button"
                                onClick={
                                    handleCloseHistory
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default Calls;