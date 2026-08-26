import { jsPDF } from 'jspdf';
import { logoBase64 } from '../assets/logoData.js';

// Helper to draw angled top/bottom borders (Black & Red diagonal split)
const drawTopBorder = (doc) => {
  // Top Black section (left part)
  doc.setFillColor(15, 23, 42); // Black / Dark Slate
  doc.rect(0, 0, 105, 5, 'F');
  doc.triangle(105, 0, 115, 0, 105, 5, 'F');

  // Top Red section (right part)
  doc.setFillColor(220, 38, 38); // Crimson Red #dc2626
  doc.rect(115, 0, 95, 5, 'F');
  doc.triangle(105, 5, 115, 0, 115, 5, 'F');
};

const drawBottomBorder = (doc) => {
  // Bottom Black section (left part)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 292, 145, 5, 'F');
  doc.triangle(145, 292, 155, 297, 145, 297, 'F');

  // Bottom Red section (right part)
  doc.setFillColor(220, 38, 38);
  doc.rect(155, 292, 55, 5, 'F');
  doc.triangle(145, 292, 155, 292, 155, 297, 'F');
};

// Helper to draw phone icon
const drawPhoneIcon = (doc, x, y) => {
  doc.setFillColor(220, 38, 38);
  doc.circle(x, y, 2.8, 'F');
  
  // White handset icon representation
  doc.saveGraphicsState();
  doc.setLineWidth(0.6);
  doc.setDrawColor(255, 255, 255);
  doc.line(x - 1, y - 1, x + 0.5, y + 1);
  doc.restoreGraphicsState();
};

// Helper to draw location pin icon
const drawPinIcon = (doc, x, y) => {
  doc.setFillColor(220, 38, 38);
  doc.circle(x, y - 1, 2, 'F');
  doc.triangle(x - 1.8, y - 0.5, x + 1.8, y - 0.5, x, y + 2, 'F');
  doc.setFillColor(255, 255, 255);
  doc.circle(x, y - 1, 0.8, 'F');
};

// Helper for Watermark on background
const drawWatermark = (doc, yStart = 110, yEnd = 240) => {
  const centerY = (yStart + yEnd) / 2;
  doc.saveGraphicsState();
  
  // Set ultra light watermark styling
  doc.setGState(new doc.GState({ opacity: 0.05 }));
  
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 45, centerY - 25, 120, 50);
    } catch (e) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(100, 100, 100);
      doc.text('NATIONAL AUTO GARAGE', 105, centerY, { align: 'center' });
    }
  }
  
  doc.restoreGraphicsState();
};

