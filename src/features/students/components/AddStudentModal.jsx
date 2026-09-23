// FILE PATH: frontend/src/features/students/components/AddStudentModal.jsx

import React from "react";

function AddStudentModal({
    open,
    addStudentData,
    addStudentError,
    addStudentLoading,

    programs,
    batches,
    districts,
    addStudentBlocks,
    addStudentCenters,

    addStudentBlockLoading,
    addStudentCenterLoading,

    isAdmin,
    isCC,

    showDistrict,
    showBlock,
    showCenter,

    onClose,
    onInputChange,
    onDistrictChange,
    onBlockChange,
    onSubmit,
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Add Student Request
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Submit a request to add a new student
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={addStudentLoading}
                        className="text-xl text-gray-500 hover:text-gray-800 disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="p-6"
                >
                    {/* ERROR */}
                    {addStudentError && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm text-red-600">
                                {addStudentError}
                            </p>
                        </div>
                    )}

                    {/* ==================================================
                        PERSONAL DETAILS
                    ================================================== */}

                    <div className="mb-6">
                        <h3 className="mb-4 font-semibold text-gray-800">
                            Personal Details
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            {/* SRN */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Student SRN *
                                </label>

                                <input
                                    type="text"
                                    name="studentSrn"
                                    value={addStudentData.studentSrn}
                                    onChange={onInputChange}
                                    required
                                    placeholder="Enter SRN"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Roll Number */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Roll Number
                                </label>

                                <input
                                    type="text"
                                    name="rollNumber"
                                    value={addStudentData.rollNumber}
                                    onChange={onInputChange}
                                    placeholder="Enter roll number"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={addStudentData.name}
                                    onChange={onInputChange}
                                    required
                                    placeholder="Student name"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Father */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Father Name
                                </label>

                                <input
                                    type="text"
                                    name="fatherName"
                                    value={addStudentData.fatherName}
                                    onChange={onInputChange}
                                    placeholder="Father name"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Mother */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Mother Name
                                </label>

                                <input
                                    type="text"
                                    name="motherName"
                                    value={addStudentData.motherName}
                                    onChange={onInputChange}
                                    placeholder="Mother name"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* DOB */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dob"
                                    value={addStudentData.dob}
                                    onChange={onInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={addStudentData.gender}
                                    onChange={onInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        Select Gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    value={addStudentData.category}
                                    onChange={onInputChange}
                                    placeholder="General / SC / BC..."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Personal Contact */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Personal Contact
                                </label>

                                <input
                                    type="text"
                                    name="personalContact"
                                    value={addStudentData.personalContact}
                                    onChange={onInputChange}
                                    placeholder="Personal contact"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Parent Contact */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Parent Contact
                                </label>

                                <input
                                    type="text"
                                    name="parentContact"
                                    value={addStudentData.parentContact}
                                    onChange={onInputChange}
                                    placeholder="Parent contact"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Other Contact */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Other Contact
                                </label>

                                <input
                                    type="text"
                                    name="otherContact"
                                    value={addStudentData.otherContact}
                                    onChange={onInputChange}
                                    placeholder="Other contact"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-3">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    value={addStudentData.address}
                                    onChange={onInputChange}
                                    rows="2"
                                    placeholder="Student address"
                                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                        </div>
                    </div>

                    {/* ==================================================
                        ENROLLMENT DETAILS
                    ================================================== */}

                    <div className="mb-6">
                        <h3 className="mb-4 font-semibold text-gray-800">
                            Enrollment Details
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            {/* PROGRAM */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Program *
                                </label>

                                <select
                                    name="programId"
                                    value={addStudentData.programId}
                                    onChange={onInputChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        Select Program
                                    </option>

                                    {programs.map((program) => (
                                        <option
                                            key={program._id}
                                            value={program._id}
                                        >
                                            {program.programName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* BATCH */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Batch *
                                </label>

                                <select
                                    name="batchId"
                                    value={addStudentData.batchId}
                                    onChange={onInputChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        Select Batch
                                    </option>

                                    {batches.map((batch) => (
                                        <option
                                            key={batch._id}
                                            value={batch._id}
                                        >
                                            {batch.batchName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* DISTRICT */}
                            {showDistrict && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        District
                                    </label>

                                    <select
                                        name="districtId"
                                        value={addStudentData.districtId}
                                        onChange={onDistrictChange}
                                        required={!isAdmin && !isCC}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="">
                                            {isAdmin
                                                ? "All Districts"
                                                : "Select District"}
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
                            )}

                            {/* BLOCK */}
                            {showBlock && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Block
                                    </label>

                                    <select
                                        name="blockId"
                                        value={addStudentData.blockId}
                                        onChange={onBlockChange}
                                        disabled={
                                            (!addStudentData.districtId &&
                                                !isAdmin) ||
                                            addStudentBlockLoading
                                        }
                                        required={!isAdmin && !isCC}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-gray-100 focus:border-blue-500"
                                    >
                                        <option value="">
                                            {addStudentBlockLoading
                                                ? "Loading blocks..."
                                                : isAdmin
                                                    ? "All Blocks"
                                                    : "Select Block"}
                                        </option>

                                        {addStudentBlocks.map((block) => (
                                            <option
                                                key={block._id}
                                                value={block._id}
                                            >
                                                {block.blockName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* CENTER */}
                            {showCenter && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Center
                                    </label>

                                    <select
                                        name="centerId"
                                        value={addStudentData.centerId}
                                        onChange={onInputChange}
                                        disabled={
                                            ((!addStudentData.blockId &&
                                                !isAdmin &&
                                                !isCC) ||
                                                addStudentCenterLoading)
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-gray-100 focus:border-blue-500"
                                    >
                                        <option value="">
                                            {addStudentCenterLoading
                                                ? "Loading centers..."
                                                : isAdmin
                                                    ? "All Centers"
                                                    : "Select Center"}
                                        </option>

                                        {addStudentCenters.map((center) => (
                                            <option
                                                key={center._id}
                                                value={center._id}
                                            >
                                                {center.centerName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* CLASS */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Class
                                </label>

                                <select
                                    name="class"
                                    value={addStudentData.class}
                                    onChange={onInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        Select Class
                                    </option>

                                    {[6, 7, 8, 9, 10, 11, 12].map(
                                        (classNumber) => (
                                            <option
                                                key={classNumber}
                                                value={classNumber}
                                            >
                                                Class {classNumber}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* BOARD */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Board
                                </label>

                                <input
                                    type="text"
                                    name="board"
                                    value={addStudentData.board}
                                    onChange={onInputChange}
                                    placeholder="HBSE / CBSE"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* ENROLLMENT DATE */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Enrollment Date
                                </label>

                                <input
                                    type="date"
                                    name="enrollmentDate"
                                    value={addStudentData.enrollmentDate}
                                    onChange={onInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                        </div>
                    </div>

                    {/* ==================================================
                        REQUEST REASON
                    ================================================== */}

                    <div className="mb-6">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Request Reason *
                        </label>

                        <textarea
                            name="requestReason"
                            value={addStudentData.requestReason}
                            onChange={onInputChange}
                            required
                            rows="4"
                            placeholder="Why should this student be added?"
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={addStudentLoading}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={addStudentLoading}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {addStudentLoading
                                ? "Submitting..."
                                : "Submit Add Request"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddStudentModal;