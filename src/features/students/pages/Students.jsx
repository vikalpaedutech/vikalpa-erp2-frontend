// // FILE PATH: C:\Users\shubh\OneDrive\Desktop\vikalpaerpv2\frontend\src\features\students\pages\Students.jsx

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// import StudentFilters from "../components/StudentFilters";
// import useStudents from "../hooks/useStudents";

// const Students = () => {
//     const navigate = useNavigate();

//     const {
//         students,
//         pagination,
//         loading,
//         error,
//         fetchStudents,
//     } = useStudents();

//     const [activeFilters, setActiveFilters] = useState({});

//     const handleSearch = (filters) => {
//         setActiveFilters(filters);

//         fetchStudents({
//             ...filters,
//             page: 1,
//         });
//     };

//     const handlePageChange = (page) => {
//         fetchStudents({
//             ...activeFilters,
//             page,
//         });
//     };

//     const getEnrollmentStatus = (student) => {
//         if (!student.enrollments?.length) {
//             return "-";
//         }

//         const activeEnrollment =
//             student.enrollments.find(
//                 (enrollment) =>
//                     enrollment.status === "active"
//             );

//         if (activeEnrollment) {
//             return activeEnrollment.status;
//         }

//         return student.enrollments[0]?.status || "-";
//     };

//     const formatStatus = (status) => {
//         if (!status) {
//             return "-";
//         }

//         return status
//             .split("-")
//             .map(
//                 (word) =>
//                     word.charAt(0).toUpperCase() +
//                     word.slice(1)
//             )
//             .join(" ");
//     };

//     if (error) {
//         return (
//             <div className="p-6">
//                 <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
//                     {error}
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6">
//             {/* Header */}
//             <div className="mb-6 flex items-center justify-between">
//                 <div>
//                     <h1 className="text-2xl font-semibold">
//                         Students
//                     </h1>

//                     <p className="mt-1 text-sm text-gray-500">
//                         Student management
//                     </p>
//                 </div>

//                 <button
//                     type="button"
//                     onClick={() =>
//                         navigate("/students/onboard")
//                     }
//                     className="rounded-md border px-4 py-2 font-medium"
//                 >
//                     Add Student
//                 </button>
//             </div>

//             {/* Filters */}
//             <StudentFilters
//                 onSearch={handleSearch}
//             />

//             {/* Summary */}
//             <div className="mb-4 flex items-center justify-between">
//                 <p className="text-sm text-gray-600">
//                     Total Students:{" "}
//                     <strong className="text-gray-900">
//                         {pagination?.total ?? 0}
//                     </strong>
//                 </p>

//                 {loading && (
//                     <p className="text-sm text-gray-500">
//                         Loading...
//                     </p>
//                 )}
//             </div>

//             {/* Students Table */}
//             <div className="overflow-x-auto rounded-lg border bg-white">
//                 <table className="min-w-full">
//                     <thead className="border-b bg-gray-50">
//                         <tr>
//                             <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
//                                 SRN
//                             </th>

//                             <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
//                                 Name
//                             </th>

//                             <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
//                                 Father Name
//                             </th>

//                             <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
//                                 Contact
//                             </th>

//                             <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
//                                 Enrollment Status
//                             </th>

//                             <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
//                                 Actions
//                             </th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {loading ? (
//                             <tr>
//                                 <td
//                                     colSpan="6"
//                                     className="px-4 py-10 text-center text-sm text-gray-500"
//                                 >
//                                     Loading students...
//                                 </td>
//                             </tr>
//                         ) : students.length === 0 ? (
//                             <tr>
//                                 <td
//                                     colSpan="6"
//                                     className="px-4 py-10 text-center text-sm text-gray-500"
//                                 >
//                                     No students found
//                                 </td>
//                             </tr>
//                         ) : (
//                             students.map((student) => {
//                                 const enrollmentStatus =
//                                     getEnrollmentStatus(
//                                         student
//                                     );

