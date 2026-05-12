const express = require("express");
const ExcelJS = require("exceljs");
const router = express.Router();

exports.downloadTemplate = async (req, res) => {
  const workbook = new ExcelJS.Workbook();

  // --- Template Sheet ---
  const templateSheet = workbook.addWorksheet("Template");

  // Header row
  const headers = [
    "Question Text *",
    "Option A *",
    "Option B *",
    "Option C",
    "Option D",
    "Correct Option *",
    "Marks",
    "ImageUrl"
  ];

  const headerRow = templateSheet.addRow(headers);

  // Style header
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "000000" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" } // ✅ ARGB must be 8 digits (with alpha FF)
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  });

  // Column widths
  const widths = [40, 20, 20, 20, 20, 20, 10, 40];
  widths.forEach((w, i) => {
    templateSheet.getColumn(i + 1).width = w;
  });

  // --- Instructions Sheet ---
  const instructionsSheet = workbook.addWorksheet("Instructions");
  instructionsSheet.addRow(["Column Name", "Description", "Example"]);
  instructionsSheet.addRow(["Question Text *", "The text of the question. (Required)", "What is 2+2?"]);
  instructionsSheet.addRow(["Option A *", "First answer choice. (Required and Unique)", "2"]);
  instructionsSheet.addRow(["Option B *", "Second answer choice. (Required and Unique)", "4"]);
  instructionsSheet.addRow(["Option C", "Third answer choice. (Optional)", "5 / blank"]);
  instructionsSheet.addRow(["Option D", "Fourth answer choice. (Optional)", "2 / blank"]);
  instructionsSheet.addRow(["Correct Option *", "Correct option (A, B, C, D). (Required)", "B"]);
  instructionsSheet.addRow(["Marks", "Marks awarded (numeric). (Required)", "2"]);
  instructionsSheet.addRow(["ImageUrl", "Optional. Image URL.", "https://example.com/img.png"]);

  instructionsSheet.columns = [
    { width: 20 },
    { width: 60 },
    { width: 40 }
  ];

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=QuestionTemplate.xlsx"
  );

  // ✅ Correct way: use res.end, not res.send
  res.end(buffer);

};
