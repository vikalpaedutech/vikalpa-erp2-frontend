import React from "react";

const AbsenteeCallingFilters = ({
  filters,
  onChange,
  onSearch,
  onReset,

  batches,
  districts,
  blocks,
  centers,

  showDistrict,
  showBlock,
  showCenter,

  loading,
}) => {
  return (
    <div className="mb-6 rounded-xl border border-gray-900 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">
        Absentee Calling Filters
      </h2>

      <form
        onSubmit={onSearch}
      >
        <div
          className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${
            showCenter &&
            !showDistrict &&
            !showBlock
              ? "lg:grid-cols-3"
              : "lg:grid-cols-3"
          }`}
        >
          {/* DATE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Date
            </label>

            <input
              type="date"
              value={
                filters.date
              }
              onChange={(event) =>
                onChange(
                  "date",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* BATCH */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Batch
            </label>

            <select
              value={
                filters.batchId
              }
              onChange={(event) =>
                onChange(
                  "batchId",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                Select Batch
              </option>

              {batches.map(
                (batch) => (
                  <option
                    key={
                      batch._id
                    }
                    value={
                      batch._id
                    }
                  >
                    {batch.batchName ||
                      batch.name ||
                      batch._id}
                  </option>
                )
              )}
            </select>
          </div>

          {/* DISTRICT */}

          {showDistrict && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                District
              </label>

              <select
                value={
                  filters.districtId
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "districtId",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">
                  Select District
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

          {showBlock && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Block
              </label>

              <select
                value={
                  filters.blockId
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "blockId",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">
                  Select Block
                </option>

                {blocks.map(
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

          {showCenter && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Center
              </label>

              <select
                value={
                  filters.centerId
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "centerId",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">
                  Select Center
                </option>

                {centers.map(
                  (center) => (
                    <option
                      key={
                        center._id
                      }
                      value={
                        center._id
                      }
                    >
                      {center.centerName ||
                        center.centerCode ||
                        center._id}
                    </option>
                  )
                )}
              </select>
            </div>
          )}
        </div>

        {/* BUTTONS */}

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-gray-900 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="rounded-lg border border-gray-400 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AbsenteeCallingFilters;