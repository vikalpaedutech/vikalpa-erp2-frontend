import { useMemo } from "react";

import { useRegionAccess } from "../../../context/RegionAccessContext";

import ClassInteractionStatusCard from "../components/ClassInteractionStatusCard";

function ClassInteraction() {
  const {
    programAccess,
  } = useRegionAccess();

  /**
   * ============================================================
   * Accessible Programs
   * ============================================================
   *
   * ProgramDropdown will receive only the programs
   * available to the current user.
   *
   * ============================================================
   */

  const programs = useMemo(() => {
    return programAccess?.programs || [];
  }, [programAccess?.programs]);

  /**
   * ============================================================
   * Accessible Batches
   * ============================================================
   *
   * BatchDropdown will further filter these according
   * to the selected Program.
   *
   * ============================================================
   */

  const batches = useMemo(() => {
    return programAccess?.batches || [];
  }, [programAccess?.batches]);

  return (
    <div className="w-full space-y-6">
      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Class Interaction
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Record and manage classroom interaction
          and disciplinary observations.
        </p>
      </div>

      {/* ======================================================
          CLASS INTERACTION FEATURE
          ====================================================== */}

      <ClassInteractionStatusCard
        programs={programs}
        batches={batches}
      />
    </div>
  );
}

export default ClassInteraction;