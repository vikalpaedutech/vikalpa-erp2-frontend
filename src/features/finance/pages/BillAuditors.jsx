import { useEffect, useState } from "react";

import {
    createBillAuditor,
    getBillAuditors,
    updateBillAuditor,
    deleteBillAuditor,
} from "../services/billAuditor.service";

import { getUsers } from "../../../services/user.service";
import { getDistricts } from "../../../services/district.service";
import { getBlocksByDistrict } from "../../../services/block.service";
import { getCentersByBlock } from "../../../services/center.service";

const initialForm = {
    userId: "",
    roleAccess: "CC",
    action: "verify",
    regionScope: "global",
    districtId: "",
    blockId: "",
    centerId: "",
    isActive: true,
};

const BillAuditors = () => {
    const [billAuditors, setBillAuditors] = useState([]);

    const [users, setUsers] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [centers, setCenters] = useState([]);

    const [form, setForm] = useState(initialForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [usersLoading, setUsersLoading] = useState(false);
    const [districtsLoading, setDistrictsLoading] = useState(false);
    const [blocksLoading, setBlocksLoading] = useState(false);
    const [centersLoading, setCentersLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const extractArray = (response, possibleKeys = []) => {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        for (const key of possibleKeys) {
            if (Array.isArray(response?.data?.[key])) {
                return response.data[key];
            }

            if (Array.isArray(response?.[key])) {
                return response[key];
            }
        }

        return [];
    };

    const fetchBillAuditors = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getBillAuditors();

            const data = extractArray(response, [
                "billAuditors",
                "auditors",
                "data",
            ]);

            setBillAuditors(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to fetch bill auditors"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);

            const response = await getUsers({
                page: 1,
                limit: 1000,
            });

            const data = extractArray(response, [
                "users",
                "data",
            ]);

            setUsers(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to fetch users"
            );
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchDistricts = async () => {
        try {
            setDistrictsLoading(true);

            const response = await getDistricts({
                page: 1,
                limit: 1000,
            });

            const data = extractArray(response, [
                "districts",
                "data",
            ]);

            setDistricts(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to fetch districts"
            );
        } finally {
            setDistrictsLoading(false);
        }
    };

    const fetchBlocks = async (districtId) => {
        if (!districtId) {
            setBlocks([]);
            return;
        }

        try {
            setBlocksLoading(true);

            const response = await getBlocksByDistrict(districtId);

            const data = extractArray(response, [
                "blocks",
                "data",
            ]);

            setBlocks(data);
        } catch (err) {
            setBlocks([]);

            setError(
                err.response?.data?.message ||
                "Failed to fetch blocks"
            );
        } finally {
            setBlocksLoading(false);
        }
    };

    const fetchCenters = async (blockId) => {
        if (!blockId) {
            setCenters([]);
            return;
        }

        try {
            setCentersLoading(true);

            const response = await getCentersByBlock(blockId);

            const data = extractArray(response, [
                "centers",
                "data",
            ]);

            setCenters(data);
        } catch (err) {
            setCenters([]);

            setError(
                err.response?.data?.message ||
                "Failed to fetch centers"
            );
        } finally {
            setCentersLoading(false);
        }
    };

    useEffect(() => {
        fetchBillAuditors();
        fetchUsers();
        fetchDistricts();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        setError("");
        setSuccess("");
    };

    const handleRegionScopeChange = (e) => {
        const regionScope = e.target.value;

        setForm((prev) => ({
            ...prev,
            regionScope,
            districtId: "",
            blockId: "",
            centerId: "",
        }));

        setBlocks([]);
        setCenters([]);

        setError("");
        setSuccess("");
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;

        setForm((prev) => ({
            ...prev,
            districtId,
            blockId: "",
            centerId: "",
        }));

        setBlocks([]);
        setCenters([]);

        setError("");
        setSuccess("");

        if (districtId) {
            await fetchBlocks(districtId);
        }
    };

    const handleBlockChange = async (e) => {
        const blockId = e.target.value;

        setForm((prev) => ({
            ...prev,
            blockId,
            centerId: "",
        }));

        setCenters([]);

        setError("");
        setSuccess("");

        if (blockId) {
            await fetchCenters(blockId);
        }
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setBlocks([]);
        setCenters([]);
        setError("");
        setSuccess("");
    };

    const validateForm = () => {
        if (!form.userId) {
            return "Please select a user";
        }

        if (!form.roleAccess) {
            return "Please select role access";
        }

        if (!form.action) {
            return "Please select action";
        }

        if (!form.regionScope) {
            return "Please select region scope";
        }

        if (
            form.regionScope === "district" ||
            form.regionScope === "block" ||
            form.regionScope === "center"
        ) {
            if (!form.districtId) {
                return "Please select district";
            }
        }

        if (
            form.regionScope === "block" ||
            form.regionScope === "center"
        ) {
            if (!form.blockId) {
                return "Please select block";
            }
        }

        if (form.regionScope === "center") {
            if (!form.centerId) {
                return "Please select center";
            }
        }

        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setFormLoading(true);
            setError("");
            setSuccess("");

            const validationError = validateForm();

            if (validationError) {
                setError(validationError);
                return;
            }

            const payload = {
                userId: form.userId,
                roleAccess: form.roleAccess,
                action: form.action,
                regionScope: form.regionScope,
                districtId:
                    form.regionScope === "global"
                        ? null
                        : form.districtId || null,
                blockId:
                    form.regionScope === "block" ||
                    form.regionScope === "center"
                        ? form.blockId || null
                        : null,
                centerId:
                    form.regionScope === "center"
                        ? form.centerId || null
                        : null,
                isActive: form.isActive,
            };

            if (editingId) {
                await updateBillAuditor(editingId, payload);

                setSuccess(
                    "Bill auditor mapping updated successfully"
                );
            } else {
                await createBillAuditor(payload);

                setSuccess(
                    "Bill auditor mapping created successfully"
                );
            }

            resetForm();
            await fetchBillAuditors();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save bill auditor mapping"
            );
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (auditor) => {
        const districtId =
            auditor.districtId?._id ||
            auditor.districtId ||
            "";

        const blockId =
            auditor.blockId?._id ||
            auditor.blockId ||
            "";

        const centerId =
            auditor.centerId?._id ||
            auditor.centerId ||
            "";

        setEditingId(auditor._id);

        setForm({
            userId:
                auditor.userId?._id ||
                auditor.userId ||
                "",
            roleAccess: auditor.roleAccess || "CC",
            action: auditor.action || "verify",
            regionScope: auditor.regionScope || "global",
            districtId,
            blockId,
            centerId,
            isActive:
                auditor.isActive !== undefined
                    ? auditor.isActive
                    : true,
        });

        setError("");
        setSuccess("");

        if (districtId) {
            await fetchBlocks(districtId);
        }

        if (blockId) {
            await fetchCenters(blockId);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (billAuditorId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this bill auditor mapping?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await deleteBillAuditor(billAuditorId);

            setSuccess(
                "Bill auditor mapping deleted successfully"
            );

            if (editingId === billAuditorId) {
                resetForm();
            }

            await fetchBillAuditors();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete bill auditor mapping"
            );
        }
    };

    const getUserName = (auditor) => {
        if (auditor.userId?.name) {
            return auditor.userId.name;
        }

        if (auditor.userId?.email) {
            return auditor.userId.email;
        }

        const user = users.find(
            (item) =>
                item._id ===
                (auditor.userId?._id || auditor.userId)
        );

        return (
            user?.name ||
            user?.email ||
            auditor.userId ||
            "-"
        );
    };

    const getDistrictName = (auditor) => {
        if (auditor.districtId?.districtName) {
            return auditor.districtId.districtName;
        }

        const district = districts.find(
            (item) =>
                item._id ===
                (auditor.districtId?._id ||
                    auditor.districtId)
        );

        return district?.districtName || "-";
    };

    const getBlockName = (auditor) => {
        if (auditor.blockId?.blockName) {
            return auditor.blockId.blockName;
        }

        const block = blocks.find(
            (item) =>
                item._id ===
                (auditor.blockId?._id ||
                    auditor.blockId)
        );

        return block?.blockName || "-";
    };

    const getCenterName = (auditor) => {
        if (auditor.centerId?.centerName) {
            return auditor.centerId.centerName;
        }

        const center = centers.find(
            (item) =>
                item._id ===
                (auditor.centerId?._id ||
                    auditor.centerId)
        );

        return center?.centerName || "-";
    };

    const getRegionDisplay = (auditor) => {
        if (auditor.regionScope === "global") {
            return "Global";
        }

        if (auditor.regionScope === "district") {
            return getDistrictName(auditor);
        }

        if (auditor.regionScope === "block") {
            return `${getDistrictName(auditor)} → ${getBlockName(
                auditor
            )}`;
        }

        if (auditor.regionScope === "center") {
            return `${getDistrictName(auditor)} → ${getBlockName(
                auditor
            )} → ${getCenterName(auditor)}`;
        }

        return "-";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Bill Auditors
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Configure which users can verify or approve
                        bills and for which region.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                {/* Form */}
                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingId
                                    ? "Edit Bill Auditor"
                                    : "Create Bill Auditor"}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Assign verification or approval access
                                to a user.
                            </p>
                        </div>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {/* User */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    User
                                </label>

                                <select
                                    name="userId"
                                    value={form.userId}
                                    onChange={handleChange}
                                    disabled={usersLoading}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
                                >
                                    <option value="">
                                        {usersLoading
                                            ? "Loading users..."
                                            : "Select User"}
                                    </option>

                                    {users.map((user) => (
                                        <option
                                            key={user._id}
                                            value={user._id}
                                        >
                                            {user.name ||
                                                user.email ||
                                                user.userId ||
                                                user._id}
                                            {user.email &&
                                            user.name
                                                ? ` (${user.email})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Role Access */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Role Access
                                </label>

                                <select
                                    name="roleAccess"
                                    value={form.roleAccess}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                >
                                    <option value="CC">CC</option>
                                    <option value="ACI">ACI</option>
                                    <option value="CM">CM</option>
                                </select>
                            </div>

                            {/* Action */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Action
                                </label>

                                <select
                                    name="action"
                                    value={form.action}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                >
                                    <option value="verify">
                                        Verify
                                    </option>

                                    <option value="approve">
                                        Approve
                                    </option>
                                </select>
                            </div>

                            {/* Region Scope */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Region Scope
                                </label>

                                <select
                                    name="regionScope"
                                    value={form.regionScope}
                                    onChange={
                                        handleRegionScopeChange
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                >
                                    <option value="global">
                                        Global
                                    </option>

                                    <option value="district">
                                        District
                                    </option>

                                    <option value="block">
                                        Block
                                    </option>

                                    <option value="center">
                                        Center
                                    </option>
                                </select>
                            </div>

                            {/* District */}
                            {form.regionScope !== "global" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        District
                                    </label>

                                    <select
                                        name="districtId"
                                        value={form.districtId}
                                        onChange={
                                            handleDistrictChange
                                        }
                                        disabled={
                                            districtsLoading
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {districtsLoading
                                                ? "Loading districts..."
                                                : "Select District"}
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

                            {/* Block */}
                            {(form.regionScope === "block" ||
                                form.regionScope === "center") && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Block
                                    </label>

                                    <select
                                        name="blockId"
                                        value={form.blockId}
                                        onChange={
                                            handleBlockChange
                                        }
                                        disabled={
                                            !form.districtId ||
                                            blocksLoading
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {blocksLoading
                                                ? "Loading blocks..."
                                                : !form.districtId
                                                ? "Select District First"
                                                : "Select Block"}
                                        </option>

                                        {blocks.map((block) => (
                                            <option
                                                key={block._id}
                                                value={block._id}
                                            >
                                                {
                                                    block.blockName
                                                }
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Center */}
                            {form.regionScope === "center" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Center
                                    </label>

                                    <select
                                        name="centerId"
                                        value={form.centerId}
                                        onChange={handleChange}
                                        disabled={
                                            !form.blockId ||
                                            centersLoading
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {centersLoading
                                                ? "Loading centers..."
                                                : !form.blockId
                                                ? "Select Block First"
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
                                                    {center.centerCode
                                                        ? ` (${center.centerCode})`
                                                        : ""}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            )}

                            {/* Active */}
                            <div className="flex items-center pt-7">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={form.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />

                                    <span className="text-sm font-medium text-gray-700">
                                        Active
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {formLoading
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Mapping"
                                    : "Create Mapping"}
                            </button>

                            {!editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Existing Bill Auditor Mappings
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                            Loading bill auditor mappings...
                        </div>
                    ) : billAuditors.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                            No bill auditor mappings found.
                        </div>
                    ) : (
                        <>
                            {/* Desktop */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                User
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Role
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Action
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Scope
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {billAuditors.map(
                                            (auditor) => (
                                                <tr
                                                    key={
                                                        auditor._id
                                                    }
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                                        {
                                                            getUserName(
                                                                auditor
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-gray-700">
                                                        {
                                                            auditor.roleAccess
                                                        }
                                                    </td>

                                                    <td className="px-5 py-4 text-sm capitalize text-gray-700">
                                                        {
                                                            auditor.action
                                                        }
                                                    </td>

                                                    <td className="max-w-xs px-5 py-4 text-sm text-gray-700">
                                                        <div className="capitalize">
                                                            {
                                                                auditor.regionScope
                                                            }
                                                        </div>

                                                        {auditor.regionScope !==
                                                            "global" && (
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                {
                                                                    getRegionDisplay(
                                                                        auditor
                                                                    )
                                                                }
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                auditor.isActive
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            {auditor.isActive
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        auditor
                                                                    )
                                                                }
                                                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        auditor._id
                                                                    )
                                                                }
                                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile */}
                            <div className="space-y-4 p-4 md:hidden">
                                {billAuditors.map(
                                    (auditor) => (
                                        <div
                                            key={auditor._id}
                                            className="rounded-xl border border-gray-200 p-4"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {getUserName(
                                                            auditor
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {
                                                            auditor.roleAccess
                                                        }
                                                    </p>
                                                </div>

                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        auditor.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {auditor.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-gray-500">
                                                        Action
                                                    </span>

                                                    <span className="font-medium capitalize text-gray-900">
                                                        {
                                                            auditor.action
                                                        }
                                                    </span>
                                                </div>

                                                <div className="flex justify-between gap-4">
                                                    <span className="text-gray-500">
                                                        Scope
                                                    </span>

                                                    <span className="font-medium capitalize text-right text-gray-900">
                                                        {
                                                            auditor.regionScope
                                                        }
                                                    </span>
                                                </div>

                                                {auditor.regionScope !==
                                                    "global" && (
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-gray-500">
                                                            Region
                                                        </span>

                                                        <span className="max-w-[65%] text-right font-medium text-gray-900">
                                                            {getRegionDisplay(
                                                                auditor
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            auditor
                                                        )
                                                    }
                                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            auditor._id
                                                        )
                                                    }
                                                    className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillAuditors;