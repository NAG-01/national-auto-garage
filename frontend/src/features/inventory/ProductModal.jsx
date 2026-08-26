import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ModalCancelButton } from '../../components/ui/Modal.jsx';
import { Input, CurrencyInput, Select, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

const DEFAULT_CATEGORIES = [
  'Engine Oils & Lubricants',
  'Brakes & Brake Pads',
  'Electrical & Battery',
  'Filters & Spark Plugs',
  'Tyres & Tubes',
  'Chains & Sprockets',
  'Clutch & Transmission',
  'Suspension & Shockers',
  'Body Parts & Cables',
  'Consumables & Hardware',
  'General Spares',
];

const UNITS = ['PCS', 'LTR', 'SET', 'BOX', 'PAIR', 'BOTTLE', 'MTR', 'KG'];

export const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Engine Oils & Lubricants',
    sellingPrice: '',
    currentStock: '',
    minimumStockLevel: '3',
    unit: 'PCS',
    notes: '',
  });

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/inventory/categories');
        const list = res.data?.length ? res.data : DEFAULT_CATEGORIES;
        const combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...list])).sort();
        setCategories(combined);
      } catch (err) {
        setCategories(DEFAULT_CATEGORIES);
      }
    };
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'Engine Oils & Lubricants',
        sellingPrice: product.sellingPrice ?? '',
        currentStock: product.currentStock ?? '',
        minimumStockLevel: product.minimumStockLevel ?? '3',
        unit: product.unit || 'PCS',
        notes: product.notes || '',
      });
      setIsCustomCategory(false);
      setCustomCategory('');
    } else {
      setFormData({
        name: '',
        category: categories[0] || 'Engine Oils & Lubricants',
        sellingPrice: '',
        currentStock: '0',
        minimumStockLevel: '3',
        unit: 'PCS',
        notes: '',
      });
      setIsCustomCategory(false);
      setCustomCategory('');
    }
    setErrors({});
  }, [product, isOpen, categories]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';

    const cat = isCustomCategory ? customCategory : formData.category;
    if (!cat.trim()) newErrors.category = 'Category is required';

    if (formData.sellingPrice === '' || Number(formData.sellingPrice) < 0) {
      newErrors.sellingPrice = 'Selling price is required';
    }
    if (!product && (formData.currentStock === '' || Number(formData.currentStock) < 0)) {
      newErrors.currentStock = 'Starting stock cannot be negative';
    }
    if (formData.minimumStockLevel === '' || Number(formData.minimumStockLevel) < 0) {
      newErrors.minimumStockLevel = 'Alert level cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const selectedCat = isCustomCategory ? customCategory.trim() : formData.category;
      const payload = {
        name: formData.name.trim(),
        category: selectedCat,
        purchaseCost: 0,
        sellingPrice: Number(formData.sellingPrice),
        minimumStockLevel: Number(formData.minimumStockLevel),
        unit: formData.unit.toUpperCase().trim(),
        notes: formData.notes.trim(),
      };

      if (!product) {
        payload.currentStock = Number(formData.currentStock || 0);
        await api.post('/inventory', payload);
        toast.success('Item added successfully');
      } else {
        await api.patch(`/inventory/${product._id}`, payload);
        toast.success('Item updated successfully');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      confirmOnClose={true}
      title={product ? `Edit Item: ${product.name}` : 'Add New Item'}
      subtitle={
        product
          ? `Item ID: ${product.productId}`
          : 'Add spare part name, selling price, and stock'
      }
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalCancelButton disabled={loading} size="md">
            Cancel
          </ModalCancelButton>
          <Button variant="accent" onClick={handleSubmit} loading={loading} size="md">
            {product ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <Input
          label="Item Name"
          required
          placeholder="e.g. Motul 4T 10W30 Engine Oil (900ml)"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          error={errors.name}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {!isCustomCategory ? (
            <Select
              label="Category"
              required
              value={formData.category}
              onChange={(e) => {
                if (e.target.value === '__NEW__') {
                  setIsCustomCategory(true);
                } else {
                  setFormData({ ...formData, category: e.target.value });
                }
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__NEW__">+ Add New Category...</option>
            </Select>
          ) : (
            <div className="relative">
              <Input
                label="New Category Name"
                required
                placeholder="e.g. Spark Plugs"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                error={errors.category}
              />
              <button
                type="button"
                onClick={() => setIsCustomCategory(false)}
                className="text-[11px] font-semibold text-orange-600 hover:underline mt-1 block"
              >
                ← Choose from existing list
              </button>
            </div>
          )}

          <Select
            label="Unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </div>

        {/* Pricing Field */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <CurrencyInput
            label="Selling Price (₹)"
            required
            placeholder="450"
            value={formData.sellingPrice}
            onChange={(e) => {
              setFormData({ ...formData, sellingPrice: e.target.value });
              if (errors.sellingPrice) setErrors({ ...errors, sellingPrice: '' });
            }}
            error={errors.sellingPrice}
            hint="Price charged to customer on bill"
          />
        </div>

        {/* Stock Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {!product ? (
            <Input
              label="Starting Stock"
              type="number"
              min="0"
              required
              placeholder="0"
              value={formData.currentStock}
              onChange={(e) => {
                setFormData({ ...formData, currentStock: e.target.value });
                if (errors.currentStock) setErrors({ ...errors, currentStock: '' });
              }}
              error={errors.currentStock}
            />
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Stock Left
              </label>
              <div className="h-10 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 flex items-center justify-between">
                <span>{product.currentStock} {product.unit}</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Use + / - buttons to update
                </span>
              </div>
            </div>
          )}

          <Input
            label="Alert Level (Min Stock)"
            type="number"
            min="0"
            required
            placeholder="3"
            value={formData.minimumStockLevel}
            onChange={(e) => {
              setFormData({ ...formData, minimumStockLevel: e.target.value });
              if (errors.minimumStockLevel) setErrors({ ...errors, minimumStockLevel: '' });
            }}
            error={errors.minimumStockLevel}
            hint="Warning shows when stock goes below this number"
          />
        </div>

        <Textarea
          label="Notes (Optional)"
          rows={2}
          placeholder="e.g. Fits Activa 6G, Jupiter, Splendor, Dio..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </form>
    </Modal>
  );
};
