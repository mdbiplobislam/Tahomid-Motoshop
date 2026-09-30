import React, { useState, useMemo } from 'react';
import { JobCard, ServiceItem, Mechanic, PartItem, JobStatus } from '../types';
import { formatBDT, formatDateTime } from '../utils/formatters';
import { NewJobCardModal } from './NewJobCardModal';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bike,
  User,
  Phone,
  FileText,
  Search,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react';

interface WorkshopManagerProps {
  jobCards: JobCard[];
  services: ServiceItem[];
  mechanics: Mechanic[];
  parts: PartItem[];
  onSaveJobCard: (card: JobCard) => void;
  onUpdateJobCard: (card: JobCard) => void;
  onBillJobCardInPOS: (card: JobCard) => void;
}

export const WorkshopManager: React.FC<WorkshopManagerProps> = ({
  jobCards,
  services,
  mechanics,
  parts,
  onSaveJobCard,
  onUpdateJobCard,
  onBillJobCardInPOS,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Status counts
  const pendingCount = jobCards.filter((j) => j.status === 'Pending').length;
  const inProgressCount = jobCards.filter((j) => j.status === 'In Progress').length;
  const readyCount = jobCards.filter((j) => j.status === 'Ready').length;
  const deliveredCount = jobCards.filter((j) => j.status === 'Delivered').length;

  const filteredJobCards = useMemo(() => {
    let result = [...jobCards];
    if (statusFilter !== 'All') {
      result = result.filter((j) => j.status === statusFilter);
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (j) =>
          j.jobCardNumber.toLowerCase().includes(q) ||
          j.customerName.toLowerCase().includes(q) ||
          j.customerPhone.toLowerCase().includes(q) ||
          j.bikeModel.toLowerCase().includes(q) ||
          j.bikeRegNo.toLowerCase().includes(q) ||
          j.assignedMechanicName.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [jobCards, statusFilter, searchQuery]);

  const handleToggleTask = (jobId: string, taskIdx: number) => {
    const job = jobCards.find((j) => j.id === jobId);
    if (!job) return;

    const updatedPlannedServices = job.plannedServices.map((task, idx) =>
      idx === taskIdx ? { ...task, done: !task.done } : task
    );

    // Auto-evaluate status if all done
    const allDone = updatedPlannedServices.every((t) => t.done);
    const newStatus: JobStatus = allDone && job.status === 'In Progress' ? 'Ready' : job.status;

    onUpdateJobCard({
      ...job,
      plannedServices: updatedPlannedServices,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    const job = jobCards.find((j) => j.id === jobId);
    if (!job) return;
    onUpdateJobCard({
      ...job,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Workshop Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="text-neutral-400 text-xs font-medium">Bikes on Ramp / In Queue</div>
          <div className="text-xl font-bold font-mono text-neutral-100 mt-1 tabular-nums">
            {pendingCount + inProgressCount}{' '}
            <span className="text-xs text-neutral-500 font-sans font-normal">
              ({inProgressCount} in progress)
            </span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="text-neutral-400 text-xs font-medium">Ready for Delivery</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {readyCount}{' '}
            <span className="text-xs text-neutral-500 font-sans font-normal">
              servicing finished
            </span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="text-neutral-400 text-xs font-medium">Active Mechanics</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {mechanics.filter((m) => m.active).length}{' '}
            <span className="text-xs text-neutral-500 font-sans font-normal">
              technicians on duty
            </span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="text-neutral-400 text-xs font-medium">Completed &amp; Billed</div>
          <div className="text-xl font-bold font-mono text-neutral-300 mt-1 tabular-nums">
            {deliveredCount}{' '}
            <span className="text-xs text-neutral-500 font-sans font-normal">jobs</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job #, customer, phone, bike reg..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Job Card</span>
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-neutral-800/60 text-xs">
          <span className="text-neutral-500 text-[11px] mr-1">Status:</span>
          {(
            ['All', 'Pending', 'In Progress', 'Ready', 'Delivered'] as (
              | 'All'
              | JobStatus
            )[]
          ).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobCards.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <p className="text-sm font-semibold text-neutral-300">No motorcycle job cards found</p>
            <p className="text-xs text-neutral-500 mt-1">
              Click "+ New Job Card" to assign a bike to the workshop ramp
            </p>
          </div>
        ) : (
          filteredJobCards.map((job) => {
            const isCompleted = job.status === 'Ready' || job.status === 'Delivered';
            const allTasksDone = job.plannedServices.every((t) => t.done);

            return (
              <div
                key={job.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4.5 space-y-3.5 shadow-sm hover:border-neutral-700 transition-all"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800/70 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {job.jobCardNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.status === 'Ready'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : job.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-300'
                            : job.status === 'Delivered'
                            ? 'bg-neutral-800 text-neutral-400'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5 mt-1">
                      <Bike className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{job.bikeModel}</span>
                      <span className="text-neutral-400 font-mono text-xs font-normal">
                        ({job.bikeRegNo})
                      </span>
                    </h4>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-neutral-400 block text-[10px]">Estimated Ready</span>
                    <span className="font-medium text-neutral-200">
                      {job.estimatedCompletionTime || 'Today'}
                    </span>
                  </div>
                </div>

                {/* Customer & Mechanic details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/70">
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">
                      Rider / Customer
                    </span>
                    <span className="font-semibold text-neutral-200">{job.customerName}</span>
                    <span className="text-neutral-400 text-[11px] block">{job.customerPhone}</span>
                  </div>

                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">
                      Assigned Mechanic
                    </span>
                    <span className="font-semibold text-amber-300">
                      {job.assignedMechanicName}
                    </span>
                    <span className="text-neutral-400 text-[11px] block font-mono">
                      Odo: {job.currentOdoKm} km
                    </span>
                  </div>
                </div>

                {/* Complaints */}
                <div>
                  <span className="text-neutral-400 text-[11px] font-semibold block mb-1">
                    Reported Issues:
                  </span>
                  <ul className="space-y-1 text-xs text-neutral-300 bg-neutral-950/50 p-2 rounded border border-neutral-800/50">
                    {job.customerReportedIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tasks & Services checklist */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-neutral-300">
                      Servicing Tasks Checklist ({job.plannedServices.filter((s) => s.done).length}/{job.plannedServices.length} done):
                    </span>
                    <span className="font-mono text-amber-400 tabular-nums">
                      Labor: {formatBDT(job.totalLaborCharge)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {job.plannedServices.map((task, sIdx) => (
                      <div
                        key={sIdx}
                        onClick={() => handleToggleTask(job.id, sIdx)}
                        className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer select-none transition-colors ${
                          task.done
                            ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20'
                            : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-850 border border-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {task.done ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-500 shrink-0" />
                          )}
                          <span className={task.done ? 'line-through text-neutral-400' : ''}>
                            {task.serviceName}
                          </span>
                        </div>
                        <span className="font-mono text-neutral-400 text-[11px] tabular-nums">
                          ৳{task.charge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parts Used on this bike */}
                {job.partsUsed.length > 0 && (
                  <div className="pt-1 text-xs">
                    <span className="text-neutral-400 text-[11px] font-semibold block mb-1">
                      Parts Installed:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.partsUsed.map((p, idx) => (
                        <span
                          key={idx}
                          className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[11px] font-mono"
                        >
                          {p.partName} x{p.quantity} (৳{p.unitPrice * p.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Footer */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value as JobStatus)}
                      className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded px-2 py-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => onBillJobCardInPOS(job)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <span>Bill in POS (চালান)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isAddModalOpen && (
        <NewJobCardModal
          services={services}
          mechanics={mechanics}
          parts={parts}
          onSaveJobCard={(card) => {
            onSaveJobCard(card);
            setIsAddModalOpen(false);
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};
