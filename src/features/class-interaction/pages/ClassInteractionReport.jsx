import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../../context/AuthContext";
import { useRegionAccess } from "../../../context/RegionAccessContext";

import {
  CLASS_INTERACTION_RECORD_TYPES,
  CLASS_INTERACTION_STATUSES,
  CLASS_INTERACTION_SUBJECTS,
} from "../constants/classInteraction.constants";

import {
  exportClassInteractionReport,
  getClassInteractionReport,
} from "../services/classInteraction.service";


const FULL_REPORT_ROLES = [
  "admin",
];

const INDIVIDUAL_REPORT_ROLES = [
  "cm",
  "cc",
  "aci",
];


function ClassInteractionReport() {

  const {
    access,
  } = useAuth();

  const {
    programAccess,
  } = useRegionAccess();


  /*
   * ============================================================
   * ROLE
   * ============================================================
   */

  const roleCodes =
    useMemo(() => {

      return (
        access?.roles || []
      )
        .map((role) => {

          if (
            typeof role ===
            "string"
          ) {
            return role.toLowerCase();
          }

          return (
            role?.roleCode ||
            role?.code ||
            role?.name ||
            ""
          ).toLowerCase();

        })
        .filter(Boolean);

    }, [
      access?.roles,
    ]);


  const isFullReportUser =
    roleCodes.some(
      (role) =>
        FULL_REPORT_ROLES.includes(
          role
        )
    );


  const isIndividualReportUser =
    roleCodes.some(
      (role) =>
        INDIVIDUAL_REPORT_ROLES.includes(
          role
        )
    );


  /*
   * ============================================================
   * ACCESSIBLE PROGRAMS / BATCHES
   * ============================================================
   */

  const programs =
    programAccess?.programs ||
    [];

  const batches =
    programAccess?.batches ||
    [];


  /*
   * ============================================================
   * FILTER STATES
   * ============================================================
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
    recordType,
    setRecordType,
  ] = useState("");

  const [
    subject,
    setSubject,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");


  /*
   * ============================================================
   * DATA STATES
   * ============================================================
   */

  const [
    records,
    setRecords,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const [
    searched,
    setSearched,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  /*
   * ============================================================
   * AVAILABLE BATCHES
   * ============================================================
   */

  const availableBatches =
    useMemo(() => {

      if (!programId) {
        return batches;
      }

      return batches.filter(
        (batch) =>
          String(
            batch?.programId?._id ||
              batch?.programId
          ) ===
          String(programId)
      );

    }, [
      batches,
      programId,
    ]);


  /*
   * ============================================================
   * AVAILABLE STATUSES
   * ============================================================
   */

  const availableStatuses =
    useMemo(() => {

      if (!recordType) {
        return [];
      }

      return (
        CLASS_INTERACTION_STATUSES[
          recordType
        ] || []
      );

    }, [
      recordType,
    ]);


  /*
   * ============================================================
   * AUTO SELECT SINGLE PROGRAM
   *
   * Only for individual users.
   *
   * Admin gets All Programs option.
   * ============================================================
   */

  useEffect(() => {

    if (
      isFullReportUser
    ) {
      return;
    }

    if (
      programs.length !== 1
    ) {
      return;
    }

    setProgramId(
      String(
        programs[0]._id
      )
    );

  }, [
    programs,
    isFullReportUser,
  ]);


  /*
   * ============================================================
   * AUTO SELECT SINGLE BATCH
   * ============================================================
   */

  useEffect(() => {

    if (
      availableBatches.length !==
      1
    ) {
      return;
    }

    setBatchId(
      String(
        availableBatches[0]._id
      )
    );

  }, [
    availableBatches,
  ]);


  /*
   * ============================================================
   * PROGRAM CHANGE
   * ============================================================
   */

  const handleProgramChange =
    (value) => {

      setProgramId(
        value
      );

      setBatchId(
        ""
      );

    };


  /*
   * ============================================================
   * RESET
   * ============================================================
   */

  const handleReset =
    () => {

      setProgramId(
        isFullReportUser
          ? ""
          : programs.length ===
            1
          ? String(
              programs[0]._id
            )
          : ""
      );

      setBatchId(
        ""
      );

      setRecordType(
        ""
      );

      setSubject(
        ""
      );

      setStatus(
        ""
      );

      setStartDate(
        ""
      );

      setEndDate(
        ""
      );

      setSearch(
        ""
      );

      setRecords(
        []
      );

      setSearched(
        false
      );

      setError(
        ""
      );

    };


  /*
   * ============================================================
   * BUILD PARAMS
   * ============================================================
   */

  const buildParams =
    () => {

      const params = {};


      if (programId) {
        params.programId =
          programId;
      }


      if (batchId) {
        params.batchId =
          batchId;
      }


      if (startDate) {
        params.startDate =
          startDate;
      }


      if (endDate) {
        params.endDate =
          endDate;
      }


      if (subject) {
        params.subject =
          subject;
      }


      if (recordType) {
        params.recordType =
          recordType;
      }


      if (status) {
        params.status =
          status;
      }


      if (search.trim()) {
        params.search =
          search.trim();
      }


      return params;

    };


  /*
   * ============================================================
   * VALIDATE
   * ============================================================
   */

  const validateFilters =
    () => {

      if (
        startDate &&
        endDate &&
        startDate >
          endDate
      ) {

        setError(
          "From Date cannot be greater than To Date."
        );

        return false;

      }


      /*
       * Individual user:
       * Program + Batch required.
       */

      if (
        isIndividualReportUser &&
        !isFullReportUser
      ) {

        if (!programId) {

          setError(
            "Please select a Program."
          );

          return false;

        }


        if (!batchId) {

          setError(
            "Please select a Batch."
          );

          return false;

        }

      }


      setError(
        ""
      );

      return true;

    };


  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const handleSearch =
    async () => {

      if (
        !validateFilters()
      ) {
        return;
      }


      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        const response =
          await getClassInteractionReport(
            buildParams()
          );


        setRecords(
          response?.data
            ?.records ||
            []
        );


        setSearched(
          true
        );

      } catch (err) {

        console.error(
          "Failed to fetch class interaction report:",
          err
        );


        setRecords(
          []
        );


        setError(
          err?.response
            ?.data
            ?.message ||
          "Failed to load report."
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  /*
   * ============================================================
   * EXPORT
   * ============================================================
   */

  const handleExport =
    async () => {

      if (
        !validateFilters()
      ) {
        return;
      }


      try {

        setExporting(
          true
        );

        setError(
          ""
        );


        const response =
          await exportClassInteractionReport(
            buildParams()
          );


        const blob =
          new Blob(
            [
              response.data,
            ],
            {
              type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }
          );


        const url =
          window.URL.createObjectURL(
            blob
          );


        const link =
          document.createElement(
            "a"
          );


        link.href =
          url;


        link.download =
          `class-interaction-report-${new Date()
            .toISOString()
            .slice(
              0,
              10
            )}.xlsx`;


        document.body.appendChild(
          link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
          url
        );

      } catch (err) {

        console.error(
          "Failed to export class interaction report:",
          err
        );


        setError(
          err?.response
            ?.data
            ?.message ||
          "Failed to export report."
        );

      } finally {

        setExporting(
          false
        );

      }

    };


  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */

  const formatDate =
    (value) => {

      if (!value) {
        return "-";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "-";
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day:
            "2-digit",

          month:
            "2-digit",

          year:
            "numeric",
        }
      );

    };


  /*
   * ============================================================
   * UNAUTHORIZED
   * ============================================================
   */

  if (
    !isFullReportUser &&
    !isIndividualReportUser
  ) {

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        You are not authorized to
        access this report.
      </div>
    );

  }


  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="w-full space-y-4">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h1 className="text-xl font-semibold text-gray-800">
              Class Interaction Report
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              View, filter and export
              class interaction records.
            </p>

          </div>


          <div className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">

            {isFullReportUser
              ? "Full Report"
              : "Individual Report"}

          </div>

        </div>

      </div>


      {/* ========================================================
          FILTER CARD
      ======================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">


          {/* ====================================================
              PROGRAM
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700">
              Program
            </label>

            <select
              value={
                programId
              }
              onChange={(event) =>
                handleProgramChange(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              {isFullReportUser && (
                <option value="">
                  All Programs
                </option>
              )}

              {!isFullReportUser &&
                programs.length !==
                  1 && (
                  <option value="">
                    Select Program
                  </option>
                )}

              {programs.map(
                (program) => (
                  <option
                    key={
                      program._id
                    }
                    value={
                      program._id
                    }
                  >
                    {
                      program.programName
                    }
                  </option>
                )
              )}

            </select>

          </div>


          {/* ====================================================
              BATCH
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700">
              Batch
            </label>

            <select
              value={
                batchId
              }
              onChange={(event) =>
                setBatchId(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              {isFullReportUser && (
                <option value="">
                  All Batches
                </option>
              )}

              {!isFullReportUser &&
                availableBatches.length !==
                  1 && (
                  <option value="">
                    Select Batch
                  </option>
                )}

              {availableBatches.map(
                (batch) => (
                  <option
                    key={
                      batch._id
                    }
                    value={
                      batch._id
                    }
                  >
                    {
                      batch.batchName
                    }
                  </option>
                )
              )}

            </select>

          </div>


          {/* ====================================================
              FROM DATE
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700">
              From Date
            </label>

            <input
              type="date"
              value={
                startDate
              }
              onChange={(event) =>
                setStartDate(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* ====================================================
              TO DATE
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700">
              To Date
            </label>

            <input
              type="date"
              value={
                endDate
              }
              onChange={(event) =>
                setEndDate(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* ====================================================
              TYPE
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700">
              Type
            </label>

            <select
              value={
                recordType
              }
              onChange={(event) => {

                setRecordType(
                  event.target.value
                );

                setStatus(
                  ""
                );

              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="">
                All Types
              </option>

              {CLASS_INTERACTION_RECORD_TYPES.map(
                (item) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                )
              )}

            </select>

          </div>


          {/* ====================================================
              SUBJECT
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700">
              Subject
            </label>

            <select
              value={
                subject
              }
              onChange={(event) =>
                setSubject(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="">
                All Subjects
              </option>

              {CLASS_INTERACTION_SUBJECTS.map(
                (item) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                )
              )}

            </select>

          </div>


          {/* ====================================================
              STATUS
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700">
              Status
            </label>

            <select
              value={
                status
              }
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="">
                All Statuses
              </option>

              {availableStatuses.map(
                (item) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                )
              )}

            </select>

          </div>


          {/* ====================================================
              SEARCH
          ==================================================== */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-700">
              Search District / Block / Center
            </label>

            <input
              type="text"
              value={
                search
              }
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Regex: rohtak or center.*12"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>


        {/* ========================================================
            ERROR
        ======================================================== */}

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* ========================================================
            ACTIONS
        ======================================================== */}

        <div className="mt-4 flex flex-wrap gap-2">

          <button
            type="button"
            onClick={
              handleSearch
            }
            disabled={
              loading
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading
              ? "Loading..."
              : "Search"}
          </button>


          <button
            type="button"
            onClick={
              handleExport
            }
            disabled={
              exporting
            }
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {exporting
              ? "Exporting..."
              : "Export Excel"}
          </button>


          <button
            type="button"
            onClick={
              handleReset
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Reset
          </button>

        </div>

      </div>


      {/* ========================================================
          REPORT SUMMARY
      ======================================================== */}

      {searched && (
        <div className="flex flex-wrap gap-2">

          <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            {records.length} Records
          </div>

          <div className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
            {
              isFullReportUser
                ? "All Users"
                : "My Records"
            }
          </div>

        </div>
      )}


      {/* ========================================================
          REPORT TABLE
      ======================================================== */}

      {searched && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">

          {loading ? (

            <div className="px-4 py-10 text-center text-sm text-gray-500">
              Loading report...
            </div>

          ) : records.length ===
            0 ? (

            <div className="px-4 py-10 text-center text-sm text-gray-500">
              No records found for
              selected filters.
            </div>

          ) : (

            <table className="min-w-[1400px] w-full border-collapse">

              <thead className="bg-gray-50">

                <tr>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Date
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    User
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Role
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Program
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Batch
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    District
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Block
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Center
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Subject
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Type
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Status
                  </th>

                  <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Remark
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {records.map(
                  (record) => (
                    <tr
                      key={
                        record._id
                      }
                      className="hover:bg-gray-50"
                    >

                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-700">
                        {
                          formatDate(
                            record.date
                          )
                        }
                      </td>

                      <td className="whitespace-nowrap px-3 py-2 text-xs font-medium text-gray-800">
                        {
                          record.userName
                        }
                      </td>

                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-700">
                        {
                          record.role
                        }
                      </td>

                      <td className="px-3 py-2 text-xs text-gray-700">
                        {
                          record.programName
                        }
                      </td>

                      <td className="px-3 py-2 text-xs text-gray-700">
                        {
                          record.batchName
                        }
                      </td>

                      <td className="px-3 py-2 text-xs text-gray-700">
                        {
                          record.districtName
                        }
                      </td>

                      <td className="px-3 py-2 text-xs text-gray-700">
                        {
                          record.blockName
                        }
                      </td>

                      <td className="px-3 py-2 text-xs font-medium text-gray-800">
                        {
                          record.centerName
                        }
                      </td>

                      <td className="px-3 py-2 text-xs text-gray-700">
                        {
                          record.subject
                        }
                      </td>

                      <td className="px-3 py-2 text-xs text-gray-700">
                        {
                          record.recordType
                        }
                      </td>

                      <td className="px-3 py-2 text-xs font-semibold text-gray-700">
                        {
                          record.status
                        }
                      </td>

                      <td className="max-w-[300px] px-3 py-2 text-xs text-gray-600">
                        {
                          record.remark ||
                          "-"
                        }
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          )}

        </div>
      )}

    </div>
  );
}


export default ClassInteractionReport;