import React, { useState } from 'react';
import { Invoice, ShopSettings } from '../types';
import { formatBDT, formatDateTime } from '../utils/formatters';
import { Printer, X, FileText, CheckCircle2, Phone, MapPin } from 'lucide-react';

interface PrintInvoiceModalProps {
  invoice: Invoice;
  settings: ShopSettings;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  invoice,
  settings,
  onClose,
}) => {
  const [printFormat, setPrintFormat] = useState<'Thermal' | 'A4'>(
    settings.receiptFormat === 'Thermal80mm' ? 'Thermal' : 'A4'
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Header Controls (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90 no-print">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">
                Invoice {invoice.invoiceNumber}
              </h3>
              <p className="text-xs text-neutral-400">
                Print or review customer receipt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('Thermal')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  printFormat === 'Thermal'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                80mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('A4')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  printFormat === 'A4'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Standard Bill
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print (Ctrl+P)
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Canvas */}
        <div className="p-6 bg-neutral-950 max-h-[75vh] overflow-y-auto flex justify-center">
          <div
            id="printable-invoice"
            className={`bg-white text-neutral-950 p-6 rounded shadow-sm text-xs font-mono transition-all ${
              printFormat === 'Thermal'
                ? 'w-[360px] text-[11px] leading-tight border border-neutral-300'
                : 'w-[560px] text-xs leading-normal border border-neutral-300'
            }`}
          >
            {/* Shop Header */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-400 mb-3">
              <h1 className="text-base font-extrabold uppercase tracking-tight text-neutral-950">
                {settings.shopName}
              </h1>
              <p className="text-[11px] font-sans font-medium text-neutral-700">
                {settings.banglaTitle}
              </p>
              <p className="text-[10px] text-neutral-600 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3 inline shrink-0" />
                {settings.address}, {settings.city}, {settings.district}
              </p>
              <p className="text-[10px] text-neutral-700 mt-0.5 flex items-center justify-center gap-1">
                <Phone className="w-3 h-3 inline shrink-0" />
                Mobile: {settings.phonePrimary} / {settings.phoneSecondary}
              </p>
              <p className="text-[10px] text-neutral-600">
                bKash: {settings.bKashNumber}
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-2 pb-2 mb-2 border-b border-neutral-300">
              <div>
                <span className="text-neutral-500 block text-[9px] uppercase">Invoice No</span>
                <span className="font-bold text-neutral-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block text-[9px] uppercase">Date & Time</span>
                <span className="font-semibold">{formatDateTime(invoice.date)}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[9px] uppercase">Customer</span>
                <span className="font-bold text-neutral-900">{invoice.customerName}</span>
                <span className="block text-[10px] text-neutral-600">{invoice.customerPhone}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block text-[9px] uppercase">Bike & Reg</span>
                <span className="font-semibold block">{invoice.bikeModel || 'Walk-in / Over Counter'}</span>
                {invoice.bikeRegNo && (
                  <span className="text-[10px] font-bold text-neutral-800">{invoice.bikeRegNo}</span>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-3">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-400 text-[10px] uppercase font-bold text-neutral-700">
                    <th className="pb-1">Item / Description</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Rate</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="align-top py-1">
                      <td className="py-1 pr-1 font-sans">
                        <div className="font-semibold text-neutral-950 leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[9px] text-neutral-500 font-mono">
                          {item.sku}
                        </div>
                      </td>
                      <td className="py-1 text-center font-bold tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-1 text-right tabular-nums">
                        {item.unitPrice}
                      </td>
                      <td className="py-1 text-right font-bold tabular-nums">
                        {item.total}
                      </td>
                    </tr>
                  ))}

                  {/* Labor / Servicing Charges */}
                  {invoice.laborItems.length > 0 && (
                    <>
                      <tr className="bg-neutral-100 text-[9px] font-bold text-neutral-600 uppercase">
                        <td colSpan={4} className="py-1 px-1">
                          Servicing &amp; Labor Charges (মজুরি)
                        </td>
                      </tr>
                      {invoice.laborItems.map((labor, lIdx) => (
                        <tr key={`labor-${lIdx}`} className="py-1">
                          <td colSpan={2} className="py-1 font-sans text-neutral-900">
                            {labor.serviceName}
                            {labor.mechanicName && (
                              <span className="text-[9px] text-neutral-500 block">
                                Mechanic: {labor.mechanicName}
                              </span>
                            )}
                          </td>
                          <td className="py-1 text-right text-neutral-500">Fee</td>
                          <td className="py-1 text-right font-bold tabular-nums">
                            {labor.charge}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary */}
            <div className="border-t border-dashed border-neutral-400 pt-2 space-y-1 text-neutral-800">
              <div className="flex justify-between">
                <span>Parts Subtotal:</span>
                <span className="tabular-nums font-semibold">{formatBDT(invoice.subtotalParts)}</span>
              </div>

              {invoice.subtotalLabor > 0 && (
                <div className="flex justify-between">
                  <span>Labor Charge (মজুরি):</span>
                  <span className="tabular-nums font-semibold">{formatBDT(invoice.subtotalLabor)}</span>
                </div>
              )}

              {invoice.discount > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Special Discount (ছাড়):</span>
                  <span className="tabular-nums font-semibold">- {formatBDT(invoice.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold border-t border-b border-neutral-400 py-1 text-neutral-950">
                <span>Grand Total (মোট বিল):</span>
                <span className="tabular-nums text-base">{formatBDT(invoice.grandTotal)}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span>Paid Amount (পরিশোধ):</span>
                <span className="tabular-nums font-bold text-emerald-800">{formatBDT(invoice.paidAmount)}</span>
              </div>

              {invoice.dueAmount > 0 ? (
                <div className="flex justify-between font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded">
                  <span>Due Balance (বকেয়া বাকি):</span>
                  <span className="tabular-nums">{formatBDT(invoice.dueAmount)}</span>
                </div>
              ) : (
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Payment Status:</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Paid in Full
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-neutral-600 pt-1">
                <span>Payment Method:</span>
                <span className="font-semibold uppercase">{invoice.paymentMethod} {invoice.paymentReference ? `(${invoice.paymentReference})` : ''}</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-4 pt-3 border-t border-dashed border-neutral-400 text-center font-sans space-y-1">
              <p className="text-[10px] text-neutral-600 italic">
                "{settings.invoiceFooterNotice}"
              </p>
              <div className="flex justify-between items-end pt-5 text-[9px] text-neutral-500">
                <span className="border-t border-neutral-400 pt-0.5 px-3">
                  Customer Signature
                </span>
                <span className="border-t border-neutral-400 pt-0.5 px-3">
                  Authorized Sign ({invoice.cashierName})
                </span>
              </div>
              <p className="text-[9px] text-neutral-400 pt-2 font-mono">
                Software: Tahomid Motoshop Accounts &amp; Inventory · Netrokona
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 no-print">
          <span className="text-xs text-neutral-400">
            Cashier: <strong className="text-neutral-200">{invoice.cashierName}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              Done / Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
