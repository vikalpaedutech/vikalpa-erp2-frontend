// import { useEffect, useState } from "react";
// import useStudentScope from "../hooks/useStudentScope";

// import { getDistricts } from "../../../services/district.service";

// import {
//     getCentersByBlock,
//     getCentersByDistrict,
// } from "../../../services/center.service";

// import {
//     getBlocksByDistrict,
//     getBlocks,
// } from "../../../services/block.service";

// const StudentFilters = ({ onSearch }) => {
//     const {
//         isAdmin,
//         programs,
//         batches,
//         regionScopes,
//     } = useStudentScope();

//     const [districts, setDistricts] = useState([]);
//     const [blocks, setBlocks] = useState([]);
//     const [centers, setCenters] = useState([]);

//     const [loadingRegions, setLoadingRegions] = useState(false);

//     const [filters, setFilters] = useState({
//         search: "",
//         programId: "",
//         batchId: "",
//         districtId: "",
//         blockId: "",
//         centerId: "",
//         board: "",
//         status: "",
//         isActive: "",
//     });

//     const getId = (value) => {
//         if (!value) {
//             return null;
//         }

//         if (typeof value === "object") {
//             return (
//                 value._id ||
//                 value.districtId ||
//                 value.blockId ||
//                 value.centerId
//             );
//         }

//         return value;
//     };

//     /*
//      * Load region options according to user's scope.
//      */
//     useEffect(() => {
//         const loadRegions = async () => {
//             try {
//                 setLoadingRegions(true);

//                 /*
//                  * ADMIN
//                  * Admin can access everything.
//                  */
//                 if (isAdmin) {
//                     const response = await getDistricts({
//                         page: 1,
//                         limit: 100,
//                     });

//                     setDistricts(
//                         response.data?.districts || []
//                     );

//                     return;
//                 }

//                 /*
//                  * GLOBAL
//                  * Global user can access all regions.
//                  */
//                 const hasGlobalAccess = regionScopes.some(
//                     (scope) => scope.scope === "global"
//                 );

//                 if (hasGlobalAccess) {
//                     const response = await getDistricts({
//                         page: 1,
//                         limit: 100,
//                     });

//                     setDistricts(
//                         response.data?.districts || []
//                     );

//                     return;
//                 }

//                 /*
//                  * DISTRICT SCOPE
//                  */
//                 const districtScopes = regionScopes.filter(
//                     (scope) =>
//                         scope.scope === "district" &&
//                         scope.districtId
//                 );

//                 if (districtScopes.length > 0) {
//                     const districtIds = districtScopes
//                         .map((scope) =>
//                             getId(scope.districtId)
//                         )
//                         .filter(Boolean);

//                     const districtResponse =
//                         await getDistricts({
//                             page: 1,
//                             limit: 100,
//                         });

//                     const allDistricts =
//                         districtResponse.data?.districts || [];

//                     const allowedDistricts =
//                         allDistricts.filter((district) =>
//                             districtIds.includes(
//                                 district._id
//                             )
//                         );

//                     setDistricts(allowedDistricts);

//                     /*
//                      * Load blocks belonging
//                      * to assigned districts.
//                      */
//                     const blockResults =
//                         await Promise.all(
//                             districtIds.map((districtId) =>
//                                 getBlocksByDistrict(
//                                     districtId
//                                 )
//                             )
//                         );

//                     const loadedBlocks =
//                         blockResults.flatMap(
//                             (response) =>
//                                 response.data || []
//                         );

//                     const uniqueBlocks =
//                         Array.from(
//                             new Map(
//                                 loadedBlocks.map(
//                                     (block) => [
//                                         block._id,
//                                         block,
//                                     ]
//                                 )
//                             ).values()
//                         );

//                     setBlocks(uniqueBlocks);

//                     /*
//                      * Load centers belonging
//                      * to assigned districts.
//                      */
//                     const centerResults =
//                         await Promise.all(
//                             districtIds.map((districtId) =>
//                                 getCentersByDistrict(
//                                     districtId
//                                 )
//                             )
//                         );

//                     const loadedCenters =
//                         centerResults.flatMap(
//                             (response) =>
//                                 response.data || []
//                         );

//                     const uniqueCenters =
//                         Array.from(
//                             new Map(
//                                 loadedCenters.map(
//                                     (center) => [
//                                         center._id,
//                                         center,
//                                     ]
//                                 )
//                             ).values()
//                         );

//                     setCenters(uniqueCenters);

//                     return;
//                 }

//                 /*
//                  * BLOCK SCOPE
//                  */
//                 const blockScopes = regionScopes.filter(
//                     (scope) =>
//                         scope.scope === "block" &&
//                         scope.blockId
//                 );

