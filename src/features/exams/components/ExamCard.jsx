function ExamCard({
  exam,
  onViewStudents,
}) {
  const examDate = exam?.examDate
    ? new Date(exam.examDate).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "-";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      {/* Top */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {exam?.examCode || "-"}
            </span>

            {exam?.isActive && (
              <span className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold text-gray-900">
            {exam?.examName || "-"}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {exam?.subject || "-"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onViewStudents?.(exam?._id)
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          View Students
        </button>
      </div>

      {/* Details */}

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 md:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">
            Exam Date
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {examDate}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Maximum Marks
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {exam?.maximumMarks ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Program
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {exam?.programId?.programName ||
              exam?.program?.programName ||
              "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Batch
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {exam?.batchId?.batchName ||
              exam?.batch?.batchName ||
              "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExamCard;