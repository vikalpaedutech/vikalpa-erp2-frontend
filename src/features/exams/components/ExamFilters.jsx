import React from "react";

import ProgramDropdown from "../../../components/common/dropdowns/ProgramDropdown";
import BatchDropdown from "../../../components/common/dropdowns/BatchDropdown";

const ExamFilters = ({
  programs = [],
  batches = [],

  programId,
  batchId,
  examCode,

  onProgramChange,
  onBatchChange,
  onExamCodeChange,

  onSearch,
  onClear,

  loading = false,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Exam Filters
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Filter exams using program, batch and exam ID/code.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* PROGRAM */}
        <div>
          <ProgramDropdown
            programs={programs}
            value={programId}
            onChange={onProgramChange}
            label="Program"
            placeholder="Select Program"
            autoSelectSingle
            hideWhenSingle
          />
        </div>

        {/* BATCH */}
        <div>
          <BatchDropdown
            batches={batches}
            programId={programId}
            value={batchId}
            onChange={onBatchChange}
            label="Batch"
            placeholder="Select Batch"
            autoSelectSingle
            hideWhenSingle
          />
        </div>

        {/* EXAM CODE */}
        <div className="lg:col-span-1">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Exam ID / Code
          </label>

          <input
            type="text"
            value={examCode}
            onChange={(e) => onExamCodeChange(e.target.value)}
            placeholder="Search Exam ID / Code"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search Exams"}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default ExamFilters;