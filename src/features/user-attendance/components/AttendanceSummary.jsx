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

  // Treat Sundays as weekly offs even if a legacy/manual database
  // record happens to carry the status "Absent" for that date.
  const isSunday = (item) => {
    if (item?.status === "Sunday") return true;
    if (!item?.date) return false;
    const weekday = new Date(item.date).toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
    });
    return weekday === "Sun";
  };

  const absent = attendance.filter(
    (item) => item.status === "Absent" && !isSunday(item)
  ).length;

  const sunday = attendance.filter(isSunday).length;

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
    {
      title: "Sunday",
      value: sunday,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
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