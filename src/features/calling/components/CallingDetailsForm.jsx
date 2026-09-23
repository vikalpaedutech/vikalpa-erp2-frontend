import { useEffect, useState } from "react";

import {
    createCallingDetails,
    updateCallingDetails,
} from "../services/calling.service";

import {
    getStudents,
    getStudentEnrollments,
} from "../../students/services/student.service";

import { getUsers } from "../../../services/user.service";

import { getDistricts } from "../../../services/district.service";

import {
    getBlocksByDistrict,
} from "../../../services/block.service";

import {
    getCentersByBlock,
} from "../../../services/center.service";


const defaultFormData = {
    callingTypeId: "",
    enrollmentId: "",
    studentId: "",
    calledDistrict: "",
    calledBlock: "",
    calledCenter: "",
    assignedTo: [],
    calledTo: "",
    father: "",
    contact1: "",
    contact2: "",
    contact3: "",
    callingStatus: "",
    remark: "",
    comment: "",
    additionalInformation1: "",
    additionalInformation2: "",
    additionalInformation3: "",
    additionalInformation4: "",
    additionalInformation5: "",
    additionalInformation6: "",
    additionalInformation7: "",
    additionalInformation8: "",
    additionalInformation9: "",
    additionalInformation10: "",
    additionalInfo: "",
    callingData: "",
};


