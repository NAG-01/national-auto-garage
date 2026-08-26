import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  History,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { SearchInput, Select } from '../../components/ui/Input.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '../../components/ui/Table.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { ProductModal } from './ProductModal.jsx';
import { StockHistoryModal } from './StockHistoryModal.jsx';
import { formatINR } from '../../utils/formatters.js';

export const InventoryListPage = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modals & Confirmation States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);

  // Quick + / - Confirmation State
  const [stockConfirmOpen, setStockConfirmOpen] = useState(false);
  const [targetStockProduct, setTargetStockProduct] = useState(null);
  const [stockDelta, setStockDelta] = useState(0); // +1 or -1
  const [stockLoading, setStockLoading] = useState(false);

  // Delete Product Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetProduct, setDeleteTargetProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const fetchCategories = async () => {
    try {
      const res = await api.get('/inventory/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setFetching(true);
      setError('');
      const res = await api.get('/inventory', {
        params: {
          search,
          category: categoryFilter === 'ALL' ? '' : categoryFilter,
          status: statusFilter === 'ALL' ? '' : statusFilter,
          page,
          limit: 15,
        },
      });
      const dataPayload = res.data || res.message || res;
      const productsList = Array.isArray(dataPayload)
        ? dataPayload
        : dataPayload.products || res.products || [];
      const summaryData = dataPayload.summary || res.summary || {};
      const paginationData = res.meta || res.pagination || dataPayload.pagination || null;

      setProducts(productsList);
      setSummary({
        totalProducts: summaryData.totalProducts || 0,
        activeProducts: summaryData.activeProducts || 0,
        lowStock: summaryData.lowStockCount || summaryData.lowStock || 0,
        outOfStock: summaryData.outOfStockCount || summaryData.outOfStock || 0,
      });
      setPagination(paginationData);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('Unable to load items list. Please try again.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => {
    fetchCategories();
    fetchProducts(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Handle Quick + / - Stock Confirmation Submit
  const handleConfirmStockChange = async () => {
    if (!targetStockProduct || stockDelta === 0) return;
    setStockLoading(true);
    try {
      const targetId = targetStockProduct._id || targetStockProduct.productId;
      await api.post(`/inventory/adjust-stock`, {
        productId: targetId,
        adjustmentQuantity: stockDelta,
        movementType: 'MANUAL_ADJUSTMENT',
        reason: 'Quick Stock Update',
        notes: `Quick ${stockDelta > 0 ? '+1' : '-1'} stock update`,
      });
      toast.success(
        `Stock updated for '${targetStockProduct.name}' (${stockDelta > 0 ? '+1' : '-1'})`
      );
      fetchProducts(false);
      setStockConfirmOpen(false);
      setTargetStockProduct(null);
      setStockDelta(0);
    } catch (err) {
      toast.error(err.message || 'Failed to update stock.');
    } finally {
      setStockLoading(false);
    }
  };

  // Handle Product Delete Submit
  const handleDeleteProduct = async () => {
    if (!deleteTargetProduct) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/inventory/${deleteTargetProduct._id}`);
      toast.success(`Item '${deleteTargetProduct.name}' deleted successfully.`);
      fetchProducts(false);
      setDeleteDialogOpen(false);
      setDeleteTargetProduct(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete item.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Clean Page Header (Top Button Removed) */}
      <PageHeader
        title="Spare Parts & Items"
        subtitle="Garage ke sabhi spare parts, unke daam aur stock ki detail yahan dekhein."
      />

      {/* Sleek Fixed-Height Status Cards Bar (Zero Page Shift on Switch) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 select-none">
        <div
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between h-20 ${
            statusFilter === 'ACTIVE'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">All Items</div>
            <div className="text-xl font-black mt-0.5">{summary.activeProducts || products.length}</div>
          </div>
          <div className={`p-2.5 rounded-xl text-xs font-bold ${statusFilter === 'ACTIVE' ? 'bg-slate-800 text-orange-400' : 'bg-slate-100 text-slate-700'}`}>
            <Package className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('IN_STOCK')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between h-20 ${
            statusFilter === 'IN_STOCK'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-700/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">In Stock</div>
            <div className="text-xl font-black mt-0.5">
              {Math.max(0, (summary.activeProducts || products.length) - summary.lowStock - summary.outOfStock)}
            </div>
          </div>
          <div className={`p-2.5 rounded-xl text-xs font-bold ${statusFilter === 'IN_STOCK' ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between h-20 ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-600/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">Low Stock</div>
            <div className="text-xl font-black mt-0.5">{summary.lowStock}</div>
          </div>
          <div className={`p-2.5 rounded-xl text-xs font-bold ${statusFilter === 'LOW_STOCK' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-700'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between h-20 ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-700/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">Out of Stock</div>
            <div className="text-xl font-black mt-0.5">{summary.outOfStock}</div>
          </div>
          <div className={`p-2.5 rounded-xl text-xs font-bold ${statusFilter === 'OUT_OF_STOCK' ? 'bg-rose-800 text-white' : 'bg-rose-50 text-rose-700'}`}>
            <Package className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onClear={() => {
              setSearch('');
              setPage(1);
            }}
            placeholder="Search parts by name, SKU, or OEM number..."
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'All Items', value: 'ACTIVE' },
            { label: 'Low Stock', value: 'LOW_STOCK' },
            { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
            { label: 'Archive / Inactive', value: 'INACTIVE' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#4F46E5] text-white shadow-xs dark:bg-[#6366F1]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="w-full sm:w-44">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-64">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={() => {
                setSearch('');
                setPage(1);
              }}
              placeholder="Search by item name or ID..."
            />
          </div>

          {/* Single Clean Add Item Button */}
          <Button
            variant="accent"
            size="md"
            icon={Plus}
            onClick={() => {
              setSelectedProduct(null);
              setProductModalOpen(true);
            }}
            className="w-full sm:w-auto shrink-0 whitespace-nowrap"
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Main Inventory Viewport */}
      <div className="min-h-[420px] relative transition-opacity duration-150">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchProducts(true)} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No items found"
            description={
              search || categoryFilter !== 'ALL'
                ? 'No items match your active search or category filter.'
                : 'Add your first spare part item to manage stock levels.'
            }
            actionText="+ Add Item"
            onAction={() => {
              setSelectedProduct(null);
              setProductModalOpen(true);
            }}
          />
        ) : (
          <div className={`space-y-4 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>ID</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Stock Left (+ / -)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const isLowStock = p.currentStock <= p.minimumStockLevel && p.currentStock > 0;
                  const isOutOfStock = p.currentStock === 0;

                  return (
                    <TableRow key={p._id} hover={false}>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                          {p.productId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{p.name}</div>
                        {p.notes && <div className="text-[11px] text-slate-500 truncate max-w-xs">{p.notes}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral">{p.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-black text-slate-900">{formatINR(p.sellingPrice)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Quick Remove (-) Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setTargetStockProduct(p);
                              setStockDelta(-1);
                              setStockConfirmOpen(true);
                            }}
                            disabled={p.currentStock <= 0}
                            title="Remove 1 Stock"
                            className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="font-bold text-xs text-slate-900 font-mono px-1">
                            {p.currentStock} {p.unit || 'PCS'}
                          </span>

                          {/* Quick Add (+) Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setTargetStockProduct(p);
                              setStockDelta(1);
                              setStockConfirmOpen(true);
                            }}
                            title="Add 1 Stock"
                            className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {isOutOfStock ? (
                            <StatusBadge status="OUT_OF_STOCK" />
                          ) : isLowStock ? (
                            <StatusBadge status="LOW_STOCK" />
                          ) : (
                            <StatusBadge status="IN_STOCK" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">


                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit2}
                            onClick={() => {
                              setSelectedProduct(p);
                              setProductModalOpen(true);
                            }}
                            title="Edit Item Details"
                          >
                            Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => {
                              setDeleteTargetProduct(p);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Item"
                            className="hover:text-rose-600 hover:bg-rose-50 text-rose-600"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => fetchProducts(false)}
      />



      {/* Quick + / - Stock Confirmation Dialog */}
      <ConfirmDialog
        isOpen={stockConfirmOpen}
        onClose={() => {
          setStockConfirmOpen(false);
          setTargetStockProduct(null);
          setStockDelta(0);
        }}
        onConfirm={handleConfirmStockChange}
        title={
          stockDelta > 0
            ? `Add Stock: ${targetStockProduct?.name}?`
            : `Remove Stock: ${targetStockProduct?.name}?`
        }
        message={
          stockDelta > 0
            ? `Are you sure you want to add 1 item to '${targetStockProduct?.name}'? (Current: ${targetStockProduct?.currentStock} -> New: ${(targetStockProduct?.currentStock || 0) + 1}). Click OK to confirm.`
            : `Are you sure you want to remove 1 item from '${targetStockProduct?.name}'? (Current: ${targetStockProduct?.currentStock} -> New: ${(targetStockProduct?.currentStock || 0) - 1}). Click OK to confirm.`
        }
        confirmText={stockDelta > 0 ? 'OK, Add Stock' : 'OK, Remove Stock'}
        variant={stockDelta > 0 ? 'success' : 'danger'}
        loading={stockLoading}
      />

      {/* Delete Item Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTargetProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        title={`Delete Item: ${deleteTargetProduct?.name}?`}
        message={`Are you sure you want to delete '${deleteTargetProduct?.name}' (${deleteTargetProduct?.productId})? Click OK to confirm.`}
        confirmText="OK, Delete Item"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