//                 if (blockScopes.length > 0) {
//                     const blockIds = blockScopes
//                         .map((scope) =>
//                             getId(scope.blockId)
//                         )
//                         .filter(Boolean);

//                     const blockResponse = await getBlocks({
//                         page: 1,
//                         limit: 100,
//                     });

//                     const allBlocks =
//                         blockResponse.data?.blocks || [];

//                     const allowedBlocks =
//                         allBlocks.filter((block) =>
//                             blockIds.includes(
//                                 block._id
//                             )
//                         );

//                     setBlocks(allowedBlocks);

//                     const centerResults =
//                         await Promise.all(
//                             blockIds.map((blockId) =>
//                                 getCentersByBlock(
//                                     blockId
//                                 )
//                             )
//                         );

//                     const loadedCenters =
//                         centerResults.flatMap(
//                             (response) =>
//                                 response.data || []
//                         );

//                     const uniqueCenters =
//                         Array.from(
//                             new Map(
//                                 loadedCenters.map(
//                                     (center) => [
//                                         center._id,
//                                         center,
//                                     ]
//                                 )
//                             ).values()
//                         );

//                     setCenters(uniqueCenters);

//                     return;
//                 }

//                 /*
//                  * CENTER SCOPE
//                  */
//                 const centerScopes = regionScopes.filter(
//                     (scope) =>
//                         scope.scope === "center" &&
//                         scope.centerId
//                 );

//                 if (centerScopes.length > 0) {
//                     const centerObjects =
//                         centerScopes
//                             .map(
//                                 (scope) =>
//                                     scope.centerId
//                             )
//                             .filter(Boolean);

//                     const allowedCenters =
//                         centerObjects.map(
//                             (center) =>
//                                 typeof center ===
//                                 "object"
//                                     ? center
//                                     : {
//                                           _id: center,
//                                       }
//                         );

//                     setCenters(allowedCenters);
//                 }
//             } catch (error) {
//                 console.error(
//                     "Failed to load region filters:",
//                     error
//                 );
//             } finally {
//                 setLoadingRegions(false);
//             }
//         };

//         loadRegions();
//     }, [isAdmin, regionScopes]);

//     /*
//      * When district changes:
//      * load corresponding blocks and centers.
//      */
//     useEffect(() => {
//         const loadDistrictRegions = async () => {
//             if (!filters.districtId) {
//                 return;
//             }

//             try {
//                 setLoadingRegions(true);

//                 const [
//                     blockResponse,
//                     centerResponse,
//                 ] = await Promise.all([
//                     getBlocksByDistrict(
//                         filters.districtId
//                     ),
//                     getCentersByDistrict(
//                         filters.districtId
//                     ),
//                 ]);

//                 setBlocks(
//                     blockResponse.data || []
//                 );

//                 setCenters(
//                     centerResponse.data || []
//                 );
//             } catch (error) {
//                 console.error(
//                     "Failed to load district regions:",
//                     error
//                 );
//             } finally {
//                 setLoadingRegions(false);
//             }
//         };

//         loadDistrictRegions();
//     }, [filters.districtId]);

//     /*
//      * When block changes:
//      * load corresponding centers.
//      */
//     useEffect(() => {
//         const loadBlockCenters = async () => {
//             if (!filters.blockId) {
//                 return;
//             }

//             try {
//                 setLoadingRegions(true);

//                 const response =
//                     await getCentersByBlock(
//                         filters.blockId
//                     );

//                 setCenters(
//                     response.data || []
//                 );
//             } catch (error) {
//                 console.error(
//                     "Failed to load block centers:",
//                     error
//                 );
//             } finally {
//                 setLoadingRegions(false);
//             }
//         };

//         loadBlockCenters();
//     }, [filters.blockId]);

//     const handleChange = (event) => {
//         const { name, value } = event.target;

//         setFilters((previous) => {
//             const updatedFilters = {
//                 ...previous,
//                 [name]: value,
//             };

//             /*
//              * Program changed:
//              * reset dependent batch.
//              */
//             if (name === "programId") {
//                 updatedFilters.batchId = "";
//             }

//             /*
//              * District changed:
//              * reset dependent block and center.
//              */
//             if (name === "districtId") {
//                 updatedFilters.blockId = "";
//                 updatedFilters.centerId = "";
//             }

//             /*
//              * Block changed:
//              * reset dependent center.
//              */
//             if (name === "blockId") {
//                 updatedFilters.centerId = "";
//             }

//             return updatedFilters;
//         });
//     };

//     const handleSearch = (event) => {
//         event.preventDefault();

//         const cleanedFilters = Object.entries(
//             filters
//         ).reduce((result, [key, value]) => {
//             if (value !== "") {
//                 result[key] = value;
//             }

//             return result;
//         }, {});

//         onSearch(cleanedFilters);
//     };

