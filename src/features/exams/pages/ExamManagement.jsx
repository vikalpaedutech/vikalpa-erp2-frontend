import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getExams,
  deleteExam,
} from "../services/exam.service";

const ExamManagement = () => {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [exams, setExams] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  // ============================================================
  // FETCH EXAMS
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

        if (search.trim()) {
          params.search =
            search.trim();
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

        const responsePagination =
          response?.data?.pagination;

        if (responsePagination) {
          setPagination((previous) => ({
            ...previous,
            ...responsePagination,
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
      search,
      pagination.limit,
    ]
  );

  // ============================================================
  // INITIAL LOAD
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
  // CLEAR SEARCH
  // ============================================================

  const handleClear = () => {
    setSearch("");

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));

    fetchExams(1);
  };

  // ============================================================
  // DELETE / DEACTIVATE
  // ============================================================

  const handleDeactivate = async (
    exam
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to deactivate "${exam.examName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await deleteExam(
        exam._id
      );

      await fetchExams(
        pagination.page
      );
    } catch (error) {
      console.error(
        "Failed to deactivate exam:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to deactivate exam."
      );
    } finally {
      setLoading(false);
    }
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

    const page =
      pagination.page - 1;

    setPagination((previous) => ({
      ...previous,
      page,
    }));

    fetchExams(page);
  };

  const handleNextPage = () => {
    if (
      pagination.page >=
        pagination.totalPages ||
      loading
    ) {
      return;
    }

    const page =
      pagination.page + 1;

    setPagination((previous) => ({
      ...previous,
      page,
    }));

    fetchExams(page);
  };

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
            Exam Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create, configure and manage exams.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/exam-management/create"
            )
          }
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Create Exam
        </button>
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
          SEARCH
          ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Search Exams
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Search by exam name, exam code or subject.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                handleSearch();
              }
            }}
            placeholder="Search exam name, code or subject"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ======================================================
          LIST HEADER
          ====================================================== */}

      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Exams
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
              Create a new exam to get started.
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
              <div
                key={exam._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  {/* ------------------------------------------
                      EXAM DETAILS
                      ------------------------------------------ */}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {exam.examCode}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          exam.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {exam.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-gray-900">
                      {exam.examName}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {exam.subject || "-"}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Exam Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {exam.examDate
                            ? new Date(
                                exam.examDate
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Maximum Marks
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {exam.maximumMarks ??
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Program
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {exam.programId
                            ?.programName ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Batch
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {exam.batchId
                            ?.batchName ||
                            "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        Attachment:{" "}
                        {exam.isThereAnyAttachment
                          ? "Allowed"
                          : "Not Allowed"}
                      </span>

                      {exam.board && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          Board:{" "}
                          {exam.board}
                        </span>
                      )}

                      {exam.class && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          Class:{" "}
                          {exam.class}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ------------------------------------------
                      ACTIONS
                      ------------------------------------------ */}

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/exam-management/${exam._id}/edit`
                        )
                      }
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    {exam.isActive && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDeactivate(
                            exam
                          )
                        }
                        disabled={loading}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
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

export default ExamManagement;