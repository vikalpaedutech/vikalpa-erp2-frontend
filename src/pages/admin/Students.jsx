// import { useEffect, useState } from "react";

// import {
//   getStudents,
//   getStudentById,
//   requestStudentAdd,
//   requestStudentRemove,
//   requestStudentSLC,
//   requestStudentTransfer,
// } from "../../services/student.service";

// import { getPrograms } from "../../services/program.service";
// import { getBatches } from "../../services/batch.service";
// import { getDistricts } from "../../services/district.service";
// import { getBlocks } from "../../services/block.service";
// import { getCenters } from "../../services/center.service";

// import StudentFilters from "../../features/students/components/StudentFilters";
// import StudentTable from "../../features/students/components/StudentTable";
// import StudentDetailsModal from "../../features/students/components/StudentDetailsModal";
// import StudentActionModal from "../../features/students/components/StudentActionModal";
// import AddStudentModal from "../../features/students/components/AddStudentModal";

// function Students() {
//   // ============================================================
//   // STUDENTS
//   // ============================================================

//   const [students, setStudents] = useState([]);

//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 20,
//     total: 0,
//     totalPages: 0,
//     hasNextPage: false,
//     hasPreviousPage: false,
//   });

//   // ============================================================
//   // FILTER DATA
//   // ============================================================

//   const [programs, setPrograms] = useState([]);
//   const [batches, setBatches] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [blocks, setBlocks] = useState([]);
//   const [centers, setCenters] = useState([]);

//   // ============================================================
//   // FILTERS
//   // ============================================================

//   const [search, setSearch] = useState("");
//   const [programId, setProgramId] = useState("");
//   const [batchId, setBatchId] = useState("");
//   const [districtId, setDistrictId] = useState("");
//   const [blockId, setBlockId] = useState("");
//   const [centerId, setCenterId] = useState("");
//   const [studentClass, setStudentClass] = useState("");
//   const [status, setStatus] = useState("");
//   const [isActive, setIsActive] = useState("");

//   // ============================================================
//   // LOADING
//   // ============================================================

//   const [loading, setLoading] = useState(false);
//   const [filterLoading, setFilterLoading] = useState(false);

//   // ============================================================
//   // STUDENT DETAILS MODAL
//   // ============================================================

//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [showStudentModal, setShowStudentModal] = useState(false);
//   const [studentLoading, setStudentLoading] = useState(false);

//   // ============================================================
//   // ACTION MODAL
//   // ============================================================

//   const [actionModal, setActionModal] = useState(null);

//   const [requestReason, setRequestReason] = useState("");
//   const [actionLoading, setActionLoading] = useState(false);

//   // ============================================================
//   // TRANSFER
//   // ============================================================

//   const [transferDistrictId, setTransferDistrictId] =
//     useState("");

//   const [transferBlockId, setTransferBlockId] =
//     useState("");

//   const [transferCenterId, setTransferCenterId] =
//     useState("");

//   const [transferBlocks, setTransferBlocks] = useState([]);
//   const [transferCenters, setTransferCenters] = useState([]);

//   const [transferBlockLoading, setTransferBlockLoading] =
//     useState(false);

//   const [transferCenterLoading, setTransferCenterLoading] =
//     useState(false);

//   // ============================================================
//   // ADD STUDENT
//   // ============================================================

//   const [showAddStudentModal, setShowAddStudentModal] =
//     useState(false);

//   const [addStudentLoading, setAddStudentLoading] =
//     useState(false);

//   const [addStudentError, setAddStudentError] =
//     useState("");

//   const [addStudentData, setAddStudentData] = useState({
//     studentSrn: "",
//     rollNumber: "",
//     name: "",
//     fatherName: "",
//     motherName: "",
//     personalContact: "",
//     parentContact: "",
//     otherContact: "",
//     dob: "",
//     gender: "",
//     category: "",
//     address: "",

//     programId: "",
//     batchId: "",
//     districtId: "",
//     blockId: "",
//     centerId: "",
//     class: "",
//     board: "",
//     enrollmentDate: "",
//     requestReason: "",
//   });

