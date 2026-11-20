import SearchableSelect from "../../../components/common/SearchableSelect";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ATTENDANCE_TYPES,
} from "../../user-attendance/constants/attendance.constants";

import {
  getActiveUsers,
  getActiveRoles,
  getActiveDepartments,
  getActiveDesignations,
  getUserRoles,
  getUserDesignations,
  getUserRegionAccess,
  getAttendance,
  markUserAttendance,
  updateUserAttendance,
} from "../services/adminAttendance.service";


// ============================================================
// HELPERS
// ============================================================

const getMonthStart = () => {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), "01"].join("-");
};

// Treat admin-entered attendance clock values as India local time (IST)
// and convert them explicitly to UTC before sending them to MongoDB.
const toAttendanceTimestamp = (date, time) => {
  if (!date || !time) return null;
  const dateMatch = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = String(time).match(/^(\d{1,2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) return null;

  const [, year, month, day] = dateMatch;
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  if (hours > 23 || minutes > 59) return null;

  const utcMilliseconds = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    hours,
    minutes
  ) - (5 * 60 + 30) * 60 * 1000;

  return new Date(utcMilliseconds).toISOString();
};


const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
};


const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const getStatusClass = (
  status
) => {
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


const getId = (
  value
) => {

  if (!value) {
    return "";
  }

  if (
    typeof value === "object"
  ) {

    return String(
      value._id ||
      value.id ||
      ""
    );
  }

  return String(value);
};


const getRoleName = (
  role
) => {

  if (!role) {
    return "-";
  }

  return (
    role.roleName ||
    role.name ||
    role.role ||
    "-"
  );
};


const getDepartmentName = (
  department
) => {

  if (!department) {
    return "-";
  }

  return (
    department.departmentName ||
    department.name ||
    "-"
  );
};


const getDesignationName = (
  designation
) => {

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
// NORMALIZE API LIST
// ============================================================

const normalizeList = (
  response,
  keys = []
) => {

  if (
    Array.isArray(response)
  ) {
    return response;
  }


  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }


  if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    return response.data.data;
  }


  for (
    const key of keys
  ) {

    if (
      Array.isArray(
        response?.[key]
      )
    ) {
      return response[key];
    }


    if (
      Array.isArray(
        response?.data?.[key]
      )
    ) {
      return response.data[key];
    }
  }


  return [];
};


// ============================================================
// GET USER DISTRICTS
// ============================================================

const getUserDistricts = (
  user
) => {

  const regionAccess =
    user?.regionAccess ||
    user?.regionAccesses ||
    user?.userRegionAccess ||
    user?.userRegionAccesses ||
    [];


  if (
    !Array.isArray(
      regionAccess
    )
  ) {
    return [];
  }


  const districts = [];


  regionAccess.forEach(
    (access) => {

      const district =
        access?.districtId ||
        access?.district ||
        access?.districtData;


      if (!district) {
        return;
      }


      const districtId =
        typeof district === "object"
          ? (
              district._id ||
              district.districtId
            )
          : district;


      const districtName =
        typeof district === "object"
          ? (
              district.districtName ||
              district.name
            )
          : (
              access?.districtName ||
              ""
            );


      if (!districtId) {
        return;
      }


      districts.push({
        id:
          String(
            districtId
          ),

        name:
          districtName ||
          String(
            districtId
          ),
      });

    }
  );


  return districts;
};


// ============================================================
// PAGE
// ============================================================


const exportCsv = (headers, rows, filename) => {
  const escape = (value) => `"${String(value ?? "-").replaceAll('"', '""')}"`;
  const lines = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", lines], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; document.body.appendChild(link);
  link.click(); link.remove(); URL.revokeObjectURL(url);
};
const formatClock = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatClockInputIST = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value || "00";
  const minute = parts.find((part) => part.type === "minute")?.value || "00";
  return `${hour}:${minute}`;
};

