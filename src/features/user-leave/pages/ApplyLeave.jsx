import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  applyLeave,
  getLeaveTypes,
  getMyLeaveBalances,
} from "../services/userLeave.service";

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function ApplyLeave() {
  const navigate = useNavigate();

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attachments, setAttachments] = useState([]);

  const [form, setForm] = useState({
    leaveTypeId: "",
    fromDate: getToday(),
    toDate: getToday(),
    durationType: "Full Day",
    halfDayType: "",
    reason: "",
    remarks: "",
  });

  useEffect(() => {
    const loadLeaveTypes = async () => {
      try {
        setLoadingTypes(true);
        setError("");

        const response = await getLeaveTypes({
          isActive: true,
        });

        setLeaveTypes(
          Array.isArray(response?.data) ? response.data : []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load leave types."
        );
      } finally {
        setLoadingTypes(false);
      }
    };

    loadLeaveTypes();
  }, []);

  useEffect(() => {
    const loadLeaveBalances = async () => {
      try {
        setLoadingBalances(true);

        const leaveYear = form.fromDate
          ? new Date(`${form.fromDate}T00:00:00`).getFullYear()
          : new Date().getFullYear();

        const response = await getMyLeaveBalances(leaveYear);

        setLeaveBalances(
          Array.isArray(response?.data) ? response.data : []
        );
      } catch (err) {
        console.error("Failed to load leave balances:", err);
        setLeaveBalances([]);
      } finally {
        setLoadingBalances(false);
      }
    };

    loadLeaveBalances();
  }, [form.fromDate]);

  const selectedLeaveBalance = useMemo(() => {
    if (!form.leaveTypeId) return null;

    return (
      leaveBalances.find(
        (balance) =>
          String(balance.leaveTypeId?._id) ===
          String(form.leaveTypeId)
      ) || null
    );
  }, [leaveBalances, form.leaveTypeId]);

  const usableBalance = selectedLeaveBalance
    ? Number(selectedLeaveBalance.availableBalance || 0) -
      Number(selectedLeaveBalance.pendingBalance || 0)
    : 0;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "durationType" && value === "Full Day"
        ? { halfDayType: "" }
        : {}),
      ...(name === "durationType" && value === "Half Day"
        ? { toDate: previous.fromDate }
        : {}),
      ...(name === "fromDate" && previous.durationType === "Half Day"
        ? { toDate: value }
        : {}),
    }));

    setError("");
    setSuccess("");
  };

  const calculatedDays = useMemo(() => {
    if (!form.fromDate || !form.toDate) return 0;

    const from = new Date(`${form.fromDate}T00:00:00`);
    const to = new Date(`${form.toDate}T00:00:00`);

    const difference = Math.round(
      (to.getTime() - from.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (difference < 0) return 0;

    return form.durationType === "Half Day"
      ? 0.5
      : difference + 1;
  }, [form.fromDate, form.toDate, form.durationType]);

  const handleAttachmentChange = (event) => {
    const files = Array.from(event.target.files || []);

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/jpg",
    ];

    const invalidFile = files.find(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFile) {
      setError(
        `"${invalidFile.name}" is not a supported file. Only PDF and image files are allowed.`
      );
      event.target.value = "";
      return;
    }

    const tooLarge = files.find(
      (file) => file.size > 10 * 1024 * 1024
    );

    if (tooLarge) {
      setError(
        `"${tooLarge.name}" is larger than 10 MB.`
      );
      event.target.value = "";
      return;
    }

    if (files.length > 10) {
      setError("You can attach a maximum of 10 files.");
      event.target.value = "";
      return;
    }

    setAttachments(files);
    setError("");
  };

  const removeAttachment = (index) => {
    setAttachments((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.leaveTypeId) {
      setError("Please select leave type.");
      return;
    }

    if (!form.fromDate || !form.toDate) {
      setError("Please select from and to dates.");
      return;
    }

    if (form.toDate < form.fromDate) {
      setError("To date cannot be earlier than from date.");
      return;
    }

    if (
      form.durationType === "Half Day" &&
      form.fromDate !== form.toDate
    ) {
      setError("Half Day leave must be for a single date.");
      return;
    }

    if (
      form.durationType === "Half Day" &&
      !form.halfDayType
    ) {
      setError("Please select First Half or Second Half.");
      return;
    }

    if (!form.reason.trim()) {
      setError("Please enter leave reason.");
      return;
    }

    if (!calculatedDays) {
      setError("Invalid leave duration.");
      return;
    }

    if (!selectedLeaveBalance) {
      setError(
        "Leave balance is not configured for this leave type and year."
      );
      return;
    }

    if (calculatedDays > usableBalance) {
      setError(
        `Insufficient leave balance. You can currently apply for ${usableBalance} day(s).`
      );
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("leaveTypeId", form.leaveTypeId);
      formData.append("fromDate", form.fromDate);
      formData.append("toDate", form.toDate);
      formData.append("durationType", form.durationType);
      formData.append("numberOfDays", calculatedDays);
      formData.append("reason", form.reason.trim());

      if (form.durationType === "Half Day") {
        formData.append("halfDayType", form.halfDayType);
      }

      if (form.remarks.trim()) {
        formData.append("remarks", form.remarks.trim());
      }

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await applyLeave(formData);

      setSuccess(
        "Leave applied successfully and sent for approval."
      );

      setAttachments([]);

      setForm((previous) => ({
        ...previous,
        reason: "",
        remarks: "",
        halfDayType: "",
      }));

      const fileInput = document.getElementById(
        "leave-attachments"
      );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to apply leave."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/leave/dashboard")}
              className="mb-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              ← Leave Dashboard
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              Apply Leave
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Submit a leave application for approval.
            </p>
          </div>

          <button
            onClick={() => navigate("/leave/my")}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700"
          >
            My Leaves
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Leave Type
              </label>

              <select
                name="leaveTypeId"
                value={form.leaveTypeId}
                onChange={handleChange}
                disabled={loadingTypes || submitting}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">
                  {loadingTypes
                    ? "Loading leave types..."
                    : "Select Leave Type"}
                </option>

                {leaveTypes.map((leaveType) => (
                  <option key={leaveType._id} value={leaveType._id}>
                    {leaveType.name} ({leaveType.code})
                    {leaveType.isPaid ? " — Paid" : " — Unpaid"}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-indigo-800">
                    Leave Balance
                  </p>

                  <p className="mt-1 text-xs text-indigo-600">
                    {loadingBalances
                      ? "Loading balance..."
                      : selectedLeaveBalance
                        ? `Year ${selectedLeaveBalance.leaveYear}`
                        : "Select a leave type with configured balance."}
                  </p>
                </div>

                {selectedLeaveBalance && (
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-900">
                      {usableBalance}
                    </p>

                    <p className="text-xs text-indigo-600">
                      available to apply
                    </p>
                  </div>
                )}
              </div>

              {selectedLeaveBalance && (
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div className="rounded-lg bg-white px-3 py-2">
                    <p className="text-gray-500">Balance</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedLeaveBalance.availableBalance}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white px-3 py-2">
                    <p className="text-gray-500">Pending</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedLeaveBalance.pendingBalance}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white px-3 py-2">
                    <p className="text-gray-500">Used</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedLeaveBalance.usedBalance}
                    </p>
                  </div>
                </div>
              )}

              {form.leaveTypeId &&
                !loadingBalances &&
                !selectedLeaveBalance && (
                  <p className="mt-3 text-sm font-medium text-red-600">
                    No balance configured for this leave type for the current year.
                  </p>
                )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                From Date
              </label>

              <input
                type="date"
                name="fromDate"
                value={form.fromDate}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                To Date
              </label>

              <input
                type="date"
                name="toDate"
                value={form.toDate}
                onChange={handleChange}
                disabled={
                  submitting ||
                  form.durationType === "Half Day"
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Duration
              </label>

              <select
                name="durationType"
                value={form.durationType}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
              >
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            {form.durationType === "Half Day" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Half Day
                </label>

                <select
                  name="halfDayType"
                  value={form.halfDayType}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="">Select Half</option>
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </div>
            )}

            <div className="md:col-span-2 rounded-xl bg-indigo-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-700">
                  Requested Days
                </span>

                <span className="text-lg font-bold text-indigo-900">
                  {calculatedDays || 0}
                </span>
              </div>

              <p className="mt-1 text-xs text-indigo-600">
                {form.fromDate && form.toDate
                  ? `${formatDate(form.fromDate)} → ${formatDate(form.toDate)}`
                  : "Select dates"}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Reason <span className="text-red-500">*</span>
              </label>

              <textarea
                name="reason"
                rows={4}
                value={form.reason}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Enter reason for leave"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Remarks
              </label>

              <textarea
                name="remarks"
                rows={3}
                value={form.remarks}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Additional remarks (optional)"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            {/* ==================================================
                LEAVE ATTACHMENTS
            ================================================== */}

            <div className="md:col-span-2">
              <label
                htmlFor="leave-attachments"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Attachments
              </label>

              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <input
                  id="leave-attachments"
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  onChange={handleAttachmentChange}
                  disabled={submitting}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-indigo-700"
                />

                <p className="mt-2 text-xs text-gray-500">
                  PDF or image files only. Maximum 10 files, 10 MB per file.
                </p>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          disabled={submitting}
                          className="ml-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={
                submitting ||
                loadingTypes ||
                loadingBalances
              }
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Leave"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/leave/dashboard")}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyLeave;