//   const [addStudentBlocks, setAddStudentBlocks] =
//     useState([]);

//   const [addStudentCenters, setAddStudentCenters] =
//     useState([]);

//   const [addStudentBlockLoading, setAddStudentBlockLoading] =
//     useState(false);

//   const [addStudentCenterLoading, setAddStudentCenterLoading] =
//     useState(false);

//   // ============================================================
//   // LOAD STUDENTS
//   // ============================================================

//   const loadStudents = async (page = 1) => {
//     try {
//       setLoading(true);

//       const params = {
//         page,
//         limit: pagination.limit,
//       };

//       if (search.trim()) {
//         params.search = search.trim();
//       }

//       if (programId) {
//         params.programId = programId;
//       }

//       if (batchId) {
//         params.batchId = batchId;
//       }

//       if (districtId) {
//         params.districtId = districtId;
//       }

//       if (blockId) {
//         params.blockId = blockId;
//       }

//       if (centerId) {
//         params.centerId = centerId;
//       }

//       if (studentClass) {
//         params.class = studentClass;
//       }

//       if (status) {
//         params.status = status;
//       }

//       if (isActive !== "") {
//         params.isActive = isActive;
//       }

//       const response = await getStudents(params);

//       setStudents(response.data?.students || []);

//       setPagination(
//         response.data?.pagination || {
//           page: 1,
//           limit: 20,
//           total: 0,
//           totalPages: 0,
//           hasNextPage: false,
//           hasPreviousPage: false,
//         }
//       );
//     } catch (error) {
//       console.error(
//         "Failed to load students:",
//         error
//       );

//       alert(
//         error.response?.data?.message ||
//           "Failed to load students"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // LOAD FILTER DATA
//   // ============================================================

//   const loadFilterData = async () => {
//     try {
//       setFilterLoading(true);

//       const [
//         programsResponse,
//         batchesResponse,
//         districtsResponse,
//       ] = await Promise.all([
//         getPrograms({
//           page: 1,
//           limit: 100,
//         }),

//         getBatches({
//           page: 1,
//           limit: 100,
//         }),

//         getDistricts({
//           page: 1,
//           limit: 100,
//         }),
//       ]);

//       setPrograms(
//         programsResponse.data?.programs ||
//           programsResponse.data ||
//           []
//       );

//       setBatches(
//         batchesResponse.data?.batches ||
//           batchesResponse.data ||
//           []
//       );

//       setDistricts(
//         districtsResponse.data?.districts ||
//           districtsResponse.data ||
//           []
//       );
//     } catch (error) {
//       console.error(
//         "Failed to load filter data:",
//         error
//       );
//     } finally {
//       setFilterLoading(false);
//     }
//   };

//   // ============================================================
//   // INITIAL LOAD
//   // ============================================================

//   useEffect(() => {
//     loadFilterData();
//   }, []);

//   useEffect(() => {
//     loadStudents(1);
//   }, [
//     programId,
//     batchId,
//     districtId,
//     blockId,
//     centerId,
//     studentClass,
//     status,
//     isActive,
//   ]);

//   // ============================================================
//   // LOAD FILTER BLOCKS
//   // ============================================================

//   useEffect(() => {
//     const loadBlocks = async () => {
//       if (!districtId) {
//         setBlocks([]);
//         setBlockId("");
//         return;
//       }

//       try {
//         const response = await getBlocks({
//           page: 1,
//           limit: 100,
//           districtId,
//         });

//         setBlocks(
//           response.data?.blocks ||
//             response.data ||
//             []
//         );
//       } catch (error) {
//         console.error(
//           "Failed to load blocks:",
//           error
//         );

//         setBlocks([]);
//       }
//     };

//     loadBlocks();
//   }, [districtId]);

//   // ============================================================
//   // LOAD FILTER CENTERS
//   // ============================================================

//   useEffect(() => {
//     const loadCenters = async () => {
//       if (!blockId) {
//         setCenters([]);
//         setCenterId("");
//         return;
//       }

