import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getMyMergedRegionAccess,
} from "../services/userRegionAccess.service";

// ============================================================
// CONTEXT
// ============================================================

const RegionAccessContext =
  createContext(null);

// ============================================================
// PROVIDER
// ============================================================

export const RegionAccessProvider = ({
  children,
}) => {
  const {
    accessScope,
    isAdmin,
  } = useAuth();

  // ============================================================
  // PROGRAM ACCESS
  // ============================================================
  //
  // Program access is NOT part of /me/regions.
  //
  // It continues to come from AuthContext accessScope.
  //
  // ============================================================

  const programAccess =
    accessScope?.programAccess || {
      programs: [],
      batches: [],
    };

  // ============================================================
  // REGION ACCESS STATE
  // ============================================================

  const [
    regionAccess,
    setRegionAccess,
  ] = useState([]);

  const [
    scopeTypes,
    setScopeTypes,
  ] = useState([]);

  const [
    loadingRegionAccess,
    setLoadingRegionAccess,
  ] = useState(false);

  const [
    regionAccessError,
    setRegionAccessError,
  ] = useState(null);

  // ============================================================
  // FETCH MERGED REGION ACCESS
  // ============================================================
  //
  // API:
  //
  // GET
  // /api/v1/user-management/user-region-access/me/regions
  //
  // Backend response:
  //
  // {
  //   data: {
  //     scope: ["global"],
  //     region: [
  //       {
  //         districtId,
  //         districtName,
  //         blockId,
  //         blockName,
  //         centerId,
  //         centerName,
  //         centerCode
  //       }
  //     ]
  //   }
  // }
  //
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const fetchRegionAccess =
      async () => {
        // ------------------------------------------------------
        // Wait until AuthContext has access information
        // ------------------------------------------------------

        if (!accessScope && !isAdmin) {
          if (isMounted) {
            setRegionAccess([]);
            setScopeTypes([]);
            setRegionAccessError(null);
            setLoadingRegionAccess(false);
          }

          return;
        }

        try {
          setLoadingRegionAccess(true);
          setRegionAccessError(null);

          const response =
            await getMyMergedRegionAccess();

          // ----------------------------------------------------
          // API response data
          // ----------------------------------------------------

          const data =
            response?.data || {};

            

          const scopes =
            Array.isArray(
              data?.scope
            )
              ? data.scope
              : [];

          const regions =
            Array.isArray(
              data?.region
            )
              ? data.region
              : [];

          if (!isMounted) {
            return;
          }

          // ----------------------------------------------------
          // Store scopes
          // ----------------------------------------------------

          setScopeTypes(
            scopes.map(
              (scope) =>
                String(
                  scope
                ).toLowerCase()
            )
          );

          // ----------------------------------------------------
          // Store merged effective region
          // ----------------------------------------------------

          setRegionAccess(
            regions
          );
        } catch (error) {
          console.error(
            "Failed to load merged region access:",
            error
          );

          if (isMounted) {
            setRegionAccess([]);
            setScopeTypes([]);

            setRegionAccessError(
              error?.response?.data
                ?.message ||
                error?.message ||
                "Failed to load region access."
            );
          }
        } finally {
          if (isMounted) {
            setLoadingRegionAccess(
              false
            );
          }
        }
      };

    fetchRegionAccess();

    return () => {
      isMounted = false;
    };
  }, [
    accessScope,
    isAdmin,
  ]);

  // ============================================================
  // GLOBAL ACCESS
  // ============================================================

  const isGlobalAccess =
    isAdmin ||
    scopeTypes.includes(
      "global"
    );

  // ============================================================
  // UNIQUE DISTRICTS
  // ============================================================
  //
  // region[] can contain many centers from the same district.
  //
  // Therefore create one district object per districtId.
  //
  // ============================================================

  const districts = useMemo(() => {
    const districtMap =
      new Map();

    regionAccess.forEach(
      (region) => {
        if (!region?.districtId) {
          return;
        }

        const districtId =
          String(
            region.districtId
          );

        if (
          !districtMap.has(
            districtId
          )
        ) {
          districtMap.set(
            districtId,
            {
              _id:
                region.districtId,

              districtId:
                region.districtId,

              districtName:
                region.districtName ||
                "",
            }
          );
        }
      }
    );

    return Array.from(
      districtMap.values()
    );
  }, [
    regionAccess,
  ]);

  // ============================================================
  // UNIQUE BLOCKS
  // ============================================================
  //
  // region[] can contain many centers from the same block.
  //
  // Therefore create one block object per blockId.
  //
  // ============================================================

  const blocks = useMemo(() => {
    const blockMap =
      new Map();

    regionAccess.forEach(
      (region) => {
        if (!region?.blockId) {
          return;
        }

        const blockId =
          String(
            region.blockId
          );

        if (
          !blockMap.has(
            blockId
          )
        ) {
          blockMap.set(
            blockId,
            {
              _id:
                region.blockId,

              blockId:
                region.blockId,

              blockName:
                region.blockName ||
                "",

              districtId:
                region.districtId ||
                null,

              districtName:
                region.districtName ||
                "",
            }
          );
        }
      }
    );

    return Array.from(
      blockMap.values()
    );
  }, [
    regionAccess,
  ]);

  // ============================================================
  // UNIQUE CENTERS
  // ============================================================
  //
  // region[] already contains center-level data.
  //
  // Therefore simply normalize it into center objects.
  //
  // ============================================================

  const centers = useMemo(() => {
    const centerMap =
      new Map();

    regionAccess.forEach(
      (region) => {
        if (!region?.centerId) {
          return;
        }

        const centerId =
          String(
            region.centerId
          );

        if (
          !centerMap.has(
            centerId
          )
        ) {
          centerMap.set(
            centerId,
            {
              _id:
                region.centerId,

              centerId:
                region.centerId,

              centerName:
                region.centerName ||
                "",

              centerCode:
                region.centerCode ||
                "",

              districtId:
                region.districtId ||
                null,

              districtName:
                region.districtName ||
                "",

              blockId:
                region.blockId ||
                null,

              blockName:
                region.blockName ||
                "",
            }
          );
        }
      }
    );

    return Array.from(
      centerMap.values()
    );
  }, [
    regionAccess,
  ]);

  // ============================================================
  // ACCESSIBLE DISTRICT IDS
  // ============================================================

  const accessibleDistrictIds =
    useMemo(() => {
      if (isGlobalAccess) {
        return [];
      }

      return [
        ...new Set(
          districts
            .map(
              (district) =>
                district?._id
            )
            .filter(Boolean)
            .map(String)
        ),
      ];
    }, [
      districts,
      isGlobalAccess,
    ]);

  // ============================================================
  // ACCESSIBLE BLOCK IDS
  // ============================================================

  const accessibleBlockIds =
    useMemo(() => {
      if (isGlobalAccess) {
        return [];
      }

      return [
        ...new Set(
          blocks
            .map(
              (block) =>
                block?._id
            )
            .filter(Boolean)
            .map(String)
        ),
      ];
    }, [
      blocks,
      isGlobalAccess,
    ]);

  // ============================================================
  // ACCESSIBLE CENTER IDS
  // ============================================================

  const accessibleCenterIds =
    useMemo(() => {
      if (isGlobalAccess) {
        return [];
      }

      return [
        ...new Set(
          centers
            .map(
              (center) =>
                center?._id
            )
            .filter(Boolean)
            .map(String)
        ),
      ];
    }, [
      centers,
      isGlobalAccess,
    ]);

  // ============================================================
  // ASSIGNED DISTRICTS
  // ============================================================
  //
  // These are the effective districts available to the user.
  //
  // Kept for backward compatibility with existing pages.
  //
  // ============================================================

  const assignedDistricts =
    districts;

  // ============================================================
  // ASSIGNED BLOCKS
  // ============================================================

  const assignedBlocks =
    blocks;

  // ============================================================
  // ASSIGNED CENTERS
  // ============================================================

  const assignedCenters =
    centers;

  // ============================================================
  // HAS DISTRICT ACCESS
  // ============================================================

  const hasDistrictAccess = (
    districtId
  ) => {
    if (!districtId) {
      return false;
    }

    if (isGlobalAccess) {
      return true;
    }

    const id =
      String(
        districtId?._id ||
          districtId
      );

    return accessibleDistrictIds.includes(
      id
    );
  };

  // ============================================================
  // HAS BLOCK ACCESS
  // ============================================================

  const hasBlockAccess = (
    blockId
  ) => {
    if (!blockId) {
      return false;
    }

    if (isGlobalAccess) {
      return true;
    }

    const id =
      String(
        blockId?._id ||
          blockId
      );

    return accessibleBlockIds.includes(
      id
    );
  };

  // ============================================================
  // HAS CENTER ACCESS
  // ============================================================

  const hasCenterAccess = (
    centerId
  ) => {
    if (!centerId) {
      return false;
    }

    if (isGlobalAccess) {
      return true;
    }

    const id =
      String(
        centerId?._id ||
          centerId
      );

    return accessibleCenterIds.includes(
      id
    );
  };

  // ============================================================
  // GET BLOCKS BY DISTRICT
  // ============================================================
  //
  // IMPORTANT:
  //
  // This function works directly on the blocks derived from
  // /me/regions.
  //
  // No API call.
  //
  // ============================================================

  const getBlocksByDistrict = (
    districtId = ""
  ) => {
    if (!districtId) {
      return [];
    }

    const selectedDistrictId =
      String(
        districtId?._id ||
          districtId
      );

    return blocks.filter(
      (block) =>
        String(
          block?.districtId?._id ||
            block?.districtId ||
            ""
        ) ===
        selectedDistrictId
    );
  };

  // ============================================================
  // GET CENTERS BY DISTRICT
  // ============================================================
  //
  // Directly filters centers derived from /me/regions.
  //
  // ============================================================

  const getCentersByDistrict = (
    districtId = ""
  ) => {
    if (!districtId) {
      return [];
    }

    const selectedDistrictId =
      String(
        districtId?._id ||
          districtId
      );

    return centers.filter(
      (center) =>
        String(
          center?.districtId?._id ||
            center?.districtId ||
            ""
        ) ===
        selectedDistrictId
    );
  };

  // ============================================================
  // GET CENTERS BY BLOCK
  // ============================================================
  //
  // Directly filters centers derived from /me/regions.
  //
  // ============================================================

  const getCentersByBlock = (
    blockId = ""
  ) => {
    if (!blockId) {
      return [];
    }

    const selectedBlockId =
      String(
        blockId?._id ||
          blockId
      );

    return centers.filter(
      (center) =>
        String(
          center?.blockId?._id ||
            center?.blockId ||
            ""
        ) ===
        selectedBlockId
    );
  };

  // ============================================================
  // REFRESH REGION ACCESS
  // ============================================================

  const refreshRegionAccess =
    async () => {
      try {
        setLoadingRegionAccess(true);
        setRegionAccessError(null);

        const response =
          await getMyMergedRegionAccess();

        const data =
          response?.data || {};

        const scopes =
          Array.isArray(
            data?.scope
          )
            ? data.scope
            : [];

        const regions =
          Array.isArray(
            data?.region
          )
            ? data.region
            : [];

        setScopeTypes(
          scopes.map(
            (scope) =>
              String(
                scope
              ).toLowerCase()
          )
        );

        setRegionAccess(
          regions
        );
      } catch (error) {
        console.error(
          "Failed to refresh region access:",
          error
        );

        setRegionAccessError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Failed to refresh region access."
        );

        throw error;
      } finally {
        setLoadingRegionAccess(
          false
        );
      }
    };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = useMemo(
    () => ({
      // --------------------------------------------------------
      // Raw access
      // --------------------------------------------------------

      regionAccess,

      programAccess,

      // --------------------------------------------------------
      // Scope
      // --------------------------------------------------------

      scopeTypes,

      isGlobalAccess,

      // --------------------------------------------------------
      // Loading / Error
      // --------------------------------------------------------

      loadingRegionAccess,

      regionAccessError,

      // --------------------------------------------------------
      // Normalized region data
      // --------------------------------------------------------

      districts,

      blocks,

      centers,

      // --------------------------------------------------------
      // Accessible IDs
      // --------------------------------------------------------

      accessibleDistrictIds,

      accessibleBlockIds,

      accessibleCenterIds,

      // --------------------------------------------------------
      // Assigned objects
      // --------------------------------------------------------

      assignedDistricts,

      assignedBlocks,

      assignedCenters,

      // --------------------------------------------------------
      // Access checks
      // --------------------------------------------------------

      hasDistrictAccess,

      hasBlockAccess,

      hasCenterAccess,

      // --------------------------------------------------------
      // Filtering helpers
      // --------------------------------------------------------

      getBlocksByDistrict,

      getCentersByBlock,

      getCentersByDistrict,

      // --------------------------------------------------------
      // Refresh
      // --------------------------------------------------------

      refreshRegionAccess,
    }),
    [
      regionAccess,
      programAccess,
      scopeTypes,
      isGlobalAccess,
      loadingRegionAccess,
      regionAccessError,
      districts,
      blocks,
      centers,
      accessibleDistrictIds,
      accessibleBlockIds,
      accessibleCenterIds,
      assignedDistricts,
      assignedBlocks,
      assignedCenters,
    ]
  );

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <RegionAccessContext.Provider
      value={value}
    >
      {children}
    </RegionAccessContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useRegionAccess = () => {
  const context =
    useContext(
      RegionAccessContext
    );

  if (!context) {
    throw new Error(
      "useRegionAccess must be used inside RegionAccessProvider"
    );
  }

  return context;
};









