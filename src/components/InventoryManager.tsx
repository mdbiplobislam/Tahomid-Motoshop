import React, { useState, useMemo } from 'react';
import { PartItem, ProductCategory, Supplier } from '../types';
import { formatBDT, formatDateTime } from '../utils/formatters';
import { NewPartModal } from './NewPartModal';
import { StockInModal } from './StockInModal';
import {
  Package,
  Search,
  Plus,
  Truck,
  AlertTriangle,
  Download,
  Edit2,
  Trash2,
  ArrowUpDown,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface InventoryManagerProps {
  parts: PartItem[];
  suppliers: Supplier[];
  onSavePart: (part: PartItem) => void;
  onDeletePart: (partId: string) => void;
  onStockIn: (
    record: any,
    updatedParts: PartItem[],
    updatedSupplier?: Supplier
  ) => void;
  onQuickAdjustStock: (partId: string, newStock: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  parts,
  suppliers,
  onSavePart,
  onDeletePart,
  onStockIn,
  onQuickAdjustStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'All' | 'Low' | 'Out'>('All');
  const [sortField, setSortField] = useState<'name' | 'stock' | 'sellingPrice'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<PartItem | null>(null);

  // Stats
  const totalItemsCount = parts.length;
  const totalStockUnits = parts.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalValuationCost = parts.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0);
  const totalValuationRetail = parts.reduce(
    (acc, p) => acc + p.stockQuantity * p.sellingPrice,
    0
  );
  const lowStockItems = parts.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert
  );
  const outOfStockItems = parts.filter((p) => p.stockQuantity <= 0);

  // Filtered and Sorted parts
  const displayedParts = useMemo(() => {
    let result = [...parts];

    // Filter text
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q) ||
          (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
          p.brand.toLowerCase().includes(q) ||
          p.compatibleBikes.some((b) => b.toLowerCase().includes(q))
      );
    }

    // Filter category
    if (categoryFilter !== 'All') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Filter stock status
    if (stockStatusFilter === 'Low') {
      result = result.filter(
        (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert
      );
    } else if (stockStatusFilter === 'Out') {
      result = result.filter((p) => p.stockQuantity <= 0);
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = a.name;
      let valB: string | number = b.name;
      if (sortField === 'stock') {
        valA = a.stockQuantity;
        valB = b.stockQuantity;
      } else if (sortField === 'sellingPrice') {
        valA = a.sellingPrice;
        valB = b.sellingPrice;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [parts, searchQuery, categoryFilter, stockStatusFilter, sortField, sortAsc]);

  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Name',
      'Category',
      'Brand',
      'Stock',
      'Unit',
      'Cost Price (BDT)',
      'Selling Price (BDT)',
      'Total Value (Cost)',
      'Rack Location',
      'Compatible Bikes',
    ];
    const rows = parts.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.brand}"`,
      p.stockQuantity,
      `"${p.unit}"`,
      p.costPrice,
      p.sellingPrice,
      p.stockQuantity * p.costPrice,
      `"${p.rackLocation}"`,
      `"${p.compatibleBikes.join(', ')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Tahomid_Motoshop_Inventory_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: 'name' | 'stock' | 'sellingPrice') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Inventory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="text-neutral-400 text-xs font-medium">Total Catalog Items</div>
          <div className="text-xl font-bold font-mono text-neutral-100 mt-1 tabular-nums">
            {totalItemsCount} <span className="text-xs text-neutral-500 font-sans font-normal">items ({totalStockUnits} units)</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="text-neutral-400 text-xs font-medium">Total Stock Valuation (Cost)</div>
          <div className="text-xl font-bold font-mono text-neutral-100 mt-1 tabular-nums">
            {formatBDT(totalValuationCost)}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="text-neutral-400 text-xs font-medium">Expected Retail Value</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatBDT(totalValuationRetail)}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-neutral-400 text-xs font-medium">Low / Out of Stock</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
              {lowStockItems.length + outOfStockItems.length}{' '}
              <span className="text-xs text-neutral-500 font-sans font-normal">
                ({outOfStockItems.length} out)
              </span>
            </div>
          </div>
          {lowStockItems.length + outOfStockItems.length > 0 && (
            <button
              onClick={() => setStockStatusFilter('Low')}
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              Filter
            </button>
          )}
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by part name, SKU, brand, bike..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStockInModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>+ Stock In (Purchase)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingPart(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add New Part</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/60 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-neutral-500 text-[11px] mr-1">Status:</span>
            {(['All', 'Low', 'Out'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStockStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  stockStatusFilter === status
                    ? 'bg-neutral-800 text-amber-400 font-semibold border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {status === 'All' ? 'All Stock' : status === 'Low' ? 'Low Stock Warning' : 'Out of Stock'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-[11px]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-md px-2.5 py-1 focus:outline-hidden focus:border-amber-400"
            >
              <option value="All">All Categories</option>
              {Array.from(new Set(parts.map((p) => p.category))).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-neutral-200 cursor-pointer"
                  >
                    <span>Part / Description</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Category &amp; Brand</th>
                <th className="py-3 px-4">Compatible Bikes</th>
                <th className="py-3 px-4 text-center">Location</th>
                <th className="py-3 px-4 text-right">Cost (৳)</th>
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleSort('sellingPrice')}
                    className="flex items-center justify-end gap-1 hover:text-neutral-200 cursor-pointer ml-auto"
                  >
                    <span>Selling (৳)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleSort('stock')}
                    className="flex items-center justify-center gap-1 hover:text-neutral-200 cursor-pointer mx-auto"
                  >
                    <span>Current Stock</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {displayedParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    No matching motorcycle parts found.
                  </td>
                </tr>
              ) : (
                displayedParts.map((part) => {
                  const isOut = part.stockQuantity <= 0;
                  const isLow = part.stockQuantity <= part.minStockAlert;

                  return (
                    <tr
                      key={part.id}
                      className="hover:bg-neutral-850/50 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-100 leading-snug">
                          {part.name}
                        </div>
                        {part.banglaName && (
                          <div className="text-[11px] text-neutral-400 font-sans">
                            {part.banglaName}
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          SKU: {part.sku} · Barcode: {part.barcode}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-neutral-300 font-medium">{part.category}</div>
                        <div className="text-[10px] text-neutral-400">{part.brand}</div>
                      </td>

                      <td className="py-3 px-4 text-neutral-400 text-[11px] max-w-xs">
                        <div className="truncate" title={part.compatibleBikes.join(', ')}>
                          {part.compatibleBikes.join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                        {part.rackLocation}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-400">
                        {part.costPrice}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-amber-400">
                        {part.sellingPrice}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onQuickAdjustStock(
                                part.id,
                                Math.max(0, part.stockQuantity - 1)
                              )
                            }
                            title="Decrement stock by 1"
                            className="w-5 h-5 rounded bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center font-mono text-xs"
                          >
                            -
                          </button>

                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold tabular-nums text-xs min-w-[50px] text-center ${
                              isOut
                                ? 'bg-rose-500/20 text-rose-400'
                                : isLow
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-neutral-800 text-neutral-200'
                            }`}
                          >
                            {part.stockQuantity} {part.unit}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              onQuickAdjustStock(part.id, part.stockQuantity + 1)
                            }
                            title="Increment stock by 1"
                            className="w-5 h-5 rounded bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center font-mono text-xs"
                          >
                            +
                          </button>
                        </div>
                        {isLow && !isOut && (
                          <div className="text-[9px] text-amber-400/80 mt-0.5">
                            Min: {part.minStockAlert}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPart(part);
                              setIsAddModalOpen(true);
                            }}
                            title="Edit Part"
                            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to remove "${part.name}" from catalog?`
                                )
                              ) {
                                onDeletePart(part.id);
                              }
                            }}
                            title="Delete Part"
                            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Part Modal */}
      {isAddModalOpen && (
        <NewPartModal
          editingPart={editingPart}
          onSave={(part) => {
            onSavePart(part);
            setIsAddModalOpen(false);
            setEditingPart(null);
          }}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingPart(null);
          }}
        />
      )}

      {/* Stock In Consignment Modal */}
      {isStockInModalOpen && (
        <StockInModal
          parts={parts}
          suppliers={suppliers}
          onConfirmStockIn={(record, updatedParts, updatedSupplier) => {
            onStockIn(record, updatedParts, updatedSupplier);
            setIsStockInModalOpen(false);
          }}
          onClose={() => setIsStockInModalOpen(false)}
        />
      )}
    </div>
  );
};
