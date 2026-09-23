// ============================================================
// SIMPLE EXCEL (.XLS) EXPORT
// ============================================================
// Uses Excel-compatible HTML so no extra npm dependency is needed.
// ============================================================

const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const downloadExcel = ({
  fileName = "report.xls",
  sheetName = "Report",
  columns = [],
  rows = [],
}) => {
  const safeSheetName = String(sheetName)
    .replace(/[\\/?*\[\]:]/g, "")
    .slice(0, 31) || "Report";

  const header = columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("");

  const body = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtml(row[column.key])}</td>`)
          .join("")}</tr>`
    )
    .join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${escapeHtml(safeSheetName)}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 6px 10px; }
          th { font-weight: bold; background: #f3f4f6; }
        </style>
      </head>
      <body>
        <table>
          <thead><tr>${header}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName.endsWith(".xls")
    ? fileName
    : `${fileName}.xls`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
