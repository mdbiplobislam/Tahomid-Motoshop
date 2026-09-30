import React, { useState, useMemo } from 'react';
import {
  Invoice,
  ExpenseRecord,
  DuePaymentRecord,
  ExpenseCategory,
  PaymentMethod,
  ShopSettings,
} from '../types';
import { formatBDT, formatDateTime, formatDateOnly } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  Receipt,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Coffee,
  Zap,
  Truck,
  Building,
} from 'lucide-react';

interface CashbookAccountsProps {
  invoices: Invoice[];
  expenses: ExpenseRecord[];
  duePayments: DuePaymentRecord[];
  settings: ShopSettings;
  onAddExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Tea & Refreshments',
  'Electricity Bill',
  'Goods Transport (Chalan)',
  'Mechanic Daily Allowance',
  'Shop Rent',
  'Tools & Equipment',
  'Internet & Utility',
  'Miscellaneous',
];

export const CashbookAccounts: React.FC<CashbookAccountsProps> = ({
  invoices,
  expenses,
  duePayments,
  settings,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // New Expense form state
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Tea & Refreshments');
  const [expenseAmount, setExpenseAmount] = useState<number>(100);
  const [expenseRecipient, setExpenseRecipient] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<PaymentMethod>('Cash');
  const [expenseDesc, setExpenseDesc] = useState('');

  // Date filter logic
  const now = new Date();
  const filterDate = useMemo(() => {
    if (timeRange === 'today') {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return d.getTime();
    }
    if (timeRange === 'week') {
      return now.getTime() - 7 * 86400000;
    }
    if (timeRange === 'month') {
      return now.getTime() - 30 * 86400000;
    }
    return 0; // 'all'
  }, [timeRange]);

  const filteredInvoices = useMemo(
    () => invoices.filter((i) => new Date(i.date).getTime() >= filterDate),
    [invoices, filterDate]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => new Date(e.date).getTime() >= filterDate),
    [expenses, filterDate]
  );

  const filteredDuePayments = useMemo(
    () => duePayments.filter((p) => new Date(p.date).getTime() >= filterDate),
    [duePayments, filterDate]
  );

  // Core Financial calculations
  // 1. Sales & Revenue
  const totalPartsSalesRevenue = filteredInvoices.reduce(
    (acc, inv) => acc + inv.subtotalParts,
    0
  );
  const totalLaborIncome = filteredInvoices.reduce(
    (acc, inv) => acc + inv.subtotalLabor,
    0
  );
  const totalInvoiceDiscounts = filteredInvoices.reduce(
    (acc, inv) => acc + inv.discount,
    0
  );
  const totalBilledSales = filteredInvoices.reduce(
    (acc, inv) => acc + inv.grandTotal,
    0
  );

  // Cost of Goods Sold for the parts sold in this period
  const totalCOGS = filteredInvoices.reduce((acc, inv) => {
    const invCost = inv.items.reduce(
      (cAcc, item) => cAcc + item.costPrice * item.quantity,
      0
    );
    return acc + invCost;
  }, 0);

  // Gross profit on parts
  const grossProfitParts = Math.max(0, totalPartsSalesRevenue - totalCOGS);

  // Total gross income (parts profit + 100% labor margin)
  const totalGrossIncome = grossProfitParts + totalLaborIncome - totalInvoiceDiscounts;

  // Expenses
  const totalOperatingExpenses = filteredExpenses.reduce(
    (acc, exp) => acc + exp.amount,
    0
  );

  // Net Profit
  const netProfit = totalGrossIncome - totalOperatingExpenses;

  // Actual Cash Collected (Cash In hand / Digital bank collected in this period)
  const directSalesCollected = filteredInvoices.reduce(
    (acc, inv) => acc + inv.paidAmount,
    0
  );
  const customerDueCollected = filteredDuePayments
    .filter((p) => p.partyType === 'Customer')
    .reduce((acc, p) => acc + p.amount, 0);

  const supplierPaidOut = filteredDuePayments
    .filter((p) => p.partyType === 'Supplier')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalCashInflow = directSalesCollected + customerDueCollected;
  const totalCashOutflow = totalOperatingExpenses + supplierPaidOut;
  const netCashMovement = totalCashInflow - totalCashOutflow;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString(),
      category: expenseCategory,
      amount: expenseAmount,
      recipient: expenseRecipient.trim() || 'Counter Expense',
      paymentMethod: expensePaymentMethod,
      description: expenseDesc.trim() || expenseCategory,
    };

    onAddExpense(newExpense);
    setIsExpenseModalOpen(false);
    setExpenseAmount(100);
    setExpenseRecipient('');
    setExpenseDesc('');
  };

  // Combine unified activity journal
  const journalEntries = useMemo(() => {
    const list: {
      id: string;
      date: string;
      title: string;
      subtitle: string;
      type: 'IN' | 'OUT';
      amount: number;
      method: string;
      category: string;
    }[] = [];

    filteredInvoices.forEach((inv) => {
      list.push({
        id: inv.id,
        date: inv.date,
        title: `Sales Invoice ${inv.invoiceNumber}`,
        subtitle: `${inv.customerName} (${inv.items.length} parts, ${inv.laborItems.length} labor)`,
        type: 'IN',
        amount: inv.paidAmount,
        method: inv.paymentMethod,
        category: 'Sale Cash In',
      });
    });

    filteredExpenses.forEach((exp) => {
      list.push({
        id: exp.id,
        date: exp.date,
        title: exp.description || exp.category,
        subtitle: `Paid to ${exp.recipient} (${exp.category})`,
        type: 'OUT',
        amount: exp.amount,
        method: exp.paymentMethod,
        category: exp.category,
      });
    });

    filteredDuePayments.forEach((due) => {
      if (due.partyType === 'Customer') {
        list.push({
          id: due.id,
          date: due.date,
          title: `Due Collected from ${due.partyName}`,
          subtitle: due.notes || due.reference || 'Installment collected',
          type: 'IN',
          amount: due.amount,
          method: due.paymentMethod,
          category: 'Customer Baki Joma',
        });
      } else {
        list.push({
          id: due.id,
          date: due.date,
          title: `Paid to Supplier ${due.partyName}`,
          subtitle: due.notes || due.reference || 'Wholesaler bill paid',
          type: 'OUT',
          amount: due.amount,
          method: due.paymentMethod,
          category: 'Supplier Mahajani Baki',
        });
      }
    });

    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredInvoices, filteredExpenses, filteredDuePayments]);

  return (
    <div className="space-y-5">
      {/* Time Range Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100">
              Accounts &amp; Cashbook (দৈনিক জমা-খরচ ও লাভ-ক্ষতি)
            </h3>
            <p className="text-xs text-neutral-400">
              Real-time daily hisab, sales revenue, parts cost, and net profit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
            {(['today', 'week', 'month', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  timeRange === r
                    ? 'bg-amber-400 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {r === 'today'
                  ? 'Today (আজ)'
                  : r === 'week'
                  ? 'Last 7 Days'
                  : r === 'month'
                  ? 'This Month'
                  : 'All Time'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-rose-400 hover:bg-rose-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Shop Expense</span>
          </button>
        </div>
      </div>

      {/* Main Financial KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Billed Sales */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Sales Billed</span>
            <Receipt className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-100 mt-1 tabular-nums">
            {formatBDT(totalBilledSales)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            Parts: {formatBDT(totalPartsSalesRevenue)} · Labor: {formatBDT(totalLaborIncome)}
          </div>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Parts Cost (COGS)</span>
            <TrendingDown className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-300 mt-1 tabular-nums">
            {formatBDT(totalCOGS)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            Parts Margin: {formatBDT(grossProfitParts)}
          </div>
        </div>

        {/* Shop Expenses */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Shop Expenses</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {formatBDT(totalOperatingExpenses)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            {filteredExpenses.length} expense records logged
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-amber-950/20">
          <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
            <span>Net Profit (নিট লাভ)</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatBDT(netProfit)}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            (Parts Profit + Labor) - Expenses
          </div>
        </div>
      </div>

      {/* Cash Drawer Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-950 border border-neutral-800 p-4 rounded-xl text-xs">
        <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 border border-neutral-850">
          <div>
            <span className="text-neutral-400 block text-[11px]">Total Cash Inflow</span>
            <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
              + {formatBDT(totalCashInflow)}
            </span>
          </div>
          <div className="text-right text-[10px] text-neutral-500">
            Counter Sales + Due Collected
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 border border-neutral-850">
          <div>
            <span className="text-neutral-400 block text-[11px]">Total Cash Outflow</span>
            <span className="font-mono text-base font-bold text-rose-400 tabular-nums">
              - {formatBDT(totalCashOutflow)}
            </span>
          </div>
          <div className="text-right text-[10px] text-neutral-500">
            Shop Expenses + Supplier Paid
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 border border-neutral-850">
          <div>
            <span className="text-neutral-400 block text-[11px]">Net Cash Drawer Surplus</span>
            <span className="font-mono text-base font-bold text-neutral-100 tabular-nums">
              {formatBDT(netCashMovement)}
            </span>
          </div>
          <div className="text-right text-[10px] text-neutral-500">
            Liquid In-hand Balance
          </div>
        </div>
      </div>

      {/* Unified Transaction Journal */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
            Cashbook Journal Ledger ({journalEntries.length} transactions)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Transaction / Memo</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Inflow (জমা)</th>
                <th className="py-3 px-4 text-right">Outflow (খরচ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {journalEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No transactions recorded in this period.
                  </td>
                </tr>
              ) : (
                journalEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-850/50">
                    <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                      {formatDateTime(item.date)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-200">{item.title}</div>
                      <div className="text-[11px] text-neutral-500">{item.subtitle}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium text-neutral-400">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 uppercase text-[10px] font-semibold text-neutral-300">
                      {item.method}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {item.type === 'IN' ? (
                        <span className="text-emerald-400">{formatBDT(item.amount)}</span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {item.type === 'OUT' ? (
                        <span className="text-rose-400">{formatBDT(item.amount)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                <span>Log Shop Daily Expense (খরচের হিসাব)</span>
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Expense Category:</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Amount (BDT):</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 font-mono font-bold text-rose-400 text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Recipient / Paid To:
                </label>
                <input
                  type="text"
                  value={expenseRecipient}
                  onChange={(e) => setExpenseRecipient(e.target.value)}
                  placeholder="e.g. Dulal Chayer Dokan or Sundarban Courier"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Payment Mode:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Cash', 'bKash', 'Nagad', 'Bank'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setExpensePaymentMethod(m)}
                      className={`py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                        expensePaymentMethod === m
                          ? 'bg-rose-400 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Description / Details:</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g. Courier charges for spare parts carton from Dhaka"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-400 hover:bg-rose-300 text-neutral-950 font-bold rounded-lg cursor-pointer"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
