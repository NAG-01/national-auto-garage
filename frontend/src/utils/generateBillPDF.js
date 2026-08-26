import { jsPDF } from 'jspdf';

export const getBillPDFDoc = (bill) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [234, 88, 12]; // Orange-600 #ea580c
  const darkColor = [15, 23, 42]; // Slate-900
  const grayColor = [100, 116, 139]; // Slate-500

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('NATIONAL AUTO GARAGE', 14, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Two-Wheeler Service & Repair Center', 14, 19);
  doc.setFont('helvetica', 'bold');
  doc.text('Imran Pathan: +91 96248 44188   |   Naim Pathan: +91 81281 44350', 14, 25);

  // Bill Badge (Right Side Header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INVOICE BILL', 196, 14, { align: 'right' });

  const billNo = bill.billNumber || bill.invoiceId || 'INV-0001';
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`No: ${billNo}`, 196, 22, { align: 'right' });

  // 2. Bill & Customer Info Card
  let y = 37;
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(14, y, 182, 32, 3, 3, 'FD');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CUSTOMER DETAILS', 18, y + 8);
  doc.text('VEHICLE & BILL DETAILS', 110, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);

  // Left Column
  doc.text(`Customer Name: `, 18, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text(bill.customerName || 'Customer', 48, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Mobile Number: `, 18, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text(bill.mobileNumber || '—', 48, y + 22);

  // Right Column
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Bike Name: `, 110, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text(bill.bikeName || '—', 135, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Number Plate: `, 110, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text(bill.bikeNumber || 'No Plate', 135, y + 22);

  const formattedDate = bill.billDate
    ? new Date(bill.billDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Date: ${formattedDate}`, 190, y + 8, { align: 'right' });

  // 3. Items Table Header
  y = 77;
  doc.setFillColor(...darkColor);
  doc.rect(14, y, 182, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text('#', 18, y + 6);
  doc.text('ITEM DESCRIPTION', 30, y + 6);
  doc.text('QTY', 125, y + 6, { align: 'center' });
  doc.text('PRICE (Rs)', 155, y + 6, { align: 'right' });
  doc.text('TOTAL (Rs)', 190, y + 6, { align: 'right' });

  // Items Table Rows
  y += 9;
  const items = bill.items && bill.items.length > 0 ? bill.items : [];

  items.forEach((item, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, 182, 8, 'F');

    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text(String(idx + 1), 18, y + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(item.productName || 'Spare Part / Service', 30, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.text(String(item.quantity || 1), 125, y + 5.5, { align: 'center' });
    doc.text(`Rs. ${(item.unitPrice || 0).toLocaleString('en-IN')}`, 155, y + 5.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${(item.total || 0).toLocaleString('en-IN')}`, 190, y + 5.5, { align: 'right' });

    y += 8;
  });

  // Border below table
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);

  // 4. Grand Total Summary Box
  y += 6;
  doc.setFillColor(255, 247, 237); // Orange-50
  doc.setDrawColor(254, 215, 170); // Orange-200
  doc.roundedRect(120, y, 76, 20, 3, 3, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL AMOUNT:', 125, y + 8);

  const grandTotal = bill.grandTotal || 0;
  doc.setFontSize(14);
  doc.text(`Rs. ${grandTotal.toLocaleString('en-IN')}`, 192, y + 14, { align: 'right' });

  // 5. Footer & Contacts (No Authorized Signature line as requested)
  y += 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkColor);
  doc.text('Thank you for choosing National Auto Garage!', 14, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text('Imran Pathan: +91 96248 44188   |   Naim Pathan: +91 81281 44350', 14, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Please keep this bill receipt for your service warranty & records.', 14, y + 11);

  // Filename format strictly matching billNumber (e.g. INV-0001.pdf)
  const filename = `${billNo}.pdf`;
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
  // 1. Automatically download the PDF file to device
  generateBillPDF(bill);

  // 2. Normalize 10-digit Indian mobile number
  const rawPhone = bill.mobileNumber || bill.customerPhone || '';
  const normalizedPhone = normalizeIndianMobileNumber(rawPhone);

  // 3. Open WhatsApp chat directly to exact customer number (no text string)
  const whatsappUrl = normalizedPhone
    ? `https://api.whatsapp.com/send?phone=${normalizedPhone}`
    : 'https://web.whatsapp.com/';

  window.open(whatsappUrl, '_blank');
  return true;
};
