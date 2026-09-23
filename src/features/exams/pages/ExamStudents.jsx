// FILE:
// frontend/src/features/exams/pages/ExamStudents.jsx

import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import DistrictCenterDropdown from "../../../components/common/dropdowns/DistrictCenterDropdown";
import CenterDropdown from "../../../components/common/dropdowns/CenterDropdown";

import {
  getExamById,
  getExamStudents,
} from "../services/exam.service";

import {
  createStudentMark,
  updateStudentMark,
} from "../services/studentMark.service";

const ExamStudents = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const { access } = useAuth();

  // ============================================================
  // ROLE
  // ============================================================

  const isCC =
    access?.roles?.some(
      (role) => role.roleCode === "cc"
    ) || false;

  // ============================================================
  // EXAM
  // ============================================================

  const [exam, setExam] = useState(null);

  const [loadingExam, setLoadingExam] =
    useState(true);

  // ============================================================
  // STUDENTS
  // ============================================================

  const [students, setStudents] = useState([]);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  // ============================================================
  // REGION FILTERS
  // ============================================================

  const [districtId, setDistrictId] =
    useState("");

  const [centerId, setCenterId] =
    useState("");

  // ============================================================
  // STUDENT SEARCH
  // ============================================================

  const [search, setSearch] =
    useState("");

  // ============================================================
  // PAGINATION
  // ============================================================

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  // ============================================================
  // MARK INPUT
  // ============================================================

  const [markInputs, setMarkInputs] =
    useState({});

  const [savingStudentId, setSavingStudentId] =
    useState(null);

  // ============================================================
  // ERROR / SUCCESS
  // ============================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ============================================================
  // LOAD EXAM
  // ============================================================

  const fetchExam = useCallback(
    async () => {
      try {
        setLoadingExam(true);
        setError("");

        const response =
          await getExamById(examId);

        const examData =
          response?.data?.exam ||
          response?.data;

        setExam(examData || null);
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
        setLoadingExam(false);
      }
    },
    [examId]
  );

  // ============================================================
  // LOAD STUDENTS
  // ============================================================

  const fetchStudents = useCallback(
    async (page = 1) => {
      if (!examId) {
        return;
      }

      try {
        setLoadingStudents(true);
        setError("");
        setSuccess("");

        const params = {
          page,
          limit: pagination.limit,
        };

        // --------------------------------------------------------
        // STUDENT SEARCH
        // Independent of district / center
        // --------------------------------------------------------

        if (search.trim()) {
          params.search =
            search.trim();
        }

        // --------------------------------------------------------
        // DISTRICT FILTER
        // Optional
        // --------------------------------------------------------

        if (districtId) {
          params.districtId =
            districtId;
        }

        // --------------------------------------------------------
        // CENTER FILTER
        // Optional
        // --------------------------------------------------------

        if (centerId) {
          params.centerId =
            centerId;
        }

        const response =
          await getExamStudents(
            examId,
            params
          );

        const studentList =
          response?.data?.students ||
          [];

        setStudents(
          Array.isArray(studentList)
            ? studentList
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
            total: studentList.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage:
              page > 1,
          }));
        }

        // --------------------------------------------------------
        // EXISTING MARKS
        // --------------------------------------------------------

        const inputs = {};

        studentList.forEach(
          (student) => {
            const existingMarks =
              student?.mark
                ?.obtainedMarks;

            if (
              existingMarks !==
                undefined &&
              existingMarks !== null
            ) {
              inputs[
                student.enrollmentId
              ] = existingMarks;
            }
          }
        );

        setMarkInputs(inputs);
      } catch (error) {
        console.error(
          "Failed to load exam students:",
          error
        );

        setStudents([]);

        setPagination((previous) => ({
          ...previous,
          page: 1,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }));

        setError(
          error?.response?.data?.message ||
            "Failed to load students."
        );
      } finally {
        setLoadingStudents(false);
      }
    },
    [
      examId,
      search,
      districtId,
      centerId,
      pagination.limit,
    ]
  );

  // ============================================================
  // INITIAL EXAM LOAD ONLY
  //
  // IMPORTANT:
  // Students are NOT loaded here.
  // ============================================================

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  // ============================================================
  // DISTRICT / CENTER CHANGE
  // ============================================================

  const handleDistrictCenterChange = ({
    districtId: selectedDistrictId,
    centerId: selectedCenterId,
  }) => {
    setDistrictId(
      selectedDistrictId || ""
    );

    setCenterId(
      selectedCenterId || ""
    );

    // Do NOT fetch students here.
    // User must click Search Students.
  };

  // ============================================================
  // CC CENTER CHANGE
  // ============================================================

  const handleCCCenterChange = (
    value
  ) => {
    setCenterId(value || "");

    setDistrictId("");

    // Do NOT fetch students here.
  };

  // ============================================================
  // SEARCH STUDENTS
  // ============================================================

  const handleSearch = () => {
    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));

    fetchStudents(1);
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const handleClear = () => {
    setDistrictId("");
    setCenterId("");
    setSearch("");

    setStudents([]);

    setMarkInputs({});

    setError("");
    setSuccess("");

    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  };

  // ============================================================
  // MARK INPUT CHANGE
  // ============================================================

  const handleMarkChange = (
    enrollmentId,
    value
  ) => {
    setMarkInputs((previous) => ({
      ...previous,
      [enrollmentId]: value,
    }));
  };

  // ============================================================
  // SAVE MARK
  // ============================================================

  const handleSaveMark = async (
    student
  ) => {
    const enrollmentId =
      student?.enrollmentId;

    const obtainedMarks =
      markInputs[enrollmentId];

    const hasExistingMark =
      Boolean(student?.mark?._id);

    // --------------------------------------------------------
    // Blank existing mark = delete it from DB
    // --------------------------------------------------------

    if (
      obtainedMarks === "" &&
      hasExistingMark
    ) {
      try {
        setSavingStudentId(enrollmentId);
        setError("");
        setSuccess("");

        const response =
          await updateStudentMark(
            student.mark._id,
            {
              obtainedMarks: "",
            }
          );

        // Update only this student locally.
        // Do not refetch the complete page/list.
        setStudents((current) =>
          current.map((item) =>
            item.enrollmentId ===
            enrollmentId
              ? {
                  ...item,
                  mark: null,
                }
              : item
          )
        );

        setMarkInputs((current) => ({
          ...current,
          [enrollmentId]: "",
        }));

        setSuccess(
          response?.message ||
            "Marks removed successfully."
        );

        return;
      } catch (error) {
        console.error(
          "Failed to remove student marks:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to remove marks."
        );
      } finally {
        setSavingStudentId(null);
      }

      return;
    }

    // --------------------------------------------------------
    // New mark cannot be saved blank
    // --------------------------------------------------------

    if (
      obtainedMarks === undefined ||
      obtainedMarks === ""
    ) {
      setError(
        "Please enter obtained marks."
      );
      return;
    }

    const numericMarks =
      Number(obtainedMarks);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0
    ) {
      setError(
        "Please enter valid marks."
      );
      return;
    }

    if (
      exam?.maximumMarks !==
        undefined &&
      numericMarks >
        Number(exam.maximumMarks)
    ) {
      setError(
        `Obtained marks cannot be greater than ${exam.maximumMarks}.`
      );
      return;
    }

    try {
      setSavingStudentId(enrollmentId);
      setError("");
      setSuccess("");

      let response;

      // --------------------------------------------------------
      // UPDATE EXISTING MARK
      // --------------------------------------------------------

      if (hasExistingMark) {
        response =
          await updateStudentMark(
            student.mark._id,
            {
              obtainedMarks:
                numericMarks,
            }
          );
      }

      // --------------------------------------------------------
      // CREATE NEW MARK
      // --------------------------------------------------------

      else {
        response =
          await createStudentMark({
            examId: exam._id,
            enrollmentId:
              student.enrollmentId,
            studentId:
              student.studentId,
            obtainedMarks:
              numericMarks,
          });
      }

      const savedMark =
        response?.data || null;

      // --------------------------------------------------------
      // Update only the affected row.
      // No full students refetch and no page reload.
      // --------------------------------------------------------

      setStudents((current) =>
        current.map((item) =>
          item.enrollmentId ===
          enrollmentId
            ? {
                ...item,
                mark: savedMark,
              }
            : item
        )
      );

      setMarkInputs((current) => ({
        ...current,
        [enrollmentId]:
          numericMarks,
      }));

      setSuccess(
        response?.message ||
          "Marks saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save student marks:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to save marks."
      );
    } finally {
      setSavingStudentId(null);
    }
  };

  // ============================================================
  // PREVIOUS PAGE
  // ============================================================

  const handlePreviousPage = () => {
    if (
      pagination.page <= 1 ||
      loadingStudents
    ) {
      return;
    }

    const previousPage =
      pagination.page - 1;

    setPagination((previous) => ({
      ...previous,
      page: previousPage,
    }));

    fetchStudents(previousPage);
  };

  // ============================================================
  // NEXT PAGE
  // ============================================================

  const handleNextPage = () => {
    if (
      pagination.page >=
        pagination.totalPages ||
      loadingStudents
    ) {
      return;
    }

    const nextPage =
      pagination.page + 1;

    setPagination((previous) => ({
      ...previous,
      page: nextPage,
    }));

    fetchStudents(nextPage);
  };

  // ============================================================
  // LOADING EXAM
  // ============================================================

  if (loadingExam) {
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
  // EXAM NOT FOUND
  // ============================================================

  if (!exam) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">
          {error ||
            "Exam not found."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/exams")
          }
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Exams
        </button>
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate("/exams")
            }
            className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Exams
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            {exam.examName}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage students and update their
            marks.
          </p>
        </div>
      </div>

      {/* ======================================================
          EXAM INFORMATION
          ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Exam Code
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {exam.examCode || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Subject
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {exam.subject || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Exam Date
            </p>

            <p className="mt-1 font-semibold text-gray-900">
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

            <p className="mt-1 font-semibold text-gray-900">
              {exam.maximumMarks ??
                "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Program / Batch
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {exam.programId?.programName ||
                exam.program?.programName ||
                "-"}
            </p>

            <p className="text-xs text-gray-500">
              {exam.batchId?.batchName ||
                exam.batch?.batchName ||
                "-"}
            </p>
          </div>
        </div>
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
          SUCCESS
          ====================================================== */}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ======================================================
          STUDENT FILTERS
          ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Student Filters
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a region or search for a student.
            Then click Search Students.
          </p>
        </div>

        {/* ----------------------------------------------------
            REGION FILTERS
            ---------------------------------------------------- */}

        {isCC ? (
          <div className="max-w-xl">
            <CenterDropdown
              value={centerId}
              onChange={
                handleCCCenterChange
              }
              label="Center"
              placeholder="Select Center"
              independent
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DistrictCenterDropdown
              districtId={districtId}
              centerId={centerId}
              onChange={
                handleDistrictCenterChange
              }
            />
          </div>
        )}

        {/* ----------------------------------------------------
            STUDENT SEARCH
            ---------------------------------------------------- */}

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Student Search
          </label>

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
            placeholder="Search student name, SRN, roll number, father name or mother name"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* ----------------------------------------------------
            ACTIONS
            ---------------------------------------------------- */}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSearch}
            disabled={
              loadingStudents
            }
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingStudents
              ? "Searching..."
              : "Search Students"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={
              loadingStudents
            }
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ======================================================
          STUDENT LIST HEADER
          ====================================================== */}

      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Students
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {pagination.total || 0}{" "}
          student
          {pagination.total !== 1
            ? "s"
            : ""}{" "}
          found
        </p>
      </div>

      {/* ======================================================
          STUDENT LOADING
          ====================================================== */}

      {loadingStudents && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading students...
          </p>
        </div>
      )}

      {/* ======================================================
          EMPTY STATE
          ====================================================== */}

      {!loadingStudents &&
        students.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
              👨‍🎓
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              No students loaded
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Select a district/center or enter a
              student search and click
              <span className="font-medium text-gray-700">
                {" "}
                Search Students
              </span>
              .
            </p>
          </div>
        )}

      {/* ======================================================
          STUDENTS
          ====================================================== */}

      {!loadingStudents &&
        students.length > 0 && (
          <div className="space-y-4">
            {students.map(
              (student) => {
                const enrollmentId =
                  student.enrollmentId;

                const studentData =
                  student.student || {};

                const currentMark =
                  markInputs[
                    enrollmentId
                  ] ?? "";

                return (
                  <div
                    key={enrollmentId}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      {/* ----------------------------------------
                          STUDENT INFORMATION
                          ---------------------------------------- */}

                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900">
                          {studentData.name ||
                            "-"}
                        </h3>

                        <div className="mt-2 grid grid-cols-1 gap-x-8 gap-y-1 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-4">
                          <p>
                            <span className="font-medium text-gray-700">
                              SRN:
                            </span>{" "}
                            {studentData.studentSrn ||
                              "-"}
                          </p>

                          <p>
                            <span className="font-medium text-gray-700">
                              Roll No:
                            </span>{" "}
                            {studentData.rollNumber ||
                              "-"}
                          </p>

                          <p>
                            <span className="font-medium text-gray-700">
                              Father:
                            </span>{" "}
                            {studentData.fatherName ||
                              "-"}
                          </p>

                          <p>
                            <span className="font-medium text-gray-700">
                              Mother:
                            </span>{" "}
                            {studentData.motherName ||
                              "-"}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {student.district
                            ?.districtName && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                              District:{" "}
                              {
                                student
                                  .district
                                  .districtName
                              }
                            </span>
                          )}

                          {student.center
                            ?.centerName && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                              Center:{" "}
                              {
                                student
                                  .center
                                  .centerName
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ----------------------------------------
                          MARKS
                          ---------------------------------------- */}

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[240px]">
                        <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Obtained Marks
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={
                              exam.maximumMarks
                            }
                            step="0.01"
                            value={
                              currentMark
                            }
                            onChange={(
                              event
                            ) =>
                              handleMarkChange(
                                enrollmentId,
                                event.target
                                  .value
                              )
                            }
                            placeholder={`Max ${exam.maximumMarks}`}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />

                          <span className="whitespace-nowrap text-sm text-gray-500">
                            /{" "}
                            {
                              exam.maximumMarks
                            }
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleSaveMark(
                              student
                            )
                          }
                          disabled={
                            savingStudentId ===
                            enrollmentId
                          }
                          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingStudentId ===
                          enrollmentId
                            ? "Saving..."
                            : student?.mark
                                  ?._id
                              ? "Update Marks"
                              : "Save Marks"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

      {/* ======================================================
          PAGINATION
          ====================================================== */}

      {!loadingStudents &&
        students.length > 0 &&
        pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={
                handlePreviousPage
              }
              disabled={
                pagination.page <=
                  1 ||
                loadingStudents
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
                loadingStudents
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

export default ExamStudents;