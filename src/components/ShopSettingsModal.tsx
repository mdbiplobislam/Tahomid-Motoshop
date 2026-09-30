import React, { useState } from 'react';
import { ShopSettings, Mechanic } from '../types';
import { AppStorage } from '../utils/storage';
import {
  Settings,
  X,
  Save,
  Download,
  Upload,
  RotateCcw,
  Wrench,
  Store,
  Phone,
  CheckCircle2,
} from 'lucide-react';

interface ShopSettingsModalProps {
  settings: ShopSettings;
  mechanics: Mechanic[];
  onSaveSettings: (settings: ShopSettings) => void;
  onSaveMechanics: (mechanics: Mechanic[]) => void;
  onResetData: () => void;
  onRestoreData: () => void;
  onClose: () => void;
}

export const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({
  settings,
  mechanics,
  onSaveSettings,
  onSaveMechanics,
  onResetData,
  onRestoreData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'mechanics' | 'backup'>('shop');

  // Shop details
  const [shopName, setShopName] = useState(settings.shopName);
  const [banglaTitle, setBanglaTitle] = useState(settings.banglaTitle);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [district, setDistrict] = useState(settings.district);
  const [phonePrimary, setPhonePrimary] = useState(settings.phonePrimary);
  const [phoneSecondary, setPhoneSecondary] = useState(settings.phoneSecondary);
  const [bKashNumber, setBKashNumber] = useState(settings.bKashNumber);
  const [nagadNumber, setNagadNumber] = useState(settings.nagadNumber);
  const [invoiceFooterNotice, setInvoiceFooterNotice] = useState(settings.invoiceFooterNotice);
  const [receiptFormat, setReceiptFormat] = useState(settings.receiptFormat);

  // Mechanics state
  const [mechList, setMechList] = useState<Mechanic[]>([...mechanics]);

  const handleMechanicChange = (
    index: number,
    field: keyof Mechanic,
    value: string | number | boolean
  ) => {
    setMechList((prev) =>
      prev.map((m, idx) => (idx === index ? { ...m, [field]: value } : m))
    );
  };

  const handleAddMechanic = () => {
    const newMech: Mechanic = {
      id: `mech-${Date.now()}`,
      name: 'New Mechanic',
      phone: '01700-000000',
      specialty: 'Servicing & General Repairs',
      commissionRatePct: 35,
      active: true,
    };
    setMechList((prev) => [...prev, newMech]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ShopSettings = {
      shopName: shopName.trim() || 'Tahomid Motoshop',
      tagline: 'Motorcycle Spare Parts, Servicing & Genuine Mobil Depot',
      banglaTitle: banglaTitle.trim() || 'তাহমিদ অটোশপ',
      address: address.trim() || 'College Road',
      city: city.trim() || 'Netrokona Sadar',
      district: district.trim() || 'Netrokona, Bangladesh',
      phonePrimary: phonePrimary.trim(),
      phoneSecondary: phoneSecondary.trim(),
      bKashNumber: bKashNumber.trim(),
      nagadNumber: nagadNumber.trim(),
      invoiceFooterNotice: invoiceFooterNotice.trim(),
      receiptFormat,
      currencySymbol: '৳',
    };

    onSaveSettings(updated);
    onSaveMechanics(mechList);
    onClose();
  };

  const handleExportBackup = () => {
    const json = AppStorage.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tahomid_Motoshop_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = AppStorage.importFullBackup(content);
        if (success) {
          alert('Database restored successfully from backup!');
          onRestoreData();
          onClose();
        } else {
          alert('Failed to restore backup file. Please verify JSON format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4 my-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                Tahomid Motoshop Software Configuration
              </h3>
              <p className="text-xs text-neutral-400">
                Manage shop identity, receipt header, workshop mechanics, and database backups
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Shop Profile &amp; Receipt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'mechanics'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Workshop Mechanics ({mechList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Database Backup &amp; Restore
          </button>
        </div>

        {/* TAB 1: Shop Profile */}
        {activeTab === 'shop' && (
          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Shop Name</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Bangla Title</label>
                <input
                  type="text"
                  value={banglaTitle}
                  onChange={(e) => setBanglaTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Road / Street</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">City / Upazila</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">District &amp; Country</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Primary Mobile No</label>
                <input
                  type="text"
                  value={phonePrimary}
                  onChange={(e) => setPhonePrimary(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Secondary Mobile No</label>
                <input
                  type="text"
                  value={phoneSecondary}
                  onChange={(e) => setPhoneSecondary(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">bKash Number</label>
                <input
                  type="text"
                  value={bKashNumber}
                  onChange={(e) => setBKashNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Nagad Number</label>
                <input
                  type="text"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Receipt Footer Terms &amp; Notice
              </label>
              <textarea
                rows={2}
                value={invoiceFooterNotice}
                onChange={(e) => setInvoiceFooterNotice(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Mechanics */}
        {activeTab === 'mechanics' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">
                Registered mechanics for servicing assignment &amp; labor tracking:
              </span>
              <button
                type="button"
                onClick={handleAddMechanic}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-semibold"
              >
                + Add Mechanic
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {mechList.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                >
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Name</label>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => handleMechanicChange(idx, 'name', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-neutral-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Phone</label>
                    <input
                      type="text"
                      value={m.phone}
                      onChange={(e) => handleMechanicChange(idx, 'phone', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-neutral-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Specialty</label>
                    <input
                      type="text"
                      value={m.specialty}
                      onChange={(e) => handleMechanicChange(idx, 'specialty', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-neutral-300"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <label className="flex items-center gap-1.5 text-neutral-300">
                      <input
                        type="checkbox"
                        checked={m.active}
                        onChange={(e) => handleMechanicChange(idx, 'active', e.target.checked)}
                        className="rounded"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setMechList((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-neutral-500 hover:text-rose-400 text-[11px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveMechanics(mechList);
                  onClose();
                }}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg cursor-pointer"
              >
                Save Mechanics
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
              <h4 className="font-bold text-neutral-100 text-sm">Data Persistence &amp; Backup</h4>
              <p className="text-neutral-400 leading-relaxed">
                All parts inventory, POS invoices, workshop job cards, customer due records, and
                daily expenses are securely stored in local persistence. You can download an offline
                JSON backup anytime or restore data on any device.
              </p>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.JSON)</span>
                </button>

                <label className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore from JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-2">
              <h4 className="font-bold text-rose-300 text-sm">Reset Demo State</h4>
              <p className="text-neutral-400 text-[11px]">
                Reset all shop inventory, invoices, and ledgers back to initial seed data for Tahomid
                Motoshop Netrokona.
              </p>

              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to reset all data back to the default Netrokona seed state?'
                    )
                  ) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