//                                 return (
//                                     <tr
//                                         key={student._id}
//                                         className="border-b last:border-b-0 hover:bg-gray-50"
//                                     >
//                                         <td className="whitespace-nowrap px-4 py-3 text-sm">
//                                             {student.studentSrn ||
//                                                 "-"}
//                                         </td>

//                                         <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
//                                             {student.name ||
//                                                 "-"}
//                                         </td>

//                                         <td className="whitespace-nowrap px-4 py-3 text-sm">
//                                             {student.fatherName ||
//                                                 "-"}
//                                         </td>

//                                         <td className="whitespace-nowrap px-4 py-3 text-sm">
//                                             {student.parentContact ||
//                                                 student.personalContact ||
//                                                 "-"}
//                                         </td>

//                                         <td className="whitespace-nowrap px-4 py-3 text-sm">
//                                             {formatStatus(
//                                                 enrollmentStatus
//                                             )}
//                                         </td>

//                                         <td className="whitespace-nowrap px-4 py-3">
//                                             <button
//                                                 type="button"
//                                                 onClick={() =>
//                                                     navigate(
//                                                         `/students/${student._id}`
//                                                     )
//                                                 }
//                                                 className="rounded-md border px-3 py-1.5 text-sm"
//                                             >
//                                                 View
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 );
//                             })
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination */}
//             {pagination &&
//                 pagination.totalPages > 1 && (
//                     <div className="mt-5 flex items-center justify-between">
//                         <button
//                             type="button"
//                             disabled={
//                                 !pagination.hasPreviousPage ||
//                                 loading
//                             }
//                             onClick={() =>
//                                 handlePageChange(
//                                     pagination.page - 1
//                                 )
//                             }
//                             className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                             Previous
//                         </button>

//                         <span className="text-sm text-gray-600">
//                             Page{" "}
//                             <strong className="text-gray-900">
//                                 {pagination.page}
//                             </strong>{" "}
//                             of{" "}
//                             <strong className="text-gray-900">
//                                 {pagination.totalPages}
//                             </strong>
//                         </span>

//                         <button
//                             type="button"
//                             disabled={
//                                 !pagination.hasNextPage ||
//                                 loading
//                             }
//                             onClick={() =>
//                                 handlePageChange(
//                                     pagination.page + 1
//                                 )
//                             }
//                             className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 )}
//         </div>
//     );
// };

// export default Students;













// FILE PATH: frontend/src/features/students/pages/Students.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StudentFilters from "../components/StudentFilters";
import AddStudentModal from "../components/AddStudentModal";

import useStudents from "../hooks/useStudents";
import useStudentScope from "../hooks/useStudentScope";

import { useAuth } from "../../../context/AuthContext";

import {
    requestStudentAdd,
} from "../services/student.service";

import {
    getDistricts,
    getDistrictById,
} from "../../../services/district.service";

import {
    getBlocks,
    getBlockById,
    getBlocksByDistrict,
} from "../../../services/block.service";

import {
    getCenters,
    getCenterById,
    getCentersByBlock,
} from "../../../services/center.service";


const getId = (value) => {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    return value._id || value.id || "";
};


const getInitialAddStudentData = () => ({
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

    programId: "",
    batchId: "",
    districtId: "",
    blockId: "",
    centerId: "",
    class: "",
    board: "",
    enrollmentDate: "",
    requestReason: "",
});