//       try {
//         const response = await getCenters({
//           page: 1,
//           limit: 100,
//           blockId,
//         });

//         setCenters(
//           response.data?.centers ||
//             response.data ||
//             []
//         );
//       } catch (error) {
//         console.error(
//           "Failed to load centers:",
//           error
//         );

//         setCenters([]);
//       }
//     };

//     loadCenters();
//   }, [blockId]);

//   // ============================================================
//   // SEARCH
//   // ============================================================

//   const handleSearch = (event) => {
//     event.preventDefault();

//     loadStudents(1);
//   };

//   // ============================================================
//   // RESET FILTERS
//   // ============================================================

//   const handleReset = () => {
//     setSearch("");
//     setProgramId("");
//     setBatchId("");
//     setDistrictId("");
//     setBlockId("");
//     setCenterId("");
//     setStudentClass("");
//     setStatus("");
//     setIsActive("");

//     setTimeout(() => {
//       loadStudents(1);
//     }, 0);
//   };

//   // ============================================================
//   // VIEW STUDENT
//   // ============================================================

//   const handleViewStudent = async (studentId) => {
//     try {
//       setStudentLoading(true);
//       setShowStudentModal(true);

//       const response =
//         await getStudentById(studentId);

//       setSelectedStudent(response.data);
//     } catch (error) {
//       console.error(
//         "Failed to load student:",
//         error
//       );

//       alert(
//         error.response?.data?.message ||
//           "Failed to load student details"
//       );

//       setShowStudentModal(false);
//     } finally {
//       setStudentLoading(false);
//     }
//   };

//   // ============================================================
//   // ACTION MODAL
//   // ============================================================

//   const closeActionModal = () => {
//     if (actionLoading) return;

//     setActionModal(null);
//     setRequestReason("");

//     setTransferDistrictId("");
//     setTransferBlockId("");
//     setTransferCenterId("");

//     setTransferBlocks([]);
//     setTransferCenters([]);
//   };

//   const openActionModal = (type) => {
//     setRequestReason("");

//     setTransferDistrictId("");
//     setTransferBlockId("");
//     setTransferCenterId("");

//     setTransferBlocks([]);
//     setTransferCenters([]);

//     setActionModal(type);
//   };

//   // ============================================================
//   // TRANSFER BLOCKS
//   // ============================================================

//   useEffect(() => {
//     const loadTransferBlocks = async () => {
//       if (!transferDistrictId) {
//         setTransferBlocks([]);
//         setTransferBlockId("");
//         return;
//       }

//       try {
//         setTransferBlockLoading(true);

//         const response = await getBlocks({
//           page: 1,
//           limit: 100,
//           districtId: transferDistrictId,
//         });

//         setTransferBlocks(
//           response.data?.blocks ||
//             response.data ||
//             []
//         );
//       } catch (error) {
//         console.error(
//           "Failed to load transfer blocks:",
//           error
//         );

//         setTransferBlocks([]);
//       } finally {
//         setTransferBlockLoading(false);
//       }
//     };

//     loadTransferBlocks();
//   }, [transferDistrictId]);

//   // ============================================================
//   // TRANSFER CENTERS
//   // ============================================================

//   useEffect(() => {
//     const loadTransferCenters = async () => {
//       if (!transferBlockId) {
//         setTransferCenters([]);
//         setTransferCenterId("");
//         return;
//       }

//       try {
//         setTransferCenterLoading(true);

//         const response = await getCenters({
//           page: 1,
//           limit: 100,
//           blockId: transferBlockId,
//         });

//         setTransferCenters(
//           response.data?.centers ||
//             response.data ||
//             []
//         );
//       } catch (error) {
//         console.error(
//           "Failed to load transfer centers:",
//           error
//         );

//         setTransferCenters([]);
//       } finally {
//         setTransferCenterLoading(false);
//       }
//     };

//     loadTransferCenters();
//   }, [transferBlockId]);

//   // ============================================================
//   // SUBMIT REMOVE / SLC / TRANSFER
//   // ============================================================

