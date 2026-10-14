// CSV export. The escaping is the whole problem: one comma in one value shifts
// every column after it. Quote anything containing a comma, quote or newline.
// A value starting with = + - @ is prefixed with ' so a spreadsheet never
// runs it as a formula (CSV injection).
function cell(value) {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers, ...rows.map((row) => headers.map((h) => row[h]))]
    .map((r) => r.map(cell).join(","))
    .join("\r\n");
}

// Browser only: build a Blob, click a link, then release the memory.
export function downloadCsv(text, filename) {
  // A leading BOM makes Excel read the file as UTF-8.
  const blob = new Blob(["\uFEFF", text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
