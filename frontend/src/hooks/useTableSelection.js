import { useState, useMemo, useCallback } from 'react';

/**
 * Reusable hook for table row selection (bulk selection)
 * @param {Array} items - List of items in current table view
 * @param {Function} getId - Function to extract unique ID from item (default: item._id)
 */
export function useTableSelection(items = [], getId = (item) => item._id || item.id) {
  const [selectedMap, setSelectedMap] = useState({});

  // Clean IDs of selected items
  const selectedIds = useMemo(() => {
    return Object.keys(selectedMap).filter((id) => selectedMap[id] === true);
  }, [selectedMap]);

  // Check if a specific item ID is selected
  const isSelected = useCallback(
    (id) => Boolean(selectedMap[id]),
    [selectedMap]
  );

  // Toggle single item selection
  const toggleSelect = useCallback((id) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }, []);

  // Is all current page items selected?
  const isAllSelected = useMemo(() => {
    if (!items || items.length === 0) return false;
    return items.every((item) => selectedMap[getId(item)]);
  }, [items, selectedMap, getId]);

  // Is some (part) current page items selected?
  const isSomeSelected = useMemo(() => {
    if (!items || items.length === 0) return false;
    return items.some((item) => selectedMap[getId(item)]) && !isAllSelected;
  }, [items, selectedMap, getId, isAllSelected]);

  // Toggle Select All current page items
  const toggleSelectAll = useCallback(() => {
    if (!items || items.length === 0) return;

    if (isAllSelected) {
      // Unselect all items on current page
      setSelectedMap((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          delete next[getId(item)];
        });
        return next;
      });
    } else {
      // Select all items on current page
      setSelectedMap((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          next[getId(item)] = true;
        });
        return next;
      });
    }
  }, [items, isAllSelected, getId]);

  // Clear all selections across table
  const clearSelection = useCallback(() => {
    setSelectedMap({});
  }, []);

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  };
}
