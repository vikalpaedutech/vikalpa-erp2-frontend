import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getExamById,
  updateExam,
} from "../services/exam.service";

import ProgramDropdown from "../../../components/common/dropdowns/ProgramDropdown";
import BatchDropdown from "../../../components/common/dropdowns/BatchDropdown";

import { getPrograms } from "../../../services/program.service";
import { getBatches } from "../../../services/batch.service";

const EditExamManagement = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // DATA
  // ============================================================

  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // FORM
  // ============================================================

  const [formData, setFormData] = useState({
    examName: "",
    examCode: "",
    examDate: "",
    subject: "",
    maximumMarks: "",
    programId: "",
    batchId: "",
    board: "",
    class: "",
    marksUploadWithinDays: "",
    description: "",
    isThereAnyAttachment: false,
    isActive: true,
  });

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          examResponse,
          programsResponse,
          batchesResponse,
        ] = await Promise.all([
          getExamById(examId),

          getPrograms({
            isActive: true,
            limit: 100,
          }),

          getBatches({
            isActive: true,
            limit: 100,
          }),
        ]);

        const exam =
          examResponse?.data?.exam ||
          examResponse?.data;

        const programsData =
          programsResponse?.data?.programs ||
          programsResponse?.data ||
          [];

        const batchesData =
          batchesResponse?.data?.batches ||
          batchesResponse?.data ||
          [];

        setPrograms(
          Array.isArray(programsData)
            ? programsData
            : []
        );

        setBatches(
          Array.isArray(batchesData)
            ? batchesData
            : []
        );

        // --------------------------------------------------------
        // EXAM DATA
        // --------------------------------------------------------

        setFormData({
          examName:
            exam?.examName || "",

          examCode:
            exam?.examCode || "",

          examDate: exam?.examDate
            ? new Date(exam.examDate)
                .toISOString()
                .split("T")[0]
            : "",

          subject:
            exam?.subject || "",

          maximumMarks:
            exam?.maximumMarks ?? "",

          programId:
            exam?.programId?._id ||
            exam?.programId ||
            "",

          batchId:
            exam?.batchId?._id ||
            exam?.batchId ||
            "",

          board:
            exam?.board || "",

          class:
            exam?.class ?? "",

          marksUploadWithinDays:
            exam?.marksUploadWithinDays ??
            "",

          description:
            exam?.description || "",

          isThereAnyAttachment:
            Boolean(
              exam?.isThereAnyAttachment
            ),

          isActive:
            exam?.isActive !== false,
        });
      } catch (error) {
        console.error(
          "Failed to load exam:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to load exam."
        );
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      loadData();
    }
  }, [examId]);

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ============================================================
  // PROGRAM CHANGE
  // ============================================================

  const handleProgramChange = (
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      programId: value || "",
      batchId: "",
    }));
  };

  // ============================================================
  // BATCH CHANGE
  // ============================================================

  const handleBatchChange = (
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      batchId: value || "",
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      if (!formData.examName.trim()) {
        setError(
          "Exam name is required."
        );
        return;
      }

      if (!formData.examCode.trim()) {
        setError(
          "Exam code is required."
        );
        return;
      }

      if (!formData.examDate) {
        setError(
          "Exam date is required."
        );
        return;
      }

      if (!formData.subject.trim()) {
        setError(
          "Subject is required."
        );
        return;
      }

      if (
        formData.maximumMarks === "" ||
        Number(formData.maximumMarks) < 0
      ) {
        setError(
          "Please enter valid maximum marks."
        );
        return;
      }

      if (!formData.programId) {
        setError(
          "Please select a program."
        );
        return;
      }

      if (!formData.batchId) {
        setError(
          "Please select a batch."
        );
        return;
      }

      // --------------------------------------------------------
      // PAYLOAD
      // --------------------------------------------------------

      const payload = {
        examName:
          formData.examName.trim(),

        examCode:
          formData.examCode.trim(),

        examDate:
          formData.examDate,

        subject:
          formData.subject.trim(),

        maximumMarks:
          Number(
            formData.maximumMarks
          ),

        programId:
          formData.programId,

        batchId:
          formData.batchId,

        board:
          formData.board.trim() ||
          undefined,

        class:
          formData.class === ""
            ? undefined
            : Number(formData.class),

        marksUploadWithinDays:
          formData.marksUploadWithinDays ===
          ""
            ? undefined
            : Number(
                formData.marksUploadWithinDays
              ),

        description:
          formData.description.trim() ||
          undefined,

        isThereAnyAttachment:
          formData.isThereAnyAttachment,

        isActive:
          formData.isActive,
      };

      await updateExam(
        examId,
        payload
      );

      navigate(
        "/exam-management"
      );
    } catch (error) {
      console.error(
        "Failed to update exam:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to update exam."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading exam...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div>
        <button
          type="button"
          onClick={() =>
            navigate(
              "/exam-management"
            )
          }
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Exam Management
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Edit Exam
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update exam configuration and controls.
        </p>
      </div>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          FORM
          ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ====================================================
            BASIC INFORMATION
            ==================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Exam Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Exam Name
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="text"
                name="examName"
                value={
                  formData.examName
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Exam Code */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Exam ID / Code
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="text"
                name="examCode"
                value={
                  formData.examCode
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Exam Date */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Exam Date
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="date"
                name="examDate"
                value={
                  formData.examDate
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Subject */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Subject
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="text"
                name="subject"
                value={
                  formData.subject
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Maximum Marks */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Maximum Marks
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="number"
                name="maximumMarks"
                value={
                  formData.maximumMarks
                }
                onChange={
                  handleChange
                }
                min="0"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            PROGRAM / BATCH
            ==================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Program & Batch
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ProgramDropdown
              programs={programs}
              value={
                formData.programId
              }
              onChange={
                handleProgramChange
              }
              label="Program"
              placeholder="Select Program"
              required
            />

            <BatchDropdown
              batches={batches}
              programId={
                formData.programId
              }
              value={
                formData.batchId
              }
              onChange={
                handleBatchChange
              }
              label="Batch"
              placeholder="Select Batch"
              required
            />
          </div>
        </div>

        {/* ====================================================
            ACADEMIC CONFIGURATION
            ==================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Academic Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Board */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Board
              </label>

              <input
                type="text"
                name="board"
                value={
                  formData.board
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. HBSE"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Class */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Class
              </label>

              <input
                type="number"
                name="class"
                value={
                  formData.class
                }
                onChange={
                  handleChange
                }
                min="1"
                max="12"
                placeholder="e.g. 10"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Marks Upload Within Days */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Marks Upload Within Days
              </label>

              <input
                type="number"
                name="marksUploadWithinDays"
                value={
                  formData.marksUploadWithinDays
                }
                onChange={
                  handleChange
                }
                min="0"
                placeholder="e.g. 7"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            EXAM CONTROLS
            ==================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Exam Controls
            </h2>
          </div>

          <div className="space-y-4">
            {/* Attachment */}

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Allow Attachments
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Allow attachments with marks.
                </p>
              </div>

              <input
                type="checkbox"
                name="isThereAnyAttachment"
                checked={
                  formData.isThereAnyAttachment
                }
                onChange={
                  handleChange
                }
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            {/* Active */}

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Active Exam
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Inactive exams are disabled for normal operations.
                </p>
              </div>

              <input
                type="checkbox"
                name="isActive"
                checked={
                  formData.isActive
                }
                onChange={
                  handleChange
                }
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* ====================================================
            DESCRIPTION
            ==================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            name="description"
            value={
              formData.description
            }
            onChange={
              handleChange
            }
            rows={5}
            placeholder="Enter exam description..."
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* ====================================================
            ACTIONS
            ==================================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/exam-management"
              )
            }
            disabled={saving}
            className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving
              ? "Updating Exam..."
              : "Update Exam"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExamManagement;