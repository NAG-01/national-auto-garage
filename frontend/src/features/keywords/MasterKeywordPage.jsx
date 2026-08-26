import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import api from '../../api/client.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, SearchInput } from '../../components/ui/Input.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Modal, ConfirmDialog } from '../../components/ui/Modal.jsx';
import { useTableSelection } from '../../hooks/useTableSelection.js';
import { BulkActionBar } from '../../components/ui/BulkActionBar.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableHeadCheckbox, TableCellCheckbox } from '../../components/ui/Table.jsx';

export const MasterKeywordPage = () => {
  // Form State
  const [newWord, setNewWord] = useState('');

  // List State
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');

  // Edit State
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [editWord, setEditWord] = useState('');
  const [updating, setUpdating] = useState(false);

  // Confirm Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Table selection hook
  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useTableSelection(keywords);

  const fetchKeywords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/master-keywords');
      const list = res.data || res.message || res || [];
      setKeywords(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch master keywords');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newWord || !newWord.trim()) {
      alert('Please enter a keyword name (e.g. Tyre)');
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    try {
      await api.post('/master-keywords', {
        word: newWord.trim(),
      });
      setNewWord('');
      setSuccessMessage(`Keyword "${newWord.trim()}" successfully add ho gaya!`);
      fetchKeywords();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to add master keyword');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (kw) => {
    setEditingKeyword(kw);
    setEditWord(kw.word);
  };

  const handleUpdateKeyword = async (e) => {
    e.preventDefault();
    if (!editingKeyword || !editWord || !editWord.trim()) return;

    setUpdating(true);
    try {
      const res = await api.put(`/master-keywords/${editingKeyword._id}`, {
        word: editWord.trim(),
      });
      const updatedData = res.data || res.message || res;
      setKeywords((prev) =>
        prev.map((k) => (k._id === editingKeyword._id ? { ...k, word: editWord.trim() } : k))
      );
      setEditingKeyword(null);
      setSuccessMessage(`Keyword successfully update ho gaya!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update keyword');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/master-keywords/${deleteId}`);
      setKeywords((prev) => prev.filter((k) => k._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete keyword');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await api.post('/master-keywords/bulk-delete', { ids: selectedIds });
      setKeywords((prev) => prev.filter((k) => !selectedIds.includes(k._id)));
      clearSelection();
      setShowBulkConfirm(false);
    } catch (err) {
      alert(err.message || 'Failed to delete selected keywords');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Filtered List
  const filteredKeywords = keywords.filter((k) => {
    return !search || k.word.toLowerCase().includes(search.trim().toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Smart Keywords Master"
        subtitle="Website par typo-tolerant auto-suggestions ke liye global keywords aur frequently used terms manage karein."
      />

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{successMessage}</span>
        </div>
      )}

      {/* Quick Add Form & Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add Keyword Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-6 border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Plus className="w-5 h-5 text-[#0284C7]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Add New Master Keyword
            </h2>
          </div>

          <form onSubmit={handleAddKeyword} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <Input
                  label="Keyword / Item Name"
                  placeholder="e.g. Tyre, Brake Pad, Engine Oil, Spark Plug"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="w-full sm:w-auto justify-center py-2.5 px-6 font-bold text-xs sm:text-sm shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                {saving ? 'Adding...' : 'Add Keyword'}
              </Button>
            </div>
          </form>
        </div>

        {/* Feature Explanation Card (5 cols) */}
        <div className="lg:col-span-5 bg-sky-50/80 border border-sky-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-sky-200/80">
              <Sparkles className="w-4 h-4 text-[#0284C7]" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Global Recommendation Engine
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Yahan add kiye gaye sabhi keywords poori website par automatically suggest honge. Pehle letter (e.g. <span className="font-mono font-bold text-[#0284C7]">T</span>) ya spelling mistake (e.g. <span className="font-mono font-bold text-[#0284C7]">tayer</span>) par bhi smart recommendation aayega!
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-200/80 text-[11px] font-bold text-[#0284C7] flex items-center justify-between">
            <span>Total Master Keywords: {keywords.length}</span>
            <Tag className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Keywords History Table Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Master Keywords Register
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Saare configured keywords ki list aur unki typing frequency statistics.
            </p>
          </div>

          <div className="max-w-xs w-full">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search keyword..."
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <BulkActionBar
            selectedCount={selectedCount}
            onClear={clearSelection}
            onDelete={() => setShowBulkConfirm(true)}
            entityName="keywords"
            deleting={isBulkDeleting}
          />
        )}

        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchKeywords} />
        ) : filteredKeywords.length === 0 ? (
          <div className="p-8 sm:p-12 text-center border border-dashed border-slate-300 bg-white rounded-2xl shadow-2xs">
            <Tag className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Koi Keyword Nahi Mila</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upar form me name bharkar "Add Keyword" dabayein.
            </p>
          </div>
        ) : (
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow hover={false}>
                <TableHeadCheckbox
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
                <TableHead>Keyword Word</TableHead>
                <TableHead className="text-right">Usage Frequency</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeywords.map((kw) => {
                const active = isSelected(kw._id);
                return (
                  <TableRow
                    key={kw._id}
                    className={active ? 'bg-slate-50 font-medium' : ''}
                  >
                    <TableCellCheckbox
                      checked={active}
                      onChange={() => toggleSelect(kw._id)}
                    />
                    <TableCell className="font-extrabold text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#0284C7]" />
                        <span>{kw.word}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        <TrendingUp className="w-3.5 h-3.5 text-[#0284C7]" />
                        {kw.usageCount || 0} times selected
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(kw)}
                          className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-colors"
                          title="Edit Keyword"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(kw._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Keyword"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Keyword Modal */}
      <Modal
        isOpen={Boolean(editingKeyword)}
        onClose={() => setEditingKeyword(null)}
        title="Edit Master Keyword"
      >
        <form onSubmit={handleUpdateKeyword} className="space-y-4">
          <Input
            label="Keyword Word / Name"
            value={editWord}
            onChange={(e) => setEditWord(e.target.value)}
            required
            autoFocus
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingKeyword(null)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteSingle}
        title="Delete Master Keyword"
        message="Kya aap is keyword ko master list se delete karna chahte hain?"
        confirmText="Delete Keyword"
        confirmVariant="danger"
        loading={isDeleting}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedCount} Master Keywords`}
        message={`Kya aap selected ${selectedCount} keywords ko database se permanently delete karna chahte hain?`}
        confirmText="Delete Selected Keywords"
        confirmVariant="danger"
        loading={isBulkDeleting}
      />
    </div>
  );
};
