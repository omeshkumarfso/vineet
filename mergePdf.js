require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const mergedFolderName = process.env.mergedFolderName;

async function mergePDFs(directoryPath, outputFilePath) {
  const outputDir = path.join(__dirname, mergedFolderName);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const pdfFiles = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith('.pdf'));
  const mergedPdf = await PDFDocument.create();

  for (const pdfFile of pdfFiles) {
    const filePath = path.join(directoryPath, pdfFile);
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(
      pdfDoc,
      pdfDoc.getPageIndices()
    );
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  fs.writeFileSync(outputFilePath, mergedPdfBytes);

  console.log('PDFs merged successfully!');
}

// Example usage
mergePDFs('./output_files', `./${mergedFolderName}/merged.pdf`);