//     const handleReset = () => {
//         const resetFilters = {
//             search: "",
//             programId: "",
//             batchId: "",
//             districtId: "",
//             blockId: "",
//             centerId: "",
//             board: "",
//             status: "",
//             isActive: "",
//         };

//         setFilters(resetFilters);

//         onSearch({});
//     };

//     /*
//      * Program → Batch cascading.
//      *
//      * If no program is selected:
//      * show all accessible batches.
//      *
//      * If program is selected:
//      * show only batches belonging to that program.
//      */
//     const visibleBatches = filters.programId
//         ? batches.filter((batch) => {
//               const batchProgramId =
//                   getId(batch.programId);

//               return (
//                   batchProgramId ===
//                   filters.programId
//               );
//           })
//         : batches;

//     /*
//      * District → Block cascading.
//      */
//     const visibleBlocks = filters.districtId
//         ? blocks.filter(
//               (block) =>
//                   getId(block.districtId) ===
//                   filters.districtId
//           )
//         : blocks;

//     /*
//      * District → Block → Center cascading.
//      */
//     const visibleCenters = filters.blockId
//         ? centers.filter(
//               (center) =>
//                   getId(center.blockId) ===
//                   filters.blockId
//           )
//         : filters.districtId
//           ? centers.filter(
//                 (center) =>
//                     getId(center.districtId) ===
//                     filters.districtId
//             )
//           : centers;

//     return (
//         <form
//             onSubmit={handleSearch}
//             className="mb-6 rounded-lg border bg-white p-5"
//         >
//             <div className="mb-4">
//                 <h2 className="text-lg font-semibold">
//                     Student Filters
//                 </h2>
//             </div>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {/* Search */}
//                 <div className="lg:col-span-3">
//                     <label className="mb-1 block text-sm font-medium">
//                         Search
//                     </label>

//                     <input
//                         type="text"
//                         name="search"
//                         value={filters.search}
//                         onChange={handleChange}
//                         placeholder="Search by name, SRN, roll number, father name..."
//                         className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
//                     />
//                 </div>

//                 {/* Program */}
//                 <div>
//                     <label className="mb-1 block text-sm font-medium">
//                         Program
//                     </label>

//                     <select
//                         name="programId"
//                         value={filters.programId}
//                         onChange={handleChange}
//                         className="w-full rounded-md border px-3 py-2"
//                     >
//                         <option value="">
//                             All Programs
//                         </option>

//                         {programs.map((program) => (
//                             <option
//                                 key={program._id}
//                                 value={program._id}
//                             >
//                                 {program.programName}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Batch */}
//                 <div>
//                     <label className="mb-1 block text-sm font-medium">
//                         Batch
//                     </label>

//                     <select
//                         name="batchId"
//                         value={filters.batchId}
//                         onChange={handleChange}
//                         disabled={
//                             !!filters.programId &&
//                             visibleBatches.length === 0
//                         }
//                         className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
//                     >
//                         <option value="">
//                             All Batches
//                         </option>

//                         {visibleBatches.map((batch) => (
//                             <option
//                                 key={batch._id}
//                                 value={batch._id}
//                             >
//                                 {batch.batchName}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* District */}
//                 <div>
//                     <label className="mb-1 block text-sm font-medium">
//                         District
//                     </label>

//                     <select
//                         name="districtId"
//                         value={filters.districtId}
//                         onChange={handleChange}
//                         disabled={loadingRegions}
//                         className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
//                     >
//                         <option value="">
//                             All Districts
//                         </option>

//                         {districts.map((district) => (
//                             <option
//                                 key={district._id}
//                                 value={district._id}
//                             >
//                                 {district.districtName}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Block */}
//                 <div>
//                     <label className="mb-1 block text-sm font-medium">
//                         Block
//                     </label>

//                     <select
//                         name="blockId"
//                         value={filters.blockId}
//                         onChange={handleChange}
//                         disabled={
//                             loadingRegions ||
//                             visibleBlocks.length === 0
//                         }
//                         className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
//                     >
//                         <option value="">
//                             All Blocks
//                         </option>

//                         {visibleBlocks.map((block) => (
//                             <option
//                                 key={block._id}
//                                 value={block._id}
//                             >
//                                 {block.blockName}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Center */}
//                 <div>
//                     <label className="mb-1 block text-sm font-medium">
//                         Center
//                     </label>

//                     <select
//                         name="centerId"
//                         value={filters.centerId}
//                         onChange={handleChange}
//                         disabled={
//                             loadingRegions ||
//                             visibleCenters.length === 0
//                         }
//                         className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
//                     >
//                         <option value="">
//                             All Centers
//                         </option>

//                         {visibleCenters.map((center) => (
//                             <option
//                                 key={center._id}
//                                 value={center._id}
//                             >
//                                 {center.centerName}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Board */}
//                 <div>
//                     <label className="mb-1 block text-sm font-medium">
//                         Board
//                     </label>

