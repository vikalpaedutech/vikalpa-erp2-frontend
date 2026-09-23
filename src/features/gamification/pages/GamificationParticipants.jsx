import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../../../services/user.service";
import { getUsersByRole } from "../../../services/userRole.service";
import { getActivePrograms } from "../../../services/program.service";
import { getActiveBatches } from "../../../services/batch.service";
import { getAvailableCenters } from "../../../services/center.service";
import {
  getGamificationRoles,
  getGamificationParticipants,
  saveGamificationParticipant,
  deleteGamificationParticipant,
} from "../services/gamification.service";

const unwrapList = (response, key) => {
  const root = response?.data ?? response;

  if (Array.isArray(root)) return root;

  if (key && Array.isArray(root?.[key])) {
    return root[key];
  }

  if (Array.isArray(root?.data)) {
    return root.data;
  }

  if (key && Array.isArray(root?.data?.[key])) {
    return root.data[key];
  }

  return [];
};

const emptyAssignment = () => ({
  programId: "",
  batchId: "",
  centerId: "",
});

export default function GamificationParticipants() {
  const [roles, setRoles] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [centers, setCenters] = useState([]);

  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [participantUserId, setParticipantUserId] =
    useState("");

  const [assignments, setAssignments] = useState([
    emptyAssignment(),
  ]);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      /*
       * First load all basic data.
       *
       * IMPORTANT:
       * We do NOT depend on the paginated /user-roles endpoint
       * anymore for eligibility.
       */
      const [
        rolesResponse,
        participantsResponse,
        usersResponse,
        programsResponse,
        batchesResponse,
        centersResponse,
      ] = await Promise.all([
        getGamificationRoles(),
        getGamificationParticipants(),
        getUsers({
          page: 1,
          limit: 100,
          isActive: true,
        }),
        getActivePrograms(),
        getActiveBatches(),
        getAvailableCenters(),
      ]);

      const loadedRoles = unwrapList(rolesResponse);
      const loadedParticipants =
        unwrapList(participantsResponse);

      const loadedUsers = unwrapList(
        usersResponse,
        "users"
      );

      const loadedPrograms =
        unwrapList(programsResponse);

      const loadedBatches =
        unwrapList(batchesResponse);

      const loadedCenters =
        unwrapList(centersResponse);

      /*
       * Only enabled gamification roles are relevant
       * for participant eligibility.
       */
      const enabledRoles = loadedRoles.filter(
        (role) => role.isAllowed
      );

      /*
       * Fetch users role-by-role.
       *
       * This fixes the previous problem where only the first
       * 100 UserRole records were loaded.
       */
      const roleUserResponses = await Promise.all(
        enabledRoles.map(async (role) => {
          try {
            const response = await getUsersByRole(
              role._id
            );

            return {
              role,
              rows: unwrapList(response),
            };
          } catch (roleError) {
            console.error(
              `Failed to load users for role ${role.roleName}:`,
              roleError
            );

            return {
              role,
              rows: [],
            };
          }
        })
      );

      /*
       * Build complete UserRole mapping.
       *
       * Each row returned by getUsersByRole looks like:
       *
       * {
       *   userId: {...},
       *   roleId: {...}
       * }
       *
       * We normalize it so the rest of the page can work
       * with the same roleMap structure.
       */
      const roleBasedUserRoles = [];

      roleUserResponses.forEach(
        ({ role, rows }) => {
          rows.forEach((item) => {
            const user =
              item.userId &&
              typeof item.userId === "object"
                ? item.userId
                : null;

            const userId =
              user?._id || item.userId;

            if (!userId) return;

            /*
             * Respect both UserRole.isActive and
             * User.isActive.
             */
            if (item.isActive === false) {
              return;
            }

            if (user?.isActive === false) {
              return;
            }

            roleBasedUserRoles.push({
              ...item,
              userId: user || item.userId,
              roleId: role,
            });
          });
        }
      );

      /*
       * Build a complete user list.
       *
       * We merge:
       * 1. Normal user API users
       * 2. Users returned by enabled-role APIs
       * 3. Existing participant users
       *
       * This is important because a participant may not be
       * present in the first 100 users returned by getUsers().
       */
      const userMap = new Map();

      loadedUsers.forEach((user) => {
        if (user?._id) {
          userMap.set(String(user._id), user);
        }
      });

      roleBasedUserRoles.forEach((item) => {
        const user = item.userId;

        if (user?._id) {
          userMap.set(String(user._id), user);
        }
      });

      loadedParticipants.forEach((participant) => {
        const user = participant.userId;

        if (
          user &&
          typeof user === "object" &&
          user._id
        ) {
          userMap.set(String(user._id), user);
        }
      });

      setRoles(loadedRoles);
      setParticipants(loadedParticipants);
      setUsers(Array.from(userMap.values()));
      setUserRoles(roleBasedUserRoles);
      setPrograms(loadedPrograms);
      setBatches(loadedBatches);
      setCenters(loadedCenters);
    } catch (e) {
      console.error(
        "Gamification participants load error:",
        e
      );

      setError(
        e.response?.data?.message ||
          "Failed to load gamification participants."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /*
   * IDs of roles which are currently allowed
   * for gamification.
   */
  const enabledRoleIds = useMemo(
    () =>
      new Set(
        roles
          .filter((role) => role.isAllowed)
          .map((role) =>
            String(role._id)
          )
      ),
    [roles]
  );

  /*
   * Map:
   *
   * userId -> [role1, role2, ...]
   */
  const roleMap = useMemo(() => {
    const map = new Map();

    userRoles.forEach((item) => {
      const userId =
        item.userId?._id ||
        item.userId;

      const roleId =
        item.roleId?._id ||
        item.roleId;

      const role = item.roleId;

      if (!userId || !roleId) {
        return;
      }

      const key = String(userId);

      const current =
        map.get(key) || [];

      const alreadyExists =
        current.some(
          (existing) =>
            String(
              existing?._id ||
                existing
            ) === String(roleId)
        );

      if (!alreadyExists) {
        current.push(
          role || roleId
        );
      }

      map.set(key, current);
    });

    return map;
  }, [userRoles]);

  /*
   * Eligible users:
   *
   * A user is eligible when at least one of their
   * active roles is enabled for gamification.
   */
  const eligibleUsers = useMemo(() => {
    const result = users.filter((user) => {
      const assignedRoles =
        roleMap.get(
          String(user._id)
        ) || [];

      return assignedRoles.some(
        (role) =>
          enabledRoleIds.has(
            String(
              role?._id || role
            )
          )
      );
    });

    /*
     * Sort users alphabetically for easier admin selection.
     */
    return [...result].sort((a, b) =>
      String(a?.name || "").localeCompare(
        String(b?.name || "")
      )
    );
  }, [
    users,
    roleMap,
    enabledRoleIds,
  ]);

  /*
   * Participants filtered by selected role.
   */
  const filteredParticipants =
    useMemo(() => {
      if (roleFilter === "all") {
        return participants;
      }

      return participants.filter(
        (participant) => {
          const userId =
            participant.userId?._id ||
            participant.userId;

          const assignedRoles =
            roleMap.get(
              String(userId)
            ) || [];

          return assignedRoles.some(
            (role) =>
              String(
                role?._id || role
              ) ===
              String(roleFilter)
          );
        }
      );
    }, [
      participants,
      roleFilter,
      roleMap,
    ]);

  /*
   * Existing participant IDs.
   */
  const participantUserIds =
    useMemo(
      () =>
        new Set(
          participants.map(
            (participant) =>
              String(
                participant.userId?._id ||
                  participant.userId
              )
          )
        ),
      [participants]
    );

  const addAssignment = () => {
    setAssignments((current) => [
      ...current,
      emptyAssignment(),
    ]);
  };

  const removeAssignment = (index) => {
    setAssignments((current) =>
      current.length === 1
        ? current
        : current.filter(
            (_, itemIndex) =>
              itemIndex !== index
          )
    );
  };

  const updateAssignment = (
    index,
    key,
    value
  ) => {
    setAssignments((current) =>
      current.map(
        (assignment, itemIndex) =>
          itemIndex === index
            ? {
                ...assignment,
                [key]: value,
                /*
                 * If program changes, reset batch
                 * because batch belongs to program.
                 */
                ...(key === "programId"
                  ? {
                      batchId: "",
                    }
                  : {}),
              }
            : assignment
      )
    );
  };

  const openAddModal = () => {
    setParticipantUserId("");

    setAssignments([
      emptyAssignment(),
    ]);

    setError("");
    setMessage("");

    setModalOpen(true);
  };

  const openEditModal = (
    participant
  ) => {
    const userId =
      participant.userId?._id ||
      participant.userId ||
      "";

    setParticipantUserId(
      String(userId)
    );

    const existingAssignments =
      (participant.assignments || [])
        .map((assignment) => ({
          programId:
            assignment.programId?._id ||
            assignment.programId ||
            "",

          batchId:
            assignment.batchId?._id ||
            assignment.batchId ||
            "",

          centerId:
            assignment.centerId?._id ||
            assignment.centerId ||
            "",
        }));

    setAssignments(
      existingAssignments.length
        ? existingAssignments
        : [emptyAssignment()]
    );

    setError("");
    setMessage("");

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setError("");
  };

  const saveParticipant = async (
    event
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveGamificationParticipant({
        userId: participantUserId,
        assignments,
        isActive: true,
      });

      setMessage(
        "Gamification participant saved successfully."
      );

      setModalOpen(false);

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to save participant."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeParticipant = async (
    participant
  ) => {
    if (
      !window.confirm(
        `Remove ${
          participant.userId?.name ||
          "this user"
        } from gamification?`
      )
    ) {
      return;
    }

    setDeletingId(
      participant._id
    );

    setError("");
    setMessage("");

    try {
      await deleteGamificationParticipant(
        participant._id
      );

      setMessage(
        "Gamification participant removed successfully."
      );

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to remove participant."
      );
    } finally {
      setDeletingId("");
    }
  };

  const selectedUser =
    users.find(
      (user) =>
        String(user._id) ===
        String(participantUserId)
    );

  const getRoleNames = (
    userId
  ) => {
    const assignedRoles =
      roleMap.get(
        String(userId)
      ) || [];

    return assignedRoles
      .map(
        (role) =>
          role?.roleName ||
          role?.roleCode ||
          "-"
      )
      .join(", ");
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Gamification Participants
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Filter participants by role and
            view or manage their gamification
            assignments.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + Add Participant
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && !modalOpen && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ROLE FILTER */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Role-wise Participants
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Select a role to see users configured
              for that role.
            </p>
          </div>

          <div className="w-full min-w-[240px] sm:w-auto">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Filter by Role
            </label>

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            >
              <option value="all">
                All Roles
              </option>

              {roles
                .filter(
                  (role) =>
                    role.isAllowed
                )
                .map((role) => (
                  <option
                    key={role._id}
                    value={role._id}
                  >
                    {role.roleName}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </section>

      {/* PARTICIPANTS TABLE */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading participants...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-3 py-3">
                    User
                  </th>

                  <th className="px-3 py-3">
                    Role
                  </th>

                  <th className="px-3 py-3">
                    Assignments
                  </th>

                  <th className="px-3 py-3">
                    Status
                  </th>

                  <th className="px-3 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredParticipants.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-3 py-10 text-center text-gray-500"
                    >
                      No gamification participants
                      found for this role.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map(
                    (participant) => {
                      const userId =
                        participant.userId?._id ||
                        participant.userId;

                      return (
                        <tr
                          key={
                            participant._id
                          }
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-3 py-3">
                            <div className="font-semibold text-slate-800">
                              {participant.userId
                                ?.name || "-"}
                            </div>

                            <div className="text-xs text-slate-400">
                              {participant
                                .userId
                                ?.userId ||
                                participant
                                  .userId
                                  ?.email ||
                                "-"}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-xs text-slate-500">
                            {getRoleNames(
                              userId
                            ) || "-"}
                          </td>

                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              {(
                                participant.assignments ||
                                []
                              ).map(
                                (
                                  assignment,
                                  index
                                ) => (
                                  <div
                                    key={
                                      assignment._id ||
                                      index
                                    }
                                    className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-slate-100"
                                  >
                                    {assignment
                                      .programId
                                      ?.programName ||
                                      "-"}
                                    {" / "}
                                    {assignment
                                      .batchId
                                      ?.batchName ||
                                      "-"}
                                    {" / "}
                                    {assignment
                                      .centerId
                                      ?.centerName ||
                                      "-"}
                                  </div>
                                )
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                participant.isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {participant.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() =>
                                openEditModal(
                                  participant
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              View / Update
                            </button>

                            <button
                              onClick={() =>
                                removeParticipant(
                                  participant
                                )
                              }
                              disabled={
                                deletingId ===
                                participant._id
                              }
                              className="ml-2 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                            >
                              {deletingId ===
                              participant._id
                                ? "Removing..."
                                : "Remove"}
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {participantUserIds.has(
                    String(
                      participantUserId
                    )
                  )
                    ? "Update Gamification Participant"
                    : "Add Gamification Participant"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Configure the user's program,
                  batch and center assignments.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-3 py-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={saveParticipant}
              className="space-y-5 p-5 sm:p-6"
            >
              {/* MODAL ERROR */}
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {/* USER */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Eligible User
                </label>

                <select
                  value={
                    participantUserId
                  }
                  onChange={(e) =>
                    setParticipantUserId(
                      e.target.value
                    )
                  }
                  required
                  disabled={participantUserIds.has(
                    String(
                      participantUserId
                    )
                  )}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="">
                    Select eligible user
                  </option>

                  {eligibleUsers.map(
                    (user) => (
                      <option
                        key={user._id}
                        value={user._id}
                      >
                        {user.name} (
                        {user.userId}) —{" "}
                        {getRoleNames(
                          user._id
                        ) || "-"}
                      </option>
                    )
                  )}
                </select>

                {/* IMPORTANT EMPTY STATE */}
                {eligibleUsers.length ===
                  0 && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                    <p className="font-semibold">
                      No eligible users found.
                    </p>

                    <p className="mt-1">
                      Please enable at least one
                      role from{" "}
                      <strong>
                        Gamification Eligible
                        Roles
                      </strong>{" "}
                      and make sure users are
                      assigned to that role.
                    </p>
                  </div>
                )}

                {selectedUser && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected:{" "}
                    {selectedUser.name} —{" "}
                    {selectedUser.email}
                  </p>
                )}
              </div>

              {/* ASSIGNMENTS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Program / Batch / Center
                      Assignments
                    </h3>

                    <p className="text-xs text-slate-400">
                      Add one or multiple assignments
                      for this participant.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      addAssignment
                    }
                    className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    + Add Assignment
                  </button>
                </div>

                {assignments.map(
                  (
                    assignment,
                    index
                  ) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4"
                    >
                      {/* PROGRAM */}
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Program
                        </label>

                        <select
                          value={
                            assignment.programId
                          }
                          onChange={(e) =>
                            updateAssignment(
                              index,
                              "programId",
                              e.target.value
                            )
                          }
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        >
                          <option value="">
                            Select Program
                          </option>

                          {programs.map(
                            (
                              program
                            ) => (
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

                      {/* BATCH */}
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Batch
                        </label>

                        <select
                          value={
                            assignment.batchId
                          }
                          onChange={(e) =>
                            updateAssignment(
                              index,
                              "batchId",
                              e.target.value
                            )
                          }
                          required
                          disabled={
                            !assignment.programId
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100"
                        >
                          <option value="">
                            Select Batch
                          </option>

                          {batches
                            .filter(
                              (
                                batch
                              ) =>
                                String(
                                  batch.programId?._id ||
                                    batch.programId
                                ) ===
                                String(
                                  assignment.programId
                                )
                            )
                            .map(
                              (
                                batch
                              ) => (
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

                      {/* CENTER */}
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Center
                        </label>

                        <select
                          value={
                            assignment.centerId
                          }
                          onChange={(e) =>
                            updateAssignment(
                              index,
                              "centerId",
                              e.target.value
                            )
                          }
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        >
                          <option value="">
                            Select Center
                          </option>

                          {centers.map(
                            (
                              center
                            ) => (
                              <option
                                key={
                                  center._id
                                }
                                value={
                                  center._id
                                }
                              >
                                {
                                  center.centerName
                                }{" "}
                                (
                                {
                                  center.centerCode
                                }
                                )
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* REMOVE */}
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            removeAssignment(
                              index
                            )
                          }
                          disabled={
                            assignments.length ===
                            1
                          }
                          className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remove Assignment
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    eligibleUsers.length ===
                      0
                  }
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Participant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}