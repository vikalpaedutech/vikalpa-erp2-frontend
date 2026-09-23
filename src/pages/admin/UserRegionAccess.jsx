import { useEffect, useState } from "react";

import { getUsers } from "../../services/user.service";

import { getDistricts } from "../../services/district.service";
import { getBlocks } from "../../services/block.service";
import { getCenters } from "../../services/center.service";

import {
  getUserRegionAccessByUserId,
  createUserRegionAccess,
  deleteUserRegionAccess,
} from "../../services/userRegionAccess.service";

function UserRegionAccess() {
  const [users, setUsers] = useState([]);

  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centers, setCenters] = useState([]);

  const [search, setSearch] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDistricts, setLoadingDistricts] =
    useState(false);
  const [loadingBlocks, setLoadingBlocks] =
    useState(false);
  const [loadingCenters, setLoadingCenters] =
    useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [regionAccess, setRegionAccess] = useState([]);

  const [loadingAccess, setLoadingAccess] =
    useState(false);

  const [scope, setScope] = useState("global");

  const [selectedDistrict, setSelectedDistrict] =
    useState("");

  const [selectedBlock, setSelectedBlock] =
    useState("");

  const [selectedCenter, setSelectedCenter] =
    useState("");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // -----------------------------------------
  // Fetch Users
  // -----------------------------------------

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError("");

      const response = await getUsers({
        page: 1,
        limit: 100,
        search: search.trim(),
        isActive: "true",
      });

      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch users"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // -----------------------------------------
  // Fetch Districts
  // -----------------------------------------

  const fetchDistricts = async () => {
    try {
      setLoadingDistricts(true);

      const response = await getDistricts({
        page: 1,
        limit: 100,
      });

      setDistricts(response.data.districts || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch districts"
      );
    } finally {
      setLoadingDistricts(false);
    }
  };

  // -----------------------------------------
  // Fetch Blocks
  // -----------------------------------------

  const fetchBlocks = async (districtId) => {
    if (!districtId) {
      setBlocks([]);
      return;
    }

    try {
      setLoadingBlocks(true);

      const response = await getBlocks({
        page: 1,
        limit: 100,
        districtId,
      });

      setBlocks(response.data.blocks || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch blocks"
      );

      setBlocks([]);
    } finally {
      setLoadingBlocks(false);
    }
  };

  // -----------------------------------------
  // Fetch Centers
  // -----------------------------------------

  const fetchCenters = async (blockId) => {
    if (!blockId) {
      setCenters([]);
      return;
    }

    try {
      setLoadingCenters(true);

      const response = await getCenters({
        page: 1,
        limit: 100,
        blockId,
      });

      setCenters(response.data.centers || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch centers"
      );

      setCenters([]);
    } finally {
      setLoadingCenters(false);
    }
  };

  // -----------------------------------------
  // Initial Load
  // -----------------------------------------

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    fetchDistricts();
  }, []);

  // -----------------------------------------
  // Open Manage Access
  // -----------------------------------------

  const handleManageAccess = async (user) => {
    setSelectedUser(user);

    setScope("global");

    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedCenter("");

    setRegionAccess([]);
    setError("");

    try {
      setLoadingAccess(true);

      const response =
        await getUserRegionAccessByUserId(
          user._id
        );

      setRegionAccess(response.data || []);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch region access"
        );
      }

      setRegionAccess([]);
    } finally {
      setLoadingAccess(false);
    }
  };

  // -----------------------------------------
  // Close Modal
  // -----------------------------------------

  const handleCloseModal = () => {
    setSelectedUser(null);

    setRegionAccess([]);

    setScope("global");

    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedCenter("");

    setBlocks([]);
    setCenters([]);

    setError("");
  };

  // -----------------------------------------
  // Scope Change
  // -----------------------------------------

  const handleScopeChange = (e) => {
    const newScope = e.target.value;

    setScope(newScope);

    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedCenter("");

    setBlocks([]);
    setCenters([]);
  };

  // -----------------------------------------
  // District Change
  // -----------------------------------------

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;

    setSelectedDistrict(districtId);
    setSelectedBlock("");
    setSelectedCenter("");

    setBlocks([]);
    setCenters([]);

    if (
      scope === "block" ||
      scope === "center"
    ) {
      await fetchBlocks(districtId);
    }
  };

  // -----------------------------------------
  // Block Change
  // -----------------------------------------

  const handleBlockChange = async (e) => {
    const blockId = e.target.value;

    setSelectedBlock(blockId);
    setSelectedCenter("");

    setCenters([]);

    if (scope === "center") {
      await fetchCenters(blockId);
    }
  };

  // -----------------------------------------
  // Create Access
  // -----------------------------------------

  const handleAddAccess = async () => {
    if (!selectedUser) {
      return;
    }

    const accessData = {
      userId: selectedUser._id,
      scope,
    };

    if (scope === "district") {
      if (!selectedDistrict) {
        setError("Please select a district.");
        return;
      }

      accessData.districtId = selectedDistrict;
    }

    if (scope === "block") {
      if (!selectedBlock) {
        setError("Please select a block.");
        return;
      }

      accessData.blockId = selectedBlock;
    }

    if (scope === "center") {
      if (!selectedCenter) {
        setError("Please select a center.");
        return;
      }

      accessData.centerId = selectedCenter;
    }

    try {
      setSaving(true);
      setError("");

      await createUserRegionAccess(
        accessData
      );

      const response =
        await getUserRegionAccessByUserId(
          selectedUser._id
        );

      setRegionAccess(response.data || []);

      setScope("global");

      setSelectedDistrict("");
      setSelectedBlock("");
      setSelectedCenter("");

      setBlocks([]);
      setCenters([]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add region access"
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // Delete Access
  // -----------------------------------------

  const handleDeleteAccess = async (
    accessId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this region access?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteUserRegionAccess(
        accessId
      );

      setRegionAccess((previous) =>
        previous.filter(
          (item) => item._id !== accessId
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to remove region access"
      );
    }
  };

  // -----------------------------------------
  // Render Access Name
  // -----------------------------------------

  const getAccessName = (access) => {
    if (access.scope === "global") {
      return "All Regions";
    }

    if (access.scope === "district") {
      return (
        access.districtId?.districtName ||
        "-"
      );
    }

    if (access.scope === "block") {
      return (
        access.blockId?.blockName ||
        "-"
      );
    }

    if (access.scope === "center") {
      return (
        access.centerId?.centerName ||
        "-"
      );
    }

    return "-";
  };

  // -----------------------------------------
  // Render Scope Badge
  // -----------------------------------------

  const getScopeBadge = (accessScope) => {
    const classes = {
      global:
        "bg-purple-100 text-purple-700",
      district:
        "bg-blue-100 text-blue-700",
      block:
        "bg-green-100 text-green-700",
      center:
        "bg-orange-100 text-orange-700",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          classes[accessScope] ||
          "bg-gray-100 text-gray-700"
        }`}
      >
        {accessScope
          ?.charAt(0)
          .toUpperCase() +
          accessScope?.slice(1)}
      </span>
    );
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          User Region Access
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage geographic access assigned to users
        </p>
      </div>


      {/* Search */}
      <div className="bg-white rounded-lg shadow p-5 mb-5">

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Users
        </label>

        <div className="relative max-w-xl">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by name, email or contact..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          )}

        </div>

      </div>


      {/* Error */}
      {error && !selectedUser && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-5">
          {error}
        </div>
      )}


      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">

        <div className="px-5 py-4 border-b">

          <h2 className="font-semibold text-gray-800">
            Users
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            {users.length} users found
          </p>

        </div>


        {loadingUsers ? (
          <div className="p-10 text-center text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    User
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Email
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Contact
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    User ID
                  </th>

                  <th className="text-right px-5 py-3 font-semibold text-gray-600">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {users.map((user) => (

                  <tr
                    key={user._id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <img
                          src={
                            user.profileimage?.url ||
                            "https://placehold.co/40x40"
                          }
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border"
                        />

                        <span className="font-medium text-gray-800">
                          {user.name || "-"}
                        </span>

                      </div>

                    </td>


                    <td className="px-5 py-4 text-gray-600">
                      {user.email || "-"}
                    </td>


                    <td className="px-5 py-4 text-gray-600">
                      {user.contact || "-"}
                    </td>


                    <td className="px-5 py-4">

                      {user.userId ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {user.userId}
                        </span>
                      ) : (
                        "-"
                      )}

                    </td>


                    <td className="px-5 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          handleManageAccess(user)
                        }
                        className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                      >
                        Manage Access
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* Manage Access Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Manage Region Access
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  {selectedUser.name || "-"}
                </p>

                <p className="text-xs text-gray-400">
                  {selectedUser.email || "-"}
                </p>

              </div>


              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>

            </div>


            {/* Error */}
            {error && (
              <div className="mx-6 mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}


            {loadingAccess ? (
              <div className="p-10 text-center text-gray-500">
                Loading region access...
              </div>
            ) : (
              <div className="p-6">

                {/* Add Access */}
                <div className="border rounded-lg p-5 mb-6">

                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Add Region Access
                  </h3>


                  {/* Scope */}
                  <div className="mb-4">

                    <label className="block text-sm text-gray-600 mb-2">
                      Scope
                    </label>

                    <select
                      value={scope}
                      onChange={handleScopeChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    >

                      <option value="global">
                        Global
                      </option>

                      <option value="district">
                        District
                      </option>

                      <option value="block">
                        Block
                      </option>

                      <option value="center">
                        Center
                      </option>

                    </select>

                  </div>


                  {/* District */}
                  {(scope === "district" ||
                    scope === "block" ||
                    scope === "center") && (
                    <div className="mb-4">

                      <label className="block text-sm text-gray-600 mb-2">
                        District
                      </label>

                      <select
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={loadingDistricts}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >

                        <option value="">
                          {loadingDistricts
                            ? "Loading districts..."
                            : "-- Select District --"}
                        </option>

                        {districts.map(
                          (district) => (
                            <option
                              key={district._id}
                              value={district._id}
                            >
                              {
                                district.districtName
                              }
                            </option>
                          )
                        )}

                      </select>

                    </div>
                  )}


                  {/* Block */}
                  {(scope === "block" ||
                    scope === "center") && (
                    <div className="mb-4">

                      <label className="block text-sm text-gray-600 mb-2">
                        Block
                      </label>

                      <select
                        value={selectedBlock}
                        onChange={handleBlockChange}
                        disabled={
                          !selectedDistrict ||
                          loadingBlocks
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >

                        <option value="">
                          {!selectedDistrict
                            ? "-- Select District First --"
                            : loadingBlocks
                            ? "Loading blocks..."
                            : "-- Select Block --"}
                        </option>

                        {blocks.map((block) => (
                          <option
                            key={block._id}
                            value={block._id}
                          >
                            {block.blockName}
                          </option>
                        ))}

                      </select>

                    </div>
                  )}


                  {/* Center */}
                  {scope === "center" && (
                    <div className="mb-4">

                      <label className="block text-sm text-gray-600 mb-2">
                        Center
                      </label>

                      <select
                        value={selectedCenter}
                        onChange={(e) =>
                          setSelectedCenter(
                            e.target.value
                          )
                        }
                        disabled={
                          !selectedBlock ||
                          loadingCenters
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >

                        <option value="">
                          {!selectedBlock
                            ? "-- Select Block First --"
                            : loadingCenters
                            ? "Loading centers..."
                            : "-- Select Center --"}
                        </option>

                        {centers.map((center) => (
                          <option
                            key={center._id}
                            value={center._id}
                          >
                            {center.centerName}
                            {center.centerCode
                              ? ` (${center.centerCode})`
                              : ""}
                          </option>
                        ))}

                      </select>

                    </div>
                  )}


                  <button
                    type="button"
                    onClick={handleAddAccess}
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? "Adding..."
                      : "Add Access"}
                  </button>

                </div>


                {/* Existing Access */}
                <div>

                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Existing Region Access
                  </h3>


                  {regionAccess.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                      No region access assigned to this user.
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">

                      <table className="w-full text-sm">

                        <thead className="bg-gray-50 border-b">

                          <tr>

                            <th className="text-left px-4 py-3 font-semibold text-gray-600">
                              Scope
                            </th>

                            <th className="text-left px-4 py-3 font-semibold text-gray-600">
                              Access
                            </th>

                            <th className="text-right px-4 py-3 font-semibold text-gray-600">
                              Action
                            </th>

                          </tr>

                        </thead>


                        <tbody className="divide-y">

                          {regionAccess.map(
                            (access) => (

                              <tr
                                key={access._id}
                                className="hover:bg-gray-50"
                              >

                                <td className="px-4 py-3">
                                  {getScopeBadge(
                                    access.scope
                                  )}
                                </td>


                                <td className="px-4 py-3 text-gray-700">
                                  {getAccessName(
                                    access
                                  )}
                                </td>


                                <td className="px-4 py-3 text-right">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteAccess(
                                        access._id
                                      )
                                    }
                                    className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                  >
                                    Remove
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


            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end">

              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default UserRegionAccess;