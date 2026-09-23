import { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";

const useAttendanceScope = () => {
    const {
        access,
        accessScope,
        isAdmin,
    } = useAuth();

    const scope = useMemo(() => {
        const programAccess =
            accessScope?.programAccess || {};

        const programs =
            programAccess.programs || [];

        const batches =
            programAccess.batches || [];

        const regionAccess =
            accessScope?.regionAccess || [];

        const hasGlobalAccess = isAdmin ||
            regionAccess.some(
                (region) => region.scope === "global"
            );

        const districtIds = regionAccess
            .filter(
                (region) =>
                    region.districtId &&
                    (
                        region.scope === "district" ||
                        region.scope === "block" ||
                        region.scope === "center"
                    )
            )
            .map((region) =>
                String(
                    region.districtId?._id ||
                    region.districtId
                )
            );

        const blockIds = regionAccess
            .filter(
                (region) =>
                    region.blockId &&
                    (
                        region.scope === "block" ||
                        region.scope === "center"
                    )
            )
            .map((region) =>
                String(
                    region.blockId?._id ||
                    region.blockId
                )
            );

        const centerIds = regionAccess
            .filter(
                (region) =>
                    region.centerId &&
                    region.scope === "center"
            )
            .map((region) =>
                String(
                    region.centerId?._id ||
                    region.centerId
                )
            );

        return {
            programs,
            batches,
            regionAccess,

            hasGlobalAccess,

            programIds: programs.map(
                (program) => String(program._id)
            ),

            batchIds: batches.map(
                (batch) => String(batch._id)
            ),

            districtIds: [
                ...new Set(districtIds),
            ],

            blockIds: [
                ...new Set(blockIds),
            ],

            centerIds: [
                ...new Set(centerIds),
            ],
        };
    }, [accessScope, isAdmin]);

    const canAccessProgram = (programId) => {
        if (isAdmin || scope.hasGlobalAccess) {
            return true;
        }

        return scope.programIds.includes(
            String(programId)
        );
    };

    const canAccessBatch = (batchId) => {
        if (isAdmin || scope.hasGlobalAccess) {
            return true;
        }

        return scope.batchIds.includes(
            String(batchId)
        );
    };

    const canAccessDistrict = (districtId) => {
        if (isAdmin || scope.hasGlobalAccess) {
            return true;
        }

        return scope.districtIds.includes(
            String(districtId)
        );
    };

    const canAccessBlock = (blockId) => {
        if (isAdmin || scope.hasGlobalAccess) {
            return true;
        }

        return scope.blockIds.includes(
            String(blockId)
        );
    };

    const canAccessCenter = (centerId) => {
        if (isAdmin || scope.hasGlobalAccess) {
            return true;
        }

        return scope.centerIds.includes(
            String(centerId)
        );
    };

    return {
        access,
        isAdmin,

        programs: scope.programs,
        batches: scope.batches,
        regionAccess: scope.regionAccess,

        hasGlobalAccess:
            scope.hasGlobalAccess,

        programIds: scope.programIds,
        batchIds: scope.batchIds,
        districtIds: scope.districtIds,
        blockIds: scope.blockIds,
        centerIds: scope.centerIds,

        canAccessProgram,
        canAccessBatch,
        canAccessDistrict,
        canAccessBlock,
        canAccessCenter,
    };
};

export default useAttendanceScope;