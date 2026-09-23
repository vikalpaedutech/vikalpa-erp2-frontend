import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../../context/AuthContext";
import { useRegionAccess } from "../../../context/RegionAccessContext";

import ProgramDropdown from "../../../components/common/dropdowns/ProgramDropdown";
import BatchDropdown from "../../../components/common/dropdowns/BatchDropdown";
import DistrictCenterDropdown from "../../../components/common/dropdowns/DistrictCenterDropdown";
import CenterDropdown from "../../../components/common/dropdowns/CenterDropdown";

import StudentCopyCard from "../components/StudentCopyCard";

import {
  getStudentCopyCheckingStudents,
  getStudentCopyCheckings,
  createBulkStudentCopyChecking,
} from "../services/studentCopyChecking.service";


/*
|--------------------------------------------------------------------------
| STUDENT COPY CHECKING
|--------------------------------------------------------------------------
*/

const StudentCopyChecking = () => {

  /*
  |--------------------------------------------------------------------------
  | AUTH / REGION ACCESS
  |--------------------------------------------------------------------------
  */

  const { access } = useAuth();

  const {
    programAccess,
  } = useRegionAccess();


  /*
  |--------------------------------------------------------------------------
  | ROLE
  |--------------------------------------------------------------------------
  */

  const isCC =
    access?.roles?.some(
      (role) =>
        role?.roleCode === "cc"
    ) || false;


  /*
  |--------------------------------------------------------------------------
  | ACCESSIBLE PROGRAMS / BATCHES
  |--------------------------------------------------------------------------
  */

  const accessiblePrograms =
    programAccess?.programs || [];

  const accessibleBatches =
    programAccess?.batches || [];


  /*
  |--------------------------------------------------------------------------
  | FILTER STATE
  |--------------------------------------------------------------------------
  */

  const [
    programId,
    setProgramId,
  ] = useState("");

  const [
    batchId,
    setBatchId,
  ] = useState("");

  const [
    districtId,
    setDistrictId,
  ] = useState("");

  const [
    centerId,
    setCenterId,
  ] = useState("");

  const [
    checkDate,
    setCheckDate,
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );


  /*
  |--------------------------------------------------------------------------
  | STUDENTS
  |--------------------------------------------------------------------------
  */

  const [
    students,
    setStudents,
  ] = useState([]);

  const [
    loadingStudents,
    setLoadingStudents,
  ] = useState(false);

  const [
    loadingExisting,
    setLoadingExisting,
  ] = useState(false);

  const [
    savingStudentId,
    setSavingStudentId,
  ] = useState(null);

  const [
    hasSearched,
    setHasSearched,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | FILTER READY
  |--------------------------------------------------------------------------
  */

  const filtersReady = useMemo(() => {

    if (!programId) {
      return false;
    }

    if (!batchId) {
      return false;
    }

    if (!checkDate) {
      return false;
    }

    /*
    |--------------------------------------------------------------------------
    | CC
    |--------------------------------------------------------------------------
    */

    if (isCC) {
      return Boolean(centerId);
    }

    /*
    |--------------------------------------------------------------------------
    | NON CC
    |--------------------------------------------------------------------------
    */

    return Boolean(
      districtId &&
      centerId
    );

  }, [
    programId,
    batchId,
    checkDate,
    isCC,
    districtId,
    centerId,
  ]);


  /*
  |--------------------------------------------------------------------------
  | RESET WHEN PROGRAM CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    setBatchId("");
    setStudents([]);
    setHasSearched(false);
    setError("");

  }, [programId]);


  /*
  |--------------------------------------------------------------------------
  | RESET REGION WHEN DISTRICT CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!isCC) {
      setCenterId("");
    }

    setStudents([]);
    setHasSearched(false);

  }, [
    districtId,
    isCC,
  ]);


  /*
  |--------------------------------------------------------------------------
  | RESET WHEN BATCH CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    setStudents([]);
    setHasSearched(false);

  }, [batchId]);


  /*
  |--------------------------------------------------------------------------
  | RESET WHEN DATE CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    setStudents([]);
    setHasSearched(false);

  }, [checkDate]);


  /*
  |--------------------------------------------------------------------------
  | LOAD EXISTING COPY CHECKINGS
  |--------------------------------------------------------------------------
  */

  const loadExistingCheckings = async (
    studentList
  ) => {

    if (!studentList.length) {
      return studentList;
    }

    try {

      setLoadingExisting(true);

      const response =
        await getStudentCopyCheckings({
          programId,
          batchId,
          centerId,
          checkDate,
          page: 1,
          limit: 100,
        });

      const existingRecords =
        response?.data
          ?.copyCheckings || [];


      /*
      |--------------------------------------------------------------------------
      | GROUP RECORDS BY STUDENT
      |--------------------------------------------------------------------------
      */

      const recordsByStudent =
        new Map();

      existingRecords.forEach(
        (record) => {

          const studentKey =
            record?.studentId?._id ||
            record?.studentId;

          if (!studentKey) {
            return;
          }

          const key =
            studentKey.toString();

          if (
            !recordsByStudent.has(
              key
            )
          ) {
            recordsByStudent.set(
              key,
              []
            );
          }

          recordsByStudent
            .get(key)
            .push(record);

        }
      );


      /*
      |--------------------------------------------------------------------------
      | MERGE WITH STUDENTS
      |--------------------------------------------------------------------------
      */

      return studentList.map(
        (student) => {

          const records =
            recordsByStudent.get(
              student._id.toString()
            ) || [];

          return {
            ...student,

            copyCheckings:
              records,

            isChecked:
              records.length > 0,
          };

        }
      );

    } catch (err) {

      console.error(
        "Failed to load existing copy checking:",
        err
      );

      return studentList.map(
        (student) => ({
          ...student,
          copyCheckings: [],
          isChecked: false,
        })
      );

    } finally {

      setLoadingExisting(false);

    }
  };


  /*
  |--------------------------------------------------------------------------
  | SEARCH STUDENTS
  |--------------------------------------------------------------------------
  */

  const handleSearchStudents =
    async () => {

      if (!filtersReady) {

        setError(
          "Please select all required filters."
        );

        return;
      }

      try {

        setError("");
        setLoadingStudents(true);
        setHasSearched(true);


        /*
        |--------------------------------------------------------------------------
        | API PARAMS
        |--------------------------------------------------------------------------
        */

        const params = {
          programId,
          batchId,
          centerId,
          checkDate,
          page: 1,
          limit: 100,
        };


        /*
        |--------------------------------------------------------------------------
        | DISTRICT FOR NON CC
        |--------------------------------------------------------------------------
        */

        if (!isCC) {

          params.districtId =
            districtId;

        }


        /*
        |--------------------------------------------------------------------------
        | GET AUTHORIZED STUDENTS
        |--------------------------------------------------------------------------
        */

        const response =
          await getStudentCopyCheckingStudents(
            params
          );

        let fetchedStudents =
          response?.data
            ?.students || [];


        /*
        |--------------------------------------------------------------------------
        | SORT BY NAME
        |--------------------------------------------------------------------------
        */

        fetchedStudents.sort(
          (a, b) =>
            (a?.name || "")
              .toLowerCase()
              .localeCompare(
                (
                  b?.name || ""
                ).toLowerCase()
              )
        );


        /*
        |--------------------------------------------------------------------------
        | LOAD EXISTING CHECKINGS
        |--------------------------------------------------------------------------
        */

        fetchedStudents =
          await loadExistingCheckings(
            fetchedStudents
          );


        setStudents(
          fetchedStudents
        );

      } catch (err) {

        console.error(
          "Failed to fetch copy checking students:",
          err
        );

        setStudents([]);

        setError(
          err?.response?.data
            ?.message ||
          "Failed to load students."
        );

      } finally {

        setLoadingStudents(false);

      }
    };


  /*
  |--------------------------------------------------------------------------
  | SAVE STUDENT
  |--------------------------------------------------------------------------
  */

  const handleSaveStudent =
    async ({
      checkDate: selectedDate,
      records,
    }) => {

      if (!records?.length) {
        return;
      }

      const studentId =
        records[0]?.studentId;

      try {

        setSavingStudentId(
          studentId
        );

        setError("");


        /*
        |--------------------------------------------------------------------------
        | SAVE
        |--------------------------------------------------------------------------
        */

        await createBulkStudentCopyChecking(
          {
            checkDate:
              selectedDate,

            records,
          }
        );


        /*
        |--------------------------------------------------------------------------
        | RELOAD SAVED STUDENT
        |--------------------------------------------------------------------------
        */

        const response =
          await getStudentCopyCheckings({
            programId,
            batchId,
            centerId,
            studentId,
            checkDate:
              selectedDate,
            page: 1,
            limit: 100,
          });

        const updatedRecords =
          response?.data
            ?.copyCheckings || [];


        /*
        |--------------------------------------------------------------------------
        | UPDATE STUDENT CARD
        |--------------------------------------------------------------------------
        */

        setStudents(
          (previousStudents) =>
            previousStudents.map(
              (student) => {

                if (
                  student._id.toString() !==
                  studentId.toString()
                ) {
                  return student;
                }

                return {
                  ...student,

                  copyCheckings:
                    updatedRecords,

                  isChecked:
                    updatedRecords.length >
                    0,
                };

              }
            )
        );

      } catch (err) {

        console.error(
          "Failed to save copy checking:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
          "Failed to save copy checking."
        );

        throw err;

      } finally {

        setSavingStudentId(
          null
        );

      }
    };


  /*
  |--------------------------------------------------------------------------
  | CLEAR SEARCH
  |--------------------------------------------------------------------------
  */

  const handleClear = () => {

    setStudents([]);
    setHasSearched(false);
    setError("");

  };


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Student Copy Checking
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Check Class Work and Home Work copies
        </p>

      </div>


      {/* ======================================================
          FILTER CARD
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5">

          <h2 className="text-base font-semibold text-slate-900">
            Search Students
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the required filters to find students.
          </p>

        </div>


        {/* ====================================================
            FILTER GRID
        ==================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* ==================================================
              PROGRAM
          ================================================== */}

          <ProgramDropdown
            programs={
              accessiblePrograms
            }
            value={
              programId
            }
            onChange={
              setProgramId
            }
            autoSelectSingle
            hideWhenSingle
          />


          {/* ==================================================
              BATCH
          ================================================== */}

          <BatchDropdown
            batches={
              accessibleBatches
            }
            programId={
              programId
            }
            value={
              batchId
            }
            onChange={
              setBatchId
            }
            autoSelectSingle
            hideWhenSingle
          />


          {/* ==================================================
              REGION
          ================================================== */}

          {!isCC ? (

            <div className="lg:col-span-2">

              <DistrictCenterDropdown
                districtId={
                  districtId
                }
                centerId={
                  centerId
                }
                onChange={({
                  districtId:
                    nextDistrictId,
                  centerId:
                    nextCenterId,
                }) => {

                  setDistrictId(
                    nextDistrictId
                  );

                  setCenterId(
                    nextCenterId
                  );

                }}
              />

            </div>

          ) : (

            <CenterDropdown
              value={
                centerId
              }
              onChange={
                setCenterId
              }
              independent
            />

          )}


          {/* ==================================================
              DATE
          ================================================== */}

          <div className="w-full">

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Check Date
            </label>

            <input
              type="date"
              value={
                checkDate
              }
              onChange={(event) =>
                setCheckDate(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>


        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">

          <button
            type="button"
            disabled={
              !filtersReady ||
              loadingStudents
            }
            onClick={
              handleSearchStudents
            }
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loadingStudents
              ? "Loading Students..."
              : "Search Students"}

          </button>


          {hasSearched && (

            <button
              type="button"
              onClick={
                handleClear
              }
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>

          )}

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
          LOADING EXISTING
      ====================================================== */}

      {loadingExisting && (

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading existing copy checking records...
        </div>

      )}


      {/* ======================================================
          BEFORE SEARCH
      ====================================================== */}

      {!hasSearched && (

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path d="M21 21l-4.35-4.35" />
              <circle
                cx="11"
                cy="11"
                r="6"
              />
            </svg>

          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Search Students
          </h3>

          <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
            Select Program, Batch, Center and Check Date,
            then click Search Students.
          </p>

        </div>

      )}


      {/* ======================================================
          NO STUDENTS
      ====================================================== */}

      {hasSearched &&
        !loadingStudents &&
        students.length === 0 && (

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                />
              </svg>

            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No Students Found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No students are available for the selected filters.
            </p>

          </div>

        )}


      {/* ======================================================
          STUDENTS
      ====================================================== */}

      {hasSearched &&
        students.length > 0 && (

          <div>

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-4 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Students
                </h2>

                <p className="text-sm text-slate-500">
                  Select the work type and update copy checking.
                </p>

              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {students.length}{" "}
                {students.length === 1
                  ? "Student"
                  : "Students"}
              </span>

            </div>


            {/* ==================================================
                STUDENT CARDS
            ================================================== */}

            <div className="space-y-4">

              {students.map(
                (student) => (

                  <StudentCopyCard
                    key={
                      student._id
                    }
                    student={
                      student
                    }
                    checkDate={
                      checkDate
                    }
                    onSave={
                      handleSaveStudent
                    }
                    saving={
                      savingStudentId ===
                      student._id
                    }
                  />

                )
              )}

            </div>

          </div>

        )}

    </div>
  );
};

export default StudentCopyChecking;