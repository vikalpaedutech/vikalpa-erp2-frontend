import { useEffect, useState } from "react";

import {
  onboardStudent,
} from "../../services/student.service";

import {
  getPrograms,
} from "../../services/program.service";

import {
  getBatches,
} from "../../services/batch.service";

import {
  getDistricts,
} from "../../services/district.service";

import {
  getBlocks,
} from "../../services/block.service";

import {
  getCenters,
} from "../../services/center.service";

function OnboardStudent() {
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centers, setCenters] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] =
    useState(true);

  const [formData, setFormData] = useState({
    studentSrn: "",
    rollNumber: "",
    name: "",
    fatherName: "",
    motherName: "",
    personalContact: "",
    parentContact: "",
    otherContact: "",
    dob: "",
    gender: "",
    category: "",
    address: "",
    profileImage: "",
    isActive: true,

    programId: "",
    batchId: "",
    districtId: "",
    blockId: "",
    centerId: "",
    class: "",
    board: "",
    enrollmentDate: "",
    status: "active",
    slcSubmitted: false,
    slcSubmittedAt: "",
  });

  // ============================================================
  // LOAD INITIAL DROPDOWNS
  // ============================================================

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingFilters(true);

        const [
          programsResponse,
          batchesResponse,
          districtsResponse,
        ] = await Promise.all([
          getPrograms({
            page: 1,
            limit: 100,
          }),

          getBatches({
            page: 1,
            limit: 100,
          }),

          getDistricts({
            page: 1,
            limit: 100,
          }),
        ]);

        setPrograms(
          programsResponse.data?.programs ||
            programsResponse.data ||
            []
        );

        setBatches(
          batchesResponse.data?.batches ||
            batchesResponse.data ||
            []
        );

        setDistricts(
          districtsResponse.data?.districts ||
            districtsResponse.data ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load onboarding data:",
          error
        );

        alert(
          error.response?.data?.message ||
            "Failed to load dropdown data"
        );
      } finally {
        setLoadingFilters(false);
      }
    };

    loadInitialData();
  }, []);

  // ============================================================
  // LOAD BLOCKS
  // ============================================================

  useEffect(() => {
    const loadBlocks = async () => {
      if (!formData.districtId) {
        setBlocks([]);
        return;
      }

      try {
        const response = await getBlocks({
          page: 1,
          limit: 100,
          districtId: formData.districtId,
        });

        setBlocks(
          response.data?.blocks ||
            response.data ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load blocks:",
          error
        );

        setBlocks([]);
      }
    };

    loadBlocks();
  }, [formData.districtId]);

  // ============================================================
  // LOAD CENTERS
  // ============================================================

  useEffect(() => {
    const loadCenters = async () => {
      if (!formData.blockId) {
        setCenters([]);
        return;
      }

      try {
        const response = await getCenters({
          page: 1,
          limit: 100,
          blockId: formData.blockId,
        });

        setCenters(
          response.data?.centers ||
            response.data ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load centers:",
          error
        );

        setCenters([]);
      }
    };

    loadCenters();
  }, [formData.blockId]);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  // ============================================================
  // DISTRICT CHANGE
  // ============================================================

  const handleDistrictChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      districtId: value,
      blockId: "",
      centerId: "",
    }));

    setBlocks([]);
    setCenters([]);
  };

  // ============================================================
  // BLOCK CHANGE
  // ============================================================

  const handleBlockChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      blockId: value,
      centerId: "",
    }));

    setCenters([]);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const payload = {
        student: {
          studentSrn: formData.studentSrn.trim(),
          rollNumber:
            formData.rollNumber.trim(),
          name: formData.name.trim(),
          fatherName:
            formData.fatherName.trim(),
          motherName:
            formData.motherName.trim(),
          personalContact:
            formData.personalContact.trim(),
          parentContact:
            formData.parentContact.trim(),
          otherContact:
            formData.otherContact.trim(),
          dob: formData.dob || undefined,
          gender: formData.gender,
          category: formData.category,
          address: formData.address.trim(),
          profileImage:
            formData.profileImage.trim(),
          isActive: formData.isActive,
        },

        enrollment: {
          programId: formData.programId,
          batchId: formData.batchId,
          districtId: formData.districtId,
          blockId: formData.blockId,
          centerId: formData.centerId,
          class: formData.class,
          board: formData.board,
          enrollmentDate:
            formData.enrollmentDate ||
            undefined,
          status: formData.status,
          slcSubmitted:
            formData.slcSubmitted,
          slcSubmittedAt:
            formData.slcSubmittedAt ||
            undefined,
        },
      };

      const response =
        await onboardStudent(payload);

      alert(
        response.message ||
          "Student onboarded successfully"
      );

      // Reset form
      setFormData({
        studentSrn: "",
        rollNumber: "",
        name: "",
        fatherName: "",
        motherName: "",
        personalContact: "",
        parentContact: "",
        otherContact: "",
        dob: "",
        gender: "",
        category: "",
        address: "",
        profileImage: "",
        isActive: true,

        programId: "",
        batchId: "",
        districtId: "",
        blockId: "",
        centerId: "",
        class: "",
        board: "",
        enrollmentDate: "",
        status: "active",
        slcSubmitted: false,
        slcSubmittedAt: "",
      });

      setBlocks([]);
      setCenters([]);
    } catch (error) {
      console.error(
        "Failed to onboard student:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to onboard student"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Onboard Student
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a new student and create their enrollment
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ====================================================
            PERSONAL DETAILS
        ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Personal Details
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Student SRN *
              </label>

              <input
                type="text"
                name="studentSrn"
                value={formData.studentSrn}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Enter SRN"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Roll Number
              </label>

              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Enter roll number"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Student name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Father Name
              </label>

              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Father name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mother Name
              </label>

              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Mother name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date of Birth
              </label>

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              >
                <option value="">
                  Select Gender
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Category"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Profile Image URL
              </label>

              <input
                type="text"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Image URL"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              placeholder="Student address"
            />
          </div>
        </div>

        {/* ====================================================
            CONTACT DETAILS
        ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Contact Details
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Personal Contact
              </label>

              <input
                type="text"
                name="personalContact"
                value={
                  formData.personalContact
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Personal contact"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Parent Contact
              </label>

              <input
                type="text"
                name="parentContact"
                value={formData.parentContact}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Parent contact"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Other Contact
              </label>

              <input
                type="text"
                name="otherContact"
                value={formData.otherContact}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Other contact"
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            ENROLLMENT DETAILS
        ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Enrollment Details
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Program */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Program *
              </label>

              <select
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                required
                disabled={loadingFilters}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
              >
                <option value="">
                  Select Program
                </option>

                {programs.map((program) => (
                  <option
                    key={program._id}
                    value={program._id}
                  >
                    {program.programName}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Batch *
              </label>

              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                required
                disabled={loadingFilters}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
              >
                <option value="">
                  Select Batch
                </option>

                {batches.map((batch) => (
                  <option
                    key={batch._id}
                    value={batch._id}
                  >
                    {batch.batchName}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                District *
              </label>

              <select
                name="districtId"
                value={formData.districtId}
                onChange={handleDistrictChange}
                required
                disabled={loadingFilters}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
              >
                <option value="">
                  Select District
                </option>

                {districts.map((district) => (
                  <option
                    key={district._id}
                    value={district._id}
                  >
                    {district.districtName}
                  </option>
                ))}
              </select>
            </div>

            {/* Block */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Block *
              </label>

              <select
                name="blockId"
                value={formData.blockId}
                onChange={handleBlockChange}
                required
                disabled={!formData.districtId}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
              >
                <option value="">
                  Select Block
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

            {/* Center */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Center *
              </label>

              <select
                name="centerId"
                value={formData.centerId}
                onChange={handleChange}
                required
                disabled={!formData.blockId}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
              >
                <option value="">
                  Select Center
                </option>

                {centers.map((center) => (
                  <option
                    key={center._id}
                    value={center._id}
                  >
                    {center.centerName}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Class *
              </label>

              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              >
                <option value="">
                  Select Class
                </option>

                <option value="9">
                  9
                </option>

                <option value="10">
                  10
                </option>

                <option value="11">
                  11
                </option>

                <option value="12">
                  12
                </option>
              </select>
            </div>

            {/* Board */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Board
              </label>

              <input
                type="text"
                name="board"
                value={formData.board}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                placeholder="Board"
              />
            </div>

            {/* Enrollment Date */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Enrollment Date
              </label>

              <input
                type="date"
                name="enrollmentDate"
                value={
                  formData.enrollmentDate
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              />
            </div>

            {/* Enrollment Status */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Enrollment Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              >
                <option value="active">
                  Active
                </option>

                <option value="provisional">
                  Provisional
                </option>

                <option value="requested-slc">
                  Requested SLC
                </option>

                <option value="add-request">
                  Add Request
                </option>

                <option value="remove-request">
                  Remove Request
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="left">
                  Left
                </option>

                <option value="transfer-student">
                  Transfer Student
                </option>
              </select>
            </div>
          </div>

          {/* SLC */}

          <div className="mt-5 flex items-center gap-3">
            <input
              type="checkbox"
              name="slcSubmitted"
              checked={
                formData.slcSubmitted
              }
              onChange={handleChange}
              className="h-4 w-4"
            />

            <label className="text-sm font-medium text-gray-700">
              SLC Submitted
            </label>
          </div>

          {formData.slcSubmitted && (
            <div className="mt-4 max-w-md">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                SLC Submitted At
              </label>

              <input
                type="date"
                name="slcSubmittedAt"
                value={
                  formData.slcSubmittedAt
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              />
            </div>
          )}
        </div>

        {/* ====================================================
            ACTIVE
        ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4"
            />

            <span className="text-sm font-medium text-gray-700">
              Student is Active
            </span>
          </label>
        </div>

        {/* ====================================================
            SUBMIT
        ==================================================== */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Onboarding..."
              : "Onboard Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OnboardStudent;