//                     <select
//                         name="board"
//                         value={filters.board}
//                         onChange={handleChange}
//                         className="w-full rounded-md border px-3 py-2"
//                     >
//                         <option value="">
//                             All Boards
//                         </option>

//                         <option value="HBSE">
//                             HBSE
//                         </option>

//                         <option value="CBSE">
//                             CBSE
//                         </option>
//                     </select>
//                 </div>

//                 {/* Enrollment Status */}
//                 <div>
//                     <label className="mb-1 block text-sm font-medium">
//                         Enrollment Status
//                     </label>

//                     <select
//                         name="status"
//                         value={filters.status}
//                         onChange={handleChange}
//                         className="w-full rounded-md border px-3 py-2"
//                     >
//                         <option value="">
//                             All Statuses
//                         </option>

//                         <option value="active">
//                             Active
//                         </option>

//                         <option value="provisional">
//                             Provisional
//                         </option>

//                         <option value="requested-slc">
//                             Requested SLC
//                         </option>

//                         <option value="left">
//                             Left
//                         </option>

//                         <option value="add-request">
//                             Add Request
//                         </option>

//                         <option value="remove-request">
//                             Remove Request
//                         </option>

//                         <option value="completed">
//                             Completed
//                         </option>

//                         <option value="transfer-student">
//                             Transfer Student
//                         </option>
//                     </select>
//                 </div>

//                 {/* Student Status */}
//                 <div>
//                     <label className="mb-1 block text-sm font-medium">
//                         Student Status
//                     </label>

//                     <select
//                         name="isActive"
//                         value={filters.isActive}
//                         onChange={handleChange}
//                         className="w-full rounded-md border px-3 py-2"
//                     >
//                         <option value="">
//                             All
//                         </option>

//                         <option value="true">
//                             Active
//                         </option>

//                         <option value="false">
//                             Inactive
//                         </option>
//                     </select>
//                 </div>
//             </div>

//             <div className="mt-5 flex gap-3">
//                 <button
//                     type="submit"
//                     className="rounded-md border px-5 py-2 font-medium"
//                 >
//                     Search
//                 </button>

//                 <button
//                     type="button"
//                     onClick={handleReset}
//                     className="rounded-md border px-5 py-2"
//                 >
//                     Reset
//                 </button>
//             </div>
//         </form>
//     );
// };

// export default StudentFilters;






// FILE PATH: frontend/src/features/students/components/StudentFilters.jsx

import { useEffect, useState } from "react";
import useStudentScope from "../hooks/useStudentScope";
import { useAuth } from "../../../context/AuthContext";

import { getDistricts } from "../../../services/district.service";

import {
    getCentersByBlock,
    getCentersByDistrict,
    getCenters,
} from "../../../services/center.service";

import {
    getBlocksByDistrict,
    getBlocks,
} from "../../../services/block.service";

