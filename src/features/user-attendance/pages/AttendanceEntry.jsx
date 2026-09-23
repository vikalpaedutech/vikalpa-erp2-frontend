import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import AttendanceCamera from "../components/AttendanceCamera";

import {
  ATTENDANCE_TYPES,
  DEFAULT_ATTENDANCE_TYPE,
} from "../constants/attendance.constants";

import {
  createUserAttendance,
  getMyAttendance,
  checkoutUserAttendance,
} from "../services/userAttendance.service";

// ============================================================
// HELPERS
// ============================================================

const getTodayDate = () => {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
};

const SPECIAL_ATTENDANCE_TYPES = [
  "Orientation",
  "Feild Visit",
  "Event",
  "Center Visit",
];

const getResponseRecords = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.attendance)) return response.data.attendance;
  if (Array.isArray(response?.attendance)) return response.attendance;
  return [];
};

const getRecordDate = (record) => {
  if (!record?.date) return "";
  return String(record.date).slice(0, 10);
};

// ============================================================
// PAGE
// ============================================================

function AttendanceEntry() {
  const navigate = useNavigate();
  const { access, user } = useAuth();

  const roleCodes = useMemo(() => {
    return (
      access?.roles
        ?.map((role) => {
          if (typeof role === "string") return role.toLowerCase();

          return (
            role?.roleCode ||
            role?.code ||
            role?.name ||
            ""
          ).toLowerCase();
        })
        .filter(Boolean) || []
    );
  }, [access]);

  const isCC = roleCodes.includes("cc");

  const [attendanceType, setAttendanceType] = useState(
    DEFAULT_ATTENDANCE_TYPE
  );

  const [visitedLocation, setVisitedLocation] = useState("");
  const [remarks, setRemarks] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [todayRecords, setTodayRecords] = useState([]);
  const [error, setError] = useState("");

  const today = getTodayDate();

  const requiresSpecialDetails = SPECIAL_ATTENDANCE_TYPES.includes(
    attendanceType
  );

  const selectedAttendance = useMemo(() => {
    return todayRecords.find(
      (record) => record?.attendanceType === attendanceType
    ) || null;
  }, [todayRecords, attendanceType]);

  // ==========================================================
  // FETCH TODAY'S ATTENDANCE
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const fetchTodayAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyAttendance({
          fromDate: today,
          toDate: today,
          page: 1,
          limit: 100,
        });

        const records = getResponseRecords(response).filter(
          (record) => getRecordDate(record) === today
        );

        if (mounted) {
          setTodayRecords(records);
        }
      } catch (err) {
        console.error(
          "Failed to fetch today's attendance:",
          err
        );

        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Failed to load today's attendance."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTodayAttendance();

    return () => {
      mounted = false;
    };
  }, [today]);

  // ==========================================================
  // CC ALWAYS USES DAILY ATTENDANCE
  // ==========================================================

  useEffect(() => {
    if (isCC) {
      setAttendanceType(DEFAULT_ATTENDANCE_TYPE);
      setVisitedLocation("");
      setRemarks("");
    }
  }, [isCC]);

  // ==========================================================
  // ATTENDANCE TYPE CHANGE
  // ==========================================================

  const handleAttendanceTypeChange = (value) => {
    setAttendanceType(value);
    setVisitedLocation("");
    setRemarks("");
    setError("");
  };

  // ==========================================================
  // PHOTO CAPTURE
  // ==========================================================

  const handlePhotoCapture = async (photoFile) => {
    try {
      setCameraOpen(false);
      setMarking(true);
      setError("");

      if (requiresSpecialDetails && !visitedLocation.trim()) {
        setError("Visited location is required for this attendance type.");
        setMarking(false);
        return;
      }

      if (requiresSpecialDetails && !remarks.trim()) {
        setError("Remarks are required for this attendance type.");
        setMarking(false);
        return;
      }

      const response = await createUserAttendance({
        attendanceType: isCC
          ? DEFAULT_ATTENDANCE_TYPE
          : attendanceType,
        status: "Present",
        date: today,
        photo: photoFile,
        visitedLocation: requiresSpecialDetails
          ? visitedLocation.trim()
          : "",
        remarks: requiresSpecialDetails
          ? remarks.trim()
          : "",
      });

      const createdRecord = response?.data;

      if (createdRecord) {
        setTodayRecords((previous) => [
          ...previous.filter(
            (item) => item._id !== createdRecord._id
          ),
          createdRecord,
        ]);
      } else {
        const refreshed = await getMyAttendance({
          fromDate: today,
          toDate: today,
          page: 1,
          limit: 100,
        });

        setTodayRecords(getResponseRecords(refreshed));
      }

      setVisitedLocation("");
      setRemarks("");
    } catch (err) {
      console.error("Failed to mark attendance:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to mark attendance."
      );
    } finally {
      setMarking(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAttendance?._id) return;

    try {
      setCheckingOut(true);
      setError("");

      const response = await checkoutUserAttendance(
        selectedAttendance._id
      );

      const updatedRecord = response?.data;

      if (updatedRecord) {
        setTodayRecords((previous) =>
          previous.map((item) =>
            item._id === updatedRecord._id
              ? updatedRecord
              : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to check out attendance:", err);

      setError(
        err.response?.data?.message ||
          "Failed to check out attendance."
      );
    } finally {
      setCheckingOut(false);
    }
  };

  const formattedDate = new Date(
    `${today}T00:00:00`
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">
            Checking today's attendance...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Good Morning
            {user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Mark your attendance and access your employee dashboard.
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {formattedDate}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ====================================================
            ATTENDANCE ALREADY MARKED FOR SELECTED TYPE
        ==================================================== */}

        {selectedAttendance ? (
          <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
            <div className="bg-green-50 px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                ✓
              </div>

              <h2 className="text-xl font-bold text-green-800">
                Attendance Marked
              </h2>

              <p className="mt-1 text-sm text-green-700">
                {attendanceType} has already been recorded for today.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm text-gray-500">Date</span>
                <span className="font-medium text-gray-900">
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm text-gray-500">
                  Attendance Type
                </span>
                <span className="font-medium text-gray-900">
                  {selectedAttendance.attendanceType}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm text-gray-500">Status</span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {selectedAttendance.status}
                </span>
              </div>

              <div className="grid gap-3 border-b pb-3 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-gray-500">
                    Check In
                  </span>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedAttendance.checkIn
                      ? new Date(
                          selectedAttendance.checkIn
                        ).toLocaleTimeString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-500">
                    Check Out
                  </span>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedAttendance.checkOut
                      ? new Date(
                          selectedAttendance.checkOut
                        ).toLocaleTimeString()
                      : "Not checked out"}
                  </p>
                </div>
              </div>

              {selectedAttendance.visitedLocation && (
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-sm text-gray-500">
                    Visited Location
                  </span>
                  <span className="max-w-[60%] text-right font-medium text-gray-900">
                    {selectedAttendance.visitedLocation}
                  </span>
                </div>
              )}

              {selectedAttendance.remarks && (
                <div className="border-b pb-3">
                  <span className="text-sm text-gray-500">Remarks</span>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedAttendance.remarks}
                  </p>
                </div>
              )}

              {selectedAttendance.photo?.url && (
                <div className="pt-3">
                  <img
                    src={selectedAttendance.photo.url}
                    alt="Attendance"
                    className="mx-auto h-40 w-40 rounded-xl object-cover"
                  />
                </div>
              )}

              {!isCC && (
                <div className="pt-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Select another attendance type
                  </label>
                  <select
                    value={attendanceType}
                    onChange={(event) =>
                      handleAttendanceTypeChange(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
                  >
                    {ATTENDANCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3 pt-4">
                {selectedAttendance.attendanceSource !== "Leave" &&
                  selectedAttendance.status !== "Absent" &&
                  !selectedAttendance.checkOut &&
                  selectedAttendance.checkIn && (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className="w-full rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {checkingOut
                        ? "Checking Out..."
                        : "Check Out"}
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Go to Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/attendance/my")}
                  className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Attendance Dashboard & Reports
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/leave/dashboard")}
                  className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  Leave Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/leave/apply")}
                  className="w-full rounded-xl border border-indigo-200 bg-white px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  Apply Leave
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            {/* ATTENDANCE TYPE */}
            {!isCC ? (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Attendance Type
                </label>

                <select
                  value={attendanceType}
                  onChange={(event) =>
                    handleAttendanceTypeChange(event.target.value)
                  }
                  disabled={marking}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {ATTENDANCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-6 rounded-xl bg-indigo-50 px-4 py-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
                  Attendance Type
                </p>
                <p className="mt-1 font-semibold text-indigo-800">
                  Daily Attendance
                </p>
              </div>
            )}

            {/* SPECIAL ATTENDANCE DETAILS */}
            {requiresSpecialDetails && (
              <div className="mb-7 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Visited Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={visitedLocation}
                    onChange={(event) =>
                      setVisitedLocation(event.target.value)
                    }
                    disabled={marking}
                    placeholder="Enter visited location"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    disabled={marking}
                    placeholder="Enter remarks"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                disabled={marking}
                onClick={() => {
                  if (requiresSpecialDetails && !visitedLocation.trim()) {
                    setError(
                      "Visited location is required for this attendance type."
                    );
                    return;
                  }

                  if (requiresSpecialDetails && !remarks.trim()) {
                    setError(
                      "Remarks are required for this attendance type."
                    );
                    return;
                  }

                  setError("");
                  setCameraOpen(true);
                }}
                className="mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:scale-105 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="mb-2 text-4xl">📷</span>
                <span className="text-sm font-bold">
                  {marking ? "Marking..." : "Mark Your Attendance"}
                </span>
              </button>

              <p className="mt-5 text-xs text-gray-500">
                Camera access is required.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Your attendance photo will be securely uploaded.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Go to Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/leave/apply")}
                  className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  Apply Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {cameraOpen && (
        <AttendanceCamera
          onCapture={handlePhotoCapture}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}

export default AttendanceEntry;
