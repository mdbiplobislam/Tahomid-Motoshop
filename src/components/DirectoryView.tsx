import React, { useState } from 'react';
import { Customer, Supplier } from '../types';
import { formatBDT, formatDateTime } from '../utils/formatters';
import { Users, Building, Plus, Search, Phone, MapPin, Bike, Edit, Trash2 } from 'lucide-react';

interface DirectoryViewProps {
  customers: Customer[];
  suppliers: Supplier[];
  onSaveCustomer: (customer: Customer) => void;
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteCustomer: (id: string) => void;
  onDeleteSupplier: (id: string) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  customers,
  suppliers,
  onSaveCustomer,
  onSaveSupplier,
  onDeleteCustomer,
  onDeleteSupplier,
}) => {
  const [tab, setTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Customer form fields
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cBikeModel, setCBikeModel] = useState('');
  const [cBikeRegNo, setCBikeRegNo] = useState('');
  const [cNotes, setCNotes] = useState('');

  // Supplier form fields
  const [sName, setSName] = useState('');
  const [sCompanyName, setSCompanyName] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sAddress, setSAddress] = useState('');
  const [sCategory, setSCategory] = useState('');
  const [sNotes, setSNotes] = useState('');

  const openCustomerModal = (c?: Customer) => {
    if (c) {
      setEditingCustomer(c);
      setCName(c.name);
      setCPhone(c.phone);
      setCAddress(c.address || '');
      setCBikeModel(c.bikeModel || '');
      setCBikeRegNo(c.bikeRegNo || '');
      setCNotes(c.notes || '');
    } else {
      setEditingCustomer(null);
      setCName('');
      setCPhone('');
      setCAddress('Netrokona Sadar');
      setCBikeModel('');
      setCBikeRegNo('');
      setCNotes('');
    }
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !cPhone.trim()) {
      alert('Name and phone number are required.');
      return;
    }

    const newCust: Customer = {
      id: editingCustomer?.id || `cust-${Date.now()}`,
      name: cName.trim(),
      phone: cPhone.trim(),
      address: cAddress.trim() || undefined,
      bikeModel: cBikeModel.trim() || undefined,
      bikeRegNo: cBikeRegNo.trim() || undefined,
      totalSpent: editingCustomer?.totalSpent || 0,
      totalDue: editingCustomer?.totalDue || 0,
      createdAt: editingCustomer?.createdAt || new Date().toISOString(),
      lastVisit: editingCustomer?.lastVisit || new Date().toISOString(),
      notes: cNotes.trim() || undefined,
    };

    onSaveCustomer(newCust);
    setIsCustomerModalOpen(false);
  };

  const openSupplierModal = (s?: Supplier) => {
    if (s) {
      setEditingSupplier(s);
      setSName(s.name);
      setSCompanyName(s.companyName);
      setSPhone(s.phone);
      setSAddress(s.address);
      setSCategory(s.categorySupplied);
      setSNotes(s.notes || '');
    } else {
      setEditingSupplier(null);
      setSName('');
      setSCompanyName('');
      setSPhone('');
      setSAddress('Netrokona / Dhaka');
      setSCategory('Spare Parts & Lubricants');
      setSNotes('');
    }
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplierForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sCompanyName.trim()) {
      alert('Representative name and company name are required.');
      return;
    }

    const newSup: Supplier = {
      id: editingSupplier?.id || `sup-${Date.now()}`,
      name: sName.trim(),
      companyName: sCompanyName.trim(),
      phone: sPhone.trim() || 'N/A',
      address: sAddress.trim() || 'Netrokona',
      categorySupplied: sCategory.trim() || 'Motorcycle Parts',
      totalPurchased: editingSupplier?.totalPurchased || 0,
      totalPayableDue: editingSupplier?.totalPayableDue || 0,
      notes: sNotes.trim() || undefined,
    };

    onSaveSupplier(newSup);
    setIsSupplierModalOpen(false);
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.bikeModel && c.bikeModel.toLowerCase().includes(q))
    );
  });

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.companyName.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => setTab('customers')}
            className={`px-4 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              tab === 'customers'
                ? 'bg-amber-400 text-neutral-950 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers ({customers.length})</span>
          </button>

          <button
            onClick={() => setTab('suppliers')}
            className={`px-4 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              tab === 'suppliers'
                ? 'bg-amber-400 text-neutral-950 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Wholesalers &amp; Suppliers ({suppliers.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {tab === 'customers' ? (
            <button
              onClick={() => openCustomerModal()}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Customer</span>
            </button>
          ) : (
            <button
              onClick={() => openSupplierModal()}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        {tab === 'customers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Customer Name &amp; Contact</th>
                  <th className="py-3 px-4">Bike Model &amp; Reg No</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Lifetime Purchases</th>
                  <th className="py-3 px-4 text-right">Due Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      No customer profiles found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-neutral-850/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-100">{cust.name}</div>
                        <div className="text-[11px] text-neutral-400">{cust.phone}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-200">
                          {cust.bikeModel || 'N/A'}
                        </div>
                        {cust.bikeRegNo && (
                          <div className="font-mono text-[10px] text-neutral-400">
                            {cust.bikeRegNo}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-neutral-400 text-[11px]">
                        {cust.address || 'Netrokona'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-200">
                        {formatBDT(cust.totalSpent)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        {cust.totalDue > 0 ? (
                          <span className="text-amber-400">{formatBDT(cust.totalDue)}</span>
                        ) : (
                          <span className="text-emerald-400 text-xs">Clear</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openCustomerModal(cust)}
                            className="p-1.5 text-neutral-400 hover:text-amber-400 rounded"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete customer profile for ${cust.name}?`)) {
                                onDeleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Representative &amp; Company</th>
                  <th className="py-3 px-4">Supplied Categories</th>
                  <th className="py-3 px-4">Phone &amp; Location</th>
                  <th className="py-3 px-4 text-right">Total Purchases</th>
                  <th className="py-3 px-4 text-right">Payable Due</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      No supplier records found.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-neutral-850/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-100">{sup.name}</div>
                        <div className="text-[11px] text-neutral-400">{sup.companyName}</div>
                      </td>

                      <td className="py-3 px-4 text-neutral-300 font-medium">
                        {sup.categorySupplied}
                      </td>

                      <td className="py-3 px-4 text-neutral-400 text-[11px]">
                        <div>{sup.phone}</div>
                        <div className="text-[10px] text-neutral-500">{sup.address}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-200">
                        {formatBDT(sup.totalPurchased)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        {sup.totalPayableDue > 0 ? (
                          <span className="text-rose-400">
                            {formatBDT(sup.totalPayableDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs">Clear</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openSupplierModal(sup)}
                            className="p-1.5 text-neutral-400 hover:text-amber-400 rounded"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete supplier profile for ${sup.name}?`)) {
                                onDeleteSupplier(sup.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 pb-2 border-b border-neutral-800">
              {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer Profile'}
            </h3>

            <form onSubmit={handleSaveCustomerForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  placeholder="017... / 018..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Bike Model</label>
                  <input
                    type="text"
                    value={cBikeModel}
                    onChange={(e) => setCBikeModel(e.target.value)}
                    placeholder="Pulsar 150 / FZ-S"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Bike Reg No</label>
                  <input
                    type="text"
                    value={cBikeRegNo}
                    onChange={(e) => setCBikeRegNo(e.target.value)}
                    placeholder="Netrokona-HA 11-..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Address / Area</label>
                <input
                  type="text"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  placeholder="e.g. Chhoto Bazar, Netrokona Sadar"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Notes</label>
                <input
                  type="text"
                  value={cNotes}
                  onChange={(e) => setCNotes(e.target.value)}
                  placeholder="e.g. Preferred engine oil, credit limit..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 pb-2 border-b border-neutral-800">
              {editingSupplier ? 'Edit Supplier Profile' : 'Add New Supplier Profile'}
            </h3>

            <form onSubmit={handleSaveSupplierForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Company / Agency Name *</label>
                <input
                  type="text"
                  required
                  value={sCompanyName}
                  onChange={(e) => setSCompanyName(e.target.value)}
                  placeholder="e.g. Uttara Motors Netrokona Depot"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={sPhone}
                  onChange={(e) => setSPhone(e.target.value)}
                  placeholder="017... / 019..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Supplied Categories</label>
                <input
                  type="text"
                  value={sCategory}
                  onChange={(e) => setSCategory(e.target.value)}
                  placeholder="e.g. Genuine Bajaj Spare Parts, Engine Oils"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Address / Depot Location</label>
                <input
                  type="text"
                  value={sAddress}
                  onChange={(e) => setSAddress(e.target.value)}
                  placeholder="e.g. Station Road, Netrokona Sadar"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
