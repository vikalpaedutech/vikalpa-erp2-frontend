import { useState } from "react";

import CallingTypeForm from "../components/CallingTypeForm";
import CallingTypeTable from "../components/CallingTypeTable";

import useCallingTypes from "../hooks/useCallingTypes";


const CallingTypes = () => {
    const [showForm, setShowForm] =
        useState(false);

    const [editingCallingType, setEditingCallingType] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [page, setPage] =
        useState(1);


  const {
    callingTypes,
    pagination,
    loading,
    error,
    fetchCallingTypes,
} = useCallingTypes();



    const handleSearch = async (event) => {
        event.preventDefault();

        setPage(1);

        await fetchCallingTypes({
            page: 1,
            limit: 20,
            search: search.trim(),
        });
    };


    const handlePageChange = async (newPage) => {
        if (
            newPage < 1 ||
            (pagination &&
                newPage > pagination.totalPages)
        ) {
            return;
        }

        setPage(newPage);

        await fetchCallingTypes({
            page: newPage,
            limit: 20,
            search: search.trim(),
        });
    };


    const handleCreate = () => {
        setEditingCallingType(null);
        setShowForm(true);
    };


    const handleEdit = (callingType) => {
        setEditingCallingType(
            callingType
        );

        setShowForm(true);
    };


    const handleFormSuccess = async () => {
        setShowForm(false);
        setEditingCallingType(null);

        await fetchCallingTypes({
            page,
            limit: 20,
            search: search.trim(),
        });
    };


    const handleCancel = () => {
        setShowForm(false);
        setEditingCallingType(null);
    };


    const handleRefresh = async () => {
        await fetchCallingTypes({
            page,
            limit: 20,
            search: search.trim(),
        });
    };


    return (
        <div className="min-h-full bg-gray-50 p-4 md:p-6">

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Calling Types
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Create and manage calling types.
                    </p>
                </div>


                {!showForm && (
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Create Calling Type
                    </button>
                )}

            </div>


            {/* Form */}
            {showForm ? (
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">

                    <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingCallingType
                                    ? "Edit Calling Type"
                                    : "Create Calling Type"}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {editingCallingType
                                    ? "Update calling type details."
                                    : "Add a new calling type."}
                            </p>
                        </div>

                    </div>


                    <CallingTypeForm
                        callingType={
                            editingCallingType
                        }
                        onSuccess={
                            handleFormSuccess
                        }
                        onCancel={
                            handleCancel
                        }
                    />

                </div>
            ) : (
                <>
                    {/* Search */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                        <form
                            onSubmit={
                                handleSearch
                            }
                            className="flex flex-col gap-3 md:flex-row"
                        >

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by title, code or calling to..."
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />


                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Search
                            </button>


                            <button
                                type="button"
                                onClick={async () => {
                                    setSearch("");
                                    setPage(1);

                                    await fetchCallingTypes({
                                        page: 1,
                                        limit: 20,
                                        search: "",
                                    });
                                }}
                                disabled={loading}
                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Reset
                            </button>

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


                    {/* Table */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">

                        <div className="mb-4 flex items-center justify-between">

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    All Calling Types
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
                                disabled={loading}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Refresh
                            </button>

                        </div>


                        <CallingTypeTable
                            callingTypes={
                                callingTypes
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
                </>
            )}

        </div>
    );
};


export default CallingTypes;