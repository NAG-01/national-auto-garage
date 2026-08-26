import { jsPDF } from 'jspdf';

// Helper to draw angled top/bottom borders (Black & Red diagonal split)
const drawTopBorder = (doc) => {
  // Top Black section (left part)
  doc.setFillColor(15, 23, 42); // Black / Dark Slate
  doc.triangle(0, 0, 115, 0, 105, 5, 'F');
  doc.rect(0, 0, 105, 5, 'F');

  // Top Red section (right part)
  doc.setFillColor(220, 38, 38); // Crimson Red #dc2626
  doc.triangle(105, 5, 115, 0, 210, 0, 'F');
  doc.rect(115, 0, 95, 5, 'F');
  doc.triangle(105, 5, 210, 0, 210, 5, 'F');
};

const drawBottomBorder = (doc) => {
  const y = 292;
  // Bottom Black section (left part)
  doc.setFillColor(15, 23, 42);
  doc.triangle(0, 297, 155, 297, 145, 292, 'F');
  doc.rect(0, 292, 145, 5, 'F');

  // Bottom Red section (right part)
  doc.setFillColor(220, 38, 38);
  doc.triangle(145, 292, 155, 297, 210, 297, 'F');
  doc.rect(155, 292, 55, 5, 'F');
  doc.triangle(145, 292, 210, 292, 210, 297, 'F');
};

// Helper for Watermark on background
const drawWatermark = (doc, yStart = 110, yEnd = 240) => {
  const centerY = (yStart + yEnd) / 2;
  doc.saveGraphicsState();
  
  // Set ultra light watermark styling
  doc.setGState(new doc.GState({ opacity: 0.05 }));
  doc.setTextColor(100, 100, 100);
  
  // Outer Bike silhouette text/logo representation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('NATIONAL', 105, centerY - 12, { align: 'center' });
  doc.setFontSize(36);
  doc.setTextColor(220, 38, 38);
  doc.text('AUTO GARAGE', 105, centerY + 4, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text('TWO WHEELER SERVICE & REPAIR CENTER', 105, centerY + 14, { align: 'center' });
  
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
  const lightBgColor = [248, 250, 252]; // Slate-50

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
  let y = 12;

  // Render Page 1 Top Border
  drawTopBorder(doc);

  // --- PAGE 1 HEADER ---
  // Left: Logo text representation matching reference
  doc.saveGraphicsState();
  // Motorcycle icon outline representation
  doc.setFillColor(15, 23, 42);
  doc.circle(22, y + 5, 6, 'F');
  doc.circle(42, y + 5, 6, 'F');
  doc.setLineWidth(1.2);
  doc.setDrawColor(15, 23, 42);
  doc.line(22, y + 5, 32, y + 10);
  doc.line(32, y + 10, 42, y + 5);
  doc.line(32, y + 10, 35, y + 2);
  doc.restoreGraphicsState();

  // Brand Name Below Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...blackColor);
  doc.text('NATIONAL', 32, y + 16, { align: 'center' });
  doc.setFontSize(17);
  doc.setTextColor(...redColor);
  doc.text('AUTO GARAGE', 32, y + 22, { align: 'center' });
  
  doc.setFontSize(6.5);
  doc.setTextColor(...blackColor);
  doc.setFont('helvetica', 'bold');
  doc.text('— TWO WHEELER SERVICE & REPAIR CENTER —', 32, y + 26, { align: 'center' });

  // Center: Contact Details
  doc.setFillColor(...redColor);
  doc.circle(108, y + 6, 2.5, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Imran Pathan', 113, y + 5);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('+91 96248 44188', 113, y + 9.5);

  doc.setFillColor(...redColor);
  doc.circle(108, y + 17, 2.5, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Naim Pathan', 113, y + 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('+91 81281 44350', 113, y + 20.5);

  // Vertical Separator Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(144, y + 2, 144, y + 26);

  // Right: Invoice Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...redColor);
  doc.text('INVOICE / SERVICE BILL', 150, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Date', 150, y + 15);
  doc.text(':', 168, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedDateStr, 173, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.text('Time', 150, y + 21);
  doc.text(':', 168, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedTimeStr, 173, y + 21);

  // --- CUSTOMER & VEHICLE DETAILS SECTION ---
  y = 44;

  // Left Card: Customer Details
  const cardW = 88;
  const cardH = 26;

  // Red Title Tab
  doc.setFillColor(...redColor);
  doc.roundedRect(12, y, 48, 6, 1.5, 1.5, 'F');
  doc.circle(16, y + 3, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CUSTOMER DETAILS', 20, y + 4.2);

  // Box Content
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, y + 5, cardW, cardH - 5, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Customer Name', 16, y + 12);
  doc.text(':', 44, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(bill?.customerName || '—', 48, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Mobile Number', 16, y + 18);
  doc.text(':', 44, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(bill?.mobileNumber || '—', 48, y + 18);

  // Right Card: Vehicle Details
  const rightX = 110;
  doc.setFillColor(...redColor);
  doc.roundedRect(rightX, y, 46, 6, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('VEHICLE DETAILS', rightX + 7, y + 4.2);

  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightX, y + 5, cardW, cardH - 5, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Bike Name', rightX + 4, y + 12);
  doc.text(':', rightX + 32, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(bill?.bikeName || '—', rightX + 36, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Number Plate', rightX + 4, y + 18);
  doc.text(':', rightX + 32, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(bill?.bikeNumber || '—', rightX + 36, y + 18);

  // --- ITEMS TABLE HEADER ---
  y = 75;
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
    doc.text('UNIT PRICE (₹)', tableX + 138, currentY + 4.8, { align: 'right' });
    doc.text('TOTAL (₹)', tableX + 178, currentY + 4.8, { align: 'right' });
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
      // Draw bottom border on current page before breaking
      drawBottomBorder(doc);

      // Add new page
      doc.addPage();
      currentPage += 1;
      drawTopBorder(doc);

      // Reset Y for next page continuation (No Page 1 Header)
      y = 15;
      renderTableHeader(y);
      y += headerH;

      // Draw watermark on new page
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
  doc.text('TOTAL AMOUNT (₹)', tableX + 116, y + 6);

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
  doc.text('★   Thank You!   ★', 105, y, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('for choosing National Auto Garage!', 105, y + 4.5, { align: 'center' });

  // --- FOOTER ADDRESS & BOTTOM BORDER ---
  y += 10;
  doc.setFillColor(...redColor);
  doc.circle(44, y - 0.8, 1.6, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('National Auto Garage, Near Old Petrol Pump, Mangrol, Surat - Gujarat 394125', 105, y, {
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
