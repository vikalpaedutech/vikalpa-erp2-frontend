import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import AttendanceSummary from "../components/AttendanceSummary";

import {
  getMyAttendance,
} from "../services/userAttendance.service";

import {
  ATTENDANCE_TYPES,
} from "../constants/attendance.constants";

import { downloadExcel } from "../../../utils/excelExport";


// ============================================================
// HELPERS
// ============================================================

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const formatInputDate = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};


const getFirstDayOfMonth = () => {
  const date = new Date();

  return formatInputDate(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    )
  );
};


const getToday = () => {
  return formatInputDate(new Date());
};


// ============================================================
// PAGE
// ============================================================

function MyAttendance() {
  const navigate = useNavigate();

  const [attendance, setAttendance] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [fromDate, setFromDate] =
    useState(getFirstDayOfMonth());

  const [toDate, setToDate] =
    useState(getToday());

  const [attendanceType, setAttendanceType] =
    useState("");

  const [status, setStatus] =
    useState("");


  // ==========================================================
  // FETCH
  // ==========================================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getMyAttendance({
          fromDate,
          toDate,
          attendanceType:
            attendanceType || undefined,
          status:
            status || undefined,
          page: 1,
          limit: 100,
        });

      setAttendance(
        response?.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAttendance();
  }, []);


  // ==========================================================
  // DOWNLOAD EXCEL
  // ==========================================================

  const downloadReport = () => {
    if (!attendance.length) {
      return;
    }

    const rows = attendance.map((item) => ({
      Date: formatDate(item.date),
      "Attendance Type": item.attendanceType || "",
      Status: item.status || "",
      "Check In": item.checkIn
        ? new Date(item.checkIn).toLocaleTimeString()
        : "",
      "Check Out": item.checkOut
        ? new Date(item.checkOut).toLocaleTimeString()
        : "",
      Source: item.attendanceSource || "",
      "Visited Location": item.visitedLocation || "",
      Remarks: item.remarks || "",
    }));

    downloadExcel({
      fileName: `attendance-report-${fromDate}-${toDate}.xls`,
      sheetName: "Attendance",
      columns: [
        { key: "Date", label: "Date" },
        { key: "Attendance Type", label: "Attendance Type" },
        { key: "Status", label: "Status" },
        { key: "Check In", label: "Check In" },
        { key: "Check Out", label: "Check Out" },
        { key: "Source", label: "Source" },
        { key: "Visited Location", label: "Visited Location" },
        { key: "Remarks", label: "Remarks" },
      ],
      rows,
    });
  };

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    useMemo(
      () => attendance,
      [attendance]
    );


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Attendance & Leaves
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View your attendance records and download your report.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() =>
                navigate("/leave/apply")
              }
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Apply Leave
            </button>

            <button
              onClick={downloadReport}
              disabled={!attendance.length}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Download Excel Report
            </button>

          </div>

        </div>


        {/* FILTERS */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-4">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5"
              />
            </div>


            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5"
              />
            </div>


            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Attendance Type
              </label>

              <select
                value={attendanceType}
                onChange={(e) =>
                  setAttendanceType(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5"
              >
                <option value="">
                  All Types
                </option>

                {ATTENDANCE_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>
            </div>


            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5"
              >
                <option value="">
                  All Status
                </option>

                <option value="Present">
                  Present
                </option>

                <option value="WFH">
                  WFH
                </option>

                <option value="Absent">
                  Absent
                </option>

                <option value="Leave">
                  Leave
                </option>
              </select>
            </div>

          </div>


          <div className="mt-4 flex justify-end">

            <button
              onClick={fetchAttendance}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Apply Filters
            </button>

          </div>

        </div>


        {/* SUMMARY */}

        <div className="mb-6">
          <AttendanceSummary
            attendance={summary}
          />
        </div>


        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Attendance Records
            </h2>
          </div>


          {loading ? (

            <div className="p-10 text-center text-sm text-gray-500">
              Loading attendance...
            </div>

          ) : attendance.length === 0 ? (

            <div className="p-10 text-center text-sm text-gray-500">
              No attendance records found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full text-sm">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-5 py-3 text-left font-semibold text-gray-600">
                      Date
                    </th>

                    <th className="px-5 py-3 text-left font-semibold text-gray-600">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left font-semibold text-gray-600">
                      Check In
                    </th>

                    <th className="px-5 py-3 text-left font-semibold text-gray-600">
                      Check Out
                    </th>

                    <th className="px-5 py-3 text-left font-semibold text-gray-600">
                      Source
                    </th>

                    <th className="px-5 py-3 text-left font-semibold text-gray-600">
                      Remarks
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y">

                  {attendance.map(
                    (item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-5 py-4">
                          {formatDate(
                            item.date
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {item.attendanceType}
                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                            {item.status}
                          </span>

                        </td>

                        <td className="px-5 py-4">
                          {item.checkIn
                            ? new Date(
                                item.checkIn
                              ).toLocaleTimeString()
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          {item.checkOut
                            ? new Date(
                                item.checkOut
                              ).toLocaleTimeString()
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          {item.attendanceSource ||
                            "-"}
                        </td>

                        <td className="px-5 py-4">
                          {item.remarks || "-"}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default MyAttendance;