import React, { useState } from 'react';
import { Customer, Invoice, JobCard, ShopSettings, UserAccount } from '../types';
import { formatBDT, formatDateTime } from '../utils/formatters';
import {
  Bike,
  User,
  Phone,
  Calendar,
  Receipt,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  Plus,
} from 'lucide-react';

interface CustomerPortalProps {
  currentUser: UserAccount;
  customer?: Customer;
  invoices: Invoice[];
  jobCards: JobCard[];
  settings: ShopSettings;
  onViewInvoice: (invoice: Invoice) => void;
  onRequestServicing: (problemDesc: string) => void;
  onLogout: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  customer,
  invoices,
  jobCards,
  settings,
  onViewInvoice,
  onRequestServicing,
  onLogout,
}) => {
  const [copiedBkash, setCopiedBkash] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [serviceComplaint, setServiceComplaint] = useState('');

  // Find customer's invoices and job cards matching phone or customerId or name
  const custPhone = customer?.phone || currentUser.phone;
  const custName = customer?.name || currentUser.name;

  const myInvoices = invoices.filter(
    (inv) =>
      (customer && inv.customerId === customer.id) ||
      inv.customerPhone.includes(custPhone) ||
      inv.customerName.toLowerCase().includes(custName.toLowerCase())
  );

  const myJobCards = jobCards.filter(
    (job) =>
      job.customerPhone.includes(custPhone) ||
      job.customerName.toLowerCase().includes(custName.toLowerCase())
  );

  const dueBalance = customer?.totalDue ?? 0;
  const totalSpent = customer?.totalSpent ?? 0;
  const bikeModel = customer?.bikeModel || 'Motorcycle (Pulsar 150)';
  const bikeReg = customer?.bikeRegNo || 'Netrokona-HA 11-4589';

  const handleCopyBkash = () => {
    navigator.clipboard.writeText(settings.bKashNumber);
    setCopiedBkash(true);
    setTimeout(() => setCopiedBkash(false), 3000);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceComplaint.trim()) {
      alert('Please describe your motorcycle problem.');
      return;
    }
    onRequestServicing(serviceComplaint.trim());
    setServiceComplaint('');
    setShowRequestModal(false);
    alert('Your servicing request has been placed! Our technicians will inspect your bike.');
  };

  return (
    <div className="space-y-6">
      {/* Rider & Motorcycle Profile Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-amber-400 pointer-events-none">
          <Bike className="w-48 h-48" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
              <Bike className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded font-bold">
                  Registered Rider Account
                </span>
                <span className="text-neutral-500 text-xs">·</span>
                <span className="text-xs text-neutral-400 font-mono">{custPhone}</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-100 mt-1">
                {custName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                <span className="font-semibold text-neutral-200">{bikeModel}</span>
                <span className="text-neutral-600">|</span>
                <span className="font-mono text-neutral-300 font-semibold">{bikeReg}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Servicing / Repair</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-800">
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 text-xs font-semibold uppercase block">
              Outstanding Due (বাকি বকেয়া)
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  dueBalance > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {formatBDT(dueBalance)}
              </span>
              {dueBalance > 0 && (
                <span className="text-[11px] text-neutral-400">Pay via bKash/Counter</span>
              )}
            </div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 text-xs font-semibold uppercase block">
              Total Spent with Motoshop
            </span>
            <div className="mt-1">
              <span className="text-2xl font-bold font-mono text-neutral-100 tabular-nums">
                {formatBDT(totalSpent)}
              </span>
            </div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 text-xs font-semibold uppercase block">
              bKash / Nagad Payment Info
            </span>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="font-mono text-neutral-200">{settings.bKashNumber}</span>
              <button
                onClick={handleCopyBkash}
                className="p-1 text-neutral-400 hover:text-white"
                title="Copy Number"
              >
                {copiedBkash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Servicing Job Cards */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-100">
              My Motorcycle Workshop History ({myJobCards.length} jobs)
            </h3>
          </div>
        </div>

        {myJobCards.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-xs">
            No servicing history found for your motorcycle yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myJobCards.map((job) => (
              <div
                key={job.id}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {job.jobCardNumber}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-200 mt-0.5">
                      {job.bikeModel} ({job.bikeRegNo})
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.status === 'Ready'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : job.status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="text-[11px] text-neutral-400">
                  <span className="text-neutral-500">Mechanic:</span> {job.assignedMechanicName} ·{' '}
                  <span className="font-mono">{formatDateTime(job.createdAt)}</span>
                </div>

                <div className="text-xs text-neutral-300 space-y-1 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850">
                  <span className="font-semibold text-neutral-400 text-[11px] block">
                    Tasks Performed:
                  </span>
                  {job.plannedServices.map((srv, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{srv.serviceName}</span>
                      <span className="font-mono text-neutral-400">৳{srv.charge}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices & Purchase Receipts */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-100">
              My Purchase Invoices &amp; Receipts ({myInvoices.length})
            </h3>
          </div>
        </div>

        {myInvoices.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-xs">
            No purchase records found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Parts Purchased</th>
                  <th className="py-2.5 px-3 text-right">Total Bill</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Due</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {myInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-850/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-200">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-400">
                      {formatDateTime(inv.date)}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300 max-w-xs truncate">
                      {inv.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-100">
                      {formatBDT(inv.grandTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                      {formatBDT(inv.paidAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-semibold">
                      {inv.dueAmount > 0 ? formatBDT(inv.dueAmount) : 'Nil'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3 text-amber-400" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Servicing Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 pb-2 border-b border-neutral-800 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Book Servicing / Report Motorcycle Problem</span>
            </h3>

            <form onSubmit={handleServiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">
                  Describe what problems your motorcycle is having:
                </label>
                <textarea
                  rows={4}
                  required
                  value={serviceComplaint}
                  onChange={(e) => setServiceComplaint(e.target.value)}
                  placeholder="e.g. Engine knocks on high speed, front fork leaking oil, brake pads worn out, or routine master servicing..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg cursor-pointer"
                >
                  Submit Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