//   const handleActionSubmit = async (event) => {
//     event.preventDefault();

//     if (!selectedStudent?.student?._id) {
//       alert("Student information is missing");
//       return;
//     }

//     if (!requestReason.trim()) {
//       alert("Request reason is required");
//       return;
//     }

//     try {
//       setActionLoading(true);

//       const studentId =
//         selectedStudent.student._id;

//       if (actionModal === "remove") {
//         await requestStudentRemove({
//           studentId,
//           requestReason:
//             requestReason.trim(),
//         });
//       }

//       if (actionModal === "slc") {
//         await requestStudentSLC({
//           studentId,
//           requestReason:
//             requestReason.trim(),
//         });
//       }

//       if (actionModal === "transfer") {
//         if (
//           !transferDistrictId ||
//           !transferBlockId ||
//           !transferCenterId
//         ) {
//           alert(
//             "District, block and center are required for transfer"
//           );
//           return;
//         }

//         await requestStudentTransfer({
//           studentId,
//           transferTo: {
//             districtId:
//               transferDistrictId,
//             blockId: transferBlockId,
//             centerId: transferCenterId,
//           },
//           requestReason:
//             requestReason.trim(),
//         });
//       }

//       alert(
//         `${
//           actionModal === "remove"
//             ? "Student removal"
//             : actionModal === "slc"
//             ? "Student SLC"
//             : "Student transfer"
//         } request submitted successfully`
//       );

//       closeActionModal();

//       await loadStudents(pagination.page);
//     } catch (error) {
//       console.error(
//         "Failed to submit student request:",
//         error
//       );

//       alert(
//         error.response?.data?.message ||
//           "Failed to submit student request"
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // ============================================================
//   // ADD STUDENT FORM
//   // ============================================================

//   const resetAddStudentForm = () => {
//     setAddStudentData({
//       studentSrn: "",
//       rollNumber: "",
//       name: "",
//       fatherName: "",
//       motherName: "",
//       personalContact: "",
//       parentContact: "",
//       otherContact: "",
//       dob: "",
//       gender: "",
//       category: "",
//       address: "",

//       programId: "",
//       batchId: "",
//       districtId: "",
//       blockId: "",
//       centerId: "",
//       class: "",
//       board: "",
//       enrollmentDate: "",
//       requestReason: "",
//     });

//     setAddStudentBlocks([]);
//     setAddStudentCenters([]);
//     setAddStudentError("");
//   };

//   const closeAddStudentModal = () => {
//     if (addStudentLoading) return;

//     setShowAddStudentModal(false);
//     resetAddStudentForm();
//   };

//   const handleAddStudentInput = (event) => {
//     const { name, value } = event.target;

//     setAddStudentData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));
//   };

//   // ============================================================
//   // ADD STUDENT BLOCKS
//   // ============================================================

//   useEffect(() => {
//     const loadAddStudentBlocks = async () => {
//       if (!addStudentData.districtId) {
//         setAddStudentBlocks([]);
//         return;
//       }

//       try {
//         setAddStudentBlockLoading(true);

//         const response = await getBlocks({
//           page: 1,
//           limit: 100,
//           districtId:
//             addStudentData.districtId,
//         });

//         setAddStudentBlocks(
//           response.data?.blocks ||
//             response.data ||
//             []
//         );
//       } catch (error) {
//         console.error(
//           "Failed to load add student blocks:",
//           error
//         );

//         setAddStudentBlocks([]);
//       } finally {
//         setAddStudentBlockLoading(false);
//       }
//     };

//     loadAddStudentBlocks();
//   }, [addStudentData.districtId]);

//   // ============================================================
//   // ADD STUDENT CENTERS
//   // ============================================================

//   useEffect(() => {
//     const loadAddStudentCenters = async () => {
//       if (!addStudentData.blockId) {
//         setAddStudentCenters([]);
//         return;
//       }

//       try {
//         setAddStudentCenterLoading(true);

//         const response = await getCenters({
//           page: 1,
//           limit: 100,
//           blockId:
//             addStudentData.blockId,
//         });

