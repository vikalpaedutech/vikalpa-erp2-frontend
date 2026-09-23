import { useEffect, useState } from "react";

import CallingDetailsTable from "../components/CallingDetailsTable";
import CallingDetailsView from "../components/CallingDetailsView";

import useCallingDetails from "../hooks/useCallingDetails";

import {
    getCallingTypes,
    downloadCallingDetailsTemplate,
    bulkUploadCallingDetails,
    exportCallingDetails,
} from "../services/calling.service";


const CallingDetails = () => {
    const [callingTypes, setCallingTypes] =
        useState([]);

    const [selectedCallingType, setSelectedCallingType] =
        useState("");

    const [callingStatus, setCallingStatus] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [showView, setShowView] =
        useState(false);

    const [selectedDetails, setSelectedDetails] =
        useState(null);

    const [uploading, setUploading] =
        useState(false);

    const [uploadError, setUploadError] =
        useState("");

    const [uploadSuccess, setUploadSuccess] =
        useState("");

    const [exporting, setExporting] =
        useState(false);

    const [exportError, setExportError] =
        useState("");


    const {
        callingDetails,
        pagination,
        loading,
        error,
        fetchCallingDetails,
    } = useCallingDetails();


    /*
     * ============================================================
     * LOAD CALLING TYPES
     * ============================================================
     */

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
                } catch (error) {
                    console.error(
                        "Failed to load calling types:",
                        error
                    );
                }
            };

        loadCallingTypes();
    }, []);


    /*
     * ============================================================
     * FILTERS
     * ============================================================
     */

    const buildFilters = (
        targetPage = page
    ) => {
        const filters = {
            page: targetPage,
            limit: 20,
        };

        if (selectedCallingType) {
            filters.callingTypeId =
                selectedCallingType;
        }

        if (callingStatus) {
            filters.callingStatus =
                callingStatus;
        }

        if (search.trim()) {
            filters.search =
                search.trim();
        }

        return filters;
    };


    /*
     * ============================================================
     * SEARCH
     * ============================================================
     */

    const handleSearch = async (
        event
    ) => {
        event.preventDefault();

        setPage(1);

        await fetchCallingDetails(
            buildFilters(1)
        );
    };


    /*
     * ============================================================
     * RESET
     * ============================================================
     */

    const handleReset = async () => {
        setSelectedCallingType("");
        setCallingStatus("");
        setSearch("");
        setPage(1);

        setUploadError("");
        setUploadSuccess("");
        setExportError("");

        await fetchCallingDetails({
            page: 1,
            limit: 20,
        });
    };


    /*
     * ============================================================
     * REFRESH
     * ============================================================
     */

    const handleRefresh = async () => {
        await fetchCallingDetails(
            buildFilters(page)
        );
    };


    /*
     * ============================================================
     * PAGINATION
     * ============================================================
     */

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

        await fetchCallingDetails(
            buildFilters(newPage)
        );
    };


    /*
     * ============================================================
     * DOWNLOAD TEMPLATE
     * ============================================================
     */

    const handleDownloadTemplate =
        async () => {
            if (!selectedCallingType) {
                setUploadError(
                    "Please select a Calling Type first."
                );

                setUploadSuccess("");

                return;
            }

            try {
                setUploadError("");
                setUploadSuccess("");

                const response =
                    await downloadCallingDetailsTemplate(
                        selectedCallingType
                    );

                const blob =
                    new Blob(
                        [response.data],
                        {
                            type:
                                "text/csv;charset=utf-8;",
                        }
                    );

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href = url;

                const selectedType =
                    callingTypes.find(
                        (type) =>
                            type._id ===
                            selectedCallingType
                    );

                const code =
                    selectedType?.callingTypeCode ||
                    "calling-details";

                link.download =
                    `calling-details-${code}.csv`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );
            } catch (error) {
                console.error(
                    "Failed to download template:",
                    error
                );

                setUploadError(
                    error.response?.data?.message ||
                    "Failed to download template."
                );
            }
        };


    /*
     * ============================================================
     * CSV UPLOAD
     * ============================================================
     */

    const handleUpload = async (
        event
    ) => {
        const file =
            event.target.files?.[0];

        event.target.value = "";

        if (!file) {
            return;
        }

        const isCsv =
            file.name
                .toLowerCase()
                .endsWith(".csv");

        const isExcel =
            file.name
                .toLowerCase()
                .endsWith(".xlsx") ||
            file.name
                .toLowerCase()
                .endsWith(".xls");

        if (!isCsv && !isExcel) {
            setUploadError(
                "Please upload a CSV or Excel file."
            );

            setUploadSuccess("");

            return;
        }

        try {
            setUploading(true);
            setUploadError("");
            setUploadSuccess("");

            const response =
                await bulkUploadCallingDetails(
                    file,
                    selectedCallingType
                );

            const createdCount =
                response.data?.createdCount;

            setUploadSuccess(
                `${createdCount ?? 0} calling details uploaded successfully.`
            );

            setPage(1);

            await fetchCallingDetails({
                page: 1,
                limit: 20,
            });
        } catch (error) {
            console.error(
                "Failed to upload calling details:",
                error
            );

            const apiError =
                error.response?.data;

            let message =
                apiError?.message ||
                "Failed to upload calling details.";

            if (
                Array.isArray(
                    apiError?.errors
                ) &&
                apiError.errors.length
            ) {
                message =
                    `${message} ${apiError.errors.join(" | ")}`;
            }

            setUploadError(
                message
            );
        } finally {
            setUploading(false);
        }
    };


    /*
     * ============================================================
     * EXPORT CALLING DETAILS
     * ============================================================
     */

    const handleExport = async () => {
        try {
            setExporting(true);
            setExportError("");

            /*
             * Export uses the current filters.
             * Pagination is intentionally NOT included.
             */

            const filters = {};

            if (selectedCallingType) {
                filters.callingTypeId =
                    selectedCallingType;
            }

            if (callingStatus) {
                filters.callingStatus =
                    callingStatus;
            }

            if (search.trim()) {
                filters.search =
                    search.trim();
            }


            const response =
                await exportCallingDetails(
                    filters
                );


            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;


            const selectedType =
                callingTypes.find(
                    (type) =>
                        type._id ===
                        selectedCallingType
                );


            const code =
                selectedType?.callingTypeCode ||
                "all";


            const date =
                new Date()
                    .toISOString()
                    .split("T")[0];


            link.download =
                `calling-details-${code}-${date}.xlsx`;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            window.URL.revokeObjectURL(
                url
            );

        } catch (error) {

            console.error(
                "Failed to export calling details:",
                error
            );


            /*
             * Blob response can contain JSON error.
             */

            let message =
                "Failed to export calling details.";


            if (
                error.response?.data
                    instanceof Blob
            ) {
                try {
                    const errorText =
                        await error.response.data.text();

                    const errorData =
                        JSON.parse(
                            errorText
                        );

                    message =
                        errorData?.message ||
                        message;

                } catch {
                    // Keep default message.
                }

            } else {
                message =
                    error.response?.data?.message ||
                    message;
            }


            setExportError(
                message
            );

        } finally {
            setExporting(false);
        }
    };


    /*
     * ============================================================
     * VIEW
     * ============================================================
     */

    const handleView = (
        callingDetailsItem
    ) => {
        setSelectedDetails(
            callingDetailsItem
        );

        setShowView(true);
    };


    const handleCloseView = () => {
        setSelectedDetails(null);
        setShowView(false);
    };


    /*
     * ============================================================
     * MAIN DETAIL VIEW
     * ============================================================
     */

    if (showView) {
        return (
            <div className="min-h-full bg-gray-50 p-4 md:p-6">

                <div className="mb-6 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Calling Details
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            View complete calling details.
                        </p>
                    </div>


                    <button
                        type="button"
                        onClick={
                            handleCloseView
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Back
                    </button>

                </div>


                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">

                    <CallingDetailsView
                        callingDetails={
                            selectedDetails
                        }
                        onClose={
                            handleCloseView
                        }
                    />

                </div>

            </div>
        );
    }


    /*
     * ============================================================
     * MAIN PAGE
     * ============================================================
     */

    return (
        <div className="min-h-full bg-gray-50 p-4 md:p-6">

            {/* Header */}

            <div className="mb-6 flex items-center justify-between gap-4">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Calling Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage and upload calling details in bulk.
                    </p>
                </div>


                {/* EXPORT */}

                <button
                    type="button"
                    onClick={
                        handleExport
                    }
                    disabled={
                        exporting ||
                        loading
                    }
                    className="shrink-0 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {exporting
                        ? "Exporting..."
                        : "Export XLSX"}
                </button>

            </div>


            {/* Bulk Upload Section */}

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                <h2 className="text-lg font-semibold text-gray-900">
                    Bulk Calling Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Select a Calling Type, download its template,
                    fill the CSV and upload it to create multiple
                    calling records.
                </p>


                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* Calling Type */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Calling Type
                        </label>

                        <select
                            value={
                                selectedCallingType
                            }
                            onChange={(event) => {
                                setSelectedCallingType(
                                    event.target.value
                                );

                                setUploadError("");
                                setUploadSuccess("");
                                setExportError("");
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">
                                Select Calling Type
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


                    {/* Download */}

                    <div className="flex items-end">

                        <button
                            type="button"
                            onClick={
                                handleDownloadTemplate
                            }
                            disabled={
                                !selectedCallingType ||
                                uploading
                            }
                            className="w-full rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Download CSV Template
                        </button>

                    </div>


                    {/* Upload */}

                    <div className="flex items-end">

                        <label
                            className={`flex w-full cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 ${
                                !selectedCallingType ||
                                uploading
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                            }`}
                        >

                            {uploading
                                ? "Uploading..."
                                : "Upload CSV"}

                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={
                                    handleUpload
                                }
                                disabled={
                                    !selectedCallingType ||
                                    uploading
                                }
                                className="hidden"
                            />

                        </label>

                    </div>

                </div>


                {/* Upload Error */}

                {uploadError && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {uploadError}
                    </div>
                )}


                {/* Upload Success */}

                {uploadSuccess && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {uploadSuccess}
                    </div>
                )}

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
                            value={
                                search
                            }
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search by name, contact, father..."
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
                                selectedCallingType
                            }
                            onChange={(event) =>
                                setSelectedCallingType(
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


            {/* Export Error */}

            {exportError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {exportError}
                </div>
            )}


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


            {/* Table */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">

                <div className="mb-4 flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Calling Records
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


                <CallingDetailsTable
                    callingDetails={
                        callingDetails
                    }
                    loading={
                        loading
                    }
                    onView={
                        handleView
                    }
                    onEdit={
                        undefined
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


export default CallingDetails;