import React from "react";

function AttendanceSummary({
    summary = {},
}) {
    const {
        total = 0,
        present = 0,
        absent = 0,
        attendancePercentage = 0,
    } = summary;

    const cards = [
        {
            label: "Total Students",
            value: total,
        },
        {
            label: "Present",
            value: present,
        },
        {
            label: "Absent",
            value: absent,
        },
        {
            label: "Attendance %",
            value: `${attendancePercentage}%`,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <p className="text-sm font-medium text-gray-500">
                        {card.label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-800">
                        {card.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default AttendanceSummary;