import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Trash2, Package } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { formatINR } from '../../utils/formatters.js';

export const PurchaseCreatePage = () => {
  const [searchParams] = useSearchParams();
  const initialSupplierId = searchParams.get('supplierId') || '';

  const [suppliers, setSuppliers] = useState([]);
  const [parts, setParts] = useState([]);

  const [supplierId, setSupplierId] = useState(initialSupplierId);
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { partId: '', quantity: 1, unitCost: 0, totalCost: 0 },
  ]);
  const [taxAmount, setTaxAmount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [supRes, partRes] = await Promise.all([
          api.get('/suppliers?limit=100'),
          api.get('/inventory?limit=200'),
        ]);
        setSuppliers(supRes.data);
        setParts(partRes.data);
      } catch (err) {
        console.error('Failed to load suppliers/parts:', err);
      }
    };
    loadMasters();
  }, []);

  const handlePartSelect = (index, selectedId) => {
    const selectedPart = parts.find((p) => p._id === selectedId);
    const next = [...items];
    next[index].partId = selectedId;
    next[index].unitCost = selectedPart ? selectedPart.purchasePrice : 0;
    next[index].totalCost = (next[index].unitCost || 0) * (next[index].quantity || 1);
    setItems(next);
  };

  const handleQuantityChange = (index, qty) => {
    const next = [...items];
    next[index].quantity = Number(qty);
    next[index].totalCost = (next[index].unitCost || 0) * Number(qty);
    setItems(next);
  };

  const handleUnitCostChange = (index, cost) => {
    const next = [...items];
    next[index].unitCost = Number(cost);
    next[index].totalCost = Number(cost) * (next[index].quantity || 1);
    setItems(next);
  };

  const addItemRow = () => {
    setItems([...items, { partId: '', quantity: 1, unitCost: 0, totalCost: 0 }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  const totalAmount = subtotal + Number(taxAmount || 0);
  const outstandingBalance = Math.max(0, totalAmount - Number(amountPaid || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error('Please select a supplier.');
      return;
    }
    const validItems = items.filter((it) => it.partId && it.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid spare part item.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/purchases', {
        supplierId,
        supplierInvoiceNo,
        purchaseDate,
        items: validItems,
        taxAmount: Number(taxAmount || 0),
        amountPaid: Number(amountPaid || 0),
        paymentMethod,
        notes,
      });

      toast.success(`Purchase Order ${res.data.purchaseNumber} recorded. Inventory stock increased!`);
      navigate('/purchases');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/purchases')}>
          Back to Purchases
        </Button>
        <PageHeader
          title="New Spare Parts Purchase Order"
          subtitle="Record vendor parts intake. Automatically increments parts stock count and updates supplier payables."
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor & Invoice info */}
        <Card title="1. Supplier & Invoice Information">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Supplier / Vendor"
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.supplierCode})
                </option>
              ))}
            </Select>

            <Input
              label="Vendor Invoice / Bill Number"
              placeholder="e.g. INV-98124"
              value={supplierInvoiceNo}
              onChange={(e) => setSupplierInvoiceNo(e.target.value)}
            />

            <Input
              label="Purchase Date"
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
        </Card>

        {/* Purchase Items List */}
        <Card
          title="2. Spare Parts Items Purchased"
          subtitle="Select parts from inventory, specify quantity and purchase cost"
          action={
            <Button variant="outline" size="sm" icon={Plus} onClick={addItemRow}>
              Add Line Item
            </Button>
          }
        >
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-end p-3 rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <div className="col-span-12 sm:col-span-5">
                  <Select
                    label="Spare Part"
                    required
                    value={item.partId}
                    onChange={(e) => handlePartSelect(index, e.target.value)}
                  >
                    <option value="">-- Select Part from Catalog --</option>
                    {parts.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.partNumber}) • Current: {p.currentStock}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <Input
                    label="Qty Intake"
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <Input
                    label="Cost / Unit (₹)"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.unitCost}
                    onChange={(e) => handleUnitCostChange(index, e.target.value)}
                  />
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Line Total
                  </label>
                  <div className="px-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg">
                    {formatINR(item.totalCost)}
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-1 flex justify-center pb-2">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment & Totals */}
        <Card title="3. Payment & Payables Settlement">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Tax Amount (GST ₹)"
              type="number"
              min="0"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
            />

            <Input
              label="Amount Paid at Purchase (₹)"
              type="number"
              min="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />

            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs space-y-1">
              <div>
                Items Subtotal: <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
              </div>
              <div>
                Total Purchase Cost: <span className="font-bold text-slate-900 text-sm">{formatINR(totalAmount)}</span>
              </div>
              <div className="text-rose-600 font-semibold">
                Supplier Credit Due: {formatINR(outstandingBalance)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/purchases')}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" loading={loading} icon={ShoppingCart}>
                Confirm Stock Intake
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};
