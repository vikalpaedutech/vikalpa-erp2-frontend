import DistrictDropdown from "./DistrictDropdown";
import BlockDropdown from "./BlockDropdown";
import CenterDropdown from "./CenterDropdown";

function DistrictBlockCenterDropdown({
  districtId = "",
  blockId = "",
  centerId = "",
  onChange,
  disabled = false,
  required = false,
  districtLabel = "District",
  blockLabel = "Block",
  centerLabel = "Center",
}) {
  const handleDistrictChange = (
    nextDistrictId
  ) => {
    onChange?.({
      districtId: nextDistrictId,
      blockId: "",
      centerId: "",
    });
  };

  const handleBlockChange = (
    nextBlockId
  ) => {
    onChange?.({
      districtId,
      blockId: nextBlockId,
      centerId: "",
    });
  };

  const handleCenterChange = (
    nextCenterId
  ) => {
    onChange?.({
      districtId,
      blockId,
      centerId: nextCenterId,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* District */}

      <DistrictDropdown
        value={districtId}
        onChange={handleDistrictChange}
        label={districtLabel}
        disabled={disabled}
        required={required}
      />

      {/* Block */}

      <BlockDropdown
        districtId={districtId}
        value={blockId}
        onChange={handleBlockChange}
        label={blockLabel}
        disabled={disabled}
        required={required}
      />

      {/* Center */}

      <CenterDropdown
        blockId={blockId}
        value={centerId}
        onChange={handleCenterChange}
        label={centerLabel}
        disabled={disabled}
        required={required}
        independent={false}
      />
    </div>
  );
}

export default DistrictBlockCenterDropdown;