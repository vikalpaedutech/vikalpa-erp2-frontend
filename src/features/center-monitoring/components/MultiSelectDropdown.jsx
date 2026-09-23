import { useMemo, useState } from "react";

function MultiSelectDropdown({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select",
  disabled = false,
  getOptionValue = (option) => option?._id,
  getOptionLabel = (option) =>
    option?.name ||
    option?.programName ||
    option?.batchName ||
    option?.districtName ||
    "",
}) {
  const [open, setOpen] = useState(false);

  const selectedValues = useMemo(
    () => new Set((value || []).map(String)),
    [value]
  );

  const handleToggle = (option) => {
    const optionId = String(
      getOptionValue(option)
    );

    if (selectedValues.has(optionId)) {
      onChange?.(
        value.filter(
          (id) => String(id) !== optionId
        )
      );
    } else {
      onChange?.([
        ...(value || []),
        optionId,
      ]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange?.([]);
      return;
    }

    onChange?.(
      options.map((option) =>
        String(getOptionValue(option))
      )
    );
  };

  return (
    <div className="relative w-full">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen((previous) => !previous)
        }
        className="flex min-h-[42px] w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm outline-none transition hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <span
          className={
            value.length > 0
              ? "text-gray-800"
              : "text-gray-400"
          }
        >
          {value.length === 0
            ? placeholder
            : `${value.length} selected`}
        </span>

        <span className="text-gray-500">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg">

          {options.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-500">
              No options available
            </div>
          ) : (
            <>
              {/* Select All */}

              <label className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={
                    options.length > 0 &&
                    value.length ===
                      options.length
                  }
                  onChange={handleSelectAll}
                  className="h-4 w-4"
                />

                <span>
                  Select All
                </span>
              </label>

              <div className="my-1 border-t border-gray-100" />

              {options.map((option) => {
                const optionId = String(
                  getOptionValue(option)
                );

                const selected =
                  selectedValues.has(
                    optionId
                  );

                return (
                  <label
                    key={optionId}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        handleToggle(option)
                      }
                      className="h-4 w-4"
                    />

                    <span>
                      {getOptionLabel(option)}
                    </span>
                  </label>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown;