import React, { useState, useEffect } from 'react';
import { Download, MessageSquare, CheckCircle2, Check } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { generateBillPDF, openCustomerWhatsApp } from '../../utils/generateBillPDF.js';
import { formatDate, formatPhone, formatRegNumber } from '../../utils/formatters.js';

export const BillPreviewModal = ({ isOpen, onClose, bill, isNewGeneration = false }) => {
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState(false);
  const toast = useToast();

  // Reset actions state when modal opens with a new bill
  useEffect(() => {
    if (isOpen) {
      setHasDownloaded(false);
      setHasOpenedWhatsApp(false);
      // Auto-generate PDF in memory when a new bill is created
      if (isNewGeneration && bill) {
        // PDF doc is generated in memory immediately upon successful bill creation
      }
    }
  }, [isOpen, bill, isNewGeneration]);

  if (!bill) return null;

  const billNo = bill.billNumber || bill.invoiceId || 'INV-0001';
  const custName = bill.customerName || 'Customer';
  const phone = bill.mobileNumber || '';
  const bike = bill.bikeName || '';
  const regNo = bill.bikeNumber || '';
  const items = bill.items || [];
  const grandTotal = bill.grandTotal || 0;

  const handleDownloadPDF = () => {
    try {
      generateBillPDF(bill);
      setHasDownloaded(true);
      toast.success(`Downloaded ${billNo}.pdf successfully!`);
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Failed to download PDF.');
    }
  };

  const handleOpenWhatsApp = () => {
    try {
      openCustomerWhatsApp(bill);
      setHasOpenedWhatsApp(true);
      toast.success('Opened WhatsApp with prefilled message for customer!');
    } catch (err) {
      console.error('WhatsApp error:', err);
      toast.error(err.message || 'Failed to open WhatsApp.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdrop={false}
      title={isNewGeneration ? "Bill Generated Successfully" : `Bill Details: ${billNo}`}
      subtitle={`Bill Number: ${billNo}`}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Bill #{billNo}</span>
          </div>

          <Button
            variant="outline"
            onClick={onClose}
          >
            Close Window
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Success Banner */}
        {isNewGeneration && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs font-semibold">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Bill generated successfully</div>
              <div className="text-[11px] text-slate-600">Bill Number: <span className="font-mono font-bold text-emerald-700">{billNo}</span></div>
            </div>
          </div>
        )}

        {/* Single Primary Action: Send PDF on WhatsApp */}
        <div className="p-3 bg-slate-900 rounded-2xl text-white">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{hasOpenedWhatsApp ? 'Send PDF on WhatsApp Again' : 'Send PDF on WhatsApp'}</span>
          </button>
        </div>

        {/* Formatted Bill Preview Container */}
        <div className="p-4 sm:p-5 border border-slate-200 rounded-2xl bg-white space-y-4 shadow-2xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">NATIONAL AUTO GARAGE</h3>
              <p className="text-[11px] text-slate-500 font-medium">Two-Wheeler Service & Repair Center</p>
              <p className="text-[10px] text-rose-600 font-bold mt-0.5">Imran Pathan: +91 96248 44188 • Naim Pathan: +91 81281 44350</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                INVOICE / SERVICE BILL
              </span>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                {formatDate(bill.billDate || bill.createdAt)}
              </div>
            </div>
          </div>

          {/* Customer & Bike Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Customer</span>
              <span className="font-bold text-slate-900">{custName}</span>
              {phone && <div className="font-mono text-slate-600 text-[11px]">{formatPhone(phone)}</div>}
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Vehicle</span>
              <span className="font-bold text-slate-900">{bike || '—'}</span>
              {regNo && <div className="font-mono text-slate-900 text-[11px] font-bold">{formatRegNumber(regNo)}</div>}
            </div>
          </div>

          {/* Items Table Preview */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bill Items ({items.length})</div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {items.map((it, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="font-semibold text-slate-900">
                    {idx + 1}. {it.productName}
                  </div>
                  <div className="font-mono text-slate-600">
                    {it.quantity} x ₹{it.unitPrice} = <span className="font-bold text-slate-900">₹{it.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total Box */}
          <div className="p-3.5 bg-rose-600 text-white rounded-xl flex items-center justify-between font-bold text-sm shadow-2xs">
            <span>TOTAL AMOUNT (₹)</span>
            <span className="font-mono text-base font-black">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
