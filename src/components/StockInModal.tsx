import React, { useState } from 'react';
import { PartItem, Supplier, StockInRecord } from '../types';
import { formatBDT } from '../utils/formatters';
import { Truck, Plus, Trash2, X, Check } from 'lucide-react';

interface StockInModalProps {
  parts: PartItem[];
  suppliers: Supplier[];
  onConfirmStockIn: (
    record: StockInRecord,
    updatedParts: PartItem[],
    updatedSupplier?: Supplier
  ) => void;
  onClose: () => void;
}

interface StockInRow {
  partId: string;
  partName: string;
  quantity: number;
  purchaseRate: number;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  parts,
  suppliers,
  onConfirmStockIn,
  onClose,
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [paidAmountInput, setPaidAmountInput] = useState('');
  const [notes, setNotes] = useState('');

  // Row entries
  const [rows, setRows] = useState<StockInRow[]>([
    {
      partId: parts[0]?.id || '',
      partName: parts[0]?.name || '',
      quantity: 10,
      purchaseRate: parts[0]?.costPrice || 0,
    },
  ]);

  const handleAddRow = () => {
    if (parts.length === 0) return;
    setRows((prev) => [
      ...prev,
      {
        partId: parts[0].id,
        partName: parts[0].name,
        quantity: 5,
        purchaseRate: parts[0].costPrice,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (
    index: number,
    field: keyof StockInRow,
    value: string | number
  ) => {
    setRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        if (field === 'partId') {
          const matched = parts.find((p) => p.id === value);
          return {
            ...row,
            partId: String(value),
            partName: matched ? matched.name : '',
            purchaseRate: matched ? matched.costPrice : row.purchaseRate,
          };
        }
        return {
          ...row,
          [field]: value,
        };
      })
    );
  };

  // Calculations
  const totalAmount = rows.reduce(
    (acc, row) => acc + (row.quantity || 0) * (row.purchaseRate || 0),
    0
  );

  const paidAmount =
    paidAmountInput === '' ? totalAmount : parseFloat(paidAmountInput) || 0;
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.length === 0) {
      alert('Please add at least one spare part in the consignment.');
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);

    const record: StockInRecord = {
      id: `stockin-${Date.now()}`,
      supplierId: selectedSupplierId,
      supplierName: supplier ? supplier.name : 'Direct Cash Supplier',
      supplierInvoiceNo: supplierInvoiceNo.trim() || `CHALAN-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      items: rows.map((r) => ({
        partId: r.partId,
        partName: r.partName,
        quantity: Number(r.quantity),
        purchaseRate: Number(r.purchaseRate),
        subtotal: Number(r.quantity) * Number(r.purchaseRate),
      })),
      totalAmount,
      paidAmount,
      dueAmount,
      notes: notes.trim() || undefined,
    };

    // Update parts stock quantity and optionally update costPrice if changed
    const updatedParts = parts.map((part) => {
      const match = rows.find((r) => r.partId === part.id);
      if (match) {
        return {
          ...part,
          stockQuantity: part.stockQuantity + Number(match.quantity),
          costPrice: Number(match.purchaseRate) > 0 ? Number(match.purchaseRate) : part.costPrice,
          updatedAt: new Date().toISOString(),
        };
      }
      return part;
    });

    // Update supplier ledger
    let updatedSupplier: Supplier | undefined;
    if (supplier) {
      updatedSupplier = {
        ...supplier,
        totalPurchased: supplier.totalPurchased + totalAmount,
        totalPayableDue: supplier.totalPayableDue + dueAmount,
        lastPurchaseDate: new Date().toISOString(),
      };
    }

    onConfirmStockIn(record, updatedParts, updatedSupplier);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4 my-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                Purchase / Stock-In Entry (মাল আনয়ন ও স্টক যোগ)
              </h3>
              <p className="text-xs text-neutral-400">
                Receive new goods consignment from distributor or wholesaler
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Supplier & Chalan Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Distributor / Wholesaler Supplier:
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 focus:outline-hidden focus:border-amber-400"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.companyName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Supplier Chalan / Memo / Invoice No:
              </label>
              <input
                type="text"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                placeholder="e.g. UTTARA-2026/894"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* Consignment Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-300">
                Consignment Items Received:
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-neutral-950 p-2.5 rounded-lg border border-neutral-800"
                >
                  <div className="col-span-6">
                    <label className="block text-[10px] text-neutral-500 mb-0.5">
                      Select Spare Part
                    </label>
                    <select
                      value={row.partId}
                      onChange={(e) => handleRowChange(idx, 'partId', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-neutral-200 text-xs focus:outline-hidden focus:border-amber-400"
                    >
                      {parts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) [Current: {p.stockQuantity}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-neutral-500 mb-0.5">
                      Qty Received
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) =>
                        handleRowChange(idx, 'quantity', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-center font-mono font-bold text-neutral-100"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-neutral-500 mb-0.5">
                      Cost Rate (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={row.purchaseRate}
                      onChange={(e) =>
                        handleRowChange(idx, 'purchaseRate', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-right font-mono text-neutral-100"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2 pt-3">
                    <span className="font-mono font-bold text-neutral-200 tabular-nums text-xs">
                      {formatBDT(row.quantity * row.purchaseRate)}
                    </span>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <span className="block text-neutral-400 text-[10px] uppercase font-semibold">
                Total Chalan Bill:
              </span>
              <span className="font-mono text-base font-bold text-neutral-100 tabular-nums">
                {formatBDT(totalAmount)}
              </span>
            </div>

            <div>
              <label className="block text-neutral-400 text-[10px] uppercase font-semibold mb-1">
                Paid to Supplier Now (জমা):
              </label>
              <input
                type="number"
                min="0"
                value={paidAmountInput}
                onChange={(e) => setPaidAmountInput(e.target.value)}
                placeholder={String(totalAmount)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 font-mono font-bold text-emerald-400 text-xs"
              />
            </div>

            <div>
              <span className="block text-neutral-400 text-[10px] uppercase font-semibold">
                Mahajani Baki Due (মহাজন বাকি):
              </span>
              <span
                className={`font-mono text-base font-bold tabular-nums ${
                  dueAmount > 0 ? 'text-rose-400' : 'text-neutral-400'
                }`}
              >
                {formatBDT(dueAmount)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg cursor-pointer"
            >
              Confirm &amp; Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
