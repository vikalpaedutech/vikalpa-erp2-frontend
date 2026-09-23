import { useEffect, useMemo, useState } from "react";

import MultiSelectDropdown from "../components/MultiSelectDropdown";

import { useRegionAccess } from "../../../context/RegionAccessContext";

import {
  getMonitoringRoles,
  getMonitoringUsersByRole,
  getUserMonitoringAccess,
  getAvailableMonitoringCenters,
  assignMonitoringCenters,
  revokeMonitoringAccessByLevel,
} from "../services/monitoringRegionAccess.service";

import {
  CENTER_MONITORING_ASSIGNMENT_LEVELS,
} from "../constants/centerMonitoring.constants";


// ============================================================
// Center Monitoring Management
// ============================================================

function CenterMonitoringManagement() {
  const {
    programAccess,
    districts,
  } = useRegionAccess();


  // ==========================================================
  // Roles / Users
  // ==========================================================

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedRole, setSelectedRole] =
    useState("");


  // ==========================================================
  // Selected user
  // ==========================================================

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [userAccess, setUserAccess] =
    useState([]);


  // ==========================================================
  // Assignment form
  // ==========================================================

  const [selectedProgramIds, setSelectedProgramIds] =
    useState([]);

  const [selectedBatchIds, setSelectedBatchIds] =
    useState([]);

  const [assignmentLevel, setAssignmentLevel] =
    useState("district");

  const [selectedDistrictIds, setSelectedDistrictIds] =
    useState([]);

  const [selectedBlockIds, setSelectedBlockIds] =
    useState([]);

  const [selectedCenterIds, setSelectedCenterIds] =
    useState([]);


  // ==========================================================
  // Available centers
  // ==========================================================

  const [availableCenters, setAvailableCenters] =
    useState([]);


  // ==========================================================
  // Loading / Messages
  // ==========================================================

  const [loadingRoles, setLoadingRoles] =
    useState(false);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [loadingAccess, setLoadingAccess] =
    useState(false);

  const [loadingCenters, setLoadingCenters] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  // ==========================================================
  // Programs / Batches
  // ==========================================================

  const programs =
    programAccess?.programs || [];

  const batches =
    programAccess?.batches || [];


  // ==========================================================
  // Available batches based on selected programs
  // ==========================================================

  const availableBatches = useMemo(() => {

    if (
      selectedProgramIds.length === 0
    ) {
      return [];
    }

    return batches.filter((batch) =>
      selectedProgramIds.includes(
        String(
          batch?.programId?._id ||
            batch?.programId
        )
      )
    );

  }, [
    batches,
    selectedProgramIds,
  ]);


  // ==========================================================
  // Available blocks based on selected districts
  // ==========================================================

  const availableBlocks = useMemo(() => {

    const blockMap = new Map();

    availableCenters.forEach(
      (center) => {

        const block =
          center?.blockId;

        const blockId =
          block?._id ||
          block;

        if (!blockId) {
          return;
        }

        if (
          !blockMap.has(
            String(blockId)
          )
        ) {

          blockMap.set(
            String(blockId),
            {
              _id: blockId,
              blockName:
                block?.blockName ||
                "Block",
            }
          );

        }

      }
    );

    return Array.from(
      blockMap.values()
    );

  }, [
    availableCenters,
  ]);


  // ==========================================================
  // Available centers based on selected blocks
  // ==========================================================

  const filteredCenters = useMemo(() => {

    if (
      selectedBlockIds.length === 0
    ) {
      return [];
    }

    return availableCenters.filter(
      (center) =>
        selectedBlockIds.includes(
          String(
            center?.blockId?._id ||
              center?.blockId
          )
        )
    );

  }, [
    availableCenters,
    selectedBlockIds,
  ]);


  // ==========================================================
  // UNIQUE REVOKE DATA
  // ==========================================================

  /*
   * Important:
   *
   * userAccess is flat.
   *
   * One center = one access document.
   *
   * Therefore we create unique groups for:
   *
   * 1. District
   * 2. Batch
   * 3. Program
   *
   * These groups are later used for bulk revoke.
   */


  // ==========================================================
  // Unique Districts
  // ==========================================================

  const revokeDistricts = useMemo(() => {

    const map = new Map();

    userAccess.forEach(
      (access) => {

        const districtId =
          access?.districtId?._id;

        if (!districtId) {
          return;
        }

        const key =
          String(districtId);

        if (!map.has(key)) {

          map.set(
            key,
            {
              _id:
                districtId,

              districtName:
                access
                  ?.districtId
                  ?.districtName ||
                "District",
            }
          );

        }

      }
    );

    return Array.from(
      map.values()
    );

  }, [
    userAccess,
  ]);


  // ==========================================================
  // Unique Batches
  // ==========================================================

  const revokeBatches = useMemo(() => {

    const map = new Map();

    userAccess.forEach(
      (access) => {

        const programId =
          access?.programId?._id;

        const batchId =
          access?.batchId?._id;

        if (
          !programId ||
          !batchId
        ) {
          return;
        }

        const key =
          `${programId}-${batchId}`;

        if (!map.has(key)) {

          map.set(
            key,
            {
              programId,

              batchId,

              programName:
                access
                  ?.programId
                  ?.programName ||
                "Program",

              batchName:
                access
                  ?.batchId
                  ?.batchName ||
                "Batch",
            }
          );

        }

      }
    );

    return Array.from(
      map.values()
    );

  }, [
    userAccess,
  ]);


  // ==========================================================
  // Unique Programs
  // ==========================================================

  const revokePrograms = useMemo(() => {

    const map = new Map();

    userAccess.forEach(
      (access) => {

        const programId =
          access?.programId?._id;

        if (!programId) {
          return;
        }

        const key =
          String(programId);

        if (!map.has(key)) {

          map.set(
            key,
            {
              programId,

              programName:
                access
                  ?.programId
                  ?.programName ||
                "Program",
            }
          );

        }

      }
    );

    return Array.from(
      map.values()
    );

  }, [
    userAccess,
  ]);


  // ==========================================================
  // Load roles
  // ==========================================================

  useEffect(() => {

    const loadRoles = async () => {

      try {

        setLoadingRoles(true);
        setError("");

        const response =
          await getMonitoringRoles();

        setRoles(
          response?.data || []
        );

      } catch (err) {

        console.error(
          "Failed to load monitoring roles:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load roles"
        );

      } finally {

        setLoadingRoles(false);

      }

    };

    loadRoles();

  }, []);


  // ==========================================================
  // Role change
  // ==========================================================

  const handleRoleChange = async (
    value
  ) => {

    setSelectedRole(value);

    setSelectedUser(null);
    setUserAccess([]);

    resetAssignmentForm();

    setMessage("");
    setError("");

    if (!value) {

      setUsers([]);

      return;
    }

    try {

      setLoadingUsers(true);

      const response =
        await getMonitoringUsersByRole({
          roleId: value,
        });

      setUsers(
        response?.data || []
      );

    } catch (err) {

      console.error(
        "Failed to load monitoring users:",
        err
      );

      setUsers([]);

      setError(
        err?.response?.data?.message ||
          "Failed to load users"
      );

    } finally {

      setLoadingUsers(false);

    }

  };


  // ==========================================================
  // Reset assignment form
  // ==========================================================

  const resetAssignmentForm = () => {

    setSelectedProgramIds([]);
    setSelectedBatchIds([]);

    setAssignmentLevel(
      "district"
    );

    setSelectedDistrictIds([]);
    setSelectedBlockIds([]);
    setSelectedCenterIds([]);

    setAvailableCenters([]);

  };


  // ==========================================================
  // Manage User
  // ==========================================================

  const handleManageUser = async (
    user
  ) => {

    setSelectedUser(user);

    setUserAccess([]);

    resetAssignmentForm();

    setMessage("");
    setError("");

    try {

      setLoadingAccess(true);

      const response =
        await getUserMonitoringAccess(
          user._id
        );

      setUserAccess(
        response?.data || []
      );

    } catch (err) {

      console.error(
        "Failed to load user monitoring access:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load user access"
      );

    } finally {

      setLoadingAccess(false);

    }

  };


  // ==========================================================
  // Close management panel
  // ==========================================================

  const handleCloseManagement = () => {

    setSelectedUser(null);

    setUserAccess([]);

    resetAssignmentForm();

    setMessage("");
    setError("");

  };


  // ==========================================================
  // Program change
  // ==========================================================

  const handleProgramChange = (
    values
  ) => {

    setSelectedProgramIds(values);

    setSelectedBatchIds([]);

  };


  // ==========================================================
  // Batch change
  // ==========================================================

  const handleBatchChange = (
    values
  ) => {

    setSelectedBatchIds(values);

  };


  // ==========================================================
  // Assignment Level Change
  // ==========================================================

  const handleAssignmentLevelChange = (
    value
  ) => {

    setAssignmentLevel(value);

    setSelectedDistrictIds([]);
    setSelectedBlockIds([]);
    setSelectedCenterIds([]);

    setAvailableCenters([]);

    setError("");

  };


  // ==========================================================
  // Load centers for selected districts
  // ==========================================================

  const loadCentersForDistricts =
    async (
      districtIds
    ) => {

      if (
        !districtIds ||
        districtIds.length === 0
      ) {

        setAvailableCenters([]);

        return;

      }

      try {

        setLoadingCenters(true);
        setError("");

        const response =
          await getAvailableMonitoringCenters({
            districtIds,
          });

        setAvailableCenters(
          response?.data || []
        );

      } catch (err) {

        console.error(
          "Failed to load centers:",
          err
        );

        setAvailableCenters([]);

        setError(
          err?.response?.data?.message ||
            "Failed to load centers"
        );

      } finally {

        setLoadingCenters(false);

      }

    };


  // ==========================================================
  // District change
  // ==========================================================

  const handleDistrictChange =
    async (
      values
    ) => {

      setSelectedDistrictIds(values);

      setSelectedBlockIds([]);
      setSelectedCenterIds([]);

      setAvailableCenters([]);

      if (
        values.length === 0
      ) {
        return;
      }

      if (
        assignmentLevel === "block" ||
        assignmentLevel === "center"
      ) {

        await loadCentersForDistricts(
          values
        );

      }

    };


  // ==========================================================
  // Block change
  // ==========================================================

  const handleBlockChange = (
    values
  ) => {

    setSelectedBlockIds(values);

    setSelectedCenterIds([]);

  };


  // ==========================================================
  // Center change
  // ==========================================================

  const handleCenterChange = (
    values
  ) => {

    setSelectedCenterIds(values);

  };


  // ==========================================================
  // Assign Monitoring Centers
  // ==========================================================

  const handleAssign = async () => {

    setError("");
    setMessage("");

    if (!selectedUser) {

      setError(
        "Please select a user."
      );

      return;

    }


    if (
      selectedProgramIds.length === 0
    ) {

      setError(
        "Please select at least one program."
      );

      return;

    }


    if (
      selectedBatchIds.length === 0
    ) {

      setError(
        "Please select at least one batch."
      );

      return;

    }


    if (
      selectedDistrictIds.length === 0
    ) {

      setError(
        "Please select at least one district."
      );

      return;

    }


    if (
      assignmentLevel === "block" &&
      selectedBlockIds.length === 0
    ) {

      setError(
        "Please select at least one block."
      );

      return;

    }


    if (
      assignmentLevel === "center" &&
      selectedBlockIds.length === 0
    ) {

      setError(
        "Please select at least one block."
      );

      return;

    }


    if (
      assignmentLevel === "center" &&
      selectedCenterIds.length === 0
    ) {

      setError(
        "Please select at least one center."
      );

      return;

    }


    try {

      setSaving(true);

      const payload = {

        userId:
          selectedUser._id,

        programIds:
          selectedProgramIds,

        batchIds:
          selectedBatchIds,

        assignmentLevel,

        districtIds:
          selectedDistrictIds,

      };


      if (
        assignmentLevel === "block" ||
        assignmentLevel === "center"
      ) {

        payload.blockIds =
          selectedBlockIds;

      }


      if (
        assignmentLevel === "center"
      ) {

        payload.centerIds =
          selectedCenterIds;

      }


      const response =
        await assignMonitoringCenters(
          payload
        );


      setMessage(
        response?.message ||
          "Monitoring centers assigned successfully"
      );


      await refreshUserAccess();

      resetAssignmentForm();

    } catch (err) {

      console.error(
        "Failed to assign monitoring centers:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to assign monitoring centers"
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================================
  // Refresh User Access
  // ==========================================================

  const refreshUserAccess = async () => {

    if (!selectedUser?._id) {
      return;
    }

    try {

      setLoadingAccess(true);

      const response =
        await getUserMonitoringAccess(
          selectedUser._id
        );

      setUserAccess(
        response?.data || []
      );

    } catch (err) {

      console.error(
        "Failed to refresh user access:",
        err
      );

    } finally {

      setLoadingAccess(false);

    }

  };


  // ==========================================================
  // Revoke Single Level
  // ==========================================================

  const handleRevokeLevel = async ({
    programId: revokeProgramId,
    batchId: revokeBatchId,
    assignmentLevel: revokeLevel,
    districtId: revokeDistrictId,
    blockId: revokeBlockId,
    centerId: revokeCenterId,
    label,
  }) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to revoke ${label}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      setSaving(true);
      setError("");
      setMessage("");

      const payload = {

        userId:
          selectedUser._id,

        programId:
          revokeProgramId,

        batchId:
          revokeBatchId,

        assignmentLevel:
          revokeLevel,

      };


      if (
        revokeLevel === "district"
      ) {

        payload.districtId =
          revokeDistrictId;

      }


      if (
        revokeLevel === "block"
      ) {

        payload.blockId =
          revokeBlockId;

      }


      if (
        revokeLevel === "center"
      ) {

        payload.centerId =
          revokeCenterId;

      }


      const response =
        await revokeMonitoringAccessByLevel(
          payload
        );


      setMessage(
        response?.message ||
          "Monitoring access revoked successfully"
      );


      await refreshUserAccess();

    } catch (err) {

      console.error(
        "Failed to revoke monitoring access:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to revoke monitoring access"
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================================
  // REVOKE ENTIRE DISTRICT
  // ==========================================================

  const handleRevokeEntireDistrict =
    async (
      district
    ) => {

      const districtId =
        district?._id;

      if (!districtId) {
        return;
      }


      /*
       * Find every Program + Batch combination
       * that exists inside this district.
       *
       * Example:
       *
       * Ambala
       *   Program A
       *      Batch 1
       *      Batch 2
       *
       *   Program B
       *      Batch 3
       *
       * All three combinations are revoked.
       */

      const combinations = [
        ...new Map(
          userAccess
            .filter(
              (access) =>
                String(
                  access?.districtId?._id
                ) ===
                String(districtId)
            )
            .map(
              (access) => {

                const programId =
                  access
                    ?.programId
                    ?._id;

                const batchId =
                  access
                    ?.batchId
                    ?._id;

                return [
                  `${programId}-${batchId}`,

                  {
                    programId,
                    batchId,
                  },
                ];

              }
            )
        ).values(),
      ];


      if (
        combinations.length === 0
      ) {

        setError(
          "No active access found for this district."
        );

        return;

      }


      const confirmed =
        window.confirm(
          `Are you sure you want to revoke ALL monitoring access for district "${district.districtName}"? This will revoke all programs, batches and centers inside this district.`
        );


      if (!confirmed) {
        return;
      }


      try {

        setSaving(true);
        setError("");
        setMessage("");


        const results =
          await Promise.allSettled(
            combinations.map(
              (item) =>
                revokeMonitoringAccessByLevel(
                  {
                    userId:
                      selectedUser._id,

                    programId:
                      item.programId,

                    batchId:
                      item.batchId,

                    assignmentLevel:
                      "district",

                    districtId,
                  }
                )
            )
          );


        const failed =
          results.filter(
            (result) =>
              result.status ===
              "rejected"
          );


        if (
          failed.length > 0
        ) {

          setError(
            `District revoke completed with ${failed.length} failed operation(s).`
          );

        } else {

          setMessage(
            `Entire ${district.districtName} district access has been revoked.`
          );

        }


        await refreshUserAccess();

      } catch (err) {

        console.error(
          "Failed to revoke entire district:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to revoke entire district"
        );

      } finally {

        setSaving(false);

      }

    };


  // ==========================================================
  // REVOKE ENTIRE BATCH
  // ==========================================================

  const handleRevokeEntireBatch =
    async (
      batch
    ) => {

      const {
        programId,
        batchId,
        programName,
        batchName,
      } = batch;


      /*
       * Find every district where this
       * Program + Batch currently has access.
       */

      const districtIds = [
        ...new Set(
          userAccess
            .filter(
              (access) =>
                String(
                  access
                    ?.programId
                    ?._id
                ) ===
                  String(
                    programId
                  ) &&
                String(
                  access
                    ?.batchId
                    ?._id
                ) ===
                  String(
                    batchId
                  )
            )
            .map(
              (access) =>
                access
                  ?.districtId
                  ?._id
            )
            .filter(Boolean)
            .map(String)
        ),
      ];


      if (
        districtIds.length === 0
      ) {

        setError(
          "No active access found for this batch."
        );

        return;

      }


      const confirmed =
        window.confirm(
          `Are you sure you want to revoke batch "${batchName}" of "${programName}"? This will revoke all centers in this batch.`
        );


      if (!confirmed) {
        return;
      }


      try {

        setSaving(true);
        setError("");
        setMessage("");


        const results =
          await Promise.allSettled(
            districtIds.map(
              (districtId) =>
                revokeMonitoringAccessByLevel(
                  {
                    userId:
                      selectedUser._id,

                    programId,

                    batchId,

                    assignmentLevel:
                      "district",

                    districtId,
                  }
                )
            )
          );


        const failed =
          results.filter(
            (result) =>
              result.status ===
              "rejected"
          );


        if (
          failed.length > 0
        ) {

          setError(
            `Batch revoke completed with ${failed.length} failed operation(s).`
          );

        } else {

          setMessage(
            `Entire batch "${batchName}" has been revoked.`
          );

        }


        await refreshUserAccess();

      } catch (err) {

        console.error(
          "Failed to revoke entire batch:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to revoke entire batch"
        );

      } finally {

        setSaving(false);

      }

    };


  // ==========================================================
  // REVOKE ENTIRE PROGRAM
  // ==========================================================

  const handleRevokeEntireProgram =
    async (
      program
    ) => {

      const programId =
        program?.programId;


      /*
       * Find every Program + Batch + District
       * combination under this program.
       *
       * Therefore:
       *
       * Program revoke
       *      ↓
       * All batches
       *      ↓
       * All districts
       *      ↓
       * All centers
       */

      const combinations = [
        ...new Map(
          userAccess
            .filter(
              (access) =>
                String(
                  access
                    ?.programId
                    ?._id
                ) ===
                String(programId)
            )
            .map(
              (access) => {

                const batchId =
                  access
                    ?.batchId
                    ?._id;

                const districtId =
                  access
                    ?.districtId
                    ?._id;

                return [
                  `${batchId}-${districtId}`,

                  {
                    batchId,
                    districtId,
                  },
                ];

              }
            )
        ).values(),
      ];


      if (
        combinations.length === 0
      ) {

        setError(
          "No active access found for this program."
        );

        return;

      }


      const confirmed =
        window.confirm(
          `Are you sure you want to revoke the entire program "${program.programName}"? This will revoke all batches and all centers under this program.`
        );


      if (!confirmed) {
        return;
      }


      try {

        setSaving(true);
        setError("");
        setMessage("");


        const results =
          await Promise.allSettled(
            combinations.map(
              (item) =>
                revokeMonitoringAccessByLevel(
                  {
                    userId:
                      selectedUser._id,

                    programId,

                    batchId:
                      item.batchId,

                    assignmentLevel:
                      "district",

                    districtId:
                      item.districtId,
                  }
                )
            )
          );


        const failed =
          results.filter(
            (result) =>
              result.status ===
              "rejected"
          );


        if (
          failed.length > 0
        ) {

          setError(
            `Program revoke completed with ${failed.length} failed operation(s).`
          );

        } else {

          setMessage(
            `Entire program "${program.programName}" has been revoked, including all batches and centers.`
          );

        }


        await refreshUserAccess();

      } catch (err) {

        console.error(
          "Failed to revoke entire program:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to revoke entire program"
        );

      } finally {

        setSaving(false);

      }

    };


  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* ======================================================
          Header
      ====================================================== */}

      <div>

        <h1 className="text-2xl font-bold text-gray-800">
          Center Monitoring Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage monitoring users and their center access.
        </p>

      </div>


      {/* ======================================================
          Messages
      ====================================================== */}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* ======================================================
          ROLE FILTER
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="max-w-md">

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Role
          </label>

          <select
            value={
              selectedRole
            }
            onChange={(
              event
            ) =>
              handleRoleChange(
                event.target.value
              )
            }
            disabled={
              loadingRoles
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          >

            <option value="">
              {loadingRoles
                ? "Loading Roles..."
                : "Select Role"}
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
                  {
                    role.roleName
                  }
                </option>

              )
            )}

          </select>

        </div>

      </div>


      {/* ======================================================
          USERS TABLE
      ====================================================== */}

      {selectedRole && (

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-5 py-4">

            <h2 className="text-base font-semibold text-gray-800">
              Monitoring Users
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {users.length} user
              {users.length !== 1
                ? "s"
                : ""} found for selected role.
            </p>

          </div>


          {loadingUsers ? (

            <div className="px-6 py-12 text-center text-sm text-gray-500">
              Loading users...
            </div>

          ) : users.length === 0 ? (

            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No active users found for this role.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px] text-left text-sm">

                <thead className="bg-gray-50 text-xs uppercase text-gray-600">

                  <tr>

                    <th className="px-5 py-3">
                      #
                    </th>

                    <th className="px-5 py-3">
                      Name
                    </th>

                    <th className="px-5 py-3">
                      Email
                    </th>

                    <th className="px-5 py-3">
                      Role
                    </th>

                    <th className="px-5 py-3 text-center">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-gray-100">

                  {users.map(
                    (
                      user,
                      index
                    ) => (

                      <tr
                        key={
                          user._id
                        }
                        className="hover:bg-gray-50"
                      >

                        <td className="px-5 py-4 text-gray-500">
                          {
                            index + 1
                          }
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-800">
                          {
                            user.name
                          }
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {
                            user.email ||
                            "-"
                          }
                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {
                              user
                                .role
                                ?.roleName ||
                              "-"
                            }
                          </span>

                        </td>

                        <td className="px-5 py-4 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              handleManageUser(
                                user
                              )
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            Manage
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}


      {/* ======================================================
          MANAGEMENT PANEL
      ====================================================== */}

      {selectedUser && (

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          {/* --------------------------------------------------
              Panel Header
          -------------------------------------------------- */}

          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

            <div>

              <h2 className="text-lg font-semibold text-gray-800">
                Manage Monitoring Access
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {
                  selectedUser.name
                }

                {selectedUser.email
                  ? ` • ${selectedUser.email}`
                  : ""}
              </p>

            </div>


            <button
              type="button"
              onClick={
                handleCloseManagement
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Close
            </button>

          </div>


          {/* --------------------------------------------------
              ASSIGNMENT
          -------------------------------------------------- */}

          <div className="border-b border-gray-200 p-5">

            <h3 className="mb-4 text-sm font-semibold text-gray-800">
              Assign Monitoring Access
            </h3>


            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

              {/* ==================================================
                  PROGRAMS
              ================================================== */}

              <MultiSelectDropdown
                label="Programs"
                options={
                  programs
                }
                value={
                  selectedProgramIds
                }
                onChange={
                  handleProgramChange
                }
                placeholder="Select Programs"
                disabled={
                  saving
                }
                getOptionValue={(
                  program
                ) =>
                  program._id
                }
                getOptionLabel={(
                  program
                ) =>
                  program.programName
                }
              />


              {/* ==================================================
                  BATCHES
              ================================================== */}

              <MultiSelectDropdown
                label="Batches"
                options={
                  availableBatches
                }
                value={
                  selectedBatchIds
                }
                onChange={
                  handleBatchChange
                }
                placeholder={
                  selectedProgramIds.length ===
                  0
                    ? "Select Programs First"
                    : "Select Batches"
                }
                disabled={
                  saving ||
                  selectedProgramIds.length ===
                    0
                }
                getOptionValue={(
                  batch
                ) =>
                  batch._id
                }
                getOptionLabel={(
                  batch
                ) =>
                  batch.batchName
                }
              />


              {/* ==================================================
                  ASSIGNMENT LEVEL
              ================================================== */}

              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Assignment Level
                </label>

                <select
                  value={
                    assignmentLevel
                  }
                  onChange={(
                    event
                  ) =>
                    handleAssignmentLevelChange(
                      event.target.value
                    )
                  }
                  disabled={
                    saving
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >

                  {
                    CENTER_MONITORING_ASSIGNMENT_LEVELS.map(
                      (level) => (

                        <option
                          key={
                            level.value
                          }
                          value={
                            level.value
                          }
                        >
                          {
                            level.label
                          }
                        </option>

                      )
                    )
                  }

                </select>

              </div>


              {/* ==================================================
                  DISTRICTS
              ================================================== */}

              <MultiSelectDropdown
                label="Districts"
                options={
                  districts || []
                }
                value={
                  selectedDistrictIds
                }
                onChange={
                  handleDistrictChange
                }
                placeholder="Select Districts"
                disabled={
                  saving ||
                  selectedProgramIds.length ===
                    0 ||
                  selectedBatchIds.length ===
                    0
                }
                getOptionValue={(
                  district
                ) =>
                  district._id
                }
                getOptionLabel={(
                  district
                ) =>
                  district.districtName
                }
              />


              {/* ==================================================
                  BLOCKS
              ================================================== */}

              {(
                assignmentLevel ===
                  "block" ||
                assignmentLevel ===
                  "center"
              ) && (

                <MultiSelectDropdown
                  label="Blocks"
                  options={
                    availableBlocks
                  }
                  value={
                    selectedBlockIds
                  }
                  onChange={
                    handleBlockChange
                  }
                  placeholder={
                    loadingCenters
                      ? "Loading Blocks..."
                      : "Select Blocks"
                  }
                  disabled={
                    saving ||
                    loadingCenters ||
                    selectedDistrictIds.length ===
                      0
                  }
                  getOptionValue={(
                    block
                  ) =>
                    block._id
                  }
                  getOptionLabel={(
                    block
                  ) =>
                    block.blockName
                  }
                />

              )}


              {/* ==================================================
                  CENTERS
              ================================================== */}

              {
                assignmentLevel ===
                  "center" && (

                  <MultiSelectDropdown
                    label="Centers"
                    options={
                      filteredCenters
                    }
                    value={
                      selectedCenterIds
                    }
                    onChange={
                      handleCenterChange
                    }
                    placeholder={
                      selectedBlockIds.length ===
                      0
                        ? "Select Blocks First"
                        : "Select Centers"
                    }
                    disabled={
                      saving ||
                      selectedBlockIds.length ===
                        0
                    }
                    getOptionValue={(
                      center
                    ) =>
                      center._id
                    }
                    getOptionLabel={(
                      center
                    ) =>
                      `${center.centerName} (${center.centerCode})`
                    }
                  />

                )
              }

            </div>


            {/* --------------------------------------------------
                Assignment Summary
            -------------------------------------------------- */}

            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">

              <p className="text-xs font-medium text-blue-800">
                Assignment Summary
              </p>

              <div className="mt-2 flex flex-wrap gap-2 text-xs text-blue-700">

                <span className="rounded-full bg-white px-3 py-1">
                  Programs:{" "}
                  {
                    selectedProgramIds.length
                  }
                </span>

                <span className="rounded-full bg-white px-3 py-1">
                  Batches:{" "}
                  {
                    selectedBatchIds.length
                  }
                </span>

                <span className="rounded-full bg-white px-3 py-1">
                  Districts:{" "}
                  {
                    selectedDistrictIds.length
                  }
                </span>

                {(
                  assignmentLevel ===
                    "block" ||
                  assignmentLevel ===
                    "center"
                ) && (

                  <span className="rounded-full bg-white px-3 py-1">
                    Blocks:{" "}
                    {
                      selectedBlockIds.length
                    }
                  </span>

                )}

                {
                  assignmentLevel ===
                    "center" && (

                    <span className="rounded-full bg-white px-3 py-1">
                      Centers:{" "}
                      {
                        selectedCenterIds.length
                      }
                    </span>

                  )
                }

              </div>

            </div>


            {/* --------------------------------------------------
                Assign Button
            -------------------------------------------------- */}

            <div className="mt-5 flex justify-end">

              <button
                type="button"
                onClick={
                  handleAssign
                }
                disabled={
                  saving ||
                  loadingCenters
                }
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {
                  saving
                    ? "Processing..."
                    : "Assign Centers"
                }
              </button>

            </div>

          </div>


          {/* ==================================================
              CURRENT ACCESS
          ================================================== */}

          <div className="p-5">

            {/* ==================================================
                BULK REVOKE
                MOVED ABOVE TABLE
            ================================================== */}

            {userAccess.length > 0 && (

              <div className="mb-6 rounded-xl border border-red-200 bg-red-50/40 p-5">

                <div>

                  <h3 className="text-base font-semibold text-gray-800">
                    Bulk Revoke Access
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Revoke access at district, batch or
                    program level. Higher-level revoke also
                    revokes everything under it.
                  </p>

                </div>


                {/* ==================================================
                    DISTRICT
                ================================================== */}

                <div className="mt-5">

                  <h4 className="mb-3 text-sm font-semibold text-gray-800">
                    District
                  </h4>

                  <div className="flex flex-wrap gap-2">

                    {revokeDistricts.map(
                      (district) => (

                        <button
                          key={
                            `district-${district._id}`
                          }
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            handleRevokeEntireDistrict(
                              district
                            )
                          }
                          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Revoke Entire{" "}
                          {
                            district.districtName
                          }
                        </button>

                      )
                    )}

                  </div>

                </div>


                {/* ==================================================
                    BATCHES
                ================================================== */}

                <div className="mt-6 border-t border-red-100 pt-5">

                  <h4 className="mb-3 text-sm font-semibold text-gray-800">
                    Batches
                  </h4>

                  <div className="flex flex-wrap gap-2">

                    {revokeBatches.map(
                      (batch) => (

                        <button
                          key={
                            `batch-${batch.programId}-${batch.batchId}`
                          }
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            handleRevokeEntireBatch(
                              batch
                            )
                          }
                          className="rounded-lg border border-orange-300 bg-white px-4 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Revoke Batch{" "}
                          {
                            batch.batchName
                          }

                          <span className="ml-1 text-[10px] opacity-70">
                            (
                            {
                              batch.programName
                            }
                            )
                          </span>

                        </button>

                      )
                    )}

                  </div>

                </div>


                {/* ==================================================
                    PROGRAMS
                ================================================== */}

                <div className="mt-6 border-t border-red-100 pt-5">

                  <h4 className="mb-3 text-sm font-semibold text-gray-800">
                    Programs
                  </h4>

                  <div className="flex flex-wrap gap-2">

                    {revokePrograms.map(
                      (program) => (

                        <button
                          key={
                            `program-${program.programId}`
                          }
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            handleRevokeEntireProgram(
                              program
                            )
                          }
                          className="rounded-lg border border-purple-300 bg-white px-4 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Revoke Entire{" "}
                          {
                            program.programName
                          }
                        </button>

                      )
                    )}

                  </div>

                </div>

              </div>

            )}


            {/* ==================================================
                CURRENT ACCESS TABLE
            ================================================== */}

            <div className="mb-4">

              <h3 className="text-sm font-semibold text-gray-800">
                Current Monitoring Access
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Individual center access can still be
                revoked from the table below.
              </p>

            </div>


            {loadingAccess ? (

              <div className="py-10 text-center text-sm text-gray-500">
                Loading current access...
              </div>

            ) : userAccess.length === 0 ? (

              <div className="rounded-lg border border-dashed border-gray-300 px-5 py-10 text-center text-sm text-gray-500">
                No active monitoring access assigned.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="bg-gray-50 text-xs uppercase text-gray-600">

                    <tr>

                      <th className="px-4 py-3">
                        Program
                      </th>

                      <th className="px-4 py-3">
                        Batch
                      </th>

                      <th className="px-4 py-3">
                        District
                      </th>

                      <th className="px-4 py-3">
                        Block
                      </th>

                      <th className="px-4 py-3">
                        Center
                      </th>

                      <th className="px-4 py-3">
                        Center Code
                      </th>

                      <th className="px-4 py-3">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-gray-100">

                    {userAccess.map(
                      (access) => (

                        <tr
                          key={
                            access._id
                          }
                          className="hover:bg-gray-50"
                        >

                          <td className="px-4 py-3">
                            {
                              access
                                .programId
                                ?.programName ||
                              "-"
                            }
                          </td>

                          <td className="px-4 py-3">
                            {
                              access
                                .batchId
                                ?.batchName ||
                              "-"
                            }
                          </td>

                          <td className="px-4 py-3">
                            {
                              access
                                .districtId
                                ?.districtName ||
                              "-"
                            }
                          </td>

                          <td className="px-4 py-3">
                            {
                              access
                                .blockId
                                ?.blockName ||
                              "-"
                            }
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {
                              access
                                .centerId
                                ?.centerName ||
                              "-"
                            }
                          </td>

                          <td className="px-4 py-3">
                            {
                              access
                                .centerId
                                ?.centerCode ||
                              "-"
                            }
                          </td>

                          <td className="px-4 py-3">

                            <button
                              type="button"
                              onClick={() =>
                                handleRevokeLevel(
                                  {
                                    programId:
                                      access
                                        .programId
                                        ?._id,

                                    batchId:
                                      access
                                        .batchId
                                        ?._id,

                                    assignmentLevel:
                                      "center",

                                    centerId:
                                      access
                                        .centerId
                                        ?._id,

                                    label:
                                      `center "${access.centerId?.centerName}"`,
                                  }
                                )
                              }
                              disabled={
                                saving
                              }
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              Revoke Center
                            </button>

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

      )}

    </div>
  );
}

export default CenterMonitoringManagement;