//         setAddStudentCenters(
//           response.data?.centers ||
//             response.data ||
//             []
//         );
//       } catch (error) {
//         console.error(
//           "Failed to load add student centers:",
//           error
//         );

//         setAddStudentCenters([]);
//       } finally {
//         setAddStudentCenterLoading(false);
//       }
//     };

//     loadAddStudentCenters();
//   }, [addStudentData.blockId]);

//   // ============================================================
//   // ADD STUDENT REQUEST
//   // ============================================================

//   const handleAddStudentSubmit = async (event) => {
//     event.preventDefault();

//     try {
//       setAddStudentLoading(true);
//       setAddStudentError("");

//       if (
//         !addStudentData.studentSrn.trim() ||
//         !addStudentData.name.trim()
//       ) {
//         setAddStudentError(
//           "Student SRN and name are required"
//         );
//         return;
//       }

//       if (
//         !addStudentData.programId ||
//         !addStudentData.batchId
//       ) {
//         setAddStudentError(
//           "Program and batch are required"
//         );
//         return;
//       }

//       if (!addStudentData.requestReason.trim()) {
//         setAddStudentError(
//           "Request reason is required"
//         );
//         return;
//       }

//       const payload = {
//         student: {
//           studentSrn:
//             addStudentData.studentSrn.trim(),

//           rollNumber:
//             addStudentData.rollNumber.trim() ||
//             undefined,

//           name:
//             addStudentData.name.trim(),

//           fatherName:
//             addStudentData.fatherName.trim() ||
//             undefined,

//           motherName:
//             addStudentData.motherName.trim() ||
//             undefined,

//           personalContact:
//             addStudentData.personalContact.trim() ||
//             undefined,

//           parentContact:
//             addStudentData.parentContact.trim() ||
//             undefined,

//           otherContact:
//             addStudentData.otherContact.trim() ||
//             undefined,

//           dob:
//             addStudentData.dob ||
//             undefined,

//           gender:
//             addStudentData.gender ||
//             undefined,

//           category:
//             addStudentData.category.trim() ||
//             undefined,

//           address:
//             addStudentData.address.trim() ||
//             undefined,

//           isActive: false,
//         },

//         enrollment: {
//           programId:
//             addStudentData.programId,

//           batchId:
//             addStudentData.batchId,

//           districtId:
//             addStudentData.districtId ||
//             undefined,

//           blockId:
//             addStudentData.blockId ||
//             undefined,

//           centerId:
//             addStudentData.centerId ||
//             undefined,

//           class: addStudentData.class
//             ? Number(addStudentData.class)
//             : undefined,

//           board:
//             addStudentData.board.trim() ||
//             undefined,

//           enrollmentDate:
//             addStudentData.enrollmentDate ||
//             undefined,
//         },

//         requestReason:
//           addStudentData.requestReason.trim(),
//       };

//       await requestStudentAdd(payload);

//       alert(
//         "Student add request submitted successfully"
//       );

//       closeAddStudentModal();

//       await loadStudents(1);
//     } catch (error) {
//       console.error(
//         "Failed to submit add student request:",
//         error
//       );

//       setAddStudentError(
//         error.response?.data?.message ||
//           "Failed to submit add student request"
//       );
//     } finally {
//       setAddStudentLoading(false);
//     }
//   };

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <div className="p-6">

//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">
//             Students
//           </h1>

//           <p className="mt-1 text-sm text-gray-500">
//             Manage and view students
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="text-sm text-gray-500">
//             Total:{" "}
//             <span className="font-semibold text-gray-800">
//               {pagination.total || 0}
//             </span>
//           </div>

//           <button
//             type="button"
//             onClick={() => {
//               resetAddStudentForm();
//               setShowAddStudentModal(true);
//             }}
//             className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
//           >
//             + Add Student
//           </button>
//         </div>
//       </div>