function AttendanceManagement() {

  // ==========================================================
  // MASTER DATA
  // ==========================================================

  const [users, setUsers] =
    useState([]);

  const [roles, setRoles] =
    useState([]);

  const [departments, setDepartments] =
    useState([]);

  const [designations, setDesignations] =
    useState([]);

  const [userRoles, setUserRoles] =
    useState([]);

  const [userDesignations, setUserDesignations] =
    useState([]);

  const [userRegionAccess, setUserRegionAccess] =
    useState([]);

  const [attendance, setAttendance] =
    useState([]);


  // ==========================================================
  // FILTERS
  // ==========================================================

  const [fromDate, setFromDate] = useState(getMonthStart());
  const [toDate, setToDate] = useState(getToday());
  const [selectedDetailUser, setSelectedDetailUser] = useState(null);


  const [selectedRole, setSelectedRole] =
    useState("");


  const [selectedDepartment, setSelectedDepartment] =
    useState("");


  const [selectedDistrict, setSelectedDistrict] =
    useState("");


  const [attendanceType, setAttendanceType] =
    useState("");


  const [status, setStatus] =
    useState("");


  const [attendanceSource, setAttendanceSource] =
    useState("");


  // ==========================================================
  // MODAL
  // ==========================================================

  const [isModalOpen, setIsModalOpen] =
    useState(false);


  const [editingId, setEditingId] =
    useState(null);


  const [selectedModalUser, setSelectedModalUser] =
    useState(null);


  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] =
    useState({

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
  // STATES
  // ==========================================================

  const [loading, setLoading] =
    useState(true);


  const [loadingAttendance, setLoadingAttendance] =
    useState(false);


  const [submitting, setSubmitting] =
    useState(false);


  const [error, setError] =
    useState("");


  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // LOAD MASTER DATA
  // ==========================================================

  useEffect(() => {

    const loadMasterData =
      async () => {

        try {

          setLoading(
            true
          );

          setError("");


          const [
            usersResponse,
            rolesResponse,
            departmentsResponse,
            designationsResponse,
            userRolesResponse,
            userDesignationsResponse,
            userRegionAccessResponse,
          ] = await Promise.all([

            getActiveUsers(),

            getActiveRoles(),

            getActiveDepartments(),

            getActiveDesignations(),

            getUserRoles(),

            getUserDesignations(),

            getUserRegionAccess(),

          ]);


          // --------------------------------------------------
          // USERS
          // --------------------------------------------------

          setUsers(
            normalizeList(
              usersResponse,
              [
                "users",
              ]
            )
          );


          // --------------------------------------------------
          // ROLES
          // --------------------------------------------------

          setRoles(
            normalizeList(
              rolesResponse,
              [
                "roles",
              ]
            )
          );


          // --------------------------------------------------
          // DEPARTMENTS
          // --------------------------------------------------

          setDepartments(
            normalizeList(
              departmentsResponse,
              [
                "departments",
              ]
            )
          );


          // --------------------------------------------------
          // DESIGNATIONS
          // --------------------------------------------------

          setDesignations(
            normalizeList(
              designationsResponse,
              [
                "designations",
              ]
            )
          );


          // --------------------------------------------------
          // USER ROLES
          // --------------------------------------------------

          setUserRoles(
            normalizeList(
              userRolesResponse,
              [
                "userRoles",
              ]
            )
          );


          // --------------------------------------------------
          // USER DESIGNATIONS
          // --------------------------------------------------

          setUserDesignations(
            normalizeList(
              userDesignationsResponse,
              [
                "userDesignations",
              ]
            )
          );


          // --------------------------------------------------
          // USER REGION ACCESS
          // --------------------------------------------------

          setUserRegionAccess(
            normalizeList(
              userRegionAccessResponse,
              [
                "userRegionAccess",
                "regionAccess",
              ]
            )
          );

        } catch (err) {

          console.error(
            "Failed to load attendance master data:",
            err
          );


          setError(
            err?.response?.data?.message ||
            "Failed to load attendance master data."
          );

        } finally {

          setLoading(
            false
          );

        }

      };


    loadMasterData();

  }, []);


  // ==========================================================
  // USER META
  // ==========================================================

  const userMeta =
    useMemo(() => {

      const map =
        new Map();


      users.forEach(
        (user) => {

          const userId =
            String(
              user._id
            );


          // --------------------------------------------------
          // ROLE MAPPINGS
          // --------------------------------------------------

          const roleMappings =
            userRoles.filter(
              (item) => {

                const mappedUserId =
                  item?.userId?._id ||
                  item?.userId;

                return (
                  String(
                    mappedUserId
                  ) ===
                  userId &&
                  item?.isActive !== false
                );
              }
            );


          // --------------------------------------------------
          // DESIGNATION MAPPINGS
          // --------------------------------------------------

          const designationMappings =
            userDesignations.filter(
              (item) => {

                const mappedUserId =
                  item?.userId?._id ||
                  item?.userId;

                return (
                  String(
                    mappedUserId
                  ) ===
                  userId &&
                  item?.isActive !== false
                );
              }
            );


          // --------------------------------------------------
          // ROLES
          // --------------------------------------------------

          const mappedRoleList = roleMappings
            .map((item) => item?.roleId || item?.role || item?.roleData)
            .filter(Boolean);
          const directRoles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);
          const roleList = [...mappedRoleList, ...directRoles]
            .map((role) => typeof role === "object" ? (roles.find((r) => getId(r) === getId(role)) || role) : roles.find((r) => getId(r) === getId(role)))
            .filter(Boolean)
            .filter((role, index, list) => list.findIndex((item) => getId(item) === getId(role)) === index);


          // --------------------------------------------------
          // DESIGNATIONS
          // --------------------------------------------------

          const designationList = designationMappings
            .map((item) => item?.designationId || item?.designation)
            .filter(Boolean)
            .map((designation) => typeof designation === "object"
              ? (designations.find((item) => getId(item) === getId(designation)) || designation)
              : designations.find((item) => getId(item) === getId(designation)))
            .filter(Boolean)
            .filter((item, index, list) => list.findIndex((entry) => getId(entry) === getId(item)) === index);


          // --------------------------------------------------
          // DEPARTMENTS
          // --------------------------------------------------

          const departmentIds =
            designationList
              .map(
                (designation) =>
                  designation?.departmentId?._id ||
                  designation?.departmentId
              )
              .filter(Boolean);


          // --------------------------------------------------
          // DISTRICTS
          // --------------------------------------------------

          let districts =
            getUserDistricts(
              user
            );


          // If user object itself doesn't contain
          // region access, derive it from the
          // separately loaded userRegionAccess list.

          if (
            districts.length === 0
          ) {

            const userAccess =
              userRegionAccess.filter(
                (access) => {

                  const mappedUserId =
                    access?.userId?._id ||
                    access?.userId;

                  return (
                    String(
                      mappedUserId
                    ) ===
                    userId
                  );
                }
              );


            const districtMap =
              new Map();


            userAccess.forEach(
              (access) => {

                const district =
                  access?.districtId;


                if (!district) {
                  return;
                }


                const districtId =
                  typeof district ===
                  "object"
                    ? (
                        district._id ||
                        district.districtId
                      )
                    : district;


                const districtName =
                  typeof district ===
                  "object"
                    ? (
                        district.districtName ||
                        district.name
                      )
                    : (
                        access?.districtName ||
                        ""
                      );


                if (!districtId) {
                  return;
                }


                districtMap.set(
                  String(
                    districtId
                  ),
                  {
                    id:
                      String(
                        districtId
                      ),

                    name:
                      districtName ||
                      String(
                        districtId
                      ),
                  }
                );

              }
            );


            districts =
              Array.from(
                districtMap.values()
              );
          }


          map.set(
            userId,
            {
              roles:
                roleList,

              designations:
                designationList,

              departmentIds: [
                ...new Set([
                  ...departmentIds.map(String),
                  ...designationList.map((designation) => getId(designation?.departmentId || designation?.department)).filter(Boolean),
                ]),
              ],

              districts,
            }
          );

        }
      );


      return map;

    }, [
      users,
      userRoles,
      userDesignations,
      userRegionAccess,
      roles,
      designations,
    ]);


  // ==========================================================
  // DISTRICTS
  // ==========================================================

  const districts =
    useMemo(() => {

      const map =
        new Map();


      users.forEach(
        (user) => {

          const meta =
            userMeta.get(
              String(
                user._id
              )
            );


          meta?.districts?.forEach(
            (district) => {

              if (
                district?.id &&
                !map.has(
                  String(
                    district.id
                  )
                )
              ) {

                map.set(
                  String(
                    district.id
                  ),
                  district
                );
              }

            }
          );

        }
      );


      return Array.from(
        map.values()
      ).sort(
        (
          first,
          second
        ) =>
          first.name.localeCompare(
            second.name
          )
      );

    }, [
      users,
      userMeta,
    ]);


  // ==========================================================
  // FILTERED USERS
  // ==========================================================

  const filteredUsers =
    useMemo(() => {

      return users.filter(
        (user) => {

          const meta =
            userMeta.get(
              String(
                user._id
              )
            );


          // --------------------------------------------------
          // ROLE
          // --------------------------------------------------

          if (
            selectedRole
          ) {

            const hasRole =
              meta?.roles?.some(
                (role) =>
                  getId(
                    role
                  ) ===
                  String(
                    selectedRole
                  )
              );


            if (!hasRole) {
              return false;
            }
          }


          // --------------------------------------------------
          // DEPARTMENT
          // --------------------------------------------------

          if (
            selectedDepartment
          ) {

            const hasDepartment =
              meta?.departmentIds?.some(
                (departmentId) =>
                  String(
                    departmentId
                  ) ===
                  String(
                    selectedDepartment
                  )
              );


            if (!hasDepartment) {
              return false;
            }
          }


          // --------------------------------------------------
          // DISTRICT
          // --------------------------------------------------

          if (
            selectedDistrict
          ) {

            const hasDistrict =
              meta?.districts?.some(
                (district) =>
                  String(
                    district?.id
                  ) ===
                  String(
                    selectedDistrict
                  )
              );


            if (!hasDistrict) {
              return false;
            }
          }


          return true;

        }
      );

    }, [
      users,
      userMeta,
      selectedRole,
      selectedDepartment,
      selectedDistrict,
    ]);


  // ==========================================================
  // LOAD ATTENDANCE
  // ==========================================================

  const fetchAttendance =
    async () => {

      try {

        setLoadingAttendance(
          true
        );


        setError("");


        const response =
          await getAttendance({

            fromDate,
            toDate,

            // Fetch all records in the selected date range so missing
            // attendance documents can be counted as absent accurately.

          });


        console.log(
          "USER ATTENDANCE API RESPONSE:",
          response
        );


        // ====================================================
        // NORMALIZE ATTENDANCE RESPONSE
        // ====================================================

        let attendanceData = [];


        if (
          Array.isArray(
            response
          )
        ) {

          attendanceData =
            response;

        } else if (
          Array.isArray(
            response?.data
          )
        ) {

          attendanceData =
            response.data;

        } else if (
          Array.isArray(
            response?.data?.data
          )
        ) {

          attendanceData =
            response.data.data;

        } else if (
          Array.isArray(
            response?.attendance
          )
        ) {

          attendanceData =
            response.attendance;

        } else if (
          Array.isArray(
            response?.attendances
          )
        ) {

          attendanceData =
            response.attendances;

        }


        console.log(
          "ATTENDANCE DATA:",
          attendanceData
        );


        setAttendance(
          attendanceData
        );

      } catch (err) {

        console.error(
          "Attendance fetch error:",
          err
        );


        setAttendance(
          []
        );


        setError(
          err?.response?.data?.message ||
          "Failed to load attendance."
        );

      } finally {

        setLoadingAttendance(
          false
        );

      }

    };


  // ==========================================================
  // AUTO FETCH ATTENDANCE
  // ==========================================================

  useEffect(() => {

    if (
      !loading
    ) {

      fetchAttendance();

    }

  }, [
    fromDate,
    toDate,
    attendanceType,
    status,
    attendanceSource,
    loading,
  ]);


  // ==========================================================
  // ATTENDANCE MAP
  // ==========================================================

  const attendanceMap =
    useMemo(() => {

      const map =
        new Map();


      attendance.forEach(
        (record) => {

          const userId =
            getId(
              record?.userId
            );


          if (!userId) {
            return;
          }


          /*
           * For the selected date and applied
           * attendance filters, backend already
           * returns matching records.
           *
           * If multiple records exist for the same
           * employee, keep the latest one returned.
           */

          if (
            !map.has(
              userId
            )
          ) {

            map.set(
              userId,
              record
            );

          }

        }
      );


      return map;

    }, [
      attendance,
    ]);


  // ==========================================================
  // SHOULD SHOW ONLY MATCHING ATTENDANCE USERS
  // ==========================================================

  const attendanceFilterApplied =
    Boolean(
      attendanceType ||
      status ||
      attendanceSource
    );


  // ==========================================================
  // DISPLAY USERS
  // ==========================================================

  const displayUsers =
    useMemo(() => {

      /*
       * No attendance filter:
       *
       * Show every active employee.
       */

      if (
        !attendanceFilterApplied
      ) {

        return filteredUsers;

      }


      /*
       * Attendance filter applied:
       *
       * Backend returns only matching
       * attendance records.
       *
       * Therefore show only employees
       * having a matching record.
       *
       * This fixes:
       *
       * Present filter
       * Absent filter
       * WFH filter
       * Leave filter
       * Attendance Type filter
       * Attendance Source filter
       */

      return filteredUsers.filter((user) =>
        attendance.some((record) => {
          if (getId(record.userId) !== String(user._id)) return false;
          if (status && record.status !== status) return false;
          if (attendanceType && record.attendanceType !== attendanceType) return false;
          if (attendanceSource && record.attendanceSource !== attendanceSource) return false;
          return true;
        })
      );

    }, [
      filteredUsers,
      attendanceMap,
      attendanceFilterApplied,
    ]);


  // ==========================================================
  // FINAL ROSTER
  // ==========================================================

  const roster =
    useMemo(() => {

      return displayUsers.map(
        (user) => {

          const record =
            attendanceMap.get(
              String(
                user._id
              )
            );


          const meta =
            userMeta.get(
              String(
                user._id
              )
            );


          return {

            user,

            roles:
              meta?.roles ||
              [],

            designations:
              meta?.designations ||
              [],

            districts:
              meta?.districts ||
              [],

            attendance:
              record ||
              null,

          };

        }
      );

    }, [
      displayUsers,
      attendanceMap,
      userMeta,
    ]);



  const getDateKeysInRange = (start, end) => {
    if (!start || !end || start > end) return [];
    const dates = [];
    const cursor = new Date(`${start}T12:00:00`);
    const finish = new Date(`${end}T12:00:00`);
    while (cursor <= finish) {
      const key = [cursor.getFullYear(), String(cursor.getMonth() + 1).padStart(2, "0"), String(cursor.getDate()).padStart(2, "0")].join("-");
      dates.push({ key, isSunday: cursor.getDay() === 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  };

  const selectedDates = useMemo(
    () => getDateKeysInRange(fromDate, toDate),
    [fromDate, toDate]
  );
  const workingDates = useMemo(
    () => selectedDates.filter((date) => !date.isSunday),
    [selectedDates]
  );

  const summaryRows = useMemo(() => roster.map((item) => {
    const userId = getId(item.user);
    const records = attendance.filter((record) => getId(record.userId) === userId);
    const recordsByDate = new Map();
    records.forEach((record) => {
      const dateKey = String(record.date || "").slice(0, 10);
      if (!recordsByDate.has(dateKey)) recordsByDate.set(dateKey, []);
      recordsByDate.get(dateKey).push(record);
    });

    let present = 0;
    let absent = 0;
    let wfh = 0;
    let leaves = 0;

    // A working day without any UserAttendance document is counted as Absent.
    // Sundays are excluded from Total Days and all attendance totals.
    workingDates.forEach(({ key }) => {
      const dayRecords = recordsByDate.get(key) || [];
      const statuses = dayRecords.map((record) => record.status);
      if (statuses.includes("Present")) present += 1;
      else if (statuses.includes("WFH")) wfh += 1;
      else if (statuses.includes("Leave")) leaves += 1;
      else absent += 1;
    });

    return {
      ...item,
      records,
      totalDays: workingDates.length,
      present,
      absent,
      wfh,
      leaves,
      sundays: selectedDates.length - workingDates.length,
      recordsByDate,
    };
  }), [roster, attendance, workingDates, selectedDates]);

  const detailRecords = useMemo(() => {
    if (!selectedDetailUser || !fromDate || !toDate || fromDate > toDate) return [];
    const selected = summaryRows.find((row) => getId(row.user) === getId(selectedDetailUser));
    const rows = [];
    selectedDates.forEach(({ key, isSunday }) => {
      const matches = (selected?.recordsByDate.get(key) || []);
      if (matches.length) rows.push(...matches);
      else rows.push({ _id: `missing-${key}`, date: key, __missing: true, __sunday: isSunday, status: isSunday ? "Sunday" : "Absent" });
    });
    return rows.reverse();
  }, [summaryRows, selectedDetailUser, selectedDates, fromDate, toDate]);

  const exportSummary = () => exportCsv(
    ["Employee","Role","Designation","District","Attendance Type","Source","Total Days","Total Present","Total Absent","Total Sundays","WFH","Leaves"],
    summaryRows.map((r) => [
      r.user.name,
      r.roles.map(getRoleName).join(", "),
      r.designations.map(getDesignationName).join(", "),
      r.districts.map((d) => d.name).join(", "),
      [...new Set(r.records.map((x) => x.attendanceType).filter(Boolean))].join(", "),
      [...new Set(r.records.map((x) => x.attendanceSource).filter(Boolean))].join(", "),
      r.totalDays, r.present, r.absent, r.sundays, r.wfh, r.leaves,
    ]),
    `attendance-summary-${fromDate}-to-${toDate}.csv`
  );

  const xmlEscape = (value) => String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

  const downloadExcelWorkbook = (sheets, filename) => {
    const workbookSheets = sheets.map((sheet, sheetIndex) => {
      const rowsXml = sheet.rows.map((row) => {
        const cellsXml = row.map((cell) => {
          if (cell && typeof cell === "object" && cell.mergeAcross !== undefined) {
            return `<Cell ss:MergeAcross="${cell.mergeAcross}" ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(cell.value)}</Data></Cell>`;
          }
          const value = cell && typeof cell === "object" && "value" in cell ? cell.value : cell;
          const style = cell && typeof cell === "object" && cell.header ? ' ss:StyleID="Header"' : "";
          return `<Cell${style}><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
        }).join("");
        return `<Row>${cellsXml}</Row>`;
      }).join("");
      return `<Worksheet ss:Name="${xmlEscape(sheet.name)}"><Table>${rowsXml}</Table></Worksheet>`;
    }).join("");

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles><Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#D9EAF7" ss:Pattern="Solid"/></Style></Styles>
 ${workbookSheets}
</Workbook>`;
    const blob = new Blob(["\\uFEFF", xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportDetailed = () => {
    const detailedRows = [];
    const matrixHeaderTop = [
      "_id", "Employee Name", "Email", "userId", "Contact", "Role", "Designation", "District",
      ...selectedDates.map(({ key, isSunday }) => ({
        value: `${key.split("-").reverse().join("-")}${isSunday ? " (Sunday)" : ""}`,
        mergeAcross: 1,
      })),
    ];
    const matrixHeaderSub = [
      "", "", "", "", "", "", "", "",
      ...selectedDates.flatMap(() => ["Check In", "Check Out"]),
    ];
    const matrixRows = [matrixHeaderTop, matrixHeaderSub];

    summaryRows.forEach((row) => {
      const identity = [
        getId(row.user), row.user.name, row.user.email, row.user.userId || "",
        row.user.contact || row.user.phone || row.user.personalContact || row.user.mobile || "",
        row.roles.map(getRoleName).join(", "),
        row.designations.map(getDesignationName).join(", "),
        row.districts.map((district) => district.name).join(", "),
      ];

      selectedDates.forEach(({ key, isSunday }) => {
        const records = row.recordsByDate.get(key) || [];
        if (records.length) {
          records.forEach((record) => detailedRows.push([
            row.user.name, row.user.email, row.user.contact || row.user.phone || row.user.personalContact || row.user.mobile || "",
            row.roles.map(getRoleName).join(", "),
            row.designations.map(getDesignationName).join(", "),
            row.districts.map((district) => district.name).join(", "),
            key.split("-").reverse().join("-"),
            record.status || "", record.attendanceType || "", record.attendanceSource || "",
            formatClock(record.checkIn), formatClock(record.checkOut), record.visitedLocation || "",
          ]));
        } else {
          detailedRows.push([
            row.user.name, row.user.email, row.user.contact || row.user.phone || row.user.personalContact || row.user.mobile || "",
            row.roles.map(getRoleName).join(", "),
            row.designations.map(getDesignationName).join(", "),
            row.districts.map((district) => district.name).join(", "),
            key.split("-").reverse().join("-"),
            isSunday ? "Sunday" : "Absent", "", "", "", "", "",
          ]);
        }
      });

      const matrixValues = selectedDates.flatMap(({ key }) => {
        const records = row.recordsByDate.get(key) || [];
        return [
          records.map((record) => record.checkIn ? formatClock(record.checkIn) : "").filter(Boolean).join(" / "),
          records.map((record) => record.checkOut ? formatClock(record.checkOut) : "").filter(Boolean).join(" / "),
        ];
      });
      matrixRows.push([...identity, ...matrixValues]);
    });

    const firstSheetRows = [
      ["Employee Name","Email","Contact","Role","Designation","District","Date","Attendance","Type","Source","Check In","Check Out","Location"],
      ...detailedRows,
    ].map((row, index) => index === 0 ? row.map((value) => ({ value, header: true })) : row);

    downloadExcelWorkbook([
      { name: "Detailed Report", rows: firstSheetRows },
      { name: "Date-wise Check In Out", rows: matrixRows },
    ], `attendance-detailed-${fromDate}-to-${toDate}.xls`);
  };

  const exportEmployeeTotals = () => exportCsv(
    ["Employee Name","Email","Total Days","Total Present","Total Absent","Total Sundays","WFH","Leaves"],
    summaryRows.map((r) => [r.user.name,r.user.email,r.totalDays,r.present,r.absent,r.sundays,r.wfh,r.leaves]),
    `employee-attendance-totals-${fromDate}-to-${toDate}.csv`
  );

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    useMemo(() => {

      const total =
        roster.length;


      const marked =
        roster.filter(
          (item) =>
            item.attendance
        ).length;


      const notMarked =
        total -
        marked;


      const present =
        roster.filter(
          (item) =>
            item.attendance?.status ===
            "Present"
        ).length;


      const wfh =
        roster.filter(
          (item) =>
            item.attendance?.status ===
            "WFH"
        ).length;


      const leave =
        roster.filter(
          (item) =>
            item.attendance?.status ===
            "Leave"
        ).length;


      const absent =
        roster.filter(
          (item) =>
            item.attendance?.status ===
            "Absent"
        ).length;


      return {

        total,

        marked,

        notMarked,

        present,

        wfh,

        leave,

        absent,

      };

    }, [
      roster,
    ]);


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleFormChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setForm(
        (previous) => ({

          ...previous,

          [name]:
            value,

        })
      );


      // ------------------------------------------------------
      // Clear location when attendance type
      // does not require it.
      // ------------------------------------------------------

      if (
        name ===
        "attendanceType"
      ) {

        const locationRequiredTypes = [
          "Orientation",
          "Feild Visit",
          "Event",
          "Center Visit",
        ];


        if (
          !locationRequiredTypes.includes(
            value
          )
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
  // LOCATION REQUIREMENT
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
    (user, attendanceDate = null) => {

      setEditingId(
        null
      );


      setError(
        ""
      );


      setSuccess(
        ""
      );


      setSelectedModalUser(
        user
      );


      setForm({

        userId:
          user._id,

        attendanceType:
          "Daily Attendance",

        status:
          "Present",

        date: attendanceDate || (fromDate === toDate ? fromDate : getToday()),

        visitedLocation:
          "",

        manualAttendanceReason:
          "",

        checkIn: "",
        checkOut: "",
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
        record?.attendanceSource ===
        "Leave"
      ) {

        setError(
          "Leave attendance cannot be manually edited."
        );

        return;
      }


      setError(
        ""
      );


      setSuccess(
        ""
      );


      const recordUserId =
        record?.userId?._id ||
        record?.userId;


      const modalUser =
        users.find(
          (user) =>
            String(
              user?._id
            ) ===
            String(
              recordUserId
            )
        ) ||
        (
          typeof record?.userId ===
          "object"
            ? record.userId
            : null
        );


      setSelectedModalUser(
        modalUser
      );


      setEditingId(
        record._id
      );


      setForm({

        userId:
          recordUserId,

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
            : fromDate,

        visitedLocation:
          record.visitedLocation ||
          "",

        manualAttendanceReason:
          record.manualAttendanceReason ||
          "",

        checkIn: formatClockInputIST(record.checkIn),
        checkOut: formatClockInputIST(record.checkOut),
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

        userId:
          "",

        attendanceType:
          "Daily Attendance",

        status:
          "Present",

        date: fromDate === toDate ? fromDate : getToday(),

        visitedLocation:
          "",

        manualAttendanceReason:
          "",

        checkIn: "",
        checkOut: "",
        remarks:
          "",

      });

    };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault();


      setError(
        ""
      );


      setSuccess(
        ""
      );


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

      // Never submit an invalid/non-empty clock value as null: doing so
      // would overwrite the existing MongoDB checkIn/checkOut timestamps.
      const checkInTimestamp = form.checkIn
        ? toAttendanceTimestamp(form.date, form.checkIn)
        : null;
      const checkOutTimestamp = form.checkOut
        ? toAttendanceTimestamp(form.date, form.checkOut)
        : null;

      if (form.checkIn && !checkInTimestamp) {
        setError("Invalid Check In time. Please enter a valid 24-hour time.");
        return;
      }

      if (form.checkOut && !checkOutTimestamp) {
        setError("Invalid Check Out time. Please enter a valid 24-hour time.");
        return;
      }


      try {

        setSubmitting(
          true
        );


        // ----------------------------------------------------
        // UPDATE
        // ----------------------------------------------------

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
              checkIn: checkInTimestamp,
              checkOut: checkOutTimestamp,

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


        // ----------------------------------------------------
        // CREATE
        // ----------------------------------------------------

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
            checkIn: checkInTimestamp,
            checkOut: checkOutTimestamp,

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


        // ----------------------------------------------------
        // CLOSE MODAL
        // ----------------------------------------------------

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

          userId:
            "",

          attendanceType:
            "Daily Attendance",

          status:
            "Present",

          date: fromDate === toDate ? fromDate : getToday(),

          visitedLocation:
            "",

          manualAttendanceReason:
            "",

          checkIn: "",
          checkOut: "",
          remarks:
            "",

        });


        // ----------------------------------------------------
        // REFRESH
        // ----------------------------------------------------

        await fetchAttendance();

      } catch (err) {

        console.error(
          "Attendance save error:",
          err
        );


        setError(
          err?.response?.data?.message ||
          "Failed to save attendance."
        );

      } finally {

        setSubmitting(
          false
        );

      }

    };


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters =
    () => {

      setFromDate(getMonthStart());
      setToDate(getToday());
      setSelectedDetailUser(null);
      setSelectedRole(
        ""
      );

      setSelectedDepartment(
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
            Loading attendance management...
          </p>

        </div>

      </div>

    );

  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-900">
            Attendance Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Employee-wise attendance summary for the selected date range.
          </p>

        </div>


        {/* ====================================================
            ALERTS
        ==================================================== */}

        {error && (

          <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>
              {error}
            </span>


            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-4 font-bold"
            >
              ×
            </button>

          </div>

        )}


        {success && (

          <div className="mb-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

            <span>
              {success}
            </span>


            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="ml-4 font-bold"
            >
              ×
            </button>

          </div>

        )}


        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-base font-semibold text-gray-900">
                Attendance Filters
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Filter active employees and their attendance.
              </p>

            </div>


            <button
              type="button"
              onClick={
                clearFilters
              }
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Clear Filters
            </button>

          </div>


          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Start Date</label>
              <input type="date" value={fromDate} max={toDate} onChange={(event) => setFromDate(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">End Date</label>
              <input type="date" value={toDate} min={fromDate} max={getToday()} onChange={(event) => setToDate(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/>
            </div>


            {/* ==================================================
                ROLE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Role
              </label>


              <SearchableSelect
                value={
                  selectedRole
                }
                onChange={(
                  event
                ) =>
                  setSelectedRole(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >

                <option value="">
                  All Roles
                </option>


                {roles.map(
                  (role) => (

                    <option
                      key={
                        role._id
                      }
                      value={
                        role._id
                      }
                    >
                      {getRoleName(
                        role
                      )}
                    </option>

                  )
                )}

              </SearchableSelect>

            </div>


            {/* ==================================================
                DEPARTMENT
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Department
              </label>


              <SearchableSelect
                value={
                  selectedDepartment
                }
                onChange={(
                  event
                ) =>
                  setSelectedDepartment(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >

                <option value="">
                  All Departments
                </option>


                {departments.map(
                  (department) => (

                    <option
                      key={
                        department._id
                      }
                      value={
                        department._id
                      }
                    >
                      {getDepartmentName(
                        department
                      )}
                    </option>

                  )
                )}

              </SearchableSelect>

            </div>


            {/* ==================================================
                DISTRICT
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                District
              </label>


              <SearchableSelect
                value={
                  selectedDistrict
                }
                onChange={(
                  event
                ) =>
                  setSelectedDistrict(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                      {district.name}
                    </option>

                  )
                )}

              </SearchableSelect>

            </div>


            {/* ==================================================
                ATTENDANCE TYPE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Attendance Type
              </label>


              <SearchableSelect
                value={
                  attendanceType
                }
                onChange={(
                  event
                ) =>
                  setAttendanceType(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >

                <option value="">
                  All Types
                </option>


                {ATTENDANCE_TYPES.map(
                  (type) => (

                    <option
                      key={
                        type
                      }
                      value={
                        type
                      }
                    >
                      {type}
                    </option>

                  )
                )}

              </SearchableSelect>

            </div>


            {/* ==================================================
                STATUS
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Status
              </label>


              <SearchableSelect
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

              </SearchableSelect>

            </div>


            {/* ==================================================
                SOURCE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Source
              </label>


              <SearchableSelect
                value={
                  attendanceSource
                }
                onChange={(
                  event
                ) =>
                  setAttendanceSource(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

              </SearchableSelect>

            </div>

          </div>

        </div>


        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">


          {/* EMPLOYEES */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-medium text-gray-500">
              Employees
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {summary.total}
            </p>

          </div>


          {/* MARKED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-medium text-gray-500">
              Marked
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {summary.marked}
            </p>

          </div>


          {/* NOT MARKED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-medium text-gray-500">
              Not Marked
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {summary.notMarked}
            </p>

          </div>


          {/* PRESENT */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-medium text-gray-500">
              Present
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {summary.present}
            </p>

          </div>


          {/* WFH */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-medium text-gray-500">
              WFH
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {summary.wfh}
            </p>

          </div>


          {/* LEAVE / ABSENT */}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-medium text-gray-500">
              {status === "Absent"
                ? "Absent"
                : status === "Leave"
                ? "Leave"
                : "Absent"}
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {status === "Absent"
                ? summary.absent
                : status === "Leave"
                ? summary.leave
                : summary.absent}
            </p>

          </div>

        </div>


        {/* ====================================================
            ROSTER
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b px-5 py-4">

            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">

              <div>

                <h2 className="font-semibold text-gray-900">
                  Employee Attendance — {formatDate(fromDate)} to {formatDate(toDate)}
                </h2>


                <p className="mt-1 text-xs text-gray-500">

                  {attendanceFilterApplied
                    ? "Showing employees matching the selected attendance filters."
                    : "Every active employee appears here. Attendance records are merged against the selected date."}

                </p>

              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={exportSummary} disabled={!summaryRows.length} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Export Summary</button>
                <button type="button" onClick={exportDetailed} disabled={!attendance.length} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Export Detailed</button>
                <button type="button" onClick={exportEmployeeTotals} disabled={!summaryRows.length} className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Export Employee Totals</button>
                <div className="text-xs font-medium text-gray-500">

                {roster.length}{" "}
                employee
                {roster.length !== 1
                  ? "s"
                  : ""}

                </div>
              </div>

            </div>

          </div>


          {loadingAttendance ? (

            <div className="p-10 text-center text-gray-500">
              Loading attendance...
            </div>

          ) : roster.length === 0 ? (

            <div className="p-10 text-center">

              <p className="text-sm font-medium text-gray-700">
                No attendance records found.
              </p>


              <p className="mt-1 text-xs text-gray-400">
                Try changing or clearing the attendance filters.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              {selectedDetailUser ? (
                <div className="p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <button type="button" onClick={() => setSelectedDetailUser(null)} className="mb-2 text-sm font-semibold text-indigo-600">← Back to employees</button>
                      <h3 className="text-lg font-bold text-gray-900">{selectedDetailUser.name} — Attendance Details</h3>
                      <p className="text-sm text-gray-500">{formatDate(fromDate)} to {formatDate(toDate)}</p>
                    </div>
                    <button type="button" onClick={() => openMarkModal(selectedDetailUser)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Mark Attendance</button>
                  </div>
                  <div className="overflow-x-auto"><table className="min-w-full text-sm">
                    <thead className="bg-gray-50"><tr>{["Date","Check In","Check Out","Attendance Type","Source","Location","Action"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
                    <tbody className="divide-y">
                      {detailRecords.map((record) => <tr key={record._id}>
                        <td className="px-4 py-3">{formatDate(record.date)}</td><td className="px-4 py-3">{formatClock(record.checkIn)}</td><td className="px-4 py-3">{formatClock(record.checkOut)}</td>
                        <td className="px-4 py-3">{record.attendanceType || "-"}</td><td className="px-4 py-3">{record.attendanceSource || "-"}</td><td className="px-4 py-3">{record.visitedLocation || "-"}</td>
                        <td className="px-4 py-3">{record.__missing ? <button type="button" onClick={() => openMarkModal(selectedDetailUser, record.date)} className="font-semibold text-indigo-600">Mark</button> : record.attendanceSource === "Leave" ? <span className="text-xs text-gray-400">System</span> : <button type="button" onClick={() => openEditModal(record)} className="font-semibold text-indigo-600">Mark / Edit</button>}</td>
                      </tr>)}
                      {!detailRecords.length && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No attendance records in this date range.</td></tr>}
                    </tbody>
                  </table></div>
                </div>
              ) : (
                <div className="overflow-x-auto"><table className="min-w-full text-sm">
                  <thead className="bg-gray-50"><tr>{["Employee","Role","Designation","District","Attendance Type","Source","Total Present","Total Absent","Total Sundays","WFH","Leaves","Action"].map((h) => <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {summaryRows.map((row) => <tr key={row.user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><div className="font-semibold">{row.user.name}</div><div className="text-xs text-gray-500">{row.user.email}</div></td>
                      <td className="px-4 py-3">{row.roles.map(getRoleName).join(", ") || "-"}</td><td className="px-4 py-3">{row.designations.map(getDesignationName).join(", ") || "-"}</td>
                      <td className="px-4 py-3">{row.districts.map((d) => d.name).join(", ") || "-"}</td><td className="px-4 py-3">{[...new Set(row.records.map((r) => r.attendanceType).filter(Boolean))].join(", ") || "-"}</td>
                      <td className="px-4 py-3">{[...new Set(row.records.map((r) => r.attendanceSource).filter(Boolean))].join(", ") || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{row.present}</td><td className="px-4 py-3 font-semibold text-red-700">{row.absent}</td><td className="px-4 py-3">{row.sundays}</td><td className="px-4 py-3">{row.wfh}</td><td className="px-4 py-3">{row.leaves}</td>
                      <td className="px-4 py-3"><button type="button" onClick={() => setSelectedDetailUser(row.user)} className="rounded-lg bg-indigo-50 px-3 py-2 font-semibold text-indigo-700">Manage</button></td>
                    </tr>)}
                  </tbody>
                </table></div>
              )}

            </div>

          )}

        </div>


      </div>


      {/* ======================================================
          MARK / EDIT MODAL
      ====================================================== */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">


            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">

                  {editingId
                    ? "Edit Attendance"
                    : "Mark Attendance"}

                </h2>


                <p className="mt-1 text-sm text-gray-500">
                  Dashboard attendance is manual and does not require a photo.
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
                className="text-2xl leading-none text-gray-400 hover:text-gray-700 disabled:opacity-50"
              >
                ×
              </button>

            </div>


            {/* ==================================================
                MODAL FORM
            ================================================== */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-6"
            >


              {/* =================================================
                  EMPLOYEE
              ================================================= */}

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


                  <div className="mt-1 text-sm text-gray-500">

                    {
                      selectedModalUser?.email ||
                      "-"
                    }

                  </div>

                </div>

              </div>


              {/* =================================================
                  DATE + TYPE
              ================================================= */}

              <div className="grid gap-5 md:grid-cols-2">


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
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>


                {/* TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Attendance Type *
                  </label>


                  <SearchableSelect
                    name="attendanceType"
                    value={
                      form.attendanceType
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >

                    {ATTENDANCE_TYPES.map(
                      (type) => (

                        <option
                          key={
                            type
                          }
                          value={
                            type
                          }
                        >
                          {type}
                        </option>

                      )
                    )}

                  </SearchableSelect>

                </div>

              </div>


              {/* =================================================
                  STATUS
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Status *
                </label>


                <SearchableSelect
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

                </SearchableSelect>

              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-sm font-semibold text-gray-700">Check In Time
                  <input type="time" name="checkIn" value={form.checkIn || ""} onChange={handleFormChange} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"/>
                </label>
                <label className="block text-sm font-semibold text-gray-700">Check Out Time
                  <input type="time" name="checkOut" value={form.checkOut || ""} onChange={handleFormChange} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"/>
                </label>
              </div>

              {/* =================================================
                  VISITED LOCATION
              ================================================= */}

              {requiresLocation && (

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Visited Location *
                  </label>


                  <input
                    type="text"
                    name="visitedLocation"
                    value={
                      form.visitedLocation
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Enter visited location"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

              )}


              {/* =================================================
                  MANUAL REASON
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Manual Attendance Reason
                </label>


                <input
                  type="text"
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


              {/* =================================================
                  REMARKS
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Remarks
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


              {/* =================================================
                  ACTIONS
              ================================================= */}

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

                  {submitting
                    ? "Saving..."
                    : editingId
                    ? "Update Attendance"
                    : "Mark Attendance"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}


export default AttendanceManagement;