// import {
//   createContext,
//   useContext,
//   useEffect,
// } from "react";

// import { useAuth } from "./AuthContext";

// import {
//   getMyMergedRegionAccess,
// } from "../services/userRegionAccess.service";

// // ============================================================
// // CONTEXT
// // ============================================================

// const RegionAccessContext =
//   createContext(null);

// // ============================================================
// // PROVIDER
// // ============================================================

// export const RegionAccessProvider = ({
//   children,
// }) => {
//   const {
//     accessScope,
//     isAdmin,
//   } = useAuth();

//   // ============================================================
//   // FETCH MERGED REGION ACCESS
//   // ============================================================

//   useEffect(() => {
//     const fetchRegionAccess =
//       async () => {
//         try {
//           // ----------------------------------------------------
//           // Call API
//           // ----------------------------------------------------

//           const response =
//             await getMyMergedRegionAccess();

//           // ----------------------------------------------------
//           // LOG COMPLETE RESPONSE
//           // ----------------------------------------------------

//           console.log(
//             "========== MERGED REGION ACCESS RESPONSE =========="
//           );

//           console.log(
//             response
//           );

//           console.log(
//             "===================================================="
//           );
//         } catch (error) {
//           console.error(
//             "Failed to load merged region access:",
//             error
//           );
//         }
//       };

//     // ----------------------------------------------------------
//     // Only call after auth information is available
//     // ----------------------------------------------------------

//     if (
//       accessScope ||
//       isAdmin
//     ) {
//       fetchRegionAccess();
//     }
//   }, [
//     accessScope,
//     isAdmin,
//   ]);

//   // ============================================================
//   // PROVIDER
//   // ============================================================

//   return (
//     <RegionAccessContext.Provider
//       value={{}}
//     >
//       {children}
//     </RegionAccessContext.Provider>
//   );
// };

// // ============================================================
// // HOOK
// // ============================================================

// export const useRegionAccess = () => {
//   return useContext(
//     RegionAccessContext
//   );
// };