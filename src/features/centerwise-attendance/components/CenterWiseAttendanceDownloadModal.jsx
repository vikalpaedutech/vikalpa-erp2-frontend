import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRegionAccess } from "../../../context/RegionAccessContext";

import DistrictCenterDropdown from "../../../components/common/dropdowns/DistrictCenterDropdown";
import ProgramDropdown from "../../../components/common/dropdowns/ProgramDropdown";
import BatchDropdown from "../../../components/common/dropdowns/BatchDropdown";

import {
  downloadCenterWiseAttendanceTemplate,
} from "../services/centerWiseAttendance.service";

const CenterWiseAttendanceDownloadModal = ({
  isOpen,
  onClose,
}) => {
  // ============================================================
  // REGION ACCESS
  // ============================================================

  const {
    districts,
    centers,
    programAccess,
    loadingRegionAccess,
  } = useRegionAccess();

  // ============================================================
  // ACCESSIBLE PROGRAMS
  // ============================================================

  const programs = useMemo(() => {
    return Array.isArray(
      programAccess?.programs
    )
      ? programAccess.programs
      : [];
  }, [programAccess]);

  // ============================================================
  // ACCESSIBLE BATCHES
  // ============================================================

  const batches = useMemo(() => {
    return Array.isArray(
      programAccess?.batches
    )
      ? programAccess.batches
      : [];
  }, [programAccess]);

  // ============================================================
  // STATE
  // ============================================================

  const [programId, setProgramId] =
    useState("");

  const [batchId, setBatchId] =
    useState("");

  const [districtId, setDistrictId] =
    useState("");

  const [centerId, setCenterId] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // BATCHES FOR SELECTED PROGRAM
  // ============================================================

  const filteredBatches = useMemo(() => {
    if (!programId) {
      return [];
    }

    return batches.filter(
      (batch) => {
        const batchProgramId =
          typeof batch?.programId ===
          "object"
            ? batch?.programId?._id
            : batch?.programId;

        return (
          String(
            batchProgramId
          ) ===
          String(programId)
        );
      }
    );
  }, [
    batches,
    programId,
  ]);

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setProgramId("");
    setBatchId("");
    setDistrictId("");
    setCenterId("");
    setError("");
    setDownloading(false);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const handleClose = () => {
    if (downloading) {
      return;
    }

    resetForm();

    onClose?.();
  };

  // ============================================================
  // PROGRAM SELECTION
  // ============================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // ----------------------------------------------------------
    // ONLY ONE PROGRAM
    // ----------------------------------------------------------

    if (programs.length === 1) {
      const onlyProgram =
        programs[0]?._id || "";

      setProgramId(
        onlyProgram
      );

      return;
    }

    // ----------------------------------------------------------
    // MULTIPLE PROGRAMS
    // ----------------------------------------------------------

    if (programs.length > 1) {
      setProgramId("");
      setBatchId("");
    }
  }, [
    isOpen,
    programs,
  ]);

  // ============================================================
  // BATCH SELECTION
  // ============================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!programId) {
      setBatchId("");

      return;
    }

    // ----------------------------------------------------------
    // ONLY ONE BATCH
    // ----------------------------------------------------------

    if (
      filteredBatches.length === 1
    ) {
      const onlyBatch =
        filteredBatches[0]?._id ||
        "";

      setBatchId(
        onlyBatch
      );

      return;
    }

    // ----------------------------------------------------------
    // MULTIPLE BATCHES
    // ----------------------------------------------------------

    if (
      filteredBatches.length > 1
    ) {
      setBatchId("");
    }
  }, [
    isOpen,
    programId,
    filteredBatches,
  ]);

  // ============================================================
  // PROGRAM CHANGE
  // ============================================================

  const handleProgramChange = (
    nextProgramId
  ) => {
    setProgramId(
      nextProgramId
    );

    // Program change means
    // previous batch is no longer valid.

    setBatchId("");

    setError("");
  };

  // ============================================================
  // BATCH CHANGE
  // ============================================================

  const handleBatchChange = (
    nextBatchId
  ) => {
    setBatchId(
      nextBatchId
    );

    setError("");
  };

  // ============================================================
  // DISTRICT + CENTER CHANGE
  // ============================================================

  const handleDistrictCenterChange = ({
    districtId: nextDistrictId,
    centerId: nextCenterId,
  }) => {
    setDistrictId(
      nextDistrictId
    );

    setCenterId(
      nextCenterId
    );

    setError("");
  };

  // ============================================================
  // DOWNLOAD
  // ============================================================

  const handleDownload = async () => {
    setError("");

    // ----------------------------------------------------------
    // PROGRAM VALIDATION
    // ----------------------------------------------------------

    if (!programId) {
      setError(
        "Please select program."
      );

      return;
    }

    // ----------------------------------------------------------
    // BATCH VALIDATION
    // ----------------------------------------------------------

    if (!batchId) {
      setError(
        "Please select batch."
      );

      return;
    }

    // ----------------------------------------------------------
    // DISTRICT VALIDATION
    // ----------------------------------------------------------

    if (!districtId) {
      setError(
        "Please select district."
      );

      return;
    }

    // ----------------------------------------------------------
    // CENTER VALIDATION
    // ----------------------------------------------------------

    if (!centerId) {
      setError(
        "Please select center."
      );

      return;
    }

    try {
      setDownloading(true);

      // --------------------------------------------------------
      // DOWNLOAD FORMAT
      // --------------------------------------------------------

      const response =
        await downloadCenterWiseAttendanceTemplate(
          programId,
          batchId,
          centerId
        );

      // --------------------------------------------------------
      // CREATE BLOB
      // --------------------------------------------------------

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      // --------------------------------------------------------
      // SELECTED CENTER
      // --------------------------------------------------------

      const selectedCenter =
        centers.find(
          (center) =>
            String(
              center?._id
            ) ===
            String(centerId)
        );

      // --------------------------------------------------------
      // CREATE DOWNLOAD LINK
      // --------------------------------------------------------

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `attendance-${
          selectedCenter?.centerCode ||
          "center"
        }-format.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      // --------------------------------------------------------
      // CLOSE MODAL
      // --------------------------------------------------------

      resetForm();

      onClose?.();
    } catch (
      downloadError
    ) {
      console.error(
        "Attendance template download error:",
        downloadError
      );

      setError(
        downloadError?.response
          ?.data?.message ||
          downloadError?.message ||
          "Failed to download attendance format."
      );
    } finally {
      setDownloading(false);
    }
  };

  // ============================================================
  // DON'T RENDER
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

      {/* ======================================================
          MODAL
      ======================================================= */}

      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Download Attendance Format
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select required filters to download the format.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={downloading}
            className="text-2xl leading-none text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            &times;
          </button>

        </div>

        {/* ====================================================
            BODY
        ===================================================== */}

        <div className="space-y-4 px-6 py-5">

          {/* ==================================================
              ERROR
          =================================================== */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* ==================================================
              PROGRAM

              1 PROGRAM
              → HIDDEN
              → AUTO SELECTED

              MULTIPLE PROGRAMS
              → SHOW DROPDOWN
          =================================================== */}

          {programs.length > 1 && (
            <ProgramDropdown
              programs={programs}
              value={programId}
              onChange={
                handleProgramChange
              }
              label="Program"
              placeholder="Select Program"
              disabled={
                downloading ||
                loadingRegionAccess
              }
              required
              autoSelectSingle
              hideWhenSingle
            />
          )}

          {/* ==================================================
              BATCH

              1 BATCH
              → HIDDEN
              → AUTO SELECTED

              MULTIPLE BATCHES
              → SHOW DROPDOWN
          =================================================== */}

          {filteredBatches.length > 1 && (
            <BatchDropdown
              batches={
                filteredBatches
              }
              programId={
                programId
              }
              value={batchId}
              onChange={
                handleBatchChange
              }
              label="Batch"
              placeholder="Select Batch"
              disabled={
                downloading ||
                loadingRegionAccess ||
                !programId
              }
              required
              autoSelectSingle
              hideWhenSingle
            />
          )}

          {/* ==================================================
              DISTRICT + CENTER
          =================================================== */}

          <DistrictCenterDropdown
            districts={
              districts
            }
            centers={
              centers
            }
            districtId={
              districtId
            }
            centerId={
              centerId
            }
            onChange={
              handleDistrictCenterChange
            }
            disabled={
              downloading ||
              loadingRegionAccess
            }
            required
            districtLabel="District"
            centerLabel="Center"
          />

        </div>

        {/* ====================================================
            FOOTER
        ===================================================== */}

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

          {/* ==================================================
              CANCEL
          =================================================== */}

          <button
            type="button"
            onClick={handleClose}
            disabled={downloading}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          {/* ==================================================
              DOWNLOAD
          =================================================== */}

          <button
            type="button"
            onClick={
              handleDownload
            }
            disabled={
              downloading ||
              loadingRegionAccess ||
              !programId ||
              !batchId ||
              !districtId ||
              !centerId
            }
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading
              ? "Downloading..."
              : "Download Format"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default CenterWiseAttendanceDownloadModal;