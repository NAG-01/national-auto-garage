import React, { useState } from 'react';
import { Plus, Trash2, User, Phone, Bike, Hash } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ModalCancelButton } from '../../components/ui/Modal.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { validatePhone } from '../../utils/formatters.js';

export const BillCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bikeName, setBikeName] = useState('');
  const [bikeNumber, setBikeNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PAID');

  // Multiple Line Items State
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState('');
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const resetForm = () => {
    setCustomerName('');
    setMobileNumber('');
    setBikeName('');
    setBikeNumber('');
    setPaymentStatus('PAID');
    setItemName('');
    setItemQty(1);
    setItemPrice('');
    setItems([]);
    setErrors({});
  };

  const handleAddItem = () => {
    if (!itemName.trim()) {
      toast.error('Please enter an item name.');
      return;
    }
    const price = Number(itemPrice);
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price.');
      return;
    }
    const qty = Math.max(1, Number(itemQty || 1));

    setItems((prev) => [
      ...prev,
      {
        productName: itemName.trim(),
        quantity: qty,
        unitPrice: price,
        total: price * qty,
      },
    ]);

    setItemName('');
    setItemQty(1);
    setItemPrice('');
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const validate = () => {
    const newErrors = {};
    if (!customerName.trim() || customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!mobileNumber.trim() || !validatePhone(mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!bikeName.trim()) {
      newErrors.bikeName = 'Bike name is required';
    }
    if (items.length === 0) {
      newErrors.items = 'Please add at least one item to the bill';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        mobileNumber: mobileNumber.trim(),
        bikeName: bikeName.trim(),
        bikeNumber: bikeNumber.trim(),
        items,
        grandTotal,
        paymentStatus,
      };

      const res = await api.post('/invoices', payload);
      const createdBill = res.data || res.invoice || res;

      toast.success(`Bill '${createdBill.billNumber || 'INV-0001'}' generated successfully!`);
      resetForm();
      onSuccess?.(createdBill);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to generate bill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      confirmOnClose={true}
      title="Create New Bill / Invoice"
      subtitle="Customer details aur items ki detail daal kar bill generate karein"
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalCancelButton disabled={loading}>
            Cancel
          </ModalCancelButton>
          <Button variant="accent" onClick={handleSubmit} loading={loading}>
            Generate Bill
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Customer & Bike Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Customer Name"
            required
            placeholder="e.g. Ramesh Kumar"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (errors.customerName) setErrors({ ...errors, customerName: '' });
            }}
            error={errors.customerName}
            icon={User}
          />

          <Input
            label="Mobile Number"
            required
            placeholder="e.g. 9876543210"
            value={mobileNumber}
            onChange={(e) => {
              setMobileNumber(e.target.value);
              if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
            }}
            error={errors.mobileNumber}
            icon={Phone}
          />

          <Input
            label="Bike Name / Model"
            required
            placeholder="e.g. Honda Activa 6G"
            value={bikeName}
            onChange={(e) => {
              setBikeName(e.target.value);
              if (errors.bikeName) setErrors({ ...errors, bikeName: '' });
            }}
            error={errors.bikeName}
            icon={Bike}
          />

          <Input
            label="Bike Number / Plate (Optional)"
            placeholder="e.g. GJ 05 AB 1234"
            value={bikeNumber}
            onChange={(e) => setBikeNumber(e.target.value)}
            icon={Hash}
          />
        </div>

        {/* Add Multiple Items Section */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Add Bill Items</span>
            <span className="text-slate-500 font-normal text-[11px]">
              Type item name, qty, & price
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-6">
              <Input
                placeholder="Item name (e.g. Engine Oil, Labour...)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                type="number"
                min="1"
                placeholder="Qty"
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                type="number"
                min="0"
                placeholder="Price ₹"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="button"
                variant="accent"
                icon={Plus}
                onClick={handleAddItem}
                className="w-full justify-center"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Items List & Grand Total */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>BILL ITEMS LIST ({items.length})</span>
            {errors.items && <span className="text-rose-600 text-xs font-semibold">{errors.items}</span>}
          </div>

          {items.length === 0 ? (
            <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              No items added yet. Type item details above and click + Add.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {items.map((it, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0 font-bold text-slate-900 truncate">
                    {idx + 1}. {it.productName}
                  </div>
                  <div className="font-mono text-slate-600">
                    {it.quantity} x ₹{it.unitPrice} = <span className="font-bold text-slate-900">₹{it.total}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="p-3 bg-orange-50/60 border-t border-orange-100 flex items-center justify-between font-bold text-xs text-orange-950">
                <span>GRAND TOTAL</span>
                <span className="font-mono text-sm text-orange-600">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