//       <StudentFilters
//         search={search}
//         setSearch={setSearch}
//         programId={programId}
//         setProgramId={setProgramId}
//         batchId={batchId}
//         setBatchId={setBatchId}
//         districtId={districtId}
//         setDistrictId={setDistrictId}
//         blockId={blockId}
//         setBlockId={setBlockId}
//         centerId={centerId}
//         setCenterId={setCenterId}
//         studentClass={studentClass}
//         setStudentClass={setStudentClass}
//         status={status}
//         setStatus={setStatus}
//         isActive={isActive}
//         setIsActive={setIsActive}
//         programs={programs}
//         batches={batches}
//         districts={districts}
//         blocks={blocks}
//         centers={centers}
//         filterLoading={filterLoading}
//         onSearch={handleSearch}
//         onReset={handleReset}
//       />

//       {/* ======================================================
//           TABLE
//       ====================================================== */}

//       <StudentTable
//         students={students}
//         loading={loading}
//         pagination={pagination}
//         onViewStudent={handleViewStudent}
//       />

//       {/* ======================================================
//           PAGINATION
//       ====================================================== */}

//       <div className="flex items-center justify-between rounded-b-xl border-x border-b border-gray-200 bg-white px-4 py-3">
//         <div className="text-sm text-gray-500">
//           Page {pagination.page || 1} of{" "}
//           {pagination.totalPages || 1}
//         </div>

//         <div className="flex gap-2">
//           <button
//             type="button"
//             disabled={
//               !pagination.hasPreviousPage ||
//               loading
//             }
//             onClick={() =>
//               loadStudents(
//                 pagination.page - 1
//               )
//             }
//             className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             Previous
//           </button>

//           <button
//             type="button"
//             disabled={
//               !pagination.hasNextPage ||
//               loading
//             }
//             onClick={() =>
//               loadStudents(
//                 pagination.page + 1
//               )
//             }
//             className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* ======================================================
//     STUDENT DETAILS MODAL
// ====================================================== */}

// <StudentDetailsModal
//     open={showStudentModal}
//     student={selectedStudent}
//     loading={studentLoading}
//     onClose={() => {
//         setShowStudentModal(false);
//         setSelectedStudent(null);
//     }}
//     onAction={openActionModal}
// />
                

//       {/* ======================================================
//           ACTION MODAL
//       ====================================================== */}

//       <StudentActionModal
//     open={!!actionModal}
//     actionType={actionModal}
//     student={selectedStudent}
//     districts={districts}
//     blocks={transferBlocks}
//     centers={transferCenters}
//     selectedDistrictId={transferDistrictId}
//     selectedBlockId={transferBlockId}
//     selectedCenterId={transferCenterId}
//     requestReason={requestReason}
//     loading={actionLoading}
//     onDistrictChange={setTransferDistrictId}
//     onBlockChange={setTransferBlockId}
//     onCenterChange={setTransferCenterId}
//     onReasonChange={setRequestReason}
//     onClose={closeActionModal}
//     onSubmit={handleActionSubmit}
// />

//       {/* ======================================================
//           ADD STUDENT MODAL
//       ====================================================== */}

//       <AddStudentModal
//     open={showAddStudentModal}
//     addStudentData={addStudentData}
//     addStudentError={addStudentError}
//     addStudentLoading={addStudentLoading}
//     programs={programs}
//     batches={batches}
//     districts={districts}
//     addStudentBlocks={addStudentBlocks}
//     addStudentCenters={addStudentCenters}
//     addStudentBlockLoading={addStudentBlockLoading}
//     addStudentCenterLoading={addStudentCenterLoading}
//     onClose={closeAddStudentModal}
//     onInputChange={handleAddStudentInput}
//     onDistrictChange={(event) => {
//         handleAddStudentInput(event);

//         setAddStudentData((previous) => ({
//             ...previous,
//             blockId: "",
//             centerId: "",
//         }));

//         setAddStudentCenters([]);
//     }}
//     onBlockChange={(event) => {
//         handleAddStudentInput(event);

//         setAddStudentData((previous) => ({
//             ...previous,
//             centerId: "",
//         }));
//     }}
//     onSubmit={handleAddStudentSubmit}
// />
//     </div>
//   );
// }

// export default Students;