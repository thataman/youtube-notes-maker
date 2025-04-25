import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Function to generate PDF from slide data
export const generatePdfFromSlides = async (slides, videoTitle) => {
  if (!slides || slides.length === 0) {
    alert("No slides available to generate PDF.");
    return;
  }

  const pdf = new jsPDF({
    orientation: 'landscape', // Assume landscape is better for video screenshots
    unit: 'px', // Use pixels for easier mapping from screen elements
    format: 'a4' // A common page size, adjust if needed
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 20; // Page margin in pixels

  // Sort slides by time just in case they aren't already
  slides.sort((a, b) => a.currentTimeSeconds - b.currentTimeSeconds);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    if (i > 0) {
      pdf.addPage();
    }

    // --- Add Header (Timestamp & Video Title) ---
    pdf.setFontSize(12);
    pdf.text(`Timestamp: ${slide.timestamp}`, margin, margin);
    pdf.text(videoTitle, pdfWidth / 2, margin, { align: 'center' });
    pdf.text(`Slide ${i + 1} of ${slides.length}`, pdfWidth - margin, margin, { align: 'right' });

    // --- Add Image ---
    // We need to load the base64 image into an Image object first to get its dimensions
    const img = new Image();
    img.src = slide.screenshotDataUrl;

    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const aspectRatio = imgWidth / imgHeight;

    // Calculate dimensions to fit image within page margins
    let drawWidth = pdfWidth - 2 * margin;
    let drawHeight = drawWidth / aspectRatio;
    const topMarginForImage = margin + 20; // Space below header

    if (drawHeight > pdfHeight - topMarginForImage - margin - 40) { // Check vertical space (leave room for notes)
      drawHeight = pdfHeight - topMarginForImage - margin - 40; // Max height available
      drawWidth = drawHeight * aspectRatio;
    }
     // Center the image horizontally
     const xPos = (pdfWidth - drawWidth) / 2;
     const yPos = topMarginForImage;

     pdf.addImage(img.src, 'PNG', xPos, yPos, drawWidth, drawHeight);


    // --- Add Notes ---
    if (slide.notes && slide.notes.trim() !== '') {
      pdf.setFontSize(10);
      const notesYPos = yPos + drawHeight + 15; // Position below image
      // Use splitTextToSize for basic wrapping
      const notesText = pdf.splitTextToSize(`Notes: ${slide.notes}`, pdfWidth - 2 * margin);
      pdf.text(notesText, margin, notesYPos);
    }
  }

  // --- Save the PDF ---
  const safeVideoTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  pdf.save(`${safeVideoTitle}_notes.pdf`);

  console.log("PDF generation complete.");
};


// Alternative using html2canvas (if you want to render slide component to PDF)
// This is more complex to get right with pagination and layout.
// The jsPDF addImage approach is usually simpler for this use case.
export const generatePdfFromDOM = async (elementId, pdfName) => {
     const input = document.getElementById(elementId);
     if (!input) {
         console.error(`Element with ID ${elementId} not found.`);
         return;
     }

     try {
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'px', 'a4'); // Landscape, pixels, A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; // Margin from top

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`${pdfName}.pdf`);
     } catch (error) {
         console.error("Error generating PDF with html2canvas:", error);
     }
}