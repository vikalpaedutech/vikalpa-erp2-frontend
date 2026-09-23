// FILE PATH: frontend/src/features/students/hooks/useStudentScope.js

import { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";

const useStudentScope = () => {
    const {
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

        // -----------------------------------------
        // ADMIN
        // -----------------------------------------

        if (isAdmin) {
            return {
                isAdmin: true,

                programs,
                batches,

                regionAccess: [],
                regionScopes: [],

                hasGlobalAccess: true,

                districts: [],
                blocks: [],
                centers: [],
            };
        }

        // -----------------------------------------
        // GENERAL USER
        // -----------------------------------------

        const regionAccess =
            accessScope?.regionAccess || [];

        // -----------------------------------------
        // REGION SCOPES
        // -----------------------------------------

        const regionScopes = regionAccess.map(
            (access) => ({
                scope: access.scope,
                districtId:
                    access.districtId || null,
                blockId:
                    access.blockId || null,
                centerId:
                    access.centerId || null,
            })
        );

        // -----------------------------------------
        // GLOBAL ACCESS
        // -----------------------------------------

        const hasGlobalAccess =
            regionScopes.some(
                (access) =>
                    access.scope === "global"
            );

        // -----------------------------------------
        // DISTRICTS
        // -----------------------------------------

        const districts = regionAccess
            .filter(
                (access) =>
                    access.scope === "district" &&
                    access.districtId
            )
            .map(
                (access) =>
                    access.districtId
            );

        // -----------------------------------------
        // BLOCKS
        // -----------------------------------------

        const blocks = regionAccess
            .filter(
                (access) =>
                    access.scope === "block" &&
                    access.blockId
            )
            .map(
                (access) =>
                    access.blockId
            );

        // -----------------------------------------
        // CENTERS
        // -----------------------------------------

        const centers = regionAccess
            .filter(
                (access) =>
                    access.scope === "center" &&
                    access.centerId
            )
            .map(
                (access) =>
                    access.centerId
            );

        return {
            isAdmin: false,

            programs,
            batches,

            regionAccess,
            regionScopes,

            hasGlobalAccess,

            districts,
            blocks,
            centers,
        };
    }, [accessScope, isAdmin]);

    return scope;
};

export default useStudentScope;