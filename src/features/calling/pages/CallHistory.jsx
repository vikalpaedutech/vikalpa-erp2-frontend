import { useEffect, useState } from "react";

import CallLogTable from "../components/CallLogTable";
import useCallLogs from "../hooks/useCallLogs";
import { getCallingTypes } from "../services/calling.service";


const CallHistory = () => {
    const [callingTypes, setCallingTypes] =
        useState([]);

    const [callingTypeId, setCallingTypeId] =
        useState("");

    const [callingStatus, setCallingStatus] =
        useState("");

    const [calledBy, setCalledBy] =
        useState("");

    const [followUpDate, setFollowUpDate] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [page, setPage] =
        useState(1);


    const {
        callLogs,
        pagination,
        loading,
        error,
        fetchCallLogs,
    } = useCallLogs({
        page: 1,
        limit: 20,
    });


    useEffect(() => {
        const loadCallingTypes =
            async () => {
                try {
                    const response =
                        await getCallingTypes({
                            page: 1,
                            limit: 100,
                            isActive: true,
                        });

                    setCallingTypes(
                        response.data
                            ?.callingTypes || []
                    );
                } catch (err) {
                    console.error(
                        "Failed to load calling types:",
                        err
                    );
                }
            };

        loadCallingTypes();
    }, []);


    const buildFilters = (
        targetPage = page
    ) => {
        const filters = {
            page: targetPage,
            limit: 20,
        };

        if (callingTypeId) {
            filters.callingTypeId =
                callingTypeId;
        }

        if (callingStatus) {
            filters.callingStatus =
                callingStatus;
        }

        if (calledBy.trim()) {
            filters.calledBy =
                calledBy.trim();
        }

        if (followUpDate) {
            filters.followUpDate =
                followUpDate;
        }

        if (search.trim()) {
            filters.search =
                search.trim();
        }

        return filters;
    };


    const handleSearch = async (
        event
    ) => {
        event.preventDefault();

        setPage(1);

        await fetchCallLogs(
            buildFilters(1)
        );
    };


    const handleReset = async () => {
        setCallingTypeId("");
        setCallingStatus("");
        setCalledBy("");
        setFollowUpDate("");
        setSearch("");
        setPage(1);

        await fetchCallLogs({
            page: 1,
            limit: 20,
        });
    };


    const handleRefresh = async () => {
        await fetchCallLogs(
            buildFilters(page)
        );
    };


    const handlePageChange = async (
        newPage
    ) => {
        if (
            newPage < 1 ||
            (
                pagination &&
                newPage >
                    pagination.totalPages
            )
        ) {
            return;
        }

        setPage(newPage);

        await fetchCallLogs(
            buildFilters(newPage)
        );
    };


    const handleEdit = (
        callLog
    ) => {
        console.log(
            "Edit call log:",
            callLog
        );

        // Edit functionality will be
        // connected from the Calls workflow.
    };


    return (
        <div className="min-h-full bg-gray-50 p-4 md:p-6">

            {/* Header */}
            <div className="mb-6">

                <h1 className="text-2xl font-semibold text-gray-900">
                    Call History
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    View and manage all call logs.
                </p>

            </div>


            {/* Filters */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">

                <form
                    onSubmit={
                        handleSearch
                    }
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                >

                    {/* Search */}
                    <div className="lg:col-span-2">

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Search
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search call logs..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>


                    {/* Calling Type */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Calling Type
                        </label>

                        <select
                            value={
                                callingTypeId
                            }
                            onChange={(event) =>
                                setCallingTypeId(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">
                                All Calling Types
                            </option>

                            {callingTypes.map(
                                (callingType) => (
                                    <option
                                        key={
                                            callingType._id
                                        }
                                        value={
                                            callingType._id
                                        }
                                    >
                                        {
                                            callingType.callingTitle
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Calling Status */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Calling Status
                        </label>

                        <select
                            value={
                                callingStatus
                            }
                            onChange={(event) =>
                                setCallingStatus(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="Connected">
                                Connected
                            </option>

                            <option value="Not Connected">
                                Not Connected
                            </option>

                            <option value="Wrong Number">
                                Wrong Number
                            </option>

                        </select>

                    </div>


                    {/* Called By */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Called By User ID
                        </label>

                        <input
                            type="text"
                            value={
                                calledBy
                            }
                            onChange={(event) =>
                                setCalledBy(
                                    event.target.value
                                )
                            }
                            placeholder="Enter user ID"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>


                    {/* Follow Up Date */}
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


                    {/* Buttons */}
                    <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Search
                        </button>


                        <button
                            type="button"
                            onClick={
                                handleReset
                            }
                            disabled={
                                loading
                            }
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </div>


            {/* Error */}
            {error && (
                <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        className="font-medium underline"
                    >
                        Retry
                    </button>

                </div>
            )}


            {/* Call Logs */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">

                <div className="mb-4 flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Call Logs
                        </h2>

                        {pagination && (
                            <p className="mt-1 text-sm text-gray-500">
                                Total:{" "}
                                {
                                    pagination.total
                                }
                            </p>
                        )}

                    </div>


                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            loading
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Refresh
                    </button>

                </div>


                <CallLogTable
                    callLogs={
                        callLogs
                    }
                    loading={
                        loading
                    }
                    onEdit={
                        handleEdit
                    }
                    onRefresh={
                        handleRefresh
                    }
                />


                {/* Pagination */}
                {pagination &&
                    pagination.totalPages >
                        1 && (
                        <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-sm text-gray-500">
                                Page{" "}
                                {
                                    pagination.page
                                }{" "}
                                of{" "}
                                {
                                    pagination.totalPages
                                }
                            </p>


                            <div className="flex gap-2">

                                <button
                                    type="button"
                                    disabled={
                                        loading ||
                                        page <= 1
                                    }
                                    onClick={() =>
                                        handlePageChange(
                                            page -
                                                1
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>


                                <button
                                    type="button"
                                    disabled={
                                        loading ||
                                        page >=
                                            pagination.totalPages
                                    }
                                    onClick={() =>
                                        handlePageChange(
                                            page +
                                                1
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>

                            </div>

                        </div>
                    )}

            </div>

        </div>
    );
};


export default CallHistory;