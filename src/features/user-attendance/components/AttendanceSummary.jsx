function AttendanceSummary({ attendance = [] }) {
  const present = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const wfh = attendance.filter(
    (item) => item.status === "WFH"
  ).length;

  const leave = attendance.filter(
    (item) => item.status === "Leave"
  ).length;

  const absent = attendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const cards = [
    {
      title: "Present",
      value: present,
    },
    {
      title: "WFH",
      value: wfh,
    },
    {
      title: "Leave",
      value: leave,
    },
    {
      title: "Absent",
      value: absent,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-gray-500">
            {card.title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default AttendanceSummary;