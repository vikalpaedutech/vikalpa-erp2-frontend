// FILE PATH:
// frontend/src/features/exams/pages/Exams.jsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ExamFilters from "../components/ExamFilters";
import ExamCard from "../components/ExamCard";

import { useAuth } from "../../../context/AuthContext";

import {
  getExams,
} from "../services/exam.service";

import {
  getPrograms,
} from "../../../services/program.service";

import {
  getBatches,
} from "../../../services/batch.service";

const Exams = () => {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  const [programId, setProgramId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [examCode, setExamCode] = useState("");

  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] =
    useState(true);

  const [error, setError] = useState("");


  const { access } = useAuth();

const isAdmin =
  access?.roles?.some(
    (role) => role.roleCode === "admin"
  ) || false;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ============================================================
  // LOAD FILTER DATA
  // ============================================================

  const fetchFilterData = useCallback(
    async () => {
      try {
        setLoadingFilters(true);
        setError("");

        const [
          programsResponse,
          batchesResponse,
        ] = await Promise.all([
          getPrograms({
            isActive: true,
            limit: 100,
          }),

          getBatches({
            isActive: true,
            limit: 100,
          }),
        ]);

        // --------------------------------------------------------
        // PROGRAMS
        // --------------------------------------------------------

        const programList =
          programsResponse?.data?.programs ||
          programsResponse?.data ||
          [];

        setPrograms(
          Array.isArray(programList)
            ? programList
            : []
        );

        // --------------------------------------------------------
        // BATCHES
        // --------------------------------------------------------

        const batchList =
          batchesResponse?.data?.batches ||
          batchesResponse?.data ||
          [];

        setBatches(
          Array.isArray(batchList)
            ? batchList
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load exam filters:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to load exam filters."
        );
      } finally {
        setLoadingFilters(false);
      }
    },
    []
  );

  // ============================================================
  // LOAD EXAMS
  // ============================================================

  const fetchExams = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: pagination.limit,
        };

        // --------------------------------------------------------
        // PROGRAM FILTER
        // --------------------------------------------------------

        if (programId) {
          params.programId = programId;
        }

        // --------------------------------------------------------
        // BATCH FILTER
        // --------------------------------------------------------

        if (batchId) {
          params.batchId = batchId;
        }

        // --------------------------------------------------------
        // EXAM SEARCH
        // --------------------------------------------------------

        if (examCode.trim()) {
          params.search =
            examCode.trim();
        }

        const response =
          await getExams(params);

        const examList =
          response?.data?.exams ||
          [];

        setExams(
          Array.isArray(examList)
            ? examList
            : []
        );

        // --------------------------------------------------------
        // PAGINATION
        // --------------------------------------------------------

        const responsePagination =
          response?.data?.pagination;

        if (responsePagination) {
          setPagination((previous) => ({
            ...previous,
            ...responsePagination,
          }));
        } else {
          setPagination((previous) => ({
            ...previous,
            page,
            total: examList.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage:
              page > 1,
          }));
        }
      } catch (error) {
        console.error(
          "Failed to load exams:",
          error
        );

        setExams([]);

        setError(
          error?.response?.data?.message ||
            "Failed to load exams."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      programId,
      batchId,
      examCode,
      pagination.limit,
    ]
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  // ============================================================
  // LOAD EXAMS ON INITIAL PAGE LOAD
  // ============================================================

  useEffect(() => {
    fetchExams(1);
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = () => {
    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));

    fetchExams(1);
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const handleClear = () => {
    setProgramId("");
    setBatchId("");
    setExamCode("");

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));

    // Fetch all exams after clearing filters.
    fetchExams(1);
  };

  // ============================================================
  // PROGRAM CHANGE
  // ============================================================

  const handleProgramChange = (
    value
  ) => {
    setProgramId(value);

    // Batch belongs to selected program.
    // So reset batch whenever program changes.
    setBatchId("");

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  // ============================================================
  // BATCH CHANGE
  // ============================================================

  const handleBatchChange = (
    value
  ) => {
    setBatchId(value);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handlePreviousPage = () => {
    if (
      pagination.page <= 1 ||
      loading
    ) {
      return;
    }

    const previousPage =
      pagination.page - 1;

    setPagination((previous) => ({
      ...previous,
      page: previousPage,
    }));

    fetchExams(previousPage);
  };

  const handleNextPage = () => {
    if (
      pagination.page >=
        pagination.totalPages ||
      loading
    ) {
      return;
    }

    const nextPage =
      pagination.page + 1;

    setPagination((previous) => ({
      ...previous,
      page: nextPage,
    }));

    fetchExams(nextPage);
  };

  // ============================================================
  // VIEW STUDENTS
  // ============================================================

  const handleViewStudents = (
    examId
  ) => {
    navigate(
      `/exams/${examId}/students`
    );
  };

  // ============================================================
  // LOADING FILTERS
  // ============================================================

  if (loadingFilters) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading exam filters...
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Exams
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage exams and student marks.
          </p>
        </div>

        {isAdmin && (
  <button
    type="button"
    onClick={() =>
      navigate("/exams/create")
    }
    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
  >
    + Create Exam
  </button>
)}
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
          FILTERS
          ====================================================== */}

      <ExamFilters
        programs={programs}
        batches={batches}
        programId={programId}
        batchId={batchId}
        examCode={examCode}
        onProgramChange={
          handleProgramChange
        }
        onBatchChange={
          handleBatchChange
        }
        onExamCodeChange={
          setExamCode
        }
        onSearch={handleSearch}
        onClear={handleClear}
        loading={loading}
      />

      {/* ======================================================
          EXAM LIST HEADER
          ====================================================== */}

      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Exam List
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {pagination.total || 0}{" "}
          exam
          {pagination.total !== 1
            ? "s"
            : ""}{" "}
          found
        </p>
      </div>

      {/* ======================================================
          LOADING
          ====================================================== */}

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading exams...
          </p>
        </div>
      )}

      {/* ======================================================
          EMPTY
          ====================================================== */}

      {!loading &&
        exams.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
              📋
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              No exams found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters or create
              a new exam.
            </p>
          </div>
        )}

      {/* ======================================================
          EXAM LIST
          ====================================================== */}

      {!loading &&
        exams.length > 0 && (
          <div className="space-y-4">
            {exams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                onViewStudents={
                  handleViewStudents
                }
              />
            ))}
          </div>
        )}

      {/* ======================================================
          PAGINATION
          ====================================================== */}

      {!loading &&
        exams.length > 0 &&
        pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={
                handlePreviousPage
              }
              disabled={
                pagination.page <= 1 ||
                loading
              }
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Previous
            </button>

            <div className="text-center text-sm text-gray-600">
              Page{" "}
              <span className="font-semibold text-gray-900">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {pagination.totalPages}
              </span>
            </div>

            <button
              type="button"
              onClick={
                handleNextPage
              }
              disabled={
                pagination.page >=
                  pagination.totalPages ||
                loading
              }
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
    </div>
  );
};

export default Exams;