export const getBillPDFDoc = (bill) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const redColor = [220, 38, 38]; // Red #dc2626
  const blackColor = [15, 23, 42]; // Black / Dark Slate
  const grayTextColor = [71, 85, 105]; // Slate-600

  const items = Array.isArray(bill?.items) && bill.items.length > 0 ? bill.items : [];
  const grandTotal = Number(bill?.grandTotal || bill?.totalAmount || 0);

  // Date & Time formatting
  const rawDate = bill?.billDate || bill?.createdAt || new Date();
  const billDateObj = new Date(rawDate);
  const formattedDateStr = billDateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTimeStr = billDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  let currentPage = 1;
  let y = 10;

  // Render Page 1 Top Border
  drawTopBorder(doc);

  // --- PAGE 1 HEADER ---
  // Left: Exact High-Res Logo Image
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 10, y + 2, 58, 26);
    } catch (e) {
      console.error('Failed to render logo base64:', e);
    }
  }

  // Center: Contact Details
  drawPhoneIcon(doc, 108, y + 7);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Imran Pathan', 113, y + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('+91 96248 44188', 113, y + 10.5);

  drawPhoneIcon(doc, 108, y + 18);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Naim Pathan', 113, y + 17);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('+91 81281 44350', 113, y + 21.5);

  // Vertical Separator Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(144, y + 3, 144, y + 26);

  // Right: Invoice Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...redColor);
  doc.text('INVOICE / SERVICE BILL', 150, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Date', 150, y + 16);
  doc.text(':', 168, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedDateStr, 173, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Time', 150, y + 22);
  doc.text(':', 168, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedTimeStr, 173, y + 22);

  // --- CUSTOMER & VEHICLE DETAILS SECTION ---
  y = 44;

  const cardW = 88;
  const cardH = 24;

  // Left Card: Customer Details Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, y + 3, cardW, cardH - 3, 2, 2, 'D');

  // Red Title Tab
  doc.setFillColor(...redColor);
  doc.roundedRect(12, y, 48, 5.5, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CUSTOMER DETAILS', 18, y + 3.8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Customer Name', 16, y + 10);
  doc.text(':', 44, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(bill?.customerName || '—', 48, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Mobile Number', 16, y + 17);
  doc.text(':', 44, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(bill?.mobileNumber || '—', 48, y + 17);

  // Right Card: Vehicle Details Box
  const rightX = 110;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightX, y + 3, cardW, cardH - 3, 2, 2, 'D');

  // Red Title Tab
  doc.setFillColor(...redColor);
  doc.roundedRect(rightX, y, 46, 5.5, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('VEHICLE DETAILS', rightX + 6, y + 3.8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Bike Name', rightX + 4, y + 10);
  doc.text(':', rightX + 32, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(bill?.bikeName || '—', rightX + 36, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Number Plate', rightX + 4, y + 17);
  doc.text(':', rightX + 32, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(bill?.bikeNumber || '—', rightX + 36, y + 17);

  // --- ITEMS TABLE HEADER ---
  y = 74;
  const tableX = 12;
  const tableW = 186;
  const headerH = 7;

  const renderTableHeader = (currentY) => {
    doc.setFillColor(...blackColor);
    doc.rect(tableX, currentY, tableW, headerH, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);

    doc.text('#', tableX + 4, currentY + 4.8);
    doc.text('ITEM DESCRIPTION', tableX + 32, currentY + 4.8);
    doc.text('QTY', tableX + 106, currentY + 4.8, { align: 'center' });
    doc.text('UNIT PRICE (Rs.)', tableX + 144, currentY + 4.8, { align: 'right' });
    doc.text('TOTAL (Rs.)', tableX + 182, currentY + 4.8, { align: 'right' });
  };

  renderTableHeader(y);
  y += headerH;

  // Draw Subtle Watermark behind items
  drawWatermark(doc, y, 260);

  const pageMaxY = 270; // Maximum y before breaking page
  const rowHeight = 7.2;

  items.forEach((item, idx) => {
    // Check page break condition
    if (y + rowHeight > pageMaxY) {
      drawBottomBorder(doc);
      doc.addPage();
      currentPage += 1;
      drawTopBorder(doc);

      // Reset Y for next page continuation (No Page 1 Header)
      y = 15;
      renderTableHeader(y);
      y += headerH;

      drawWatermark(doc, y, 260);
    }

    // Row Background (Alternating subtle gray/white)
    doc.setFillColor(idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 251);
    doc.rect(tableX, y, tableW, rowHeight, 'F');

    // Row Outer/Cell Border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(tableX, y, tableW, rowHeight, 'D');

    // Column Dividers
    doc.line(tableX + 12, y, tableX + 12, y + rowHeight);
    doc.line(tableX + 96, y, tableX + 96, y + rowHeight);
    doc.line(tableX + 116, y, tableX + 116, y + rowHeight);
    doc.line(tableX + 148, y, tableX + 148, y + rowHeight);

    // Row Values
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...blackColor);
    doc.text(String(idx + 1), tableX + 6, y + 4.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    const descText = String(item.productName || item.description || 'Service Item');
    doc.text(descText, tableX + 14, y + 4.8);

    doc.setFont('helvetica', 'bold');
    const qtyVal = Number(item.quantity || 1).toFixed(2);
    doc.text(qtyVal, tableX + 106, y + 4.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    const unitPriceVal = Number(item.unitPrice || 0).toFixed(2);
    doc.text(unitPriceVal, tableX + 144, y + 4.8, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    const itemTotalVal = Number(item.total || item.unitPrice * item.quantity || 0).toFixed(2);
    doc.text(itemTotalVal, tableX + 182, y + 4.8, { align: 'right' });

    y += rowHeight;
  });

  // Check space for Total & Footer; if insufficient, add final page
  if (y + 35 > pageMaxY) {
    drawBottomBorder(doc);
    doc.addPage();
    currentPage += 1;
    drawTopBorder(doc);
    y = 20;
  }

  // --- TOTAL SECTION (LAST PAGE ONLY) ---
  y += 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(tableX, y, tableW, 9, 'FD');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('TOTAL AMOUNT (Rs.)', tableX + 112, y + 6);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...redColor);
  const formattedGrandTotal = grandTotal.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  doc.text(formattedGrandTotal, tableX + 182, y + 6.5, { align: 'right' });

  // --- THANK YOU SECTION ---
  y += 18;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...redColor);
  doc.text('-   Thank You!   -', 105, y, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('for choosing National Auto Garage!', 105, y + 4.5, { align: 'center' });

  // --- FOOTER ADDRESS & BOTTOM BORDER ---
  y += 10;
  drawPinIcon(doc, 42, y - 0.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('National Auto Garage, Near Old Petrol Pump, Mangrol, Surat - Gujarat 394125', 107, y, {
    align: 'center',
  });

  drawBottomBorder(doc);

  const filename = `National_Auto_Garage_Bill.pdf`;
  return { doc, filename };
};

export const generateBillPDF = (bill) => {
  const { doc, filename } = getBillPDFDoc(bill);
  doc.save(filename);
};

export const normalizeIndianMobileNumber = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length > 10) {
    const last10 = digits.slice(-10);
    return `91${last10}`;
  }
  return null;
};

export const openCustomerWhatsApp = (bill) => {
  generateBillPDF(bill);
  const rawPhone = bill.mobileNumber || bill.customerPhone || '';
  const normalizedPhone = normalizeIndianMobileNumber(rawPhone);

  const whatsappUrl = normalizedPhone
    ? `https://api.whatsapp.com/send?phone=${normalizedPhone}`
    : 'https://web.whatsapp.com/';

  window.open(whatsappUrl, '_blank');
  return true;
};
