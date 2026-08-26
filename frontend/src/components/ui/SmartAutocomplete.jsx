import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Tag } from 'lucide-react';
import api from '../../api/client.js';
import { getSmartSuggestions } from '../../utils/fuzzyMatcher.js';

let cachedMasterKeywords = null;
let isFetchingMasterKeywords = false;

export const SmartAutocomplete = ({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Type keyword or item name...',
  className = '',
  disabled = false,
  id,
  label,
  required = false,
  icon: Icon,
  error,
}) => {
  const [masterKeywords, setMasterKeywords] = useState(cachedMasterKeywords || []);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);

  // Fetch master keywords from backend and cache
  useEffect(() => {
    let isMounted = true;
    const fetchKeywords = async () => {
      if (cachedMasterKeywords) {
        setMasterKeywords(cachedMasterKeywords);
        return;
      }
      if (isFetchingMasterKeywords) return;

      isFetchingMasterKeywords = true;
      try {
        const res = await api.get('/master-keywords');
        const list = res.data || res.message || res || [];
        cachedMasterKeywords = Array.isArray(list) ? list : [];
        if (isMounted) setMasterKeywords(cachedMasterKeywords);
      } catch (err) {
        console.error('Failed to fetch master keywords for smart autocomplete:', err);
      } finally {
        isFetchingMasterKeywords = false;
      }
    };

    fetchKeywords();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute smart suggestions whenever input value or masterKeywords change
  useEffect(() => {
    if (!value || !value.trim() || masterKeywords.length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const matches = getSmartSuggestions(value, masterKeywords, 6);
    setSuggestions(matches);
    setIsOpen(matches.length > 0);
    setSelectedIndex(-1);
  }, [value, masterKeywords]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectKeyword = (kw) => {
    onChange?.({ target: { value: kw.word } });
    onSelect?.(kw.word);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectKeyword(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full rounded-xl border text-sm text-slate-900 font-medium placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] disabled:bg-slate-100 ${
            Icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } py-2 h-10 ${
            error
              ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
              : 'border-slate-300 bg-white hover:border-slate-400'
          } ${className}`}
        />
      </div>

      {/* Smart Recommendation Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-[#0284C7]">
              <Sparkles className="w-3 h-3" /> Smart Recommendations
            </span>
            <span>{suggestions.length} Matches</span>
          </div>

          <div className="py-1 max-h-48 overflow-y-auto">
            {suggestions.map((kw, idx) => (
              <button
                key={kw._id || idx}
                type="button"
                onClick={() => handleSelectKeyword(kw)}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between gap-2 transition-colors ${
                  idx === selectedIndex ? 'bg-sky-50 text-[#0284C7]' : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Tag className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span className="truncate font-bold">{kw.word}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
