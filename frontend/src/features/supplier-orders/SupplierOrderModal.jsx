import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ModalCancelButton } from '../../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatPhone } from '../../utils/formatters.js';

const UNITS = ['PCS', 'BOTTLE', 'LTR', 'SET', 'BOX', 'PAIR', 'MTR', 'KG'];

export const SupplierOrderModal = ({ isOpen, onClose, order, defaultSupplierId, onSuccess }) => {
  const [suppliers, setSuppliers] = useState([]);

  const [supplierId, setSupplierId] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

  // Free-Text Product Picker State
  const [customItemName, setCustomItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemUnit, setItemUnit] = useState('PCS');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const res = await api.get('/suppliers?status=ACTIVE&limit=100');
        const list = res.data?.suppliers || res.suppliers || [];
        setSuppliers(list);
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      }
    };

    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (order) {
      const sId = order.supplierId?._id || order.supplierId || '';
      setSupplierId(sId);
      setSupplierPhone(order.supplierPhone || order.supplierId?.phone || '');
      setOrderDate(
        order.orderDate
          ? new Date(order.orderDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setNotes(order.notes || '');

      const initialItems = (order.items || []).map((it) => ({
        productName: it.productName || 'Item',
        unit: it.unit || 'PCS',
        quantityRequested: it.quantityRequested || 1,
      }));
      setItems(initialItems);
    } else {
      const sId = defaultSupplierId || '';
      setSupplierId(sId);
      const matchedSup = suppliers.find((s) => s._id === sId);
      setSupplierPhone(matchedSup ? matchedSup.phone || '' : '');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setItems([]);
    }
    setCustomItemName('');
    setItemQty(1);
    setItemUnit('PCS');
    setErrors({});
  }, [order, defaultSupplierId, isOpen, suppliers]);

  const handleSupplierSelect = (id) => {
    setSupplierId(id);
    const sup = suppliers.find((s) => s._id === id);
    if (sup) {
      setSupplierPhone(sup.phone || '');
    } else {
      setSupplierPhone('');
    }
    if (errors.supplierId) setErrors({ ...errors, supplierId: '' });
  };

  const handleAddProductLine = () => {
    if (!customItemName.trim()) {
      toast.error('Please type an item name.');
      return;
    }

    const qty = Number(itemQty);
    if (!qty || qty < 1) {
      toast.error('Quantity requested must be at least 1.');
      return;
    }

    const cleanName = customItemName.trim();

    // Check duplicate name
    const existingIndex = items.findIndex(
      (it) => it.productName.toLowerCase() === cleanName.toLowerCase()
    );
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantityRequested += qty;
      updated[existingIndex].unit = itemUnit;
      setItems(updated);
      toast.success(`Updated quantity for '${cleanName}'`);
    } else {
      setItems((prev) => [
        ...prev,
        {
          productName: cleanName,
          unit: itemUnit,
          quantityRequested: qty,
        },
      ]);
    }

    setCustomItemName('');
    setItemQty(1);
    setItemUnit('PCS');
  };

  const handleRemoveLineItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemQtyChange = (index, val) => {
    const qty = Math.max(1, Number(val || 1));
    setItems((prev) => {
      const updated = [...prev];
      updated[index].quantityRequested = qty;
      return updated;
    });
  };

  const handleItemUnitChange = (index, val) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index].unit = val;
      return updated;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!supplierId) newErrors.supplierId = 'Please select a supplier';
    if (items.length === 0) newErrors.items = 'At least one item is required in the order list';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        supplierId,
        supplierPhone: supplierPhone.trim(),
        orderDate,
        notes: notes.trim(),
        items: items.map((it) => ({
          productName: it.productName.trim(),
          quantityRequested: Number(it.quantityRequested),
          unit: it.unit,
          estimatedUnitCost: 0,
        })),
      };

      if (order) {
        await api.patch(`/supplier-orders/${order._id}`, payload);
        toast.success('Supplier order list updated successfully');
      } else {
        await api.post('/supplier-orders', payload);
        toast.success('Supplier order list created successfully');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save order list.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      confirmOnClose={true}
      title={order ? `Edit Order List: ${order.orderId}` : 'Create Supplier Order List'}
      subtitle="Add items list to order from supplier and send via WhatsApp"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalCancelButton disabled={loading}>
            Cancel
          </ModalCancelButton>
          <Button variant="accent" onClick={handleSubmit} loading={loading}>
            {order ? 'Save Changes' : 'Create Order List'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Supplier Select & Mobile Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Supplier / Vendor"
            required
            value={supplierId}
            onChange={(e) => handleSupplierSelect(e.target.value)}
            error={errors.supplierId}
          >
            <option value="">-- Choose Supplier --</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({formatPhone(s.phone)})
              </option>
            ))}
          </Select>

          {/* Clean Input without overlapping inner icon */}
          <Input
            label="Supplier Mobile / WhatsApp Number"
            placeholder="e.g. 9825098250"
            value={supplierPhone}
            onChange={(e) => setSupplierPhone(e.target.value)}
            hint="Used to send order list on WhatsApp"
          />
        </div>

        {/* Free-Text Item Entry Section */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Add Item To Order List</span>
            <span className="text-slate-500 font-normal text-[11px]">
              Type item name, quantity, and unit
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-6">
              <Input
                placeholder="Type item name (e.g. Motul 10W-30 Oil, Brake Shoe...)"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProductLine();
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
              <Select value={itemUnit} onChange={(e) => setItemUnit(e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Button
                type="button"
                variant="accent"
                icon={Plus}
                onClick={handleAddProductLine}
                className="w-full justify-center"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>ORDERED ITEMS LIST ({items.length})</span>
            {errors.items && <span className="text-rose-600 text-xs font-semibold">{errors.items}</span>}
          </div>

          {items.length === 0 ? (
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              No items added yet. Type item name above and click + Add to build your order list.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0 font-bold text-slate-900 truncate">
                    {idx + 1}. {it.productName}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        value={it.quantityRequested}
                        onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                      />
                    </div>

                    <div className="w-20">
                      <Select
                        value={it.unit}
                        onChange={(e) => handleItemUnitChange(idx, e.target.value)}
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Textarea
          label="Order Notes (Optional)"
          rows={2}
          placeholder="e.g. Urgent restock order / Deliver by tomorrow..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
};
