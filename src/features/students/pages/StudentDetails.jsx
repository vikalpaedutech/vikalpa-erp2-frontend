// FILE PATH: C:\Users\shubh\OneDrive\Desktop\vikalpaerpv2\frontend\src\features\students\pages\StudentDetails.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getStudentById,
    requestStudentRemove,
    requestStudentSLC,
    requestStudentTransfer,
} from "../services/student.service";

import { getDistricts } from "../../../services/district.service";
import { getBlocksByDistrict } from "../../../services/block.service";
import { getCentersByBlock } from "../../../services/center.service";

const StudentDetails = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);

    const [showRemoveForm, setShowRemoveForm] = useState(false);
    const [showSLCForm, setShowSLCForm] = useState(false);
    const [showTransferForm, setShowTransferForm] = useState(false);

    const [requestReason, setRequestReason] = useState("");

    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [centers, setCenters] = useState([]);

    const [transferData, setTransferData] = useState({
        districtId: "",
        blockId: "",
        centerId: "",
    });

    const [regionLoading, setRegionLoading] = useState(false);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getStudentById(studentId);

                setStudent(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to fetch student details"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [studentId]);

    const getActiveEnrollment = () => {
        return student?.enrollments?.find(
            (enrollment) =>
                enrollment.status === "active" ||
                enrollment.status === "provisional"
        );
    };

    const handleRemoveRequest = async (event) => {
        event.preventDefault();

        if (!requestReason.trim()) {
            setActionError(
                "Request reason is required."
            );
            return;
        }

        try {
            setActionLoading(true);
            setActionError(null);
            setActionSuccess(null);

            await requestStudentRemove({
                studentId: student.student._id,
                requestReason: requestReason.trim(),
            });

            setActionSuccess(
                "Student removal request submitted successfully."
            );

            setRequestReason("");
            setShowRemoveForm(false);

            const response =
                await getStudentById(studentId);

            setStudent(response.data);
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                "Failed to submit removal request."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleSLCRequest = async (event) => {
        event.preventDefault();

        if (!requestReason.trim()) {
            setActionError(
                "Request reason is required."
            );
            return;
        }

        try {
            setActionLoading(true);
            setActionError(null);
            setActionSuccess(null);

            await requestStudentSLC({
                studentId: student.student._id,
                requestReason: requestReason.trim(),
            });

            setActionSuccess(
                "Student SLC request submitted successfully."
            );

            setRequestReason("");
            setShowSLCForm(false);

            const response =
                await getStudentById(studentId);

            setStudent(response.data);
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                "Failed to submit SLC request."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const loadDistricts = async () => {
        try {
            setRegionLoading(true);

            const response = await getDistricts({
                page: 1,
                limit: 100,
            });

            setDistricts(
                response.data?.districts || []
            );
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                "Failed to load districts."
            );
        } finally {
            setRegionLoading(false);
        }
    };

    const loadBlocks = async (districtId) => {
        if (!districtId) {
            setBlocks([]);
            return;
        }

        try {
            setRegionLoading(true);

            const response =
                await getBlocksByDistrict(
                    districtId
                );

            setBlocks(response.data || []);
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                "Failed to load blocks."
            );
        } finally {
            setRegionLoading(false);
        }
    };

    const loadCenters = async (blockId) => {
        if (!blockId) {
            setCenters([]);
            return;
        }

        try {
            setRegionLoading(true);

            const response =
                await getCentersByBlock(blockId);

            setCenters(response.data || []);
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                "Failed to load centers."
            );
        } finally {
            setRegionLoading(false);
        }
    };

    const handleOpenTransferForm = async () => {
        setActionError(null);
        setActionSuccess(null);

        setRequestReason("");

        setShowRemoveForm(false);
        setShowSLCForm(false);
        setShowTransferForm(true);

        setTransferData({
            districtId: "",
            blockId: "",
            centerId: "",
        });

        setBlocks([]);
        setCenters([]);

        await loadDistricts();
    };

    const handleTransferChange = async (event) => {
        const { name, value } = event.target;

        setActionError(null);

        if (name === "districtId") {
            setTransferData({
                districtId: value,
                blockId: "",
                centerId: "",
            });

            setBlocks([]);
            setCenters([]);

            if (value) {
                await loadBlocks(value);
            }

            return;
        }

        if (name === "blockId") {
            setTransferData((previous) => ({
                ...previous,
                blockId: value,
                centerId: "",
            }));

            setCenters([]);

            if (value) {
                await loadCenters(value);
            }

            return;
        }

        setTransferData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleTransferRequest = async (event) => {
        event.preventDefault();

        if (
            !transferData.districtId ||
            !transferData.blockId ||
            !transferData.centerId
        ) {
            setActionError(
                "District, block and center are required."
            );
            return;
        }

        if (!requestReason.trim()) {
            setActionError(
                "Request reason is required."
            );
            return;
        }

        try {
            setActionLoading(true);
            setActionError(null);
            setActionSuccess(null);

            await requestStudentTransfer({
                studentId: student.student._id,

                transferTo: {
                    districtId:
                        transferData.districtId,
                    blockId:
                        transferData.blockId,
                    centerId:
                        transferData.centerId,
                },

                requestReason:
                    requestReason.trim(),
            });

            setActionSuccess(
                "Student transfer request submitted successfully."
            );

            setRequestReason("");

            setTransferData({
                districtId: "",
                blockId: "",
                centerId: "",
            });

            setBlocks([]);
            setCenters([]);

            setShowTransferForm(false);

            const response =
                await getStudentById(studentId);

            setStudent(response.data);
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                "Failed to submit transfer request."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenRemoveForm = () => {
        setActionError(null);
        setActionSuccess(null);
        setRequestReason("");

        setShowSLCForm(false);
        setShowTransferForm(false);
        setShowRemoveForm(true);
    };

    const handleOpenSLCForm = () => {
        setActionError(null);
        setActionSuccess(null);
        setRequestReason("");

        setShowRemoveForm(false);
        setShowTransferForm(false);
        setShowSLCForm(true);
    };

    const handleCancelAction = () => {
        setRequestReason("");

        setShowRemoveForm(false);
        setShowSLCForm(false);
        setShowTransferForm(false);

        setTransferData({
            districtId: "",
            blockId: "",
            centerId: "",
        });

        setBlocks([]);
        setCenters([]);

        setActionError(null);
    };

    if (loading) {
        return (
            <div className="p-6">
                Loading student details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-red-600">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/students")
                    }
                    className="mt-4 rounded-md border px-4 py-2"
                >
                    Back to Students
                </button>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="p-6">
                Student not found.
            </div>
        );
    }

    const activeEnrollment =
        getActiveEnrollment();

    const canRequestActions =
        !!activeEnrollment;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Student Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        {student.student?.name}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/students")
                    }
                    className="rounded-md border px-4 py-2"
                >
                    Back
                </button>
            </div>

            {/* Student Actions */}
            <div className="mb-6 rounded-lg border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">
                    Student Actions
                </h2>

                {actionError && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                {actionSuccess && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        {actionSuccess}
                    </div>
                )}

                {!canRequestActions && (
                    <p className="mb-4 text-sm text-gray-500">
                        No active enrollment is available
                        for student actions.
                    </p>
                )}

                {!showRemoveForm &&
                    !showSLCForm &&
                    !showTransferForm && (
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                disabled={
                                    !canRequestActions ||
                                    actionLoading
                                }
                                onClick={
                                    handleOpenRemoveForm
                                }
                                className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Request Remove
                            </button>

                            <button
                                type="button"
                                disabled={
                                    !canRequestActions ||
                                    actionLoading
                                }
                                onClick={
                                    handleOpenSLCForm
                                }
                                className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Request SLC
                            </button>

                            <button
                                type="button"
                                disabled={
                                    !canRequestActions ||
                                    actionLoading
                                }
                                onClick={
                                    handleOpenTransferForm
                                }
                                className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Request Transfer
                            </button>
                        </div>
                    )}

                {/* Remove Request */}
                {showRemoveForm && (
                    <form
                        onSubmit={
                            handleRemoveRequest
                        }
                        className="rounded-md border p-4"
                    >
                        <h3 className="mb-3 font-medium">
                            Request Student Removal
                        </h3>

                        <label className="mb-1 block text-sm font-medium">
                            Reason
                        </label>

                        <textarea
                            value={requestReason}
                            onChange={(event) =>
                                setRequestReason(
                                    event.target.value
                                )
                            }
                            placeholder="Enter reason for student removal..."
                            rows="4"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                        />

                        <div className="mt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={
                                    actionLoading
                                }
                                className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {actionLoading
                                    ? "Submitting..."
                                    : "Submit Request"}
                            </button>

                            <button
                                type="button"
                                disabled={
                                    actionLoading
                                }
                                onClick={
                                    handleCancelAction
                                }
                                className="rounded-md border px-4 py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* SLC Request */}
                {showSLCForm && (
                    <form
                        onSubmit={
                            handleSLCRequest
                        }
                        className="rounded-md border p-4"
                    >
                        <h3 className="mb-3 font-medium">
                            Request SLC
                        </h3>

                        <label className="mb-1 block text-sm font-medium">
                            Reason
                        </label>

                        <textarea
                            value={requestReason}
                            onChange={(event) =>
                                setRequestReason(
                                    event.target.value
                                )
                            }
                            placeholder="Enter reason for SLC request..."
                            rows="4"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                        />

                        <div className="mt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={
                                    actionLoading
                                }
                                className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {actionLoading
                                    ? "Submitting..."
                                    : "Submit Request"}
                            </button>

                            <button
                                type="button"
                                disabled={
                                    actionLoading
                                }
                                onClick={
                                    handleCancelAction
                                }
                                className="rounded-md border px-4 py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Transfer Request */}
                {showTransferForm && (
                    <form
                        onSubmit={
                            handleTransferRequest
                        }
                        className="rounded-md border p-4"
                    >
                        <h3 className="mb-4 font-medium">
                            Request Student Transfer
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* District */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    District
                                </label>

                                <select
                                    name="districtId"
                                    value={
                                        transferData.districtId
                                    }
                                    onChange={
                                        handleTransferChange
                                    }
                                    disabled={
                                        regionLoading
                                    }
                                    className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
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

                            {/* Block */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Block
                                </label>

                                <select
                                    name="blockId"
                                    value={
                                        transferData.blockId
                                    }
                                    onChange={
                                        handleTransferChange
                                    }
                                    disabled={
                                        !transferData.districtId ||
                                        regionLoading
                                    }
                                    className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
                                >
                                    <option value="">
                                        Select Block
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

                            {/* Center */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Center
                                </label>

                                <select
                                    name="centerId"
                                    value={
                                        transferData.centerId
                                    }
                                    onChange={
                                        handleTransferChange
                                    }
                                    disabled={
                                        !transferData.blockId ||
                                        regionLoading
                                    }
                                    className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
                                >
                                    <option value="">
                                        Select Center
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
                        </div>

                        <div className="mt-4">
                            <label className="mb-1 block text-sm font-medium">
                                Reason
                            </label>

                            <textarea
                                value={requestReason}
                                onChange={(event) =>
                                    setRequestReason(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter reason for student transfer..."
                                rows="4"
                                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                            />
                        </div>

                        <div className="mt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={
                                    actionLoading ||
                                    regionLoading
                                }
                                className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {actionLoading
                                    ? "Submitting..."
                                    : "Submit Transfer Request"}
                            </button>

                            <button
                                type="button"
                                disabled={
                                    actionLoading
                                }
                                onClick={
                                    handleCancelAction
                                }
                                className="rounded-md border px-4 py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Basic Information */}
            <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-5 text-lg font-semibold">
                    Basic Information
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-sm text-gray-500">
                            SRN
                        </p>

                        <p className="font-medium">
                            {student.student?.studentSrn ||
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Roll Number
                        </p>

                        <p className="font-medium">
                            {student.student?.rollNumber ||
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Name
                        </p>

                        <p className="font-medium">
                            {student.student?.name ||
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Father Name
                        </p>

                        <p className="font-medium">
                            {student.student?.fatherName ||
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Mother Name
                        </p>

                        <p className="font-medium">
                            {student.student?.motherName ||
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Personal Contact
                        </p>

                        <p className="font-medium">
                            {student.student
                                ?.personalContact ||
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Parent Contact
                        </p>

                        <p className="font-medium">
                            {student.student
                                ?.parentContact ||
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Gender
                        </p>

                        <p className="font-medium">
                            {student.student?.gender ||
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Category
                        </p>

                        <p className="font-medium">
                            {student.student?.category ||
                                "-"}
                        </p>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm text-gray-500">
                            Address
                        </p>

                        <p className="font-medium">
                            {student.student?.address ||
                                "-"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Enrollments */}
            <div className="mt-6 rounded-lg border bg-white p-6">
                <h2 className="mb-5 text-lg font-semibold">
                    Enrollments
                </h2>

                {!student.enrollments ||
                student.enrollments.length === 0 ? (
                    <p className="text-gray-500">
                        No enrollments found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Program
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Batch
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        District
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Block
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Center
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Class
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Board
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {student.enrollments.map(
                                    (enrollment) => (
                                        <tr
                                            key={
                                                enrollment._id
                                            }
                                            className="border-b"
                                        >
                                            <td className="px-4 py-3">
                                                {enrollment
                                                    .programId
                                                    ?.programName ||
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {enrollment
                                                    .batchId
                                                    ?.batchName ||
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {enrollment
                                                    .districtId
                                                    ?.districtName ||
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {enrollment
                                                    .blockId
                                                    ?.blockName ||
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {enrollment
                                                    .centerId
                                                    ?.centerName ||
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {enrollment.class ||
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {enrollment.board ||
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {enrollment.status ||
                                                    "-"}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetails;