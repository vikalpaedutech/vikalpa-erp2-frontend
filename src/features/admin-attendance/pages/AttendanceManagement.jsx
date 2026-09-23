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

  const [date, setDate] =
    useState(
      getToday()
    );


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

          const roleList =
            roleMappings
              .map(
                (item) =>
                  item?.roleId
              )
              .filter(Boolean);


          // --------------------------------------------------
          // DESIGNATIONS
          // --------------------------------------------------

          const designationList =
            designationMappings
              .map(
                (item) =>
                  item?.designationId
              )
              .filter(Boolean);


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

              departmentIds,

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

            date,

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
    date,
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

      return filteredUsers.filter(
        (user) =>
          attendanceMap.has(
            String(
              user._id
            )
          )
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
    (user) => {

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

        date,

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
            : date,

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

        userId:
          "",

        attendanceType:
          "Daily Attendance",

        status:
          "Present",

        date,

        visitedLocation:
          "",

        manualAttendanceReason:
          "",

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

          date,

          visitedLocation:
            "",

          manualAttendanceReason:
            "",

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
            Employee-wise attendance for the selected date.
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


            {/* ==================================================
                DATE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Attendance Date
              </label>


              <input
                type="date"
                value={
                  date
                }
                onChange={(
                  event
                ) =>
                  setDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>


            {/* ==================================================
                ROLE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Role
              </label>


              <select
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

              </select>

            </div>


            {/* ==================================================
                DEPARTMENT
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Department
              </label>


              <select
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

              </select>

            </div>


            {/* ==================================================
                DISTRICT
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                District
              </label>


              <select
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

              </select>

            </div>


            {/* ==================================================
                ATTENDANCE TYPE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Attendance Type
              </label>


              <select
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

              </select>

            </div>


            {/* ==================================================
                STATUS
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Status
              </label>


              <select
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

              </select>

            </div>


            {/* ==================================================
                SOURCE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Source
              </label>


              <select
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

              </select>

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
                  Employee Attendance —{" "}
                  {formatDate(
                    date
                  )}
                </h2>


                <p className="mt-1 text-xs text-gray-500">

                  {attendanceFilterApplied
                    ? "Showing employees matching the selected attendance filters."
                    : "Every active employee appears here. Attendance records are merged against the selected date."}

                </p>

              </div>


              <div className="text-xs font-medium text-gray-500">

                {roster.length}{" "}
                employee
                {roster.length !== 1
                  ? "s"
                  : ""}

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

              <table className="min-w-full text-sm">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-5 py-3 text-left">
                      Employee
                    </th>


                    <th className="px-5 py-3 text-left">
                      Role
                    </th>


                    <th className="px-5 py-3 text-left">
                      Designation
                    </th>


                    <th className="px-5 py-3 text-left">
                      District
                    </th>


                    <th className="px-5 py-3 text-left">
                      Attendance
                    </th>


                    <th className="px-5 py-3 text-left">
                      Type
                    </th>


                    <th className="px-5 py-3 text-left">
                      Source
                    </th>


                    <th className="px-5 py-3 text-left">
                      Location
                    </th>


                    <th className="px-5 py-3 text-left">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y">

                  {roster.map(
                    ({
                      user,
                      roles,
                      designations,
                      districts: userDistricts,
                      attendance,
                    }) => (

                      <tr
                        key={
                          user._id
                        }
                        className="hover:bg-gray-50"
                      >


                        {/* EMPLOYEE */}

                        <td className="px-5 py-4">

                          <div className="font-semibold text-gray-900">
                            {user.name}
                          </div>

                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>

                        </td>


                        {/* ROLE */}

                        <td className="px-5 py-4">

                          <div className="flex flex-wrap gap-1">

                            {roles.length
                              ? roles.map(
                                  (
                                    role
                                  ) => (

                                    <span
                                      key={
                                        role?._id
                                      }
                                      className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
                                    >
                                      {getRoleName(
                                        role
                                      )}
                                    </span>

                                  )
                                )
                              : "-"}

                          </div>

                        </td>


                        {/* DESIGNATION */}

                        <td className="px-5 py-4">

                          {designations.length
                            ? designations
                                .map(
                                  (
                                    designation
                                  ) =>
                                    getDesignationName(
                                      designation
                                    )
                                )
                                .join(
                                  ", "
                                )
                            : "-"}

                        </td>


                        {/* DISTRICT */}

                        <td className="px-5 py-4">

                          {userDistricts?.length
                            ? userDistricts
                                .map(
                                  (
                                    district
                                  ) =>
                                    district?.name
                                )
                                .filter(Boolean)
                                .join(
                                  ", "
                                )
                            : "-"}

                        </td>


                        {/* ATTENDANCE */}

                        <td className="px-5 py-4">

                          {attendance ? (

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                attendance.status
                              )}`}
                            >
                              {
                                attendance.status
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
                            attendance?.attendanceType ||
                            "-"
                          }
                        </td>


                        {/* SOURCE */}

                        <td className="px-5 py-4">

                          {attendance ? (

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                              {
                                attendance.attendanceSource
                              }
                            </span>

                          ) : (
                            "-"
                          )}

                        </td>


                        {/* LOCATION */}

                        <td className="px-5 py-4">

                          {
                            attendance?.visitedLocation ||
                            "-"
                          }

                        </td>


                        {/* ACTION */}

                        <td className="px-5 py-4">

                          {attendance ? (

                            attendance.attendanceSource !==
                            "Leave" ? (

                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    attendance
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

                    )
                  )}

                </tbody>

              </table>

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


                  <select
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

                  </select>

                </div>

              </div>


              {/* =================================================
                  STATUS
              ================================================= */}

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

                </select>

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
                  Manual Attendance Reason *
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
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>


              {/* =================================================
                  REMARKS
              ================================================= */}

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
                  required
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