const CallingDetailsForm = ({
    callingTypes = [],
    callingDetails = null,
    onSuccess,
    onCancel,
}) => {
    const isEditMode =
        Boolean(callingDetails);


    const [formData, setFormData] =
        useState(defaultFormData);


    const [students, setStudents] =
        useState([]);

    const [enrollments, setEnrollments] =
        useState([]);

    const [users, setUsers] =
        useState([]);

    const [districts, setDistricts] =
        useState([]);

    const [blocks, setBlocks] =
        useState([]);

    const [centers, setCenters] =
        useState([]);


    const [loadingStudents, setLoadingStudents] =
        useState(false);

    const [loadingEnrollments, setLoadingEnrollments] =
        useState(false);

    const [loadingUsers, setLoadingUsers] =
        useState(false);

    const [loadingDistricts, setLoadingDistricts] =
        useState(false);

    const [loadingBlocks, setLoadingBlocks] =
        useState(false);

    const [loadingCenters, setLoadingCenters] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);


    /*
     * ============================================================
     * HELPERS
     * ============================================================
     */

    const getId = (value) => {
        if (!value) {
            return "";
        }

        if (typeof value === "object") {
            return (
                value._id ||
                value.id ||
                ""
            );
        }

        return value;
    };


    const getName = (
        value,
        fallback = "-"
    ) => {
        if (!value) {
            return fallback;
        }

        if (typeof value === "string") {
            return value;
        }

        return (
            value.name ||
            value.fullName ||
            value.studentName ||
            value.studentSrn ||
            value.userId ||
            value.email ||
            fallback
        );
    };


    const getCallingType = () => {
        if (!formData.callingTypeId) {
            return null;
        }

        return callingTypes.find(
            (callingType) =>
                callingType._id ===
                formData.callingTypeId
        );
    };


    const selectedCallingType =
        getCallingType();


    const availableStatuses =
        selectedCallingType?.callingStatus ||
        [];


    const connectedRemarks =
        selectedCallingType
            ?.callingRemark
            ?.connected || [];


    const notConnectedRemarks =
        selectedCallingType
            ?.callingRemark
            ?.notConnected || [];


    const availableRemarks = [
        ...new Set([
            ...connectedRemarks,
            ...notConnectedRemarks,
        ]),
    ];


    /*
     * ============================================================
     * LOAD INITIAL DATA
     * ============================================================
     */

    useEffect(() => {
        const loadInitialData =
            async () => {
                try {
                    setLoadingStudents(true);
                    setLoadingUsers(true);
                    setLoadingDistricts(true);

                    const [
                        studentsResponse,
                        usersResponse,
                        districtsResponse,
                    ] = await Promise.all([
                        getStudents({
                            page: 1,
                            limit: 100,
                            isActive: true,
                        }),

                        getUsers({
                            page: 1,
                            limit: 100,
                            isActive: "true",
                        }),

                        getDistricts({
                            page: 1,
                            limit: 100,
                        }),
                    ]);


                    setStudents(
                        studentsResponse
                            ?.data
                            ?.students || []
                    );


                    setUsers(
                        usersResponse
                            ?.data
                            ?.users || []
                    );


                    setDistricts(
                        districtsResponse
                            ?.data
                            ?.districts || []
                    );

                } catch (err) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load form data"
                    );
                } finally {
                    setLoadingStudents(false);
                    setLoadingUsers(false);
                    setLoadingDistricts(false);
                }
            };


        loadInitialData();
    }, []);


    /*
     * ============================================================
     * EDIT MODE
     * ============================================================
     */

    useEffect(() => {
        if (!callingDetails) {
            setFormData(
                defaultFormData
            );

            setEnrollments([]);
            setBlocks([]);
            setCenters([]);

            return;
        }


        const districtId =
            getId(
                callingDetails.calledDistrict
            );

        const blockId =
            getId(
                callingDetails.calledBlock
            );

        const centerId =
            getId(
                callingDetails.calledCenter
            );


        setFormData({
            callingTypeId:
                getId(
                    callingDetails.callingTypeId
                ),

            enrollmentId:
                getId(
                    callingDetails.enrollmentId
                ),

            studentId:
                getId(
                    callingDetails.studentId
                ),

            calledDistrict:
                districtId,

            calledBlock:
                blockId,

            calledCenter:
                centerId,

            assignedTo:
                Array.isArray(
                    callingDetails.assignedTo
                )
                    ? callingDetails.assignedTo
                          .map(getId)
                          .filter(Boolean)
                    : [],

            calledTo:
                callingDetails.calledTo ||
                "",

            father:
                callingDetails.father ||
                "",

            contact1:
                callingDetails.contact1 ||
                "",

            contact2:
                callingDetails.contact2 ||
                "",

            contact3:
                callingDetails.contact3 ||
                "",

            callingStatus:
                callingDetails.callingStatus ||
                "",

            remark:
                callingDetails.remark ||
                "",

            comment:
                callingDetails.comment ||
                "",

            additionalInformation1:
                callingDetails.additionalInformation1 ??
                "",

            additionalInformation2:
                callingDetails.additionalInformation2 ??
                "",

            additionalInformation3:
                callingDetails.additionalInformation3 ??
                "",

            additionalInformation4:
                callingDetails.additionalInformation4 ??
                "",

            additionalInformation5:
                callingDetails.additionalInformation5 ??
                "",

            additionalInformation6:
                callingDetails.additionalInformation6 ??
                "",

            additionalInformation7:
                callingDetails.additionalInformation7 ??
                "",

            additionalInformation8:
                callingDetails.additionalInformation8 ??
                "",

            additionalInformation9:
                callingDetails.additionalInformation9 ??
                "",

            additionalInformation10:
                callingDetails.additionalInformation10 ??
                "",

            additionalInfo:
                callingDetails.additionalInfo ??
                "",

            callingData:
                callingDetails.callingData ??
                "",
        });


        if (callingDetails.studentId) {
            loadEnrollments(
                getId(
                    callingDetails.studentId
                )
            );
        }


        if (districtId) {
            loadBlocks(
                districtId
            );
        }


        if (blockId) {
            loadCenters(
                blockId
            );
        }

    }, [callingDetails]);


    /*
     * ============================================================
     * LOAD ENROLLMENTS
     * ============================================================
     */

    const loadEnrollments =
        async (studentId) => {
            if (!studentId) {
                setEnrollments([]);
                return;
            }

            try {
                setLoadingEnrollments(true);

                const response =
                    await getStudentEnrollments(
                        studentId
                    );

                setEnrollments(
                    response.data
                        ?.enrollments || []
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load enrollments"
                );

                setEnrollments([]);
            } finally {
                setLoadingEnrollments(false);
            }
        };


    /*
     * ============================================================
     * LOAD BLOCKS
     * ============================================================
     */

    const loadBlocks =
        async (districtId) => {
            if (!districtId) {
                setBlocks([]);
                return;
            }

            try {
                setLoadingBlocks(true);

                const response =
                    await getBlocksByDistrict(
                        districtId
                    );

                setBlocks(
                    response.data?.blocks ||
                    response.data ||
                    []
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load blocks"
                );

                setBlocks([]);
            } finally {
                setLoadingBlocks(false);
            }
        };


    /*
     * ============================================================
     * LOAD CENTERS
     * ============================================================
     */

    const loadCenters =
        async (blockId) => {
            if (!blockId) {
                setCenters([]);
                return;
            }

            try {
                setLoadingCenters(true);

                const response =
                    await getCentersByBlock(
                        blockId
                    );

                setCenters(
                    response.data?.centers ||
                    response.data ||
                    []
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load centers"
                );

                setCenters([]);
            } finally {
                setLoadingCenters(false);
            }
        };


    /*
     * ============================================================
     * FIELD CHANGE
     * ============================================================
     */

    const handleChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;


        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    };


    /*
     * ============================================================
     * CALLING TYPE CHANGE
     * ============================================================
     */

    const handleCallingTypeChange =
        (event) => {
            const callingTypeId =
                event.target.value;

            setFormData(
                (previous) => ({
                    ...previous,
                    callingTypeId,
                    callingStatus: "",
                    remark: "",
                })
            );
        };


    /*
     * ============================================================
     * STUDENT CHANGE
     * ============================================================
     */

    const handleStudentChange =
        async (event) => {
            const studentId =
                event.target.value;


            setFormData(
                (previous) => ({
                    ...previous,
                    studentId,
                    enrollmentId: "",
                })
            );


            setEnrollments([]);


            if (!studentId) {
                return;
            }


            await loadEnrollments(
                studentId
            );
        };


    /*
     * ============================================================
     * ENROLLMENT CHANGE
     * ============================================================
     */

    const handleEnrollmentChange =
        (event) => {
            const enrollmentId =
                event.target.value;


            setFormData(
                (previous) => ({
                    ...previous,
                    enrollmentId,
                })
            );


            const enrollment =
                enrollments.find(
                    (item) =>
                        item._id ===
                        enrollmentId
                );


            if (!enrollment) {
                return;
            }


            setFormData(
                (previous) => ({
                    ...previous,

                    enrollmentId,

                    calledDistrict:
                        getId(
                            enrollment.districtId
                        ),

                    calledBlock:
                        getId(
                            enrollment.blockId
                        ),

                    calledCenter:
                        getId(
                            enrollment.centerId
                        ),
                })
            );


            const districtId =
                getId(
                    enrollment.districtId
                );

            const blockId =
                getId(
                    enrollment.blockId
                );


            if (districtId) {
                loadBlocks(
                    districtId
                );
            }


            if (blockId) {
                loadCenters(
                    blockId
                );
            }
        };


    /*
     * ============================================================
     * DISTRICT CHANGE
     * ============================================================
     */

    const handleDistrictChange =
        async (event) => {
            const districtId =
                event.target.value;


            setFormData(
                (previous) => ({
                    ...previous,
                    calledDistrict:
                        districtId,
                    calledBlock: "",
                    calledCenter: "",
                })
            );


            setBlocks([]);
            setCenters([]);


            if (!districtId) {
                return;
            }


            await loadBlocks(
                districtId
            );
        };


    /*
     * ============================================================
     * BLOCK CHANGE
     * ============================================================
     */

    const handleBlockChange =
        async (event) => {
            const blockId =
                event.target.value;


            setFormData(
                (previous) => ({
                    ...previous,
                    calledBlock:
                        blockId,
                    calledCenter: "",
                })
            );


            setCenters([]);


            if (!blockId) {
                return;
            }


            await loadCenters(
                blockId
            );
        };


    /*
     * ============================================================
     * ASSIGNED USER CHANGE
     * ============================================================
     */

    const handleAssignedUserChange =
        (userId) => {
            setFormData(
                (previous) => {
                    const exists =
                        previous.assignedTo.includes(
                            userId
                        );


                    return {
                        ...previous,

                        assignedTo:
                            exists
                                ? previous.assignedTo.filter(
                                      (id) =>
                                          id !==
                                          userId
                                  )
                                : [
                                      ...previous.assignedTo,
                                      userId,
                                  ],
                    };
                }
            );
        };


    /*
     * ============================================================
     * SUBMIT
     * ============================================================
     */

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();


        try {
            setLoading(true);
            setError(null);


            if (!formData.callingTypeId) {
                setError(
                    "Please select calling type"
                );

                return;
            }


            if (!formData.calledTo.trim()) {
                setError(
                    "Called To is required"
                );

                return;
            }


            const payload = {
                callingTypeId:
                    formData.callingTypeId,

                enrollmentId:
                    formData.enrollmentId ||
                    null,

                studentId:
                    formData.studentId ||
                    null,

                calledDistrict:
                    formData.calledDistrict ||
                    null,

                calledBlock:
                    formData.calledBlock ||
                    null,

                calledCenter:
                    formData.calledCenter ||
                    null,

                assignedTo:
                    formData.assignedTo,

                calledTo:
                    formData.calledTo.trim(),

                father:
                    formData.father.trim(),

                contact1:
                    formData.contact1.trim(),

                contact2:
                    formData.contact2.trim(),

                contact3:
                    formData.contact3.trim(),

                callingStatus:
                    formData.callingStatus,

                remark:
                    formData.remark.trim(),

                comment:
                    formData.comment.trim(),

                additionalInformation1:
                    formData.additionalInformation1,

                additionalInformation2:
                    formData.additionalInformation2,

                additionalInformation3:
                    formData.additionalInformation3,

                additionalInformation4:
                    formData.additionalInformation4,

                additionalInformation5:
                    formData.additionalInformation5,

                additionalInformation6:
                    formData.additionalInformation6,

                additionalInformation7:
                    formData.additionalInformation7,

                additionalInformation8:
                    formData.additionalInformation8,

                additionalInformation9:
                    formData.additionalInformation9,

                additionalInformation10:
                    formData.additionalInformation10,

                additionalInfo:
                    formData.additionalInfo,

                callingData:
                    formData.callingData,
            };


            let response;


            if (isEditMode) {
                response =
                    await updateCallingDetails(
                        callingDetails._id,
                        payload
                    );
            } else {
                response =
                    await createCallingDetails(
                        payload
                    );
            }


            if (onSuccess) {
                onSuccess(response);
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save calling details"
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}


            {/* ==================================================
                CALLING INFORMATION
            ================================================== */}

            <section>

                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Calling Information
                </h3>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Calling Type */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Calling Type
                        </label>

                        <select
                            name="callingTypeId"
                            value={
                                formData.callingTypeId
                            }
                            onChange={
                                handleCallingTypeChange
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">
                                Select calling type
                            </option>

                            {callingTypes.map(
                                (callingType) => (
                                    <option
                                        key={
                                            callingType._id
                                        }
                                        value={
                                            callingType._id
                                        }
                                    >
                                        {
                                            callingType.callingTitle
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Called To */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Called To
                        </label>

                        <input
                            type="text"
                            name="calledTo"
                            value={
                                formData.calledTo
                            }
                            onChange={
                                handleChange
                            }
                            required
                            placeholder="Enter person being called"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>

                </div>

            </section>


            {/* ==================================================
                STUDENT INFORMATION
            ================================================== */}

            <section>

                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Student Information
                </h3>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Student */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Student
                        </label>

                        <select
                            name="studentId"
                            value={
                                formData.studentId
                            }
                            onChange={
                                handleStudentChange
                            }
                            disabled={
                                loadingStudents
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {loadingStudents
                                    ? "Loading students..."
                                    : "Select student"}
                            </option>

                            {students.map(
                                (student) => (
                                    <option
                                        key={
                                            student._id
                                        }
                                        value={
                                            student._id
                                        }
                                    >
                                        {getName(
                                            student,
                                            student.studentSrn ||
                                                student._id
                                        )}
                                        {student.studentSrn
                                            ? ` (${student.studentSrn})`
                                            : ""}
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Enrollment */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Enrollment
                        </label>

                        <select
                            name="enrollmentId"
                            value={
                                formData.enrollmentId
                            }
                            onChange={
                                handleEnrollmentChange
                            }
                            disabled={
                                !formData.studentId ||
                                loadingEnrollments
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {!formData.studentId
                                    ? "Select student first"
                                    : loadingEnrollments
                                      ? "Loading enrollments..."
                                      : "Select enrollment"}
                            </option>

                            {enrollments.map(
                                (enrollment) => (
                                    <option
                                        key={
                                            enrollment._id
                                        }
                                        value={
                                            enrollment._id
                                        }
                                    >
                                        {getName(
                                            enrollment.programId,
                                            "Program"
                                        )}
                                        {" - "}
                                        {getName(
                                            enrollment.batchId,
                                            "Batch"
                                        )}
                                        {enrollment.centerId
                                            ? ` - ${getName(
                                                  enrollment.centerId,
                                                  "Center"
                                              )}`
                                            : ""}
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Father */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Father
                        </label>

                        <input
                            type="text"
                            name="father"
                            value={
                                formData.father
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Father name"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>

                </div>

            </section>


            {/* ==================================================
                CONTACT INFORMATION
            ================================================== */}

            <section>

                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Contact Information
                </h3>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Contact 1
                        </label>

                        <input
                            type="text"
                            name="contact1"
                            value={
                                formData.contact1
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Contact number"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>


                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Contact 2
                        </label>

                        <input
                            type="text"
                            name="contact2"
                            value={
                                formData.contact2
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Contact number"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>


                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Contact 3
                        </label>

                        <input
                            type="text"
                            name="contact3"
                            value={
                                formData.contact3
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Contact number"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>

                </div>

            </section>


            {/* ==================================================
                LOCATION
            ================================================== */}

            <section>

                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Calling Location
                </h3>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* District */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            District
                        </label>

                        <select
                            name="calledDistrict"
                            value={
                                formData.calledDistrict
                            }
                            onChange={
                                handleDistrictChange
                            }
                            disabled={
                                loadingDistricts
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {loadingDistricts
                                    ? "Loading districts..."
                                    : "Select district"}
                            </option>

                            {districts.map(
                                (district) => (
                                    <option
                                        key={
                                            district._id
                                        }
                                        value={
                                            district._id
                                        }
                                    >
                                        {
                                            district.districtName
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Block */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Block
                        </label>

                        <select
                            name="calledBlock"
                            value={
                                formData.calledBlock
                            }
                            onChange={
                                handleBlockChange
                            }
                            disabled={
                                !formData.calledDistrict ||
                                loadingBlocks
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {!formData.calledDistrict
                                    ? "Select district first"
                                    : loadingBlocks
                                      ? "Loading blocks..."
                                      : "Select block"}
                            </option>

                            {blocks.map(
                                (block) => (
                                    <option
                                        key={
                                            block._id
                                        }
                                        value={
                                            block._id
                                        }
                                    >
                                        {
                                            block.blockName
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Center */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Center
                        </label>

                        <select
                            name="calledCenter"
                            value={
                                formData.calledCenter
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                !formData.calledBlock ||
                                loadingCenters
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {!formData.calledBlock
                                    ? "Select block first"
                                    : loadingCenters
                                      ? "Loading centers..."
                                      : "Select center"}
                            </option>

                            {centers.map(
                                (center) => (
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
                                        }
                                        {center.centerCode
                                            ? ` (${center.centerCode})`
                                            : ""}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                </div>

            </section>


            {/* ==================================================
                ASSIGNED USERS
            ================================================== */}

            <section>

                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Assigned Users
                </h3>


                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

                    {loadingUsers ? (
                        <p className="text-sm text-gray-500">
                            Loading users...
                        </p>
                    ) : users.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No active users found.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                            {users.map(
                                (user) => (
                                    <label
                                        key={
                                            user._id
                                        }
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50"
                                    >

                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.assignedTo.includes(
                                                    user._id
                                                )
                                            }
                                            onChange={() =>
                                                handleAssignedUserChange(
                                                    user._id
                                                )
                                            }
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />

                                        <span className="text-sm text-gray-700">
                                            {getName(
                                                user,
                                                user.email
                                            )}
                                        </span>

                                    </label>
                                )
                            )}

                        </div>
                    )}

                </div>

            </section>


            {/* ==================================================
                INITIAL CALL STATUS
            ================================================== */}

            <section>

                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Initial Calling Status
                </h3>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Status */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Calling Status
                        </label>

                        <select
                            name="callingStatus"
                            value={
                                formData.callingStatus
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                !formData.callingTypeId
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {!formData.callingTypeId
                                    ? "Select calling type first"
                                    : "Select status"}
                            </option>

                            {availableStatuses.map(
                                (status) => (
                                    <option
                                        key={
                                            status
                                        }
                                        value={
                                            status
                                        }
                                    >
                                        {status}
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Remark */}
                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Remark
                        </label>

                        {availableRemarks.length >
                        0 ? (
                            <select
                                name="remark"
                                value={
                                    formData.remark
                                }
                                onChange={
                                    handleChange
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">
                                    Select remark
                                </option>

                                {availableRemarks.map(
                                    (
                                        remark
                                    ) => (
                                        <option
                                            key={
                                                remark
                                            }
                                            value={
                                                remark
                                            }
                                        >
                                            {
                                                remark
                                            }
                                        </option>
                                    )
                                )}

                            </select>
                        ) : (
                            <input
                                type="text"
                                name="remark"
                                value={
                                    formData.remark
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter remark"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        )}

                    </div>

                </div>

            </section>


            {/* ==================================================
                COMMENT
            ================================================== */}

            <section>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Comment
                </label>

                <textarea
                    name="comment"
                    value={
                        formData.comment
                    }
                    onChange={
                        handleChange
                    }
                    rows={4}
                    placeholder="Enter additional comment"
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

            </section>


            {/* ==================================================
                ADDITIONAL INFORMATION
            ================================================== */}

            <section>

                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Additional Information
                </h3>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {Array.from(
                        { length: 10 },
                        (_, index) => {
                            const fieldName =
                                `additionalInformation${
                                    index + 1
                                }`;

                            return (
                                <div
                                    key={
                                        fieldName
                                    }
                                >

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Additional Information{" "}
                                        {index +
                                            1}
                                    </label>

                                    <input
                                        type="text"
                                        name={
                                            fieldName
                                        }
                                        value={
                                            formData[
                                                fieldName
                                            ]
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder={`Additional information ${index + 1}`}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />

                                </div>
                            );
                        }
                    )}

                </div>

            </section>


            {/* ==================================================
                EXTRA DATA
            ================================================== */}

            <section>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Additional Info
                        </label>

                        <textarea
                            name="additionalInfo"
                            value={
                                typeof formData.additionalInfo ===
                                "string"
                                    ? formData.additionalInfo
                                    : JSON.stringify(
                                          formData.additionalInfo
                                      )
                            }
                            onChange={
                                handleChange
                            }
                            rows={4}
                            placeholder="Enter additional information"
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>


                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Calling Data
                        </label>

                        <textarea
                            name="callingData"
                            value={
                                typeof formData.callingData ===
                                "string"
                                    ? formData.callingData
                                    : JSON.stringify(
                                          formData.callingData
                                      )
                            }
                            onChange={
                                handleChange
                            }
                            rows={4}
                            placeholder="Enter calling data"
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                    </div>

                </div>

            </section>


            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                {onCancel && (
                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        disabled={
                            loading
                        }
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}


                <button
                    type="submit"
                    disabled={
                        loading
                    }
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Saving..."
                        : isEditMode
                          ? "Update Calling Details"
                          : "Create Calling Details"}
                </button>

            </div>

        </form>
    );
};


export default CallingDetailsForm;