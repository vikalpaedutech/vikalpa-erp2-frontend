import React from "react";

const getCardClass = (status) => {
  switch (status) {
    case "Connected":
      return "border-green-200 bg-green-100";

    case "Not Connected":
      return "border-orange-200 bg-orange-100";

    default:
      return "border-gray-200 bg-white";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "Connected":
      return "bg-green-200 text-green-800";

    case "Not Connected":
      return "bg-orange-200 text-orange-800";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const AbsenteeCallingCard = ({
  student,
  onCall,
}) => {
  const status =
    student.callingStatus || "";

  const contacts = [
    {
      label: "Contact 1",
      number: student.personalContact,
    },
    {
      label: "Contact 2",
      number: student.parentContact,
    },
    {
      label: "Contact 3",
      number: student.otherContact,
    },
  ].filter(
    (contact) =>
      contact.number &&
      String(contact.number).trim()
  );

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition ${getCardClass(
        status
      )}`}
    >
      {/* HEADER */}

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {student.name || "-"}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            SRN: {student.studentSrn || "-"}
          </p>
        </div>

        {status && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
              status
            )}`}
          >
            {status}
          </span>
        )}
      </div>

      {/* STUDENT INFORMATION */}

      <div className="space-y-3 border-t border-gray-200/70 pt-4">
        <div>
          <p className="text-xs text-gray-500">
            Father Name
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {student.fatherName || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Center
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {student.centerName || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Block
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {student.blockName || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            District
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {student.districtName || "-"}
          </p>
        </div>

        {/* CONTACTS */}

        <div>
          <p className="text-xs text-gray-500">
            Contact
          </p>

          {contacts.length > 0 ? (
            <div className="mt-1 space-y-1">
              {contacts.map(
                (contact) => (
                  <a
                    key={`${contact.label}-${contact.number}`}
                    href={`tel:${contact.number}`}
                    className="block w-fit text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {contact.number}
                  </a>
                )
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              -
            </p>
          )}
        </div>

        {/* REMARK */}

        {student.remark && (
          <div>
            <p className="text-xs text-gray-500">
              Remark
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {student.remark}
            </p>
          </div>
        )}

        {/* COMMENT */}

        {student.comment && (
          <div>
            <p className="text-xs text-gray-500">
              Comment
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {student.comment}
            </p>
          </div>
        )}
      </div>

      {/* ACTION */}

      <div className="mt-5 border-t border-gray-200/70 pt-4">
        <button
          type="button"
          onClick={() =>
            onCall(student)
          }
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          {status
            ? "Update Call"
            : "Call"}
        </button>
      </div>
    </div>
  );
};

export default AbsenteeCallingCard;