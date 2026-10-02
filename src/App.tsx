import React, { useState, useEffect } from 'react';
import {
  PartItem,
  ServiceItem,
  Customer,
  Supplier,
  Invoice,
  JobCard,
  ExpenseRecord,
  DuePaymentRecord,
  Mechanic,
  ShopSettings,
  UserAccount,
} from './types';
import { AppStorage } from './utils/storage';
import { TopNav, NavTab } from './components/TopNav';
import { PosBilling } from './components/PosBilling';
import { InventoryManager } from './components/InventoryManager';
import { WorkshopManager } from './components/WorkshopManager';
import { BakiKhata } from './components/BakiKhata';
import { CashbookAccounts } from './components/CashbookAccounts';
import { DirectoryView } from './components/DirectoryView';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';
import { ShopSettingsModal } from './components/ShopSettingsModal';
import { LoginView } from './components/LoginView';
import { CustomerPortal } from './components/CustomerPortal';
import { formatBDT, generateJobNumber } from './utils/formatters';
import {
  MapPin,
  Phone,
  Bike,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Wrench,
} from 'lucide-react';

export default function App() {
  // Authentication & Users State
  const [users, setUsers] = useState<UserAccount[]>(() => AppStorage.getUsers());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = AppStorage.getCurrentUser();
    // Default to Super Admin if none saved so the shop is instantly ready, or users can switch anytime
    return saved || AppStorage.getUsers()[0] || null;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('pos');

  // Core Data States
  const [parts, setParts] = useState<PartItem[]>(() => AppStorage.getParts());
  const [services, setServices] = useState<ServiceItem[]>(() => AppStorage.getServices());
  const [customers, setCustomers] = useState<Customer[]>(() => AppStorage.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => AppStorage.getSuppliers());
  const [invoices, setInvoices] = useState<Invoice[]>(() => AppStorage.getInvoices());
  const [jobCards, setJobCards] = useState<JobCard[]>(() => AppStorage.getJobCards());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => AppStorage.getExpenses());
  const [duePayments, setDuePayments] = useState<DuePaymentRecord[]>(() =>
    AppStorage.getDuePayments()
  );
  const [mechanics, setMechanics] = useState<Mechanic[]>(() => AppStorage.getMechanics());
  const [settings, setSettings] = useState<ShopSettings>(() => AppStorage.getSettings());

  // Modals & In-flight states
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState<Invoice | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [jobCardForBilling, setJobCardForBilling] = useState<{
    customerName: string;
    customerPhone: string;
    bikeModel: string;
    bikeRegNo: string;
    jobCardId: string;
    parts: { partId: string; quantity: number }[];
    services: { serviceName: string; charge: number }[];
  } | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    AppStorage.saveUsers(users);
  }, [users]);

  useEffect(() => {
    AppStorage.saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    AppStorage.saveParts(parts);
  }, [parts]);

  useEffect(() => {
    AppStorage.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    AppStorage.saveSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    AppStorage.saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    AppStorage.saveJobCards(jobCards);
  }, [jobCards]);

  useEffect(() => {
    AppStorage.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    AppStorage.saveDuePayments(duePayments);
  }, [duePayments]);

  useEffect(() => {
    AppStorage.saveMechanics(mechanics);
  }, [mechanics]);

  useEffect(() => {
    AppStorage.saveSettings(settings);
  }, [settings]);

  // Global F2 keyboard shortcut for POS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (currentUser?.role !== 'customer') {
          setActiveTab('pos');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  // Handle Authentication
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'customer') {
      // Customer lands on their portal
    } else {
      setActiveTab('pos');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    AppStorage.saveCurrentUser(null);
  };

  // Quick summary counts
  const lowStockCount = parts.filter((p) => p.stockQuantity <= p.minStockAlert).length;
  const pendingJobsCount = jobCards.filter(
    (j) => j.status === 'In Progress' || j.status === 'Pending'
  ).length;

  // POS Sale Completion Handler
  const handleCompleteSale = (
    newInvoice: Invoice,
    updatedParts: PartItem[],
    updatedCustomer?: Customer
  ) => {
    setParts(updatedParts);
    setInvoices((prev) => [newInvoice, ...prev]);

    if (updatedCustomer) {
      setCustomers((prev) => {
        const idx = prev.findIndex((c) => c.id === updatedCustomer.id);
        if (idx >= 0) {
          return prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c));
        } else {
          return [updatedCustomer, ...prev];
        }
      });
    }

    // If this bill came from a workshop job card, mark the job card as delivered
    if (jobCardForBilling) {
      setJobCards((prev) =>
        prev.map((j) =>
          j.id === jobCardForBilling.jobCardId
            ? {
                ...j,
                status: 'Delivered',
                invoiceId: newInvoice.invoiceNumber,
                updatedAt: new Date().toISOString(),
              }
            : j
        )
      );
      setJobCardForBilling(null);
    }

    // Auto-open print receipt
    setActiveInvoiceForPrint(newInvoice);
  };

  // Workshop to POS Billing Bridge
  const handleBillJobCardInPOS = (card: JobCard) => {
    setJobCardForBilling({
      customerName: card.customerName,
      customerPhone: card.customerPhone,
      bikeModel: card.bikeModel,
      bikeRegNo: card.bikeRegNo,
      jobCardId: card.id,
      parts: card.partsUsed.map((p) => ({ partId: p.partId, quantity: p.quantity })),
      services: card.plannedServices.map((s) => ({
        serviceName: s.serviceName,
        charge: s.charge,
      })),
    });
    setActiveTab('pos');
  };

  // Customer portal appointment booking
  const handleCustomerRequestServicing = (problemDesc: string) => {
    if (!currentUser) return;
    const custProfile = customers.find((c) => c.id === currentUser.customerId);

    const newJob: JobCard = {
      id: `job-${Date.now()}`,
      jobCardNumber: generateJobNumber(Math.floor(100 + Math.random() * 900)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: custProfile?.name || currentUser.name,
      customerPhone: custProfile?.phone || currentUser.phone,
      bikeModel: custProfile?.bikeModel || 'Motorcycle (Customer App)',
      bikeRegNo: custProfile?.bikeRegNo || 'Netrokona-HA 11-4589',
      currentOdoKm: 15000,
      assignedMechanicId: mechanics[0]?.id || 'mech-1',
      assignedMechanicName: mechanics[0]?.name || 'Master Uzzal',
      customerReportedIssues: [problemDesc],
      diagnosticNotes: 'Online booking via Rider Self-Service Portal. Pending shop inspection.',
      plannedServices: [
        {
          serviceName: 'General Inspection & Servicing',
          charge: 350,
          done: false,
        },
      ],
      partsUsed: [],
      status: 'Pending',
      estimatedCompletionTime: 'Awaiting Ramp Check',
      totalLaborCharge: 350,
      totalPartsCharge: 0,
    };

    setJobCards((prev) => [newJob, ...prev]);
  };

  // Stock-In Handler
  const handleStockIn = (
    record: any,
    updatedParts: PartItem[],
    updatedSupplier?: Supplier
  ) => {
    setParts(updatedParts);
    if (updatedSupplier) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
      );
    }
  };

  // Quick Stock Adjustment
  const handleQuickAdjustStock = (partId: string, newStock: number) => {
    setParts((prev) =>
      prev.map((p) =>
        p.id === partId
          ? { ...p, stockQuantity: newStock, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  // Due Payment recorded
  const handleRecordDuePayment = (
    payment: DuePaymentRecord,
    updatedCust?: Customer,
    updatedSup?: Supplier
  ) => {
    setDuePayments((prev) => [payment, ...prev]);
    if (updatedCust) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
      );
    }
    if (updatedSup) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === updatedSup.id ? updatedSup : s))
      );
    }
  };

  // Reload everything on restore/reset
  const handleReloadData = () => {
    setParts(AppStorage.getParts());
    setServices(AppStorage.getServices());
    setCustomers(AppStorage.getCustomers());
    setSuppliers(AppStorage.getSuppliers());
    setInvoices(AppStorage.getInvoices());
    setJobCards(AppStorage.getJobCards());
    setExpenses(AppStorage.getExpenses());
    setDuePayments(AppStorage.getDuePayments());
    setMechanics(AppStorage.getMechanics());
    setSettings(AppStorage.getSettings());
    setUsers(AppStorage.getUsers());
  };

  const handleResetData = () => {
    AppStorage.resetAllToDefault();
    handleReloadData();
    setCurrentUser(AppStorage.getUsers()[0]);
  };

  // If user is logged out, render the Login Screen
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        settings={settings}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Calculate today's quick business health snapshot
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayInvoices = invoices.filter(
    (i) => new Date(i.date).getTime() >= todayStart.getTime()
  );
  const todaySales = todayInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalDueReceivable = customers.reduce((acc, c) => acc + c.totalDue, 0);

  // Check if current user is customer
  const isCustomer = currentUser.role === 'customer';
  const customerProfile = isCustomer
    ? customers.find(
        (c) =>
          c.id === currentUser.customerId ||
          c.phone.includes(currentUser.phone) ||
          c.name.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : undefined;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-400 selection:text-neutral-950">
      {/* 1. Strict Top Bar Contract with User Authentication Badge */}
      <TopNav
        activeTab={activeTab}
        currentUser={currentUser}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onQuickNewSale={() => setActiveTab('pos')}
        onLogout={handleLogout}
        onSwitchUser={() => setCurrentUser(null)}
        lowStockCount={lowStockCount}
        pendingJobsCount={pendingJobsCount}
      />

      {/* 2. Domain Context Strip */}
      <div className="border-b border-neutral-850 bg-neutral-900/60 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 text-neutral-400">
            <span className="font-semibold text-neutral-200">
              {settings.banglaTitle}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              {settings.address}, {settings.city}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:flex items-center gap-1">
              <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
              {settings.phonePrimary}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {!isCustomer ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 font-sans">Today's Sales:</span>
                  <span className="font-bold text-amber-400 tabular-nums">
                    {formatBDT(todaySales)}
                  </span>
                </div>
                <span aria-hidden="true" className="text-neutral-700">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 font-sans">Customer Baki:</span>
                  <span className="font-bold text-rose-400 tabular-nums">
                    {formatBDT(totalDueReceivable)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-neutral-300 font-sans">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Logged in as Rider: <strong className="text-amber-400">{currentUser.name}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* CUSTOMER PORTAL VIEW */}
        {isCustomer ? (
          <CustomerPortal
            currentUser={currentUser}
            customer={customerProfile}
            invoices={invoices}
            jobCards={jobCards}
            settings={settings}
            onViewInvoice={(inv) => setActiveInvoiceForPrint(inv)}
            onRequestServicing={handleCustomerRequestServicing}
            onLogout={handleLogout}
          />
        ) : (
          /* ADMIN & STAFF DASHBOARDS */
          <>
            {activeTab === 'pos' && (
              <PosBilling
                parts={parts}
                services={services}
                customers={customers}
                mechanics={mechanics}
                settings={settings}
                onCompleteSale={handleCompleteSale}
                initialJobCardData={jobCardForBilling}
                onClearInitialJobCard={() => setJobCardForBilling(null)}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryManager
                parts={parts}
                suppliers={suppliers}
                onSavePart={(newPart) => {
                  setParts((prev) => {
                    const idx = prev.findIndex((p) => p.id === newPart.id);
                    if (idx >= 0) {
                      return prev.map((p) => (p.id === newPart.id ? newPart : p));
                    } else {
                      return [newPart, ...prev];
                    }
                  });
                }}
                onDeletePart={(partId) => {
                  setParts((prev) => prev.filter((p) => p.id !== partId));
                }}
                onStockIn={handleStockIn}
                onQuickAdjustStock={handleQuickAdjustStock}
              />
            )}

            {activeTab === 'workshop' && (
              <WorkshopManager
                jobCards={jobCards}
                services={services}
                mechanics={mechanics}
                parts={parts}
                onSaveJobCard={(card) => setJobCards((prev) => [card, ...prev])}
                onUpdateJobCard={(card) =>
                  setJobCards((prev) => prev.map((j) => (j.id === card.id ? card : j)))
                }
                onBillJobCardInPOS={handleBillJobCardInPOS}
              />
            )}

            {activeTab === 'baki' && (
              <BakiKhata
                customers={customers}
                suppliers={suppliers}
                duePayments={duePayments}
                settings={settings}
                onRecordPayment={handleRecordDuePayment}
              />
            )}

            {activeTab === 'cashbook' && (
              <CashbookAccounts
                invoices={invoices}
                expenses={expenses}
                duePayments={duePayments}
                settings={settings}
                onAddExpense={(exp) => setExpenses((prev) => [exp, ...prev])}
                onDeleteExpense={(id) => setExpenses((prev) => prev.filter((e) => e.id !== id))}
              />
            )}

            {activeTab === 'directory' && (
              <DirectoryView
                customers={customers}
                suppliers={suppliers}
                onSaveCustomer={(cust) => {
                  setCustomers((prev) => {
                    const idx = prev.findIndex((c) => c.id === cust.id);
                    if (idx >= 0) {
                      return prev.map((c) => (c.id === cust.id ? cust : c));
                    } else {
                      return [cust, ...prev];
                    }
                  });
                }}
                onSaveSupplier={(sup) => {
                  setSuppliers((prev) => {
                    const idx = prev.findIndex((s) => s.id === sup.id);
                    if (idx >= 0) {
                      return prev.map((s) => (s.id === sup.id ? sup : s));
                    } else {
                      return [sup, ...prev];
                    }
                  });
                }}
                onDeleteCustomer={(id) => setCustomers((prev) => prev.filter((c) => c.id !== id))}
                onDeleteSupplier={(id) => setSuppliers((prev) => prev.filter((s) => s.id !== id))}
              />
            )}
          </>
        )}
      </main>

      {/* 4. Thermal / A4 Printable Receipt Modal */}
      {activeInvoiceForPrint && (
        <PrintInvoiceModal
          invoice={activeInvoiceForPrint}
          settings={settings}
          onClose={() => setActiveInvoiceForPrint(null)}
        />
      )}

      {/* 5. Shop Settings & Database Backup Modal */}
      {isSettingsModalOpen && currentUser && (
        <ShopSettingsModal
          settings={settings}
          mechanics={mechanics}
          users={users}
          currentUser={currentUser}
          onSaveSettings={setSettings}
          onSaveMechanics={setMechanics}
          onSaveUsers={setUsers}
          onResetData={handleResetData}
          onRestoreData={handleReloadData}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-4 text-center text-xs text-neutral-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>{settings.shopName}</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Netrokona, Bangladesh</span>
            {currentUser && (
              <>
                <span aria-hidden="true" className="mx-2">·</span>
                <span className="text-neutral-400 capitalize">
                  Active Role: <strong>{currentUser.role.replace('_', ' ')}</strong>
                </span>
              </>
            )}
          </div>
          <div>
            {!isCustomer && (
              <span>
                Press <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded font-mono text-[10px] text-neutral-300">F2</kbd> for New Sale
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
