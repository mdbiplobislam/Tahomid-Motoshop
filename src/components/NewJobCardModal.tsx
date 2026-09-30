import React, { useState } from 'react';
import { JobCard, ServiceItem, Mechanic, PartItem } from '../types';
import { generateJobNumber } from '../utils/formatters';
import { Wrench, Plus, Trash2, X, Bike } from 'lucide-react';

interface NewJobCardModalProps {
  services: ServiceItem[];
  mechanics: Mechanic[];
  parts: PartItem[];
  onSaveJobCard: (card: JobCard) => void;
  onClose: () => void;
}

export const NewJobCardModal: React.FC<NewJobCardModalProps> = ({
  services,
  mechanics,
  parts,
  onSaveJobCard,
  onClose,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [bikeRegNo, setBikeRegNo] = useState('Netrokona-HA ');
  const [currentOdoKm, setCurrentOdoKm] = useState<number>(15000);
  const [assignedMechanicId, setAssignedMechanicId] = useState(mechanics[0]?.id || '');
  const [estimatedCompletion, setEstimatedCompletion] = useState('5:00 PM Today');
  const [diagnosticNotes, setDiagnosticNotes] = useState('');

  // Issues reported
  const [issues, setIssues] = useState<string[]>(['']);
  // Selected Services
  const [selectedServices, setSelectedServices] = useState<
    { serviceName: string; charge: number; done: boolean }[]
  >([
    {
      serviceName: services[0]?.name || 'Master Servicing',
      charge: services[0]?.standardCharge || 600,
      done: false,
    },
  ]);

  // Selected Parts used
  const [partsUsed, setPartsUsed] = useState<
    { partId: string; partName: string; quantity: number; unitPrice: number }[]
  >([]);

  const handleAddIssue = () => {
    setIssues((prev) => [...prev, '']);
  };

  const handleIssueChange = (index: number, val: string) => {
    setIssues((prev) => prev.map((item, idx) => (idx === index ? val : item)));
  };

  const handleRemoveIssue = (index: number) => {
    setIssues((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Add Service
  const handleAddServiceRow = () => {
    setSelectedServices((prev) => [
      ...prev,
      {
        serviceName: services[1]?.name || 'Brake Servicing',
        charge: services[1]?.standardCharge || 180,
        done: false,
      },
    ]);
  };

  const handleServiceChange = (index: number, srvName: string, charge: number) => {
    setSelectedServices((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, serviceName: srvName, charge } : s))
    );
  };

  const handleRemoveService = (index: number) => {
    setSelectedServices((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Add Part Row
  const handleAddPartRow = () => {
    if (parts.length === 0) return;
    setPartsUsed((prev) => [
      ...prev,
      {
        partId: parts[0].id,
        partName: parts[0].name,
        quantity: 1,
        unitPrice: parts[0].sellingPrice,
      },
    ]);
  };

  const handlePartChange = (index: number, partId: string) => {
    const p = parts.find((pt) => pt.id === partId);
    if (!p) return;
    setPartsUsed((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              partId: p.id,
              partName: p.name,
              quantity: item.quantity,
              unitPrice: p.sellingPrice,
            }
          : item
      )
    );
  };

  const handlePartQtyChange = (index: number, qty: number) => {
    setPartsUsed((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  const handleRemovePart = (index: number) => {
    setPartsUsed((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalLabor = selectedServices.reduce((acc, s) => acc + (s.charge || 0), 0);
  const totalParts = partsUsed.reduce(
    (acc, p) => acc + (p.quantity || 0) * (p.unitPrice || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter customer name.');
      return;
    }
    if (!bikeModel.trim()) {
      alert('Please enter motorcycle model.');
      return;
    }

    const mech = mechanics.find((m) => m.id === assignedMechanicId);

    const validIssues = issues.map((i) => i.trim()).filter(Boolean);

    const jobCard: JobCard = {
      id: `job-${Date.now()}`,
      jobCardNumber: generateJobNumber(Math.floor(100 + Math.random() * 900)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || 'N/A',
      bikeModel: bikeModel.trim(),
      bikeRegNo: bikeRegNo.trim() || 'Unregistered / On Test',
      currentOdoKm: Math.max(0, currentOdoKm),
      assignedMechanicId: assignedMechanicId,
      assignedMechanicName: mech ? mech.name : 'Shop Head Mechanic',
      customerReportedIssues:
        validIssues.length > 0 ? validIssues : ['Routine Master Servicing & Checkup'],
      diagnosticNotes: diagnosticNotes.trim(),
      plannedServices: selectedServices.map((s) => ({
        serviceName: s.serviceName,
        charge: Number(s.charge) || 0,
        done: s.done,
      })),
      partsUsed: partsUsed.map((p) => ({
        partId: p.partId,
        partName: p.partName,
        quantity: Number(p.quantity) || 1,
        unitPrice: Number(p.unitPrice) || 0,
      })),
      status: 'Pending',
      estimatedCompletionTime: estimatedCompletion || 'Today',
      totalLaborCharge: totalLabor,
      totalPartsCharge: totalParts,
    };

    onSaveJobCard(jobCard);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4 my-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                New Motorcycle Servicing Job Card (সার্ভিসিং জব কার্ড)
              </h3>
              <p className="text-xs text-neutral-400">
                Assign bike to ramp, record rider complaints and required tasks
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer & Bike Information */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Customer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Al-Amin Chowdhury"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Customer Phone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="017... / 018..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Motorcycle Model *</label>
              <input
                type="text"
                required
                value={bikeModel}
                onChange={(e) => setBikeModel(e.target.value)}
                placeholder="e.g. Yamaha FZ-S V3 ABS or Bajaj Pulsar 150"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Bike Reg No</label>
                <input
                  type="text"
                  value={bikeRegNo}
                  onChange={(e) => setBikeRegNo(e.target.value)}
                  placeholder="Netrokona-HA 11-..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Odometer (KM)</label>
                <input
                  type="number"
                  min="0"
                  value={currentOdoKm}
                  onChange={(e) => setCurrentOdoKm(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 font-mono text-neutral-100 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Mechanic Assignment & Estimate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Assigned Head Mechanic:
              </label>
              <select
                value={assignedMechanicId}
                onChange={(e) => setAssignedMechanicId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 focus:outline-hidden focus:border-amber-400"
              >
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Estimated Ready Time:
              </label>
              <input
                type="text"
                value={estimatedCompletion}
                onChange={(e) => setEstimatedCompletion(e.target.value)}
                placeholder="e.g. 5:30 PM Today"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* Reported Issues Checklist */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-300">
                Customer Reported Complaints / Problems (সমস্যাসমূহ):
              </label>
              <button
                type="button"
                onClick={handleAddIssue}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Complaint</span>
              </button>
            </div>

            {issues.map((issue, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-neutral-500 font-mono text-xs">{idx + 1}.</span>
                <input
                  type="text"
                  value={issue}
                  onChange={(e) => handleIssueChange(idx, e.target.value)}
                  placeholder="e.g. Engine knocking sound, brake pad worn, fork oil leaking..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-100 focus:outline-hidden focus:border-amber-400"
                />
                {issues.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIssue(idx)}
                    className="text-neutral-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Planned Services & Charges */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-300">
                Planned Servicing Tasks &amp; Labor Charge:
              </label>
              <button
                type="button"
                onClick={handleAddServiceRow}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Service</span>
              </button>
            </div>

            {selectedServices.map((srv, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-8">
                  <input
                    type="text"
                    value={srv.serviceName}
                    onChange={(e) => handleServiceChange(idx, e.target.value, srv.charge)}
                    placeholder="Service description"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-neutral-200"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    min="0"
                    value={srv.charge}
                    onChange={(e) =>
                      handleServiceChange(idx, srv.serviceName, parseFloat(e.target.value) || 0)
                    }
                    placeholder="Fee (৳)"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-right font-mono text-amber-400 font-bold"
                  />
                </div>
                <div className="col-span-1 text-center">
                  {selectedServices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Parts required/used on this bike */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-300">
                Spare Parts Replaced / Allocated:
              </label>
              <button
                type="button"
                onClick={handleAddPartRow}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>+ Allocate Part</span>
              </button>
            </div>

            {partsUsed.map((pItem, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-8">
                  <select
                    value={pItem.partId}
                    onChange={(e) => handlePartChange(idx, e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-neutral-200 text-xs"
                  >
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (৳{p.sellingPrice})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    min="1"
                    value={pItem.quantity}
                    onChange={(e) =>
                      handlePartQtyChange(idx, parseInt(e.target.value, 10) || 1)
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-center font-mono font-bold text-neutral-100"
                  />
                </div>
                <div className="col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemovePart(idx)}
                    className="text-neutral-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Diagnostic notes */}
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">
              Mechanic Diagnostic &amp; Inspection Remarks:
            </label>
            <textarea
              rows={2}
              value={diagnosticNotes}
              onChange={(e) => setDiagnosticNotes(e.target.value)}
              placeholder="e.g. Engine compression checked, battery charging 14.2V, chain lubricated with Motul spray..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
            />
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
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg cursor-pointer"
            >
              Create Job Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
