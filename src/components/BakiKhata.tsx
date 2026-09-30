import React, { useState } from 'react';
import { Customer, Supplier, DuePaymentRecord, PaymentMethod, ShopSettings } from '../types';
import { formatBDT, formatDateTime } from '../utils/formatters';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Building,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface BakiKhataProps {
  customers: Customer[];
  suppliers: Supplier[];
  duePayments: DuePaymentRecord[];
  settings: ShopSettings;
  onRecordPayment: (
    payment: DuePaymentRecord,
    updatedCustomer?: Customer,
    updatedSupplier?: Supplier
  ) => void;
}

export const BakiKhata: React.FC<BakiKhataProps> = ({
  customers,
  suppliers,
  duePayments,
  settings,
  onRecordPayment,
}) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier' | 'history'>('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Payment Modal
  const [selectedParty, setSelectedParty] = useState<{
    type: 'Customer' | 'Supplier';
    id: string;
    name: string;
    phone: string;
    currentDue: number;
  } | null>(null);

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  // Computations
  const totalCustomerDue = customers.reduce((acc, c) => acc + (c.totalDue || 0), 0);
  const totalSupplierDue = suppliers.reduce((acc, s) => acc + (s.totalPayableDue || 0), 0);

  // Filtered lists
  const filteredCustomersWithDue = customers
    .filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.bikeModel && c.bikeModel.toLowerCase().includes(q));
      return matchSearch;
    })
    .sort((a, b) => b.totalDue - a.totalDue);

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.companyName.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  });

  const handleOpenPaymentModal = (
    type: 'Customer' | 'Supplier',
    id: string,
    name: string,
    phone: string,
    currentDue: number
  ) => {
    setSelectedParty({ type, id, name, phone, currentDue });
    setPaymentAmount(currentDue);
    setPaymentReference('');
    setPaymentNote('');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParty || paymentAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const payRecord: DuePaymentRecord = {
      id: `duepay-${Date.now()}`,
      date: new Date().toISOString(),
      partyType: selectedParty.type,
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      partyPhone: selectedParty.phone,
      amount: paymentAmount,
      paymentMethod,
      reference: paymentReference.trim() || undefined,
      notes: paymentNote.trim() || undefined,
    };

    let updatedCust: Customer | undefined;
    let updatedSup: Supplier | undefined;

    if (selectedParty.type === 'Customer') {
      const c = customers.find((cust) => cust.id === selectedParty.id);
      if (c) {
        updatedCust = {
          ...c,
          totalDue: Math.max(0, c.totalDue - paymentAmount),
          lastVisit: new Date().toISOString(),
        };
      }
    } else {
      const s = suppliers.find((sup) => sup.id === selectedParty.id);
      if (s) {
        updatedSup = {
          ...s,
          totalPayableDue: Math.max(0, s.totalPayableDue - paymentAmount),
        };
      }
    }

    onRecordPayment(payRecord, updatedCust, updatedSup);
    setSelectedParty(null);
  };

  const handleCopyReminder = (c: Customer) => {
    const message = `আসসালামু আলাইকুম ${c.name} ভাই, তাহমিদ অটোশপ (নেত্রকোনা) থেকে আপনার মোটর পার্টস/সার্ভিসিং বাবদ বকেয়া পাওনা ৳${c.totalDue} টাকা। অনুগ্রহ করে দোকানে এসে অথবা বিকাশ/নগদে (${settings.bKashNumber}) পরিশোধ করার বিনীত অনুরোধ করা হলো। দোকান: ${settings.phonePrimary}। ধন্যবাদ!`;

    navigator.clipboard.writeText(message);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-xs font-medium">
              Customer Due Receivable (খদ্দের বাকি)
            </span>
            <div className="w-6 h-6 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2 tabular-nums">
            {formatBDT(totalCustomerDue)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Total outstanding credit given to local riders &amp; mechanics
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-xs font-medium">
              Supplier Due Payable (মহাজন বাকি)
            </span>
            <div className="w-6 h-6 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2 tabular-nums">
            {formatBDT(totalSupplierDue)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Total debt owed to distributors &amp; wholesalers in Netrokona/Dhaka
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-xs font-medium">
              Net Balance Position
            </span>
            <div className="w-6 h-6 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-100 mt-2 tabular-nums">
            {formatBDT(totalCustomerDue - totalSupplierDue)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Receivable assets vs Payable liabilities
          </p>
        </div>
      </div>

      {/* Control Bar & Tabs */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-amber-400 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Customer Due ({customers.filter((c) => c.totalDue > 0).length})
            </button>

            <button
              onClick={() => setActiveTab('supplier')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'supplier'
                  ? 'bg-amber-400 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Supplier Due ({suppliers.filter((s) => s.totalPayableDue > 0).length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-400 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Payment History ({duePayments.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: Customer Due Register */}
      {activeTab === 'customer' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Motorcycle Model &amp; Reg</th>
                  <th className="py-3 px-4 text-right">Total Lifetime Spent</th>
                  <th className="py-3 px-4 text-right">Current Due (বকেয়া)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredCustomersWithDue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500">
                      No customer due records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomersWithDue.map((cust) => (
                    <tr key={cust.id} className="hover:bg-neutral-850/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-100">{cust.name}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          <span>{cust.phone}</span>
                        </div>
                        {cust.address && (
                          <div className="text-[10px] text-neutral-500">{cust.address}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-200">
                          {cust.bikeModel || 'General Buyer'}
                        </div>
                        {cust.bikeRegNo && (
                          <div className="font-mono text-[10px] text-neutral-400">
                            {cust.bikeRegNo}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-300">
                        {formatBDT(cust.totalSpent)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        {cust.totalDue > 0 ? (
                          <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-xs">
                            {formatBDT(cust.totalDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs">Clear (পরিশোধিত)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {cust.totalDue > 0 && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopyReminder(cust)}
                                title="Copy SMS / WhatsApp payment reminder text"
                                className="px-2.5 py-1 text-[11px] font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-750 hover:text-white rounded flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedId === cust.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare className="w-3 h-3 text-amber-400" />
                                    <span>Reminder</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenPaymentModal(
                                    'Customer',
                                    cust.id,
                                    cust.name,
                                    cust.phone,
                                    cust.totalDue
                                  )
                                }
                                className="px-3 py-1 text-[11px] font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors cursor-pointer"
                              >
                                + Record Payment (জমা)
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Supplier Due Register */}
      {activeTab === 'supplier' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Supplier / Wholesaler</th>
                  <th className="py-3 px-4">Supplied Categories</th>
                  <th className="py-3 px-4 text-right">Total Purchased</th>
                  <th className="py-3 px-4 text-right">Payable Due (মহাজন বাকি)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500">
                      No supplier records found.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-neutral-850/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-100">{sup.name}</div>
                        <div className="text-[11px] text-neutral-400">{sup.companyName}</div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          <span>{sup.phone}</span> · <span>{sup.address}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-300 font-medium">
                        {sup.categorySupplied}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-300">
                        {formatBDT(sup.totalPurchased)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        {sup.totalPayableDue > 0 ? (
                          <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-xs">
                            {formatBDT(sup.totalPayableDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs">Paid in Full</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {sup.totalPayableDue > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenPaymentModal(
                                'Supplier',
                                sup.id,
                                sup.name,
                                sup.phone,
                                sup.totalPayableDue
                              )
                            }
                            className="px-3 py-1 text-[11px] font-bold text-neutral-950 bg-rose-400 hover:bg-rose-300 rounded transition-colors cursor-pointer"
                          >
                            Pay Supplier (পরিশোধ)
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Payment History */}
      {activeTab === 'history' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Party Type</th>
                  <th className="py-3 px-4">Name &amp; Phone</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount (BDT)</th>
                  <th className="py-3 px-4">Reference / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {duePayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      No due payment records logged yet.
                    </td>
                  </tr>
                ) : (
                  duePayments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-850/50">
                      <td className="py-3 px-4 font-mono text-neutral-400">
                        {formatDateTime(p.date)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.partyType === 'Customer'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          {p.partyType === 'Customer' ? 'Received from Rider' : 'Paid to Wholesaler'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-100">{p.partyName}</div>
                        <div className="text-[10px] text-neutral-400">{p.partyPhone}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-300 uppercase text-[11px]">
                        {p.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-400">
                        {formatBDT(p.amount)}
                      </td>
                      <td className="py-3 px-4 text-neutral-400 text-[11px]">
                        {p.reference ? `${p.reference} - ` : ''}
                        {p.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedParty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-100">
                {selectedParty.type === 'Customer'
                  ? 'Record Customer Due Collection (বাকি জমা)'
                  : 'Pay Supplier / Wholesaler (মহাজন পরিশোধ)'}
              </h3>
              <button
                onClick={() => setSelectedParty(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-400">Party Name:</span>
                <span className="font-bold text-neutral-100">{selectedParty.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Phone:</span>
                <span className="text-neutral-300">{selectedParty.phone}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-neutral-800/80">
                <span className="text-neutral-400">Total Outstanding Due:</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatBDT(selectedParty.currentDue)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Payment Amount to Record (BDT):
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedParty.currentDue}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 font-mono font-bold text-emerald-400 text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Payment Mode:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Cash', 'bKash', 'Nagad', 'Bank'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                        paymentMethod === m
                          ? 'bg-amber-400 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Transaction Reference / TrxID (Optional):
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. bKash Trx BK29810 or Bank Cheque #92"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100 placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Remarks / Note:
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Partial installment paid at shop counter"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100 placeholder-neutral-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedParty(null)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg cursor-pointer"
                >
                  Confirm &amp; Update Hisab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
