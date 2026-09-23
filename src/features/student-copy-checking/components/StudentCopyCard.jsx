import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { SUBJECTS } from "../constants/subjects";


/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const WORK_TYPES = {
  CLASS_WORK: "Class Work",
  HOME_WORK: "Home Work",
};

const COPY_STATUSES = {
  COMPLETE: "Complete",
  INCOMPLETE: "Incomplete",
  NOT_BROUGHT: "Not-brought",
};


/*
|--------------------------------------------------------------------------
| CREATE EMPTY SUBJECT RECORD
|--------------------------------------------------------------------------
*/

const createEmptyRecord = (
  subjectId
) => ({
  subjectId,
  status: "",
  remarks: "",
});


/*
|--------------------------------------------------------------------------
| STUDENT COPY CARD
|--------------------------------------------------------------------------
*/

const StudentCopyCard = ({
  student,
  checkDate,
  onSave,
  saving = false,
}) => {

  /*
  |--------------------------------------------------------------------------
  | MODAL
  |--------------------------------------------------------------------------
  */

  const [
    activeWorkType,
    setActiveWorkType,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | RECORDS
  |--------------------------------------------------------------------------
  */

  const [
    classWorkRecords,
    setClassWorkRecords,
  ] = useState([]);

  const [
    homeWorkRecords,
    setHomeWorkRecords,
  ] = useState([]);


  /*
  |--------------------------------------------------------------------------
  | MODAL VALIDATION ERROR
  |--------------------------------------------------------------------------
  */

  const [
    validationError,
    setValidationError,
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | LOAD EXISTING RECORDS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const existingRecords =
      student?.copyCheckings || [];


    /*
    |--------------------------------------------------------------------------
    | CLASS WORK
    |--------------------------------------------------------------------------
    */

    const existingClassWork =
      existingRecords
        .filter(
          (record) =>
            record?.workType ===
            WORK_TYPES.CLASS_WORK
        )
        .map((record) => ({
          subjectId:
            record?.subjectId || "",

          status:
            record?.status || "",

          remarks:
            record?.remarks || "",
        }));


    /*
    |--------------------------------------------------------------------------
    | HOME WORK
    |--------------------------------------------------------------------------
    */

    const existingHomeWork =
      existingRecords
        .filter(
          (record) =>
            record?.workType ===
            WORK_TYPES.HOME_WORK
        )
        .map((record) => ({
          subjectId:
            record?.subjectId || "",

          status:
            record?.status || "",

          remarks:
            record?.remarks || "",
        }));


    setClassWorkRecords(
      existingClassWork
    );

    setHomeWorkRecords(
      existingHomeWork
    );

  }, [
    student?.copyCheckings,
  ]);


  /*
  |--------------------------------------------------------------------------
  | COUNTS
  |--------------------------------------------------------------------------
  */

  const classWorkCount =
    classWorkRecords.filter(
      (record) =>
        record?.status
    ).length;

  const homeWorkCount =
    homeWorkRecords.filter(
      (record) =>
        record?.status
    ).length;


  /*
  |--------------------------------------------------------------------------
  | BUTTON STATE
  |--------------------------------------------------------------------------
  */

  const classWorkCompleted =
    classWorkCount > 0;

  const homeWorkCompleted =
    homeWorkCount > 0;


  /*
  |--------------------------------------------------------------------------
  | OPEN MODAL
  |--------------------------------------------------------------------------
  */

  const openModal = (
    workType
  ) => {

    setValidationError("");

    setActiveWorkType(
      workType
    );

  };


  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {

    if (saving) {
      return;
    }

    setActiveWorkType(null);

    setValidationError("");

  };


  /*
  |--------------------------------------------------------------------------
  | CURRENT RECORDS
  |--------------------------------------------------------------------------
  */

  const currentRecords =
    activeWorkType ===
    WORK_TYPES.CLASS_WORK
      ? classWorkRecords
      : homeWorkRecords;


  /*
  |--------------------------------------------------------------------------
  | CURRENT RECORD SETTER
  |--------------------------------------------------------------------------
  */

  const setCurrentRecords = (
    updater
  ) => {

    if (
      activeWorkType ===
      WORK_TYPES.CLASS_WORK
    ) {

      setClassWorkRecords(
        updater
      );

      return;
    }

    setHomeWorkRecords(
      updater
    );

  };


  /*
  |--------------------------------------------------------------------------
  | SUBJECT RECORD
  |--------------------------------------------------------------------------
  */

  const getSubjectRecord = (
    subjectId
  ) => {

    return (
      currentRecords.find(
        (record) =>
          record.subjectId ===
          subjectId
      ) || {
        subjectId,
        status: "",
        remarks: "",
      }
    );

  };


  /*
  |--------------------------------------------------------------------------
  | UPDATE STATUS
  |--------------------------------------------------------------------------
  */

  const handleStatusChange = (
    subjectId,
    status
  ) => {

    setCurrentRecords(
      (previousRecords) => {

        const exists =
          previousRecords.some(
            (record) =>
              record.subjectId ===
              subjectId
          );


        if (!exists) {

          return [
            ...previousRecords,

            {
              subjectId,
              status,
              remarks: "",
            },
          ];

        }


        return previousRecords.map(
          (record) =>
            record.subjectId ===
            subjectId
              ? {
                  ...record,
                  status,
                }
              : record
        );

      }
    );

    setValidationError("");

  };


  /*
  |--------------------------------------------------------------------------
  | UPDATE REMARK
  |--------------------------------------------------------------------------
  */

  const handleRemarkChange = (
    subjectId,
    remarks
  ) => {

    setCurrentRecords(
      (previousRecords) => {

        const exists =
          previousRecords.some(
            (record) =>
              record.subjectId ===
              subjectId
          );


        if (!exists) {

          return [
            ...previousRecords,

            {
              subjectId,
              status: "",
              remarks,
            },
          ];

        }


        return previousRecords.map(
          (record) =>
            record.subjectId ===
            subjectId
              ? {
                  ...record,
                  remarks,
                }
              : record
        );

      }
    );

  };


  /*
  |--------------------------------------------------------------------------
  | SUBMIT MODAL
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async () => {

    if (!activeWorkType) {
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | ONLY SUBJECTS WITH STATUS
    |--------------------------------------------------------------------------
    */

    const selectedRecords =
      currentRecords.filter(
        (record) =>
          record?.status
      );


    /*
    |--------------------------------------------------------------------------
    | NOTHING SELECTED
    |--------------------------------------------------------------------------
    */

    if (
      selectedRecords.length ===
      0
    ) {

      setValidationError(
        `Please select a status for at least one ${activeWorkType} subject.`
      );

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | ENROLLMENT
    |--------------------------------------------------------------------------
    */

    const enrollment =
      student?.enrollments?.[0];


    if (!enrollment?._id) {

      setValidationError(
        "Enrollment information is missing for this student."
      );

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | BUILD API RECORDS
    |--------------------------------------------------------------------------
    */

    const records =
      selectedRecords.map(
        (record) => ({
          studentId:
            student._id,

          enrollmentId:
            enrollment._id,

          subjectId:
            record.subjectId,

          workType:
            activeWorkType,

          status:
            record.status,

          remarks:
            record.remarks?.trim() ||
            undefined,
        })
      );


    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    try {

      await onSave?.({
        checkDate,
        records,
      });


      /*
      |--------------------------------------------------------------------------
      | CLOSE MODAL AFTER SUCCESS
      |--------------------------------------------------------------------------
      */

      setActiveWorkType(
        null
      );

      setValidationError("");

    } catch (error) {

      console.error(
        "Failed to save copy checking:",
        error
      );

      setValidationError(
        error?.response?.data
          ?.message ||
        "Failed to save copy checking."
      );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | STATUS OPTIONS
  |--------------------------------------------------------------------------
  */

  const statusOptions = [
    {
      value:
        COPY_STATUSES.COMPLETE,
      label: "Complete",
    },
    {
      value:
        COPY_STATUSES.INCOMPLETE,
      label: "Incomplete",
    },
    {
      value:
        COPY_STATUSES.NOT_BROUGHT,
      label: "Not Brought",
    },
  ];


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* ========================================================
          STUDENT CARD
      ======================================================== */}

      <div
        className={`
          overflow-hidden rounded-2xl border
          bg-white shadow-sm
          transition-all
          ${
            student?.isChecked
              ? "border-emerald-200"
              : "border-slate-200"
          }
        `}
      >

        {/* ======================================================
            STUDENT HEADER
        ====================================================== */}

        <div className="flex items-center justify-between px-5 py-4">

          <div className="min-w-0">

            {/* --------------------------------------------------
                STATUS COUNTS
            -------------------------------------------------- */}

            <div className="mb-1 flex items-center gap-3 text-xs font-semibold">

              <span
                className={
                  classWorkCompleted
                    ? "text-emerald-600"
                    : "text-slate-400"
                }
              >
                CW: {classWorkCount}
              </span>

              <span className="text-slate-300">
                |
              </span>

              <span
                className={
                  homeWorkCompleted
                    ? "text-emerald-600"
                    : "text-slate-400"
                }
              >
                HW: {homeWorkCount}
              </span>

            </div>


            {/* --------------------------------------------------
                NAME
            -------------------------------------------------- */}

            <h3 className="text-lg font-bold text-slate-900">
              {student?.name ||
                "Student"}
            </h3>


            {/* --------------------------------------------------
                STUDENT DETAILS
            -------------------------------------------------- */}

            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">

              <span>
                <span className="font-semibold text-slate-600">
                  SRN:
                </span>{" "}
                {student?.srn ||
                  student?.rollNumber ||
                  "-"}
              </span>

              <span>
                <span className="font-semibold text-slate-600">
                  Father:
                </span>{" "}
                {student?.fatherName ||
                  "-"}
              </span>

            </div>

          </div>


          {/* --------------------------------------------------
              INITIAL
          -------------------------------------------------- */}

          <div
            className={`
              hidden h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl text-sm font-bold
              sm:flex
              ${
                student?.isChecked
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-50 text-blue-600"
              }
            `}
          >
            {(
              student?.name ||
              "S"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

        </div>


        {/* ======================================================
            WORK TYPE BUTTONS
        ====================================================== */}

        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* ==================================================
                CLASS WORK BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                openModal(
                  WORK_TYPES.CLASS_WORK
                )
              }
              className={`
                group flex items-center
                justify-between rounded-xl
                border px-4 py-3
                text-left transition-all
                ${
                  classWorkCompleted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100"
                }
              `}
            >

              <div className="flex items-center gap-3">

                <div
                  className={`
                    flex h-9 w-9 items-center
                    justify-center rounded-lg
                    ${
                      classWorkCompleted
                        ? "bg-emerald-100"
                        : "bg-blue-100"
                    }
                  `}
                >

                  {classWorkCompleted ? (

                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-emerald-600"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.42 0l-3.2-3.2a1 1 0 111.42-1.42l2.49 2.49 6.49-6.49a1 1 0 011.42 0z"
                        clipRule="evenodd"
                      />
                    </svg>

                  ) : (

                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path d="M6 3h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
                      <path d="M7 7h6" />
                      <path d="M7 10h6" />
                      <path d="M7 13h4" />
                    </svg>

                  )}

                </div>


                <div>

                  <p className="text-sm font-bold">
                    Class Work
                  </p>

                  <p className="text-xs opacity-70">
                    {classWorkCompleted
                      ? `${classWorkCount} subject${classWorkCount === 1 ? "" : "s"} checked`
                      : "Open checking"}
                  </p>

                </div>

              </div>


              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>

            </button>


            {/* ==================================================
                HOME WORK BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                openModal(
                  WORK_TYPES.HOME_WORK
                )
              }
              className={`
                group flex items-center
                justify-between rounded-xl
                border px-4 py-3
                text-left transition-all
                ${
                  homeWorkCompleted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100"
                }
              `}
            >

              <div className="flex items-center gap-3">

                <div
                  className={`
                    flex h-9 w-9 items-center
                    justify-center rounded-lg
                    ${
                      homeWorkCompleted
                        ? "bg-emerald-100"
                        : "bg-indigo-100"
                    }
                  `}
                >

                  {homeWorkCompleted ? (

                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-emerald-600"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.42 0l-3.2-3.2a1 1 0 111.42-1.42l2.49 2.49 6.49-6.49a1 1 0 011.42 0z"
                        clipRule="evenodd"
                      />
                    </svg>

                  ) : (

                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path d="M6 3h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
                      <path d="M7 7h6" />
                      <path d="M7 10h6" />
                      <path d="M7 13h4" />
                    </svg>

                  )}

                </div>


                <div>

                  <p className="text-sm font-bold">
                    Home Work
                  </p>

                  <p className="text-xs opacity-70">
                    {homeWorkCompleted
                      ? `${homeWorkCount} subject${homeWorkCount === 1 ? "" : "s"} checked`
                      : "Open checking"}
                  </p>

                </div>

              </div>


              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>

            </button>

          </div>

        </div>

      </div>


      {/* ========================================================
          MODAL
      ======================================================== */}

      {activeWorkType && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">


            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>

                <div className="flex items-center gap-3">

                  <div
                    className={`
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                      ${
                        activeWorkType ===
                        WORK_TYPES.CLASS_WORK
                          ? "bg-blue-100 text-blue-600"
                          : "bg-indigo-100 text-indigo-600"
                      }
                    `}
                  >

                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path d="M6 3h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
                      <path d="M7 7h6" />
                      <path d="M7 10h6" />
                      <path d="M7 13h4" />
                    </svg>

                  </div>


                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {activeWorkType}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {student?.name} ·{" "}
                      {student?.srn ||
                        student?.rollNumber ||
                        "No SRN"}
                    </p>

                  </div>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close"
              >

                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M5 5l10 10" />
                  <path d="M15 5L5 15" />
                </svg>

              </button>

            </div>


            {/* ==================================================
                MODAL BODY
            ================================================== */}

            <div className="flex-1 overflow-auto p-5">


              {/* =================================================
                  ERROR
              ================================================= */}

              {validationError && (

                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4zM10 14a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <p className="text-sm font-medium text-red-700">
                    {validationError}
                  </p>

                </div>

              )}


              {/* =================================================
                  MATRIX
              ================================================= */}

              <div className="overflow-hidden rounded-xl border border-slate-200">

                {/* -------------------------------------------------
                    TABLE HEADER
                ------------------------------------------------- */}

                <div className="hidden grid-cols-[minmax(180px,1.4fr)_110px_110px_125px_minmax(180px,1fr)] items-center gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">

                  <div>
                    Subject
                  </div>

                  <div className="text-center">
                    Complete
                  </div>

                  <div className="text-center">
                    Incomplete
                  </div>

                  <div className="text-center">
                    Not Brought
                  </div>

                  <div>
                    Remarks
                  </div>

                </div>


                {/* -------------------------------------------------
                    SUBJECT ROWS
                ------------------------------------------------- */}

                <div className="divide-y divide-slate-100">

                  {SUBJECTS.map(
                    (subject) => {

                      const record =
                        getSubjectRecord(
                          subject.subjectId
                        );

                      return (

                        <div
                          key={
                            subject.subjectId
                          }
                          className="grid grid-cols-1 gap-3 px-4 py-4 hover:bg-slate-50/70 md:grid-cols-[minmax(180px,1.4fr)_110px_110px_125px_minmax(180px,1fr)] md:items-center md:gap-3"
                        >

                          {/* -------------------------------------
                              SUBJECT
                          ------------------------------------- */}

                          <div>

                            <span className="text-sm font-semibold text-slate-800">
                              {
                                subject.subjectName
                              }
                            </span>

                          </div>


                          {/* -------------------------------------
                              COMPLETE
                          ------------------------------------- */}

                          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 md:justify-center md:border-0 md:px-0 md:py-0">

                            <span className="text-xs font-medium text-slate-500 md:hidden">
                              Complete
                            </span>

                            <input
                              type="checkbox"
                              checked={
                                record.status ===
                                COPY_STATUSES.COMPLETE
                              }
                              onChange={() =>
                                handleStatusChange(
                                  subject.subjectId,
                                  record.status ===
                                    COPY_STATUSES.COMPLETE
                                    ? ""
                                    : COPY_STATUSES.COMPLETE
                                )
                              }
                              className="h-4 w-4 cursor-pointer accent-emerald-600"
                            />

                          </label>


                          {/* -------------------------------------
                              INCOMPLETE
                          ------------------------------------- */}

                          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 md:justify-center md:border-0 md:px-0 md:py-0">

                            <span className="text-xs font-medium text-slate-500 md:hidden">
                              Incomplete
                            </span>

                            <input
                              type="checkbox"
                              checked={
                                record.status ===
                                COPY_STATUSES.INCOMPLETE
                              }
                              onChange={() =>
                                handleStatusChange(
                                  subject.subjectId,
                                  record.status ===
                                    COPY_STATUSES.INCOMPLETE
                                    ? ""
                                    : COPY_STATUSES.INCOMPLETE
                                )
                              }
                              className="h-4 w-4 cursor-pointer accent-amber-500"
                            />

                          </label>


                          {/* -------------------------------------
                              NOT BROUGHT
                          ------------------------------------- */}

                          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 md:justify-center md:border-0 md:px-0 md:py-0">

                            <span className="text-xs font-medium text-slate-500 md:hidden">
                              Not Brought
                            </span>

                            <input
                              type="checkbox"
                              checked={
                                record.status ===
                                COPY_STATUSES.NOT_BROUGHT
                              }
                              onChange={() =>
                                handleStatusChange(
                                  subject.subjectId,
                                  record.status ===
                                    COPY_STATUSES.NOT_BROUGHT
                                    ? ""
                                    : COPY_STATUSES.NOT_BROUGHT
                                )
                              }
                              className="h-4 w-4 cursor-pointer accent-red-500"
                            />

                          </label>


                          {/* -------------------------------------
                              REMARK
                          ------------------------------------- */}

                          <input
                            type="text"
                            value={
                              record.remarks ||
                              ""
                            }
                            onChange={(event) =>
                              handleRemarkChange(
                                subject.subjectId,
                                event.target.value
                              )
                            }
                            placeholder="Optional remark"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />

                        </div>

                      );

                    }
                  )}

                </div>

              </div>


              {/* =================================================
                  INFO
              ================================================= */}

              <p className="mt-3 text-xs text-slate-400">
                Select one status for each subject you want to check.
                Remarks are optional.
              </p>

            </div>


            {/* ==================================================
                MODAL FOOTER
            ================================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  {activeWorkType}
                </p>

                <p className="text-xs text-slate-500">
                  {currentRecords.filter(
                    (record) =>
                      record?.status
                  ).length}{" "}
                  subjects selected
                </p>

              </div>


              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    saving
                  }
                  className={`
                    inline-flex min-w-[170px]
                    items-center justify-center
                    gap-2 rounded-lg
                    px-5 py-2.5
                    text-sm font-bold text-white
                    shadow-sm transition
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    ${
                      activeWorkType ===
                      WORK_TYPES.CLASS_WORK
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }
                  `}
                >

                  {saving ? (

                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                          opacity="0.3"
                        />

                        <path
                          d="M21 12a9 9 0 00-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>

                      Saving...

                    </>

                  ) : (

                    <>
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.42 0l-3.2-3.2a1 1 0 111.42-1.42l2.49 2.49 6.49-6.49a1 1 0 011.42 0z"
                          clipRule="evenodd"
                        />
                      </svg>

                      Submit{" "}
                      {activeWorkType}

                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default StudentCopyCard;