const StudentFilters = ({ onSearch }) => {
    const {
        isAdmin,
        programs,
        batches,
        regionScopes,
    } = useStudentScope();

    const { access } = useAuth();

    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [centers, setCenters] = useState([]);

    const [loadingRegions, setLoadingRegions] =
        useState(false);

    const [filters, setFilters] = useState({
        search: "",
        programId: "",
        batchId: "",
        districtId: "",
        blockId: "",
        centerId: "",
        board: "",
        status: "",
        isActive: "",
    });

    /*
     * -----------------------------------------
     * ROLE
     * -----------------------------------------
     */

    const isCC = access?.roles?.some(
        (role) =>
            role?.roleCode?.toLowerCase() === "cc"
    );

    /*
     * -----------------------------------------
     * HELPER
     * -----------------------------------------
     */

    const getId = (value) => {
        if (!value) {
            return null;
        }

        if (typeof value === "object") {
            return (
                value._id ||
                value.districtId ||
                value.blockId ||
                value.centerId
            );
        }

        return value;
    };

    /*
     * -----------------------------------------
     * DEFAULT NON-ADMIN FILTERS
     * -----------------------------------------
     *
     * Non-admin:
     * Enrollment Status = Active
     * Student Status = Active
     *
     * If exactly one program is assigned:
     * Program is automatically selected.
     */

    useEffect(() => {
        if (isAdmin) {
            setFilters({
                search: "",
                programId: "",
                batchId: "",
                districtId: "",
                blockId: "",
                centerId: "",
                board: "",
                status: "",
                isActive: "",
            });

            return;
        }

        setFilters((previous) => ({
            ...previous,

            programId:
                programs.length === 1
                    ? programs[0]._id
                    : "",

            status: "active",
            isActive: "true",
        }));
    }, [isAdmin, programs]);

    /*
     * -----------------------------------------
     * LOAD REGION OPTIONS
     * -----------------------------------------
     */

    useEffect(() => {
        const loadRegions = async () => {
            try {
                setLoadingRegions(true);

                /*
                 * ---------------------------------
                 * ADMIN
                 * ---------------------------------
                 */

                if (isAdmin) {
                    const response =
                        await getDistricts({
                            page: 1,
                            limit: 100,
                        });

                    setDistricts(
                        response.data?.districts ||
                            []
                    );

                    return;
                }

                /*
                 * ---------------------------------
                 * CC
                 * ---------------------------------
                 *
                 * CC only gets Center filter.
                 *
                 * No District.
                 * No Block.
                 */

                if (isCC) {
                    const centerScopes =
                        regionScopes.filter(
                            (scope) =>
                                scope.scope ===
                                    "center" &&
                                scope.centerId
                        );

                    if (
                        centerScopes.length > 0
                    ) {
                        const allowedCenters =
                            centerScopes
                                .map(
                                    (scope) =>
                                        scope.centerId
                                )
                                .filter(Boolean)
                                .map((center) =>
                                    typeof center ===
                                    "object"
                                        ? center
                                        : {
                                              _id: center,
                                          }
                                );

                        setCenters(
                            allowedCenters
                        );

                        return;
                    }

                    /*
                     * CC with global access.
                     * Load all centers, but still
                     * no "All Centers" option.
                     */

                    const hasGlobalAccess =
                        regionScopes.some(
                            (scope) =>
                                scope.scope ===
                                "global"
                        );

                    if (hasGlobalAccess) {
                        const response =
                            await getCenters({
                                page: 1,
                                limit: 100,
                            });

                        setCenters(
                            response.data?.centers ||
                                []
                        );
                    }

                    return;
                }

                /*
                 * ---------------------------------
                 * GLOBAL NON-ADMIN
                 * ---------------------------------
                 */

                const hasGlobalAccess =
                    regionScopes.some(
                        (scope) =>
                            scope.scope ===
                            "global"
                    );

                if (hasGlobalAccess) {
                    const response =
                        await getDistricts({
                            page: 1,
                            limit: 100,
                        });

                    setDistricts(
                        response.data?.districts ||
                            []
                    );

                    return;
                }

                /*
                 * ---------------------------------
                 * DISTRICT SCOPE
                 * ---------------------------------
                 */

                const districtScopes =
                    regionScopes.filter(
                        (scope) =>
                            scope.scope ===
                                "district" &&
                            scope.districtId
                    );

                if (
                    districtScopes.length > 0
                ) {
                    const districtIds =
                        districtScopes
                            .map((scope) =>
                                getId(
                                    scope.districtId
                                )
                            )
                            .filter(Boolean);

                    const districtResponse =
                        await getDistricts({
                            page: 1,
                            limit: 100,
                        });

                    const allDistricts =
                        districtResponse.data
                            ?.districts || [];

                    setDistricts(
                        allDistricts.filter(
                            (district) =>
                                districtIds.includes(
                                    district._id
                                )
                        )
                    );

                    const blockResults =
                        await Promise.all(
                            districtIds.map(
                                (districtId) =>
                                    getBlocksByDistrict(
                                        districtId
                                    )
                            )
                        );

                    const loadedBlocks =
                        blockResults.flatMap(
                            (response) =>
                                response.data || []
                        );

                    const uniqueBlocks =
                        Array.from(
                            new Map(
                                loadedBlocks.map(
                                    (block) => [
                                        block._id,
                                        block,
                                    ]
                                )
                            ).values()
                        );

                    setBlocks(
                        uniqueBlocks
                    );

                    const centerResults =
                        await Promise.all(
                            districtIds.map(
                                (districtId) =>
                                    getCentersByDistrict(
                                        districtId
                                    )
                            )
                        );

                    const loadedCenters =
                        centerResults.flatMap(
                            (response) =>
                                response.data || []
                        );

                    const uniqueCenters =
                        Array.from(
                            new Map(
                                loadedCenters.map(
                                    (center) => [
                                        center._id,
                                        center,
                                    ]
                                )
                            ).values()
                        );

                    setCenters(
                        uniqueCenters
                    );

                    return;
                }

                /*
                 * ---------------------------------
                 * BLOCK SCOPE
                 * ---------------------------------
                 */

                const blockScopes =
                    regionScopes.filter(
                        (scope) =>
                            scope.scope ===
                                "block" &&
                            scope.blockId
                    );

                if (
                    blockScopes.length > 0
                ) {
                    const blockIds =
                        blockScopes
                            .map((scope) =>
                                getId(
                                    scope.blockId
                                )
                            )
                            .filter(Boolean);

                    const blockResponse =
                        await getBlocks({
                            page: 1,
                            limit: 100,
                        });

                    const allBlocks =
                        blockResponse.data
                            ?.blocks || [];

                    const allowedBlocks =
                        allBlocks.filter(
                            (block) =>
                                blockIds.includes(
                                    block._id
                                )
                        );

                    setBlocks(
                        allowedBlocks
                    );

                    const districtIds = [
                        ...new Set(
                            allowedBlocks
                                .map((block) =>
                                    getId(
                                        block.districtId
                                    )
                                )
                                .filter(Boolean)
                        ),
                    ];

                    if (
                        districtIds.length > 0
                    ) {
                        const districtResponse =
                            await getDistricts({
                                page: 1,
                                limit: 100,
                            });

                        const allDistricts =
                            districtResponse
                                .data?.districts ||
                            [];

                        setDistricts(
                            allDistricts.filter(
                                (district) =>
                                    districtIds.includes(
                                        district._id
                                    )
                            )
                        );
                    }

                    const centerResults =
                        await Promise.all(
                            blockIds.map(
                                (blockId) =>
                                    getCentersByBlock(
                                        blockId
                                    )
                            )
                        );

                    const loadedCenters =
                        centerResults.flatMap(
                            (response) =>
                                response.data || []
                        );

                    const uniqueCenters =
                        Array.from(
                            new Map(
                                loadedCenters.map(
                                    (center) => [
                                        center._id,
                                        center,
                                    ]
                                )
                            ).values()
                        );

                    setCenters(
                        uniqueCenters
                    );

                    return;
                }

                /*
                 * ---------------------------------
                 * CENTER SCOPE
                 * ---------------------------------
                 */

                const centerScopes =
                    regionScopes.filter(
                        (scope) =>
                            scope.scope ===
                                "center" &&
                            scope.centerId
                    );

                if (
                    centerScopes.length > 0
                ) {
                    const centerObjects =
                        centerScopes
                            .map(
                                (scope) =>
                                    scope.centerId
                            )
                            .filter(Boolean);

                    const allowedCenters =
                        centerObjects.map(
                            (center) =>
                                typeof center ===
                                "object"
                                    ? center
                                    : {
                                          _id: center,
                                      }
                        );

                    setCenters(
                        allowedCenters
                    );

                    const blockIds = [
                        ...new Set(
                            allowedCenters
                                .map((center) =>
                                    getId(
                                        center.blockId
                                    )
                                )
                                .filter(Boolean)
                        ),
                    ];

                    const districtIds = [
                        ...new Set(
                            allowedCenters
                                .map((center) =>
                                    getId(
                                        center.districtId
                                    )
                                )
                                .filter(Boolean)
                        ),
                    ];

                    if (
                        districtIds.length > 0
                    ) {
                        const districtResponse =
                            await getDistricts({
                                page: 1,
                                limit: 100,
                            });

                        const allDistricts =
                            districtResponse
                                .data?.districts ||
                            [];

                        setDistricts(
                            allDistricts.filter(
                                (district) =>
                                    districtIds.includes(
                                        district._id
                                    )
                            )
                        );
                    }

                    if (
                        blockIds.length > 0
                    ) {
                        const blockResponse =
                            await getBlocks({
                                page: 1,
                                limit: 100,
                            });

                        const allBlocks =
                            blockResponse
                                .data?.blocks || [];

                        setBlocks(
                            allBlocks.filter(
                                (block) =>
                                    blockIds.includes(
                                        block._id
                                    )
                            )
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "Failed to load region filters:",
                    error
                );
            } finally {
                setLoadingRegions(false);
            }
        };

        loadRegions();
    }, [
        isAdmin,
        isCC,
        regionScopes,
    ]);

    /*
     * -----------------------------------------
     * DISTRICT → BLOCK + CENTER
     * -----------------------------------------
     */

    useEffect(() => {
        const loadDistrictRegions =
            async () => {
                if (
                    !filters.districtId ||
                    isCC
                ) {
                    return;
                }

                try {
                    setLoadingRegions(true);

                    const [
                        blockResponse,
                        centerResponse,
                    ] = await Promise.all([
                        getBlocksByDistrict(
                            filters.districtId
                        ),
                        getCentersByDistrict(
                            filters.districtId
                        ),
                    ]);

                    setBlocks(
                        blockResponse.data ||
                            []
                    );

                    setCenters(
                        centerResponse.data ||
                            []
                    );
                } catch (error) {
                    console.error(
                        "Failed to load district regions:",
                        error
                    );
                } finally {
                    setLoadingRegions(
                        false
                    );
                }
            };

        loadDistrictRegions();
    }, [
        filters.districtId,
        isCC,
    ]);

    /*
     * -----------------------------------------
     * BLOCK → CENTER
     * -----------------------------------------
     */

    useEffect(() => {
        const loadBlockCenters =
            async () => {
                if (
                    !filters.blockId ||
                    isCC
                ) {
                    return;
                }

                try {
                    setLoadingRegions(true);

                    const response =
                        await getCentersByBlock(
                            filters.blockId
                        );

                    setCenters(
                        response.data || []
                    );
                } catch (error) {
                    console.error(
                        "Failed to load block centers:",
                        error
                    );
                } finally {
                    setLoadingRegions(
                        false
                    );
                }
            };

        loadBlockCenters();
    }, [
        filters.blockId,
        isCC,
    ]);

    /*
     * -----------------------------------------
     * FILTER CHANGE
     * -----------------------------------------
     */

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFilters((previous) => {
            const updatedFilters = {
                ...previous,
                [name]: value,
            };

            /*
             * Program changed:
             * reset batch.
             */
            if (name === "programId") {
                updatedFilters.batchId =
                    "";
            }

            /*
             * District changed:
             * reset block + center.
             */
            if (name === "districtId") {
                updatedFilters.blockId =
                    "";
                updatedFilters.centerId =
                    "";
            }

            /*
             * Block changed:
             * reset center.
             */
            if (name === "blockId") {
                updatedFilters.centerId =
                    "";
            }

            return updatedFilters;
        });
    };

    /*
     * -----------------------------------------
     * SEARCH
     * -----------------------------------------
     */

    const handleSearch = (event) => {
        event.preventDefault();

        /*
         * -------------------------------------
         * NON-ADMIN VALIDATION
         * -------------------------------------
         *
         * Prevent accidental unrestricted
         * student fetch.
         */

        if (!isAdmin) {
            if (
                programs.length === 0
            ) {
                return;
            }

            /*
             * If multiple programs are assigned,
             * one must be selected.
             */
            if (
                programs.length > 1 &&
                !filters.programId
            ) {
                return;
            }

            /*
             * A batch must always be selected
             * for non-admin users.
             */
            if (!filters.batchId) {
                return;
            }

            /*
             * CC must select a center.
             */
            if (
                isCC &&
                !filters.centerId
            ) {
                return;
            }

            /*
             * Non-CC users with accessible
             * region filters must select
             * the appropriate lowest-level
             * region.
             */
            if (!isCC) {
                const hasRegionAccess =
                    regionScopes.length > 0;

                if (hasRegionAccess) {
                    const hasGlobalAccess =
                        regionScopes.some(
                            (scope) =>
                                scope.scope ===
                                "global"
                        );

                    if (!hasGlobalAccess) {
                        const hasCenterScope =
                            regionScopes.some(
                                (scope) =>
                                    scope.scope ===
                                    "center"
                            );

                        const hasBlockScope =
                            regionScopes.some(
                                (scope) =>
                                    scope.scope ===
                                    "block"
                            );

                        const hasDistrictScope =
                            regionScopes.some(
                                (scope) =>
                                    scope.scope ===
                                    "district"
                            );

                        if (
                            hasCenterScope &&
                            !filters.centerId
                        ) {
                            return;
                        }

                        if (
                            hasBlockScope &&
                            !filters.blockId
                        ) {
                            return;
                        }

                        if (
                            hasDistrictScope &&
                            !filters.districtId
                        ) {
                            return;
                        }
                    }
                }
            }
        }

        const cleanedFilters =
            Object.entries(filters).reduce(
                (result, [key, value]) => {
                    if (value !== "") {
                        result[key] = value;
                    }

                    return result;
                },
                {}
            );

        onSearch(cleanedFilters);
    };

    /*
     * -----------------------------------------
     * RESET
     * -----------------------------------------
     */

    const handleReset = () => {
        const resetFilters = {
            search: "",
            programId:
                !isAdmin &&
                programs.length === 1
                    ? programs[0]._id
                    : "",
            batchId: "",
            districtId: "",
            blockId: "",
            centerId: "",
            board: "",
            status: !isAdmin
                ? "active"
                : "",
            isActive: !isAdmin
                ? "true"
                : "",
        };

        setFilters(resetFilters);

        /*
         * Admin can reset to completely
         * unrestricted data.
         *
         * Non-admin gets only defaults,
         * but does NOT fetch until valid
         * required filters are selected.
         */

        if (isAdmin) {
            onSearch({});
        }
    };

    /*
     * -----------------------------------------
     * CASCADING OPTIONS
     * -----------------------------------------
     */

    const visibleBatches =
        filters.programId
            ? batches.filter(
                  (batch) =>
                      getId(
                          batch.programId
                      ) ===
                      filters.programId
              )
            : batches;

    const visibleBlocks =
        filters.districtId
            ? blocks.filter(
                  (block) =>
                      getId(
                          block.districtId
                      ) ===
                      filters.districtId
              )
            : blocks;

    const visibleCenters =
        filters.blockId
            ? centers.filter(
                  (center) =>
                      getId(
                          center.blockId
                      ) ===
                      filters.blockId
              )
            : filters.districtId
              ? centers.filter(
                    (center) =>
                        getId(
                            center.districtId
                        ) ===
                        filters.districtId
                )
              : centers;

    return (
        <form
            onSubmit={handleSearch}
            className="mb-6 rounded-lg border bg-white p-5"
        >
            <div className="mb-4">
                <h2 className="text-lg font-semibold">
                    Student Filters
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* SEARCH */}

                <div className="lg:col-span-3">
                    <label className="mb-1 block text-sm font-medium">
                        Search
                    </label>

                    <input
                        type="text"
                        name="search"
                        value={
                            filters.search
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="Search by name, SRN, roll number, father name..."
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                    />
                </div>

                {/* PROGRAM */}

                {(
                    isAdmin ||
                    programs.length > 1
                ) && (
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Program
                        </label>

                        <select
                            name="programId"
                            value={
                                filters.programId
                            }
                            onChange={
                                handleChange
                            }
                            className="w-full rounded-md border px-3 py-2"
                        >
                            <option value="">
                                {isAdmin
                                    ? "All Programs"
                                    : "Select Program"}
                            </option>

                            {programs.map(
                                (program) => (
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
                )}

                {/* BATCH */}

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Batch
                    </label>

                    <select
                        name="batchId"
                        value={
                            filters.batchId
                        }
                        onChange={
                            handleChange
                        }
                        className="w-full rounded-md border px-3 py-2"
                    >
                        <option value="">
                            {isAdmin
                                ? "All Batches"
                                : "Select Batch"}
                        </option>

                        {visibleBatches.map(
                            (batch) => (
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

                {/* DISTRICT */}

                {!isCC && (
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            District
                        </label>

                        <select
                            name="districtId"
                            value={
                                filters.districtId
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                loadingRegions
                            }
                            className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
                        >
                            <option value="">
                                {isAdmin
                                    ? "All Districts"
                                    : "Select District"}
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
                )}

                {/* BLOCK */}

                {!isCC && (
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Block
                        </label>

                        <select
                            name="blockId"
                            value={
                                filters.blockId
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                loadingRegions ||
                                visibleBlocks.length ===
                                    0
                            }
                            className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
                        >
                            <option value="">
                                {isAdmin
                                    ? "All Blocks"
                                    : "Select Block"}
                            </option>

                            {visibleBlocks.map(
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
                )}

                {/* CENTER */}

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Center
                    </label>

                    <select
                        name="centerId"
                        value={
                            filters.centerId
                        }
                        onChange={
                            handleChange
                        }
                        disabled={
                            loadingRegions ||
                            visibleCenters.length ===
                                0
                        }
                        className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
                    >
                        <option value="">
                            {isAdmin
                                ? "All Centers"
                                : "Select Center"}
                        </option>

                        {visibleCenters.map(
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
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* BOARD */}

                {isAdmin && (
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Board
                        </label>

                        <select
                            name="board"
                            value={
                                filters.board
                            }
                            onChange={
                                handleChange
                            }
                            className="w-full rounded-md border px-3 py-2"
                        >
                            <option value="">
                                All Boards
                            </option>

                            <option value="HBSE">
                                HBSE
                            </option>

                            <option value="CBSE">
                                CBSE
                            </option>
                        </select>
                    </div>
                )}

                {/* ENROLLMENT STATUS */}

                {isAdmin && (
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Enrollment Status
                        </label>

                        <select
                            name="status"
                            value={
                                filters.status
                            }
                            onChange={
                                handleChange
                            }
                            className="w-full rounded-md border px-3 py-2"
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="provisional">
                                Provisional
                            </option>

                            <option value="requested-slc">
                                Requested SLC
                            </option>

                            <option value="left">
                                Left
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

                            <option value="transfer-student">
                                Transfer Student
                            </option>
                        </select>
                    </div>
                )}

                {/* STUDENT STATUS */}

                {isAdmin && (
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Student Status
                        </label>

                        <select
                            name="isActive"
                            value={
                                filters.isActive
                            }
                            onChange={
                                handleChange
                            }
                            className="w-full rounded-md border px-3 py-2"
                        >
                            <option value="">
                                All
                            </option>

                            <option value="true">
                                Active
                            </option>

                            <option value="false">
                                Inactive
                            </option>
                        </select>
                    </div>
                )}
            </div>

            <div className="mt-5 flex gap-3">
                <button
                    type="submit"
                    className="rounded-md border px-5 py-2 font-medium"
                >
                    Search
                </button>

                <button
                    type="button"
                    onClick={
                        handleReset
                    }
                    className="rounded-md border px-5 py-2"
                >
                    Reset
                </button>
            </div>
        </form>
    );
};

export default StudentFilters;