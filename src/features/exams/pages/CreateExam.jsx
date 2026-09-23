import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useRegionAccess } from "../../../context/RegionAccessContext";

import { getPrograms } from "../../../services/program.service";
import { getBatches } from "../../../services/batch.service";

import { createExam } from "../services/exam.service";

import ProgramDropdown from "../../../components/common/dropdowns/ProgramDropdown";
import BatchDropdown from "../../../components/common/dropdowns/BatchDropdown";

function CreateExam() {
  const navigate = useNavigate();

  const {
    loadingRegionAccess,
  } = useRegionAccess();

  /**
   * ============================================================
   * DATA
   * ============================================================
   */

  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loadingPrograms, setLoadingPrograms] =
    useState(false);

  const [loadingBatches, setLoadingBatches] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  /**
   * ============================================================
   * FORM
   * ============================================================
   */

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
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * ============================================================
   * LOAD PROGRAMS
   * ============================================================
   */

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);
        setError("");

        const response = await getPrograms({
          isActive: true,
          limit: 100,
        });

        const programList =
          response?.data?.programs ||
          response?.data?.results ||
          response?.data ||
          [];

        setPrograms(
          Array.isArray(programList)
            ? programList
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load programs:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to load programs."
        );
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  /**
   * ============================================================
   * LOAD BATCHES
   * ============================================================
   */

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);
        setError("");

        const response = await getBatches({
          isActive: true,
          limit: 100,
        });

        const batchList =
          response?.data?.batches ||
          response?.data?.results ||
          response?.data ||
          [];

        setBatches(
          Array.isArray(batchList)
            ? batchList
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load batches:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to load batches."
        );
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, []);

  /**
   * ============================================================
   * INPUT HANDLER
   * ============================================================
   */

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

  /**
   * ============================================================
   * PROGRAM CHANGE
   * ============================================================
   */

  const handleProgramChange = (
    nextProgramId
  ) => {
    setFormData((previous) => ({
      ...previous,
      programId: nextProgramId,
      batchId: "",
    }));
  };

  /**
   * ============================================================
   * BATCH CHANGE
   * ============================================================
   */

  const handleBatchChange = (
    nextBatchId
  ) => {
    setFormData((previous) => ({
      ...previous,
      batchId: nextBatchId,
    }));
  };

  /**
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /**
     * ----------------------------------------------------------
     * Frontend validation
     * ----------------------------------------------------------
     */

    if (!formData.examName.trim()) {
      setError("Exam name is required.");
      return;
    }

    if (!formData.examCode.trim()) {
      setError("Exam code is required.");
      return;
    }

    if (!formData.examDate) {
      setError("Exam date is required.");
      return;
    }

    if (!formData.subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!formData.maximumMarks) {
      setError(
        "Maximum marks are required."
      );
      return;
    }

    if (!formData.programId) {
      setError("Please select a program.");
      return;
    }

    if (!formData.batchId) {
      setError("Please select a batch.");
      return;
    }

    try {
      setSubmitting(true);

      /**
       * --------------------------------------------------------
       * Prepare payload
       * --------------------------------------------------------
       */

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
          Number(formData.maximumMarks),

        programId:
          formData.programId,

        batchId:
          formData.batchId,

        board:
          formData.board.trim() || undefined,

        class: formData.class
          ? Number(formData.class)
          : undefined,

        marksUploadWithinDays:
          formData.marksUploadWithinDays
            ? Number(
                formData.marksUploadWithinDays
              )
            : undefined,

        description:
          formData.description.trim() ||
          undefined,

        isThereAnyAttachment:
          formData.isThereAnyAttachment,
      };

      const response =
        await createExam(payload);

      console.log(
        "Exam created successfully:",
        response
      );

      setSuccess(
        "Exam created successfully."
      );

      /**
       * --------------------------------------------------------
       * Navigate back to exam list.
       * --------------------------------------------------------
       */

      setTimeout(() => {
        navigate("/exams");
      }, 700);
    } catch (error) {
      console.error(
        "Failed to create exam:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to create exam."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * ============================================================
   * CANCEL
   * ============================================================
   */

  const handleCancel = () => {
    navigate("/exams");
  };

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Exam
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a new exam for a program and batch.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          ← Back to Exams
        </button>
      </div>

      {/* ======================================================
          ALERTS
          ====================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
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

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Basic Information
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Enter the basic details of the exam.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Exam Name */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Exam Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="examName"
                value={formData.examName}
                onChange={handleChange}
                placeholder="Enter exam name"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Exam Code */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Exam Code
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="examCode"
                value={formData.examCode}
                onChange={handleChange}
                placeholder="Enter unique exam code"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Subject */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Subject
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter subject"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Exam Date */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Exam Date
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            PROGRAM & BATCH
            ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Program & Batch
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Select the program and batch for this exam.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ProgramDropdown
              programs={programs}
              value={formData.programId}
              onChange={handleProgramChange}
              autoSelectSingle
              hideWhenSingle
              required
              disabled={
                loadingPrograms ||
                loadingRegionAccess
              }
            />

            <BatchDropdown
              batches={batches}
              programId={formData.programId}
              value={formData.batchId}
              onChange={handleBatchChange}
              autoSelectSingle
              hideWhenSingle
              required
              disabled={
                loadingBatches ||
                loadingRegionAccess
              }
            />
          </div>
        </div>

        {/* ====================================================
            MARKS & ACADEMIC DETAILS
            ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Academic Details
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Configure marks and academic information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Maximum Marks */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Maximum Marks
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="number"
                name="maximumMarks"
                value={formData.maximumMarks}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 100"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Board */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Board
              </label>

              <input
                type="text"
                name="board"
                value={formData.board}
                onChange={handleChange}
                placeholder="e.g. HBSE / CBSE"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Class */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Class
              </label>

              <input
                type="number"
                name="class"
                value={formData.class}
                onChange={handleChange}
                min="1"
                max="12"
                placeholder="e.g. 10"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Marks Upload Days */}

            <div className="md:col-span-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Marks Upload Within Days
              </label>

              <input
                type="number"
                name="marksUploadWithinDays"
                value={
                  formData.marksUploadWithinDays
                }
                onChange={handleChange}
                min="0"
                placeholder="e.g. 7"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:max-w-sm"
              />

              <p className="mt-1 text-xs text-gray-500">
                Number of days allowed for uploading student marks.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            ATTACHMENT
            ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Attachments
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Configure whether this exam requires attachments.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isThereAnyAttachment"
              checked={
                formData.isThereAnyAttachment
              }
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <span className="text-sm font-medium text-gray-700">
              Attachment required for this exam
            </span>
          </label>
        </div>

        {/* ====================================================
            DESCRIPTION
            ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter any additional information about the exam..."
            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* ====================================================
            ACTIONS
            ==================================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Creating Exam..."
              : "Create Exam"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateExam;