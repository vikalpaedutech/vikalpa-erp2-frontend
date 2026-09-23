import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ATTENDANCE_TYPES,
} from "../../user-attendance/constants/attendance.constants";

import {
  getActiveDesignations,
  getUserDesignations,
  getAccessBasedAttendance,
  markUserAttendance,
  updateUserAttendance,
} from "../services/adminAttendance.service";

// ============================================================
// HELPERS
// ============================================================

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ============================================================

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value._id ||
        value.id ||
        ""
    );
  }

  return String(value);
};

// ============================================================

const getStatusClass = (status) => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-700";

    case "WFH":
      return "bg-blue-100 text-blue-700";

    case "Leave":
      return "bg-yellow-100 text-yellow-700";

    case "Absent":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

// ============================================================

const getDesignationName = (designation) => {
  if (!designation) {
    return "-";
  }

  return (
    designation.designation ||
    designation.designationName ||
    designation.name ||
    "-"
  );
};

// ============================================================

const getUserDistrict = (user) => {
  const district =
    user?.regionAccess?.district;

  if (!district) {
    return null;
  }

  return {
    id: getId(district),

    name:
      district?.districtName ||
      district?.name ||
      "-",
  };
};

// ============================================================
// PAGE
// ============================================================

function AccessBasedAttendance() {

  // ==========================================================
  // MASTER DATA
  // ==========================================================

  const [
    designations,
    setDesignations,
  ] = useState([]);

  const [
    userDesignations,
    setUserDesignations,
  ] = useState([]);

  // ==========================================================
  // ACCESS BASED DATA
  // ==========================================================

  const [
    accessibleUsers,
    setAccessibleUsers,
  ] = useState([]);

  const [
    attendance,
    setAttendance,
  ] = useState([]);

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [
    fromDate,
    setFromDate,
  ] = useState(getToday());

  const [
    toDate,
    setToDate,
  ] = useState(getToday());

  const [
    selectedRole,
    setSelectedRole,
  ] = useState("");

  const [
    selectedDistrict,
    setSelectedDistrict,
  ] = useState("");

  const [
    attendanceType,
    setAttendanceType,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    attendanceSource,
    setAttendanceSource,
  ] = useState("");

  // ==========================================================
  // STATES
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingAttendance,
    setLoadingAttendance,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ==========================================================
  // MODAL
  // ==========================================================

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    selectedModalUser,
    setSelectedModalUser,
  ] = useState(null);

  // ==========================================================
  // FORM
  // ==========================================================

  const [
    form,
    setForm,
  ] = useState({
    userId: "",

    attendanceType:
      "Daily Attendance",

    status:
      "Present",

    date:
      getToday(),

    visitedLocation:
      "",

    manualAttendanceReason:
      "",

    remarks:
      "",
  });

  // ==========================================================
  // LOAD MASTER DATA
  // ==========================================================

  useEffect(() => {

    const loadMasterData =
      async () => {

        try {

          setLoading(true);

          setError("");

          const [
            designationsResponse,
            userDesignationsResponse,
          ] = await Promise.all([
            getActiveDesignations(),
            getUserDesignations(),
          ]);

          setDesignations(
            designationsResponse?.data
              ?.designations ||
              designationsResponse
                ?.designations ||
              []
          );

          setUserDesignations(
            userDesignationsResponse
              ?.data
              ?.userDesignations ||
              userDesignationsResponse
                ?.userDesignations ||
              []
          );

        } catch (err) {

          console.error(
            "Access based attendance master data error:",
            err
          );

          setError(
            err.response?.data?.message ||
            "Failed to load attendance master data."
          );

        } finally {

          setLoading(false);

        }

      };

    loadMasterData();

  }, []);

  // ==========================================================
  // FETCH ACCESS BASED ATTENDANCE
  // ==========================================================

  const fetchAttendance =
    async (
      customFilters = null
    ) => {

      try {

        setLoadingAttendance(true);

        setError("");

        const filters =
          customFilters || {
            fromDate:
              fromDate ||
              undefined,

            toDate:
              toDate ||
              undefined,

            attendanceType:
              attendanceType ||
              undefined,

            status:
              status ||
              undefined,

            attendanceSource:
              attendanceSource ||
              undefined,
          };

        const response =
          await getAccessBasedAttendance(
            filters
          );

        const responseData =
          response?.data ||
          {};

        setAccessibleUsers(
          Array.isArray(
            responseData.users
          )
            ? responseData.users
            : []
        );

        setAttendance(
          Array.isArray(
            responseData.attendance
          )
            ? responseData.attendance
            : []
        );

      } catch (err) {

        console.error(
          "Access based attendance fetch error:",
          err
        );

        setAccessibleUsers([]);

        setAttendance([]);

        setError(
          err.response?.data?.message ||
          "Failed to load attendance."
        );

      } finally {

        setLoadingAttendance(false);

      }

    };

  // ==========================================================
  // INITIAL FETCH
  // ==========================================================

  useEffect(() => {

    fetchAttendance();

  }, []);

  // ==========================================================
  // USER META
  // ==========================================================

  const userMeta =
    useMemo(() => {

      const map =
        new Map();

      accessibleUsers.forEach(
        (user) => {

          const userId =
            String(
              user.userId ||
              user._id
            );

          const designationMappings =
            userDesignations.filter(
              (item) =>
                getId(
                  item.userId
                ) === userId &&
                item.isActive !== false
            );

          const designationList =
            designationMappings
              .map(
                (item) =>
                  item.designationId
              )
              .filter(Boolean);

          map.set(
            userId,
            {
              designations:
                designationList,
            }
          );

        }
      );

      return map;

    }, [
      accessibleUsers,
      userDesignations,
    ]);

  // ==========================================================
  // ACCESSIBLE ROLES
  // ==========================================================

  const roles =
    useMemo(() => {

      const map =
        new Map();

      accessibleUsers.forEach(
        (user) => {

          const role =
            user?.role;

          if (!role) {
            return;
          }

          const roleId =
            getId(role);

          if (
            roleId &&
            !map.has(roleId)
          ) {

            map.set(
              roleId,
              role
            );

          }

        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          (
            a?.roleName ||
            ""
          ).localeCompare(
            b?.roleName ||
            ""
          )
      );

    }, [
      accessibleUsers,
    ]);

  // ==========================================================
  // ACCESSIBLE DISTRICTS
  // ==========================================================

  const districts =
    useMemo(() => {

      const map =
        new Map();

      accessibleUsers.forEach(
        (user) => {

          const district =
            getUserDistrict(
              user
            );

          if (
            district?.id &&
            !map.has(
              district.id
            )
          ) {

            map.set(
              district.id,
              district
            );

          }

        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

    }, [
      accessibleUsers,
    ]);

  // ==========================================================
  // FILTER ACCESSIBLE USERS
  // ==========================================================

  const filteredUsers =
    useMemo(() => {

      return accessibleUsers.filter(
        (user) => {

          // --------------------------------------------------
          // ROLE FILTER
          // --------------------------------------------------

          if (selectedRole) {

            const userRoleId =
              String(
                user?.role?._id ||
                user?.role?.id ||
                ""
              );

            if (
              userRoleId !==
              String(selectedRole)
            ) {

              return false;

            }

          }

          // --------------------------------------------------
          // DISTRICT FILTER
          // --------------------------------------------------

          if (selectedDistrict) {

            const district =
              getUserDistrict(
                user
              );

            if (
              String(
                district?.id ||
                ""
              ) !==
              String(
                selectedDistrict
              )
            ) {

              return false;

            }

          }

          return true;

        }
      );

    }, [
      accessibleUsers,
      selectedRole,
      selectedDistrict,
    ]);

  // ==========================================================
  // FILTERED USER IDS
  // ==========================================================

  const filteredUserIds =
    useMemo(() => {

      return new Set(
        filteredUsers.map(
          (user) =>
            String(
              user.userId ||
              user._id
            )
        )
      );

    }, [
      filteredUsers,
    ]);

  // ==========================================================
  // FILTERED ATTENDANCE
  //
  // IMPORTANT:
  // We DO NOT create a map by userId here.
  //
  // Therefore:
  //
  // testcc - 20 Sep
  // testcc - 21 Sep
  //
  // both records remain available.
  // ==========================================================

  const filteredAttendance =
    useMemo(() => {

      return attendance.filter(
        (record) => {

          const recordUserId =
            getId(
              record.userId
            );

          return filteredUserIds.has(
            recordUserId
          );

        }
      );

    }, [
      attendance,
      filteredUserIds,
    ]);

  // ==========================================================
  // GENERATE EVERY DATE IN RANGE
  //
  // Example:
  //
  // From = 14 Sep
  // To   = 21 Sep
  //
  // Result:
  //
  // 21
  // 20
  // 19
  // 18
  // 17
  // 16
  // 15
  // 14
  //
  // Latest date first.
  // ==========================================================

  const dateRange =
    useMemo(() => {

      if (
        !fromDate ||
        !toDate ||
        fromDate >
          toDate
      ) {

        return [];

      }

      const dates = [];

      const current =
        new Date(
          `${fromDate}T00:00:00.000Z`
        );

      const end =
        new Date(
          `${toDate}T00:00:00.000Z`
        );

      while (
        current <= end
      ) {

        dates.push(
          current
            .toISOString()
            .slice(
              0,
              10
            )
        );

        current.setUTCDate(
          current.getUTCDate() +
            1
        );

      }

      // Latest date first
      return dates.reverse();

    }, [
      fromDate,
      toDate,
    ]);

  // ==========================================================
  // DISPLAY ROWS
  //
  // THIS IS THE IMPORTANT FIX.
  //
  // For every employee:
  //     for every date:
  //         find attendance
  //
  // Attendance exists:
  //     actual record
  //
  // Attendance doesn't exist:
  //     Not Marked
  //
  // This gives:
  //
  // 14 Sep -> Not Marked
  // 15 Sep -> Not Marked
  // 16 Sep -> Not Marked
  // 17 Sep -> Not Marked
  // 18 Sep -> Not Marked
  // 19 Sep -> Not Marked
  // 20 Sep -> Present
  // 21 Sep -> Present
  // ==========================================================

  const displayRows =
    useMemo(() => {

      const rows = [];

      if (
        dateRange.length === 0
      ) {

        return rows;

      }

      filteredUsers.forEach(
        (user) => {

          const userId =
            String(
              user.userId ||
              user._id
            );

          dateRange.forEach(
            (date) => {

              // ==============================================
              // FIND ALL ATTENDANCE RECORDS FOR THIS USER + DATE
              // ==============================================

              const records =
                filteredAttendance.filter(
                  (record) => {

                    const recordUserId =
                      getId(
                        record.userId
                      );

                    if (
                      recordUserId !==
                      userId
                    ) {

                      return false;

                    }

                    if (
                      !record.date
                    ) {

                      return false;

                    }

                    const recordDate =
                      String(
                        record.date
                      ).slice(
                        0,
                        10
                      );

                    return (
                      recordDate ===
                      date
                    );

                  }
                );

              // ==============================================
              // ATTENDANCE FOUND
              // ==============================================

              if (
                records.length > 0
              ) {

                records.forEach(
                  (record) => {

                    rows.push({
                      type:
                        "attendance",

                      user,

                      record,

                      date,
                    });

                  }
                );

                return;

              }

              // ==============================================
              // NOT MARKED
              //
              // Only show missing dates when no attendance
              // filter is selected.
              //
              // Example:
              //
              // Status = Present
              //
              // We should NOT show Not Marked rows because
              // user specifically filtered Present.
              // ==============================================

              if (
                !attendanceType &&
                !status &&
                !attendanceSource
              ) {

                rows.push({
                  type:
                    "not-marked",

                  user,

                  record:
                    null,

                  date,
                });

              }

            }
          );

        }
      );

      return rows;

    }, [
      filteredUsers,
      filteredAttendance,
      dateRange,
      attendanceType,
      status,
      attendanceSource,
    ]);

  // ==========================================================
  // ATTENDANCE USER-DATE SET
  // ==========================================================

  const markedEmployeeDays =
    useMemo(() => {

      const set =
        new Set();

      filteredAttendance.forEach(
        (record) => {

          const userId =
            getId(
              record.userId
            );

          if (
            !userId ||
            !record.date
          ) {

            return;

          }

          const date =
            String(
              record.date
            ).slice(
              0,
              10
            );

          set.add(
            `${userId}_${date}`
          );

        }
      );

      return set;

    }, [
      filteredAttendance,
    ]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    useMemo(() => {

      const totalEmployees =
        filteredUsers.length;

      const totalEmployeeDays =
        totalEmployees *
        dateRange.length;

      const marked =
        markedEmployeeDays.size;

      // ------------------------------------------------------
      // Not marked only makes sense when there is no
      // attendance-specific filter.
      // ------------------------------------------------------

      const attendanceFilterApplied =
        Boolean(
          attendanceType ||
          status ||
          attendanceSource
        );

      const notMarked =
        attendanceFilterApplied
          ? 0
          : Math.max(
              totalEmployeeDays -
                marked,
              0
            );

      const present =
        filteredAttendance.filter(
          (record) =>
            record.status ===
            "Present"
        ).length;

      const wfh =
        filteredAttendance.filter(
          (record) =>
            record.status ===
            "WFH"
        ).length;

      const absent =
        filteredAttendance.filter(
          (record) =>
            record.status ===
            "Absent"
        ).length;

      return {
        total:
          totalEmployees,

        marked,

        notMarked,

        present,

        wfh,

        absent,
      };

    }, [
      filteredUsers,
      dateRange,
      markedEmployeeDays,
      filteredAttendance,
      attendanceType,
      status,
      attendanceSource,
    ]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch =
    async () => {

      if (
        fromDate &&
        toDate &&
        fromDate >
          toDate
      ) {

        setError(
          "From Date cannot be greater than To Date."
        );

        return;

      }

      await fetchAttendance({
        fromDate:
          fromDate ||
          undefined,

        toDate:
          toDate ||
          undefined,

        attendanceType:
          attendanceType ||
          undefined,

        status:
          status ||
          undefined,

        attendanceSource:
          attendanceSource ||
          undefined,
      });

    };

  // ==========================================================
  // RESET
  // ==========================================================

  const handleReset =
    async () => {

      const today =
        getToday();

      setFromDate(
        today
      );

      setToDate(
        today
      );

      setSelectedRole(
        ""
      );

      setSelectedDistrict(
        ""
      );

      setAttendanceType(
        ""
      );

      setStatus(
        ""
      );

      setAttendanceSource(
        ""
      );

      await fetchAttendance({
        fromDate:
          today,

        toDate:
          today,

        attendanceType:
          undefined,

        status:
          undefined,

        attendanceSource:
          undefined,
      });

    };

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleFormChange =
    (event) => {

      const {
        name,
        value,
      } =
        event.target;

      setForm(
        (previous) => ({
          ...previous,

          [name]:
            value,
        })
      );

      if (
        name ===
        "attendanceType"
      ) {

        if (
          ![
            "Orientation",
            "Feild Visit",
            "Event",
            "Center Visit",
          ].includes(value)
        ) {

          setForm(
            (previous) => ({
              ...previous,

              attendanceType:
                value,

              visitedLocation:
                "",
            })
          );

        }

      }

    };

  // ==========================================================
  // LOCATION REQUIRED
  // ==========================================================

  const requiresLocation =
    [
      "Orientation",
      "Feild Visit",
      "Event",
      "Center Visit",
    ].includes(
      form.attendanceType
    );

  // ==========================================================
  // OPEN MARK MODAL
  // ==========================================================

  const openMarkModal =
    (user) => {

      if (
        fromDate &&
        toDate &&
        fromDate !==
          toDate
      ) {

        setError(
          "For marking attendance, From Date and To Date must be the same."
        );

        return;

      }

      const markDate =
        fromDate ||
        toDate ||
        getToday();

      setError("");

      setSuccess("");

      setEditingId(
        null
      );

      setSelectedModalUser(
        user
      );

      setForm({
        userId:
          user.userId ||
          user._id,

        attendanceType:
          "Daily Attendance",

        status:
          "Present",

        date:
          markDate,

        visitedLocation:
          "",

        manualAttendanceReason:
          "",

        remarks:
          "",
      });

      setIsModalOpen(
        true
      );

    };

  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  const openEditModal =
    (record) => {

      if (
        record.attendanceSource ===
        "Leave"
      ) {

        setError(
          "Leave attendance cannot be manually edited."
        );

        return;

      }

      setError("");

      setSuccess("");

      setEditingId(
        record._id
      );

      const userId =
        getId(
          record.userId
        );

      const user =
        accessibleUsers.find(
          (item) =>
            String(
              item.userId ||
              item._id
            ) ===
            userId
        );

      setSelectedModalUser(
        user || null
      );

      setForm({
        userId,

        attendanceType:
          record.attendanceType ||
          "Daily Attendance",

        status:
          record.status ||
          "Present",

        date:
          record.date
            ? String(
                record.date
              ).slice(
                0,
                10
              )
            : fromDate ||
              getToday(),

        visitedLocation:
          record.visitedLocation ||
          "",

        manualAttendanceReason:
          record.manualAttendanceReason ||
          "",

        remarks:
          record.remarks ||
          "",
      });

      setIsModalOpen(
        true
      );

    };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal =
    () => {

      if (
        submitting
      ) {

        return;

      }

      setIsModalOpen(
        false
      );

      setEditingId(
        null
      );

      setSelectedModalUser(
        null
      );

      setForm({
        userId: "",

        attendanceType:
          "Daily Attendance",

        status:
          "Present",

        date:
          fromDate ||
          getToday(),

        visitedLocation:
          "",

        manualAttendanceReason:
          "",

        remarks:
          "",
      });

    };

  // ==========================================================
  // SUBMIT ATTENDANCE
  // ==========================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setError("");

      setSuccess("");

      if (
        !form.userId
      ) {

        setError(
          "Employee is required."
        );

        return;

      }

      if (
        requiresLocation &&
        !form.visitedLocation.trim()
      ) {

        setError(
          "Visited location is required for this attendance type."
        );

        return;

      }

      if (
        !form.manualAttendanceReason.trim()
      ) {

        setError(
          "Manual attendance reason is required."
        );

        return;

      }

      if (
        !form.remarks.trim()
      ) {

        setError(
          "Remarks are required."
        );

        return;

      }

      try {

        setSubmitting(
          true
        );

        // ====================================================
        // UPDATE
        // ====================================================

        if (
          editingId
        ) {

          await updateUserAttendance(
            editingId,
            {
              attendanceType:
                form.attendanceType,

              status:
                form.status,

              date:
                form.date,

              visitedLocation:
                requiresLocation
                  ? form.visitedLocation.trim()
                  : null,

              manualAttendanceReason:
                form.manualAttendanceReason.trim(),

              remarks:
                form.remarks.trim(),
            }
          );

          setSuccess(
            "Attendance updated successfully."
          );

        }

        // ====================================================
        // CREATE
        // ====================================================

        else {

          await markUserAttendance({
            userId:
              form.userId,

            attendanceType:
              form.attendanceType,

            status:
              form.status,

            date:
              form.date,

            visitedLocation:
              requiresLocation
                ? form.visitedLocation.trim()
                : null,

            manualAttendanceReason:
              form.manualAttendanceReason.trim(),

            remarks:
              form.remarks.trim(),
          });

          setSuccess(
            "Attendance marked successfully."
          );

        }

        setIsModalOpen(
          false
        );

        setEditingId(
          null
        );

        setSelectedModalUser(
          null
        );

        setForm({
          userId: "",

          attendanceType:
            "Daily Attendance",

          status:
            "Present",

          date:
            fromDate ||
            getToday(),

          visitedLocation:
            "",

          manualAttendanceReason:
            "",

          remarks:
            "",
        });

        await fetchAttendance();

      } catch (err) {

        console.error(
          "Attendance save error:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Failed to save attendance."
        );

      } finally {

        setSubmitting(
          false
        );

      }

    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading
  ) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />

          <p className="text-sm text-gray-500">
            Loading access based attendance...
          </p>

        </div>

      </div>
    );

  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-900">
            Access Based Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Employee-wise attendance available within your assigned role and region access.
          </p>

        </div>

        {/* ====================================================
            ALERTS
        ==================================================== */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5">

            <h2 className="font-semibold text-gray-900">
              Attendance Filters
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Filter only employees available within your access.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* FROM DATE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                From Date
              </label>

              <input
                type="date"
                value={
                  fromDate
                }
                onChange={
                  (event) =>
                    setFromDate(
                      event.target.value
                    )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            {/* TO DATE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                To Date
              </label>

              <input
                type="date"
                value={
                  toDate
                }
                onChange={
                  (event) =>
                    setToDate(
                      event.target.value
                    )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            {/* ROLE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Role
              </label>

              <select
                value={
                  selectedRole
                }
                onChange={
                  (event) =>
                    setSelectedRole(
                      event.target.value
                    )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >

                <option value="">
                  All Roles
                </option>

                {roles.map(
                  (role) => (
                    <option
                      key={
                        getId(
                          role
                        )
                      }
                      value={
                        getId(
                          role
                        )
                      }
                    >
                      {
                        role.roleName
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* DISTRICT */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                District
              </label>

              <select
                value={
                  selectedDistrict
                }
                onChange={
                  (event) =>
                    setSelectedDistrict(
                      event.target.value
                    )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >

                <option value="">
                  All Districts
                </option>

                {districts.map(
                  (district) => (
                    <option
                      key={
                        district.id
                      }
                      value={
                        district.id
                      }
                    >
                      {
                        district.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* ATTENDANCE TYPE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Attendance Type
              </label>

              <select
                value={
                  attendanceType
                }
                onChange={
                  (event) =>
                    setAttendanceType(
                      event.target.value
                    )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >

                <option value="">
                  All Types
                </option>

                {(
                  Array.isArray(
                    ATTENDANCE_TYPES
                  )
                    ? ATTENDANCE_TYPES
                    : [
                        "Daily Attendance",
                        "Orientation",
                        "Feild Visit",
                        "Event",
                        "Center Visit",
                        "Half Day",
                      ]
                ).map(
                  (type) => (
                    <option
                      key={
                        type
                      }
                      value={
                        type
                      }
                    >
                      {
                        type
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* STATUS */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Status
              </label>

              <select
                value={
                  status
                }
                onChange={
                  (event) =>
                    setStatus(
                      event.target.value
                    )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

            {/* SOURCE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Source
              </label>

              <select
                value={
                  attendanceSource
                }
                onChange={
                  (event) =>
                    setAttendanceSource(
                      event.target.value
                    )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >

                <option value="">
                  All Sources
                </option>

                <option value="Manual">
                  Manual
                </option>

                <option value="Leave">
                  Leave
                </option>

                <option value="System">
                  System
                </option>

              </select>

            </div>

          </div>

          {/* BUTTONS */}

          <div className="mt-5 flex gap-3">

            <button
              type="button"
              onClick={
                handleSearch
              }
              disabled={
                loadingAttendance
              }
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {
                loadingAttendance
                  ? "Searching..."
                  : "Search"
              }
            </button>

            <button
              type="button"
              onClick={
                handleReset
              }
              disabled={
                loadingAttendance
              }
              className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>

          </div>

        </div>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs text-gray-500">
              Employees
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {
                summary.total
              }
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs text-gray-500">
              Marked
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {
                summary.marked
              }
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs text-gray-500">
              Not Marked
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {
                summary.notMarked
              }
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs text-gray-500">
              Present
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {
                summary.present
              }
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs text-gray-500">
              WFH
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {
                summary.wfh
              }
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs text-gray-500">
              Absent
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {
                summary.absent
              }
            </p>

          </div>

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b px-5 py-4">

            <h2 className="font-semibold text-gray-900">
              Employee Attendance
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Only employees available through your role and region access are displayed.
            </p>

          </div>

          {loadingAttendance ? (

            <div className="p-10 text-center text-gray-500">
              Loading attendance...
            </div>

          ) : displayRows.length === 0 ? (

            <div className="p-10 text-center text-gray-500">
              No employees or attendance records match the selected filters.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-[1200px] w-full text-sm">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      Employee
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      Role
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      Designation
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      District
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      Date
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      Attendance
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      Type
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      Source
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      Location
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-gray-600">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {displayRows.map(
                    (
                      row,
                      index
                    ) => {

                      const user =
                        row.user;

                      const record =
                        row.record;

                      const userId =
                        String(
                          user.userId ||
                          user._id
                        );

                      const meta =
                        userMeta.get(
                          userId
                        );

                      const district =
                        getUserDistrict(
                          user
                        );

                      const designationNames =
                        meta?.designations
                          ?.map(
                            (
                              designation
                            ) =>
                              getDesignationName(
                                designation
                              )
                          )
                          .filter(Boolean)
                          .join(
                            ", "
                          ) ||
                        "-";

                      return (
                        <tr
                          key={
                            record?._id ||
                            `${userId}-${row.date}-${index}`
                          }
                          className="hover:bg-gray-50"
                        >

                          {/* EMPLOYEE */}

                          <td className="px-5 py-4">

                            <div className="font-semibold text-gray-900">
                              {
                                user.name
                              }
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              {
                                user.email
                              }
                            </div>

                          </td>

                          {/* ROLE */}

                          <td className="px-5 py-4">

                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                              {
                                user?.role
                                  ?.roleName ||
                                "-"
                              }
                            </span>

                          </td>

                          {/* DESIGNATION */}

                          <td className="px-5 py-4">
                            {
                              designationNames
                            }
                          </td>

                          {/* DISTRICT */}

                          <td className="px-5 py-4">
                            {
                              district?.name ||
                              "-"
                            }
                          </td>

                          {/* DATE */}

                          <td className="px-5 py-4">

                            {
                              record?.date
                                ? formatDate(
                                    record.date
                                  )
                                : formatDate(
                                    row.date
                                  )
                            }

                          </td>

                          {/* ATTENDANCE */}

                          <td className="px-5 py-4">

                            {record ? (

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  record.status
                                )}`}
                              >
                                {
                                  record.status
                                }
                              </span>

                            ) : (

                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                Not Marked
                              </span>

                            )}

                          </td>

                          {/* TYPE */}

                          <td className="px-5 py-4">

                            {
                              record
                                ?.attendanceType ||
                              "-"
                            }

                          </td>

                          {/* SOURCE */}

                          <td className="px-5 py-4">

                            {
                              record
                                ?.attendanceSource ||
                              "-"
                            }

                          </td>

                          {/* LOCATION */}

                          <td className="px-5 py-4">

                            {
                              record
                                ?.visitedLocation ||
                              "-"
                            }

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">

                            {record ? (

                              record.attendanceSource !==
                              "Leave" ? (

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      record
                                    )
                                  }
                                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                                >
                                  Edit
                                </button>

                              ) : (

                                <span className="text-xs text-gray-400">
                                  System
                                </span>

                              )

                            ) : (

                              <button
                                type="button"
                                onClick={() =>
                                  openMarkModal(
                                    user
                                  )
                                }
                                className="font-semibold text-indigo-600 hover:text-indigo-800"
                              >
                                Mark
                              </button>

                            )}

                          </td>

                        </tr>
                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">

                  {
                    editingId
                      ? "Edit Attendance"
                      : "Mark Attendance"
                  }

                </h2>

                <p className="mt-1 text-sm text-gray-500">

                  {
                    selectedModalUser?.name ||
                    "-"
                  }

                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  submitting
                }
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-6"
            >

              {/* EMPLOYEE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Employee
                </label>

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">

                  <div className="font-semibold text-gray-900">
                    {
                      selectedModalUser?.name ||
                      "-"
                    }
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    {
                      selectedModalUser?.email ||
                      ""
                    }
                  </div>

                </div>

              </div>

              {/* FORM GRID */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* ATTENDANCE TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Attendance Type *
                  </label>

                  <select
                    name="attendanceType"
                    value={
                      form.attendanceType
                    }
                    onChange={
                      handleFormChange
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >

                    {(
                      Array.isArray(
                        ATTENDANCE_TYPES
                      )
                        ? ATTENDANCE_TYPES
                        : [
                            "Daily Attendance",
                            "Orientation",
                            "Feild Visit",
                            "Event",
                            "Center Visit",
                            "Half Day",
                          ]
                    ).map(
                      (type) => (
                        <option
                          key={
                            type
                          }
                          value={
                            type
                          }
                        >
                          {
                            type
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* STATUS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Status *
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleFormChange
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >

                    <option value="Present">
                      Present
                    </option>

                    <option value="WFH">
                      WFH
                    </option>

                    <option value="Absent">
                      Absent
                    </option>

                  </select>

                </div>

                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Date *
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={
                      form.date
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      Boolean(
                        editingId
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  />

                </div>

                {/* LOCATION */}

                {requiresLocation && (

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Visited Location *
                    </label>

                    <input
                      name="visitedLocation"
                      value={
                        form.visitedLocation
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter visited location"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                )}

              </div>

              {/* REASON */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Manual Attendance Reason *
                </label>

                <input
                  name="manualAttendanceReason"
                  value={
                    form.manualAttendanceReason
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Why is attendance being marked manually?"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>

              {/* REMARKS */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Remarks *
                </label>

                <textarea
                  name="remarks"
                  value={
                    form.remarks
                  }
                  onChange={
                    handleFormChange
                  }
                  rows={4}
                  placeholder="Enter attendance remarks..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {
                    submitting
                      ? "Saving..."
                      : editingId
                      ? "Update Attendance"
                      : "Mark Attendance"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AccessBasedAttendance;