const Students = () => {
    const navigate = useNavigate();

    const {
        students,
        pagination,
        loading,
        error,
        fetchStudents,
    } = useStudents();

    const {
        programs,
        batches,
        regionScopes,
        isAdmin,
    } = useStudentScope();

    const {
        access,
    } = useAuth();


    /* ============================================================
       STUDENT LIST
    ============================================================ */

    const [activeFilters, setActiveFilters] = useState({});


    const handleSearch = (filters) => {
        setActiveFilters(filters);

        fetchStudents({
            ...filters,
            page: 1,
        });
    };


    const handlePageChange = (page) => {
        fetchStudents({
            ...activeFilters,
            page,
        });
    };


    /* ============================================================
       ADD STUDENT REQUEST
    ============================================================ */

    const [addStudentOpen, setAddStudentOpen] = useState(false);

    const [
        addStudentData,
        setAddStudentData,
    ] = useState(
        getInitialAddStudentData()
    );

    const [
        addStudentError,
        setAddStudentError,
    ] = useState("");

    const [
        addStudentLoading,
        setAddStudentLoading,
    ] = useState(false);


    /* ============================================================
       ADD STUDENT REGION OPTIONS
    ============================================================ */

    const [addStudentDistricts, setAddStudentDistricts] = useState([]);
    const [addStudentBlocks, setAddStudentBlocks] = useState([]);
    const [addStudentCenters, setAddStudentCenters] = useState([]);

    const [
        addStudentBlockLoading,
        setAddStudentBlockLoading,
    ] = useState(false);

    const [
        addStudentCenterLoading,
        setAddStudentCenterLoading,
    ] = useState(false);

    const [
        addStudentOptionsLoading,
        setAddStudentOptionsLoading,
    ] = useState(false);


    /* ============================================================
       ROLE
    ============================================================ */

    const isCC = useMemo(() => {
        return access?.roles?.some(
            (role) =>
                role.roleCode === "cc" ||
                role.roleCode === "center-coordinator"
        );
    }, [access]);


    /* ============================================================
       REGION SCOPE HELPERS
    ============================================================ */

    const districtScopeIds = useMemo(() => {
        return [
            ...new Set(
                (regionScopes || [])
                    .filter(
                        (scope) =>
                            scope.scope === "district" &&
                            scope.districtId
                    )
                    .map(
                        (scope) =>
                            getId(scope.districtId)
                    )
                    .filter(Boolean)
            ),
        ];
    }, [regionScopes]);


    const blockScopeIds = useMemo(() => {
        return [
            ...new Set(
                (regionScopes || [])
                    .filter(
                        (scope) =>
                            scope.scope === "block" &&
                            scope.blockId
                    )
                    .map(
                        (scope) =>
                            getId(scope.blockId)
                    )
                    .filter(Boolean)
            ),
        ];
    }, [regionScopes]);


    const centerScopeIds = useMemo(() => {
        return [
            ...new Set(
                (regionScopes || [])
                    .filter(
                        (scope) =>
                            scope.scope === "center" &&
                            scope.centerId
                    )
                    .map(
                        (scope) =>
                            getId(scope.centerId)
                    )
                    .filter(Boolean)
            ),
        ];
    }, [regionScopes]);


    const hasGlobalRegionAccess = useMemo(() => {
        return (regionScopes || []).some(
            (scope) =>
                scope.scope === "global"
        );
    }, [regionScopes]);


    /* ============================================================
       LOAD DISTRICTS / BLOCKS / CENTERS FOR MODAL
    ============================================================ */

    const loadAddStudentOptions = async () => {
        try {
            setAddStudentOptionsLoading(true);
            setAddStudentError("");

            /* ----------------------------------------------------
               ADMIN
            ---------------------------------------------------- */

            if (isAdmin) {
                const districtResponse =
                    await getDistricts({
                        page: 1,
                        limit: 100,
                    });

                setAddStudentDistricts(
                    districtResponse.data?.districts || []
                );

                setAddStudentBlocks([]);
                setAddStudentCenters([]);

                return;
            }


            /* ----------------------------------------------------
               GLOBAL NON-ADMIN
            ---------------------------------------------------- */

            if (hasGlobalRegionAccess) {
                const districtResponse =
                    await getDistricts({
                        page: 1,
                        limit: 100,
                    });

                setAddStudentDistricts(
                    districtResponse.data?.districts || []
                );

                setAddStudentBlocks([]);
                setAddStudentCenters([]);

                return;
            }


            /* ----------------------------------------------------
               DISTRICT SCOPE
            ---------------------------------------------------- */

            if (districtScopeIds.length > 0) {
                const districtResults =
                    await Promise.all(
                        districtScopeIds.map(
                            (districtId) =>
                                getDistrictById(
                                    districtId
                                )
                        )
                    );

                setAddStudentDistricts(
                    districtResults
                        .map(
                            (response) =>
                                response.data
                        )
                        .filter(Boolean)
                );

                setAddStudentBlocks([]);
                setAddStudentCenters([]);

                return;
            }


            /* ----------------------------------------------------
               BLOCK SCOPE
            ---------------------------------------------------- */

            if (blockScopeIds.length > 0) {
                const blockResults =
                    await Promise.all(
                        blockScopeIds.map(
                            (blockId) =>
                                getBlockById(
                                    blockId
                                )
                        )
                    );

                const blocks =
                    blockResults
                        .map(
                            (response) =>
                                response.data
                        )
                        .filter(Boolean);

                setAddStudentBlocks(blocks);

                const districtIds = [
                    ...new Set(
                        blocks
                            .map(
                                (block) =>
                                    getId(
                                        block.districtId
                                    )
                            )
                            .filter(Boolean)
                    ),
                ];

                const districtResults =
                    await Promise.all(
                        districtIds.map(
                            (districtId) =>
                                getDistrictById(
                                    districtId
                                )
                        )
                    );

                setAddStudentDistricts(
                    districtResults
                        .map(
                            (response) =>
                                response.data
                        )
                        .filter(Boolean)
                );

                setAddStudentCenters([]);

                return;
            }


            /* ----------------------------------------------------
               CENTER SCOPE
            ---------------------------------------------------- */

            if (centerScopeIds.length > 0) {
                const centerResults =
                    await Promise.all(
                        centerScopeIds.map(
                            (centerId) =>
                                getCenterById(
                                    centerId
                                )
                        )
                    );

                const centers =
                    centerResults
                        .map(
                            (response) =>
                                response.data
                        )
                        .filter(Boolean);

                setAddStudentCenters(centers);

                const blockIds = [
                    ...new Set(
                        centers
                            .map(
                                (center) =>
                                    getId(
                                        center.blockId
                                    )
                            )
                            .filter(Boolean)
                    ),
                ];

                const districtIds = [
                    ...new Set(
                        centers
                            .map(
                                (center) =>
                                    getId(
                                        center.districtId
                                    )
                            )
                            .filter(Boolean)
                    ),
                ];


                if (blockIds.length > 0) {
                    const blockResults =
                        await Promise.all(
                            blockIds.map(
                                (blockId) =>
                                    getBlockById(
                                        blockId
                                    )
                            )
                        );

                    setAddStudentBlocks(
                        blockResults
                            .map(
                                (response) =>
                                    response.data
                            )
                            .filter(Boolean)
                    );
                }


                if (districtIds.length > 0) {
                    const districtResults =
                        await Promise.all(
                            districtIds.map(
                                (districtId) =>
                                    getDistrictById(
                                        districtId
                                    )
                            )
                        );

                    setAddStudentDistricts(
                        districtResults
                            .map(
                                (response) =>
                                    response.data
                            )
                            .filter(Boolean)
                    );
                }

                return;
            }


            setAddStudentDistricts([]);
            setAddStudentBlocks([]);
            setAddStudentCenters([]);

        } catch (err) {
            setAddStudentError(
                err.response?.data?.message ||
                "Failed to load request options"
            );
        } finally {
            setAddStudentOptionsLoading(false);
        }
    };


    /* ============================================================
       OPEN MODAL
    ============================================================ */

    const handleOpenAddStudent = async () => {
        setAddStudentData(
            getInitialAddStudentData()
        );

        setAddStudentError("");

        setAddStudentBlocks([]);
        setAddStudentCenters([]);

        setAddStudentOpen(true);

        await loadAddStudentOptions();
    };


    /* ============================================================
       CLOSE MODAL
    ============================================================ */

    const handleCloseAddStudent = () => {
        if (addStudentLoading) {
            return;
        }

        setAddStudentOpen(false);
        setAddStudentError("");

        setAddStudentData(
            getInitialAddStudentData()
        );
    };


    /* ============================================================
       INPUT CHANGE
    ============================================================ */

    const handleAddStudentInputChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setAddStudentData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );


        /* --------------------------------------------------------
           PROGRAM CHANGE
        -------------------------------------------------------- */

        if (name === "programId") {
            setAddStudentData(
                (previous) => ({
                    ...previous,
                    programId: value,
                    batchId: "",
                })
            );
        }


        /* --------------------------------------------------------
           CENTER CHANGE
        -------------------------------------------------------- */

        if (name === "centerId") {
            setAddStudentData(
                (previous) => ({
                    ...previous,
                    centerId: value,
                })
            );
        }
    };


    /* ============================================================
       DISTRICT CHANGE
    ============================================================ */

    const handleAddStudentDistrictChange = async (
        event
    ) => {
        const districtId =
            event.target.value;

        setAddStudentData(
            (previous) => ({
                ...previous,
                districtId,
                blockId: "",
                centerId: "",
            })
        );

        setAddStudentBlocks([]);
        setAddStudentCenters([]);


        if (!districtId) {
            return;
        }


        try {
            setAddStudentBlockLoading(true);

            const response =
                await getBlocksByDistrict(
                    districtId
                );

            setAddStudentBlocks(
                Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response)
                        ? response
                        : []
            );

        } catch (err) {
            setAddStudentError(
                err.response?.data?.message ||
                "Failed to load blocks"
            );
        } finally {
            setAddStudentBlockLoading(false);
        }
    };


    /* ============================================================
       BLOCK CHANGE
    ============================================================ */

    const handleAddStudentBlockChange = async (
        event
    ) => {
        const blockId =
            event.target.value;

        setAddStudentData(
            (previous) => ({
                ...previous,
                blockId,
                centerId: "",
            })
        );

        setAddStudentCenters([]);


        if (!blockId) {
            return;
        }


        try {
            setAddStudentCenterLoading(true);

            const response =
                await getCentersByBlock(
                    blockId
                );

            setAddStudentCenters(
                Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response)
                        ? response
                        : []
            );

        } catch (err) {
            setAddStudentError(
                err.response?.data?.message ||
                "Failed to load centers"
            );
        } finally {
            setAddStudentCenterLoading(false);
        }
    };


    /* ============================================================
       FILTER OPTIONS
    ============================================================ */

    const visibleBatches = useMemo(() => {
        if (!addStudentData.programId) {
            return [];
        }

        return (batches || []).filter(
            (batch) =>
                getId(batch.programId) ===
                addStudentData.programId
        );
    }, [
        batches,
        addStudentData.programId,
    ]);


    /* ============================================================
       SUBMIT REQUEST
    ============================================================ */

    const handleSubmitAddStudent = async (
        event
    ) => {
        event.preventDefault();

        setAddStudentError("");


        /* --------------------------------------------------------
           BASIC VALIDATION
        -------------------------------------------------------- */

        if (!addStudentData.studentSrn.trim()) {
            setAddStudentError(
                "Student SRN is required"
            );
            return;
        }

        if (!addStudentData.name.trim()) {
            setAddStudentError(
                "Student name is required"
            );
            return;
        }

        if (!addStudentData.programId) {
            setAddStudentError(
                "Please select a program"
            );
            return;
        }

        if (!addStudentData.batchId) {
            setAddStudentError(
                "Please select a batch"
            );
            return;
        }

        if (!addStudentData.centerId) {
            setAddStudentError(
                "Please select a center"
            );
            return;
        }

        if (!addStudentData.requestReason.trim()) {
            setAddStudentError(
                "Request reason is required"
            );
            return;
        }


        /* --------------------------------------------------------
           REQUEST BODY
        -------------------------------------------------------- */

        const requestBody = {
            student: {
                studentSrn:
                    addStudentData.studentSrn.trim(),

                rollNumber:
                    addStudentData.rollNumber.trim(),

                name:
                    addStudentData.name.trim(),

                fatherName:
                    addStudentData.fatherName.trim(),

                motherName:
                    addStudentData.motherName.trim(),

                personalContact:
                    addStudentData.personalContact.trim(),

                parentContact:
                    addStudentData.parentContact.trim(),

                otherContact:
                    addStudentData.otherContact.trim(),

                dob:
                    addStudentData.dob || undefined,

                gender:
                    addStudentData.gender || undefined,

                category:
                    addStudentData.category.trim(),

                address:
                    addStudentData.address.trim(),

                profileImage: "",

                isActive: false,
            },

            enrollment: {
                programId:
                    addStudentData.programId,

                batchId:
                    addStudentData.batchId,

                districtId:
                    addStudentData.districtId || undefined,

                blockId:
                    addStudentData.blockId || undefined,

                centerId:
                    addStudentData.centerId,

                class:
                    addStudentData.class
                        ? Number(addStudentData.class)
                        : undefined,

                board:
                    addStudentData.board.trim(),

                enrollmentDate:
                    addStudentData.enrollmentDate ||
                    undefined,

                status: "add-request",

                slcSubmitted: false,

                slcSubmittedAt: null,
            },

            requestReason:
                addStudentData.requestReason.trim(),
        };


        /* --------------------------------------------------------
           API
        -------------------------------------------------------- */

        try {
            setAddStudentLoading(true);

            await requestStudentAdd(
                requestBody
            );


            /* ----------------------------------------------------
               CLOSE
            ---------------------------------------------------- */

            setAddStudentOpen(false);

            setAddStudentData(
                getInitialAddStudentData()
            );

            setAddStudentError("");


            /* ----------------------------------------------------
               REFRESH STUDENT LIST
            ---------------------------------------------------- */

            if (
                Object.keys(activeFilters).length > 0
            ) {
                await fetchStudents({
                    ...activeFilters,
                    page:
                        pagination?.page || 1,
                });
            } else if (isAdmin) {
                await fetchStudents();
            }

        } catch (err) {
            setAddStudentError(
                err.response?.data?.message ||
                "Failed to submit add student request"
            );
        } finally {
            setAddStudentLoading(false);
        }
    };


    /* ============================================================
       ENROLLMENT DISPLAY
    ============================================================ */

    const getEnrollmentStatus = (
        student
    ) => {
        if (
            !student.enrollments?.length
        ) {
            return "-";
        }

        const activeEnrollment =
            student.enrollments.find(
                (enrollment) =>
                    enrollment.status ===
                    "active"
            );

        if (activeEnrollment) {
            return activeEnrollment.status;
        }

        return (
            student.enrollments[0]?.status ||
            "-"
        );
    };


    const formatStatus = (
        status
    ) => {
        if (!status) {
            return "-";
        }

        return status
            .split("-")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };


    /* ============================================================
       ERROR
    ============================================================ */

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }


    /* ============================================================
       UI
    ============================================================ */

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-semibold">
                        Students
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Student management
                    </p>
                </div>


                <button
                    type="button"
                    onClick={
                        handleOpenAddStudent
                    }
                    className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                    Request Add Student
                </button>

            </div>


            {/* FILTERS */}
            <StudentFilters
                onSearch={handleSearch}
            />


            {/* SUMMARY */}
            <div className="mb-4 flex items-center justify-between">

                <p className="text-sm text-gray-600">
                    Total Students:{" "}
                    <strong className="text-gray-900">
                        {pagination?.total ?? 0}
                    </strong>
                </p>


                {loading && (
                    <p className="text-sm text-gray-500">
                        Loading...
                    </p>
                )}

            </div>


            {/* TABLE */}
            <div className="overflow-x-auto rounded-lg border bg-white">

                <table className="min-w-full">

                    <thead className="border-b bg-gray-50">

                        <tr>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                                SRN
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                                Name
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                                Father Name
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                                Contact
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                                Enrollment Status
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {loading ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="px-4 py-10 text-center text-sm text-gray-500"
                                >
                                    Loading students...
                                </td>

                            </tr>

                        ) : students.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="px-4 py-10 text-center text-sm text-gray-500"
                                >
                                    No students found
                                </td>

                            </tr>

                        ) : (

                            students.map(
                                (student) => {

                                    const enrollmentStatus =
                                        getEnrollmentStatus(
                                            student
                                        );

                                    return (

                                        <tr
                                            key={
                                                student._id
                                            }
                                            className="border-b last:border-b-0 hover:bg-gray-50"
                                        >

                                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                {
                                                    student.studentSrn ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                                                {
                                                    student.name ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                {
                                                    student.fatherName ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                {
                                                    student.parentContact ||
                                                    student.personalContact ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                {
                                                    formatStatus(
                                                        enrollmentStatus
                                                    )
                                                }
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/students/${student._id}`
                                                        )
                                                    }
                                                    className="rounded-md border px-3 py-1.5 text-sm"
                                                >
                                                    View
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


            {/* PAGINATION */}
            {pagination &&
                pagination.totalPages > 1 && (

                    <div className="mt-5 flex items-center justify-between">

                        <button
                            type="button"
                            disabled={
                                !pagination.hasPreviousPage ||
                                loading
                            }
                            onClick={() =>
                                handlePageChange(
                                    pagination.page - 1
                                )
                            }
                            className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>


                        <span className="text-sm text-gray-600">

                            Page{" "}

                            <strong className="text-gray-900">
                                {pagination.page}
                            </strong>

                            {" "}of{" "}

                            <strong className="text-gray-900">
                                {pagination.totalPages}
                            </strong>

                        </span>


                        <button
                            type="button"
                            disabled={
                                !pagination.hasNextPage ||
                                loading
                            }
                            onClick={() =>
                                handlePageChange(
                                    pagination.page + 1
                                )
                            }
                            className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>

                    </div>

                )}


            {/* ADD STUDENT REQUEST MODAL */}
            <AddStudentModal
                open={addStudentOpen}

                addStudentData={
                    addStudentData
                }

                addStudentError={
                    addStudentError
                }

                addStudentLoading={
                    addStudentLoading ||
                    addStudentOptionsLoading
                }

                programs={
                    programs || []
                }

                batches={
                    visibleBatches
                }

                districts={
                    addStudentDistricts
                }

                addStudentBlocks={
                    addStudentBlocks
                }

                addStudentCenters={
                    addStudentCenters
                }

                addStudentBlockLoading={
                    addStudentBlockLoading
                }

                addStudentCenterLoading={
                    addStudentCenterLoading
                }

                isAdmin={isAdmin}

                isCC={isCC}

                showDistrict={
                    isAdmin ||
                    !isCC
                }

                showBlock={
                    isAdmin ||
                    (!isCC &&
                        !(
                            blockScopeIds.length ===
                            0 &&
                            centerScopeIds.length >
                            0
                        ))
                }

                showCenter={true}

                onClose={
                    handleCloseAddStudent
                }

                onInputChange={
                    handleAddStudentInputChange
                }

                onDistrictChange={
                    handleAddStudentDistrictChange
                }

                onBlockChange={
                    handleAddStudentBlockChange
                }

                onSubmit={
                    handleSubmitAddStudent
                }
            />

        </div>
    );
};

export default Students;