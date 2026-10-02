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
} from '../types';
import {
  initialParts,
  initialServices,
  initialCustomers,
  initialSuppliers,
  initialInvoices,
  initialJobCards,
  initialExpenses,
  initialDuePayments,
  initialMechanics,
  initialShopSettings,
  initialUsers,
} from '../data/seedData';

const STORAGE_KEYS = {
  PARTS: 'tms_parts_v1',
  SERVICES: 'tms_services_v1',
  CUSTOMERS: 'tms_customers_v1',
  SUPPLIERS: 'tms_suppliers_v1',
  INVOICES: 'tms_invoices_v1',
  JOB_CARDS: 'tms_job_cards_v1',
  EXPENSES: 'tms_expenses_v1',
  DUE_PAYMENTS: 'tms_due_payments_v1',
  MECHANICS: 'tms_mechanics_v1',
  SETTINGS: 'tms_settings_v1',
  USERS: 'tms_users_v1',
  CURRENT_USER: 'tms_current_user_v1',
};

function getOrInit<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read from localStorage for ${key}`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage for ${key}`, err);
  }
}

export const AppStorage = {
  getParts: (): PartItem[] => getOrInit(STORAGE_KEYS.PARTS, initialParts),
  saveParts: (items: PartItem[]) => setItem(STORAGE_KEYS.PARTS, items),

  getServices: (): ServiceItem[] => getOrInit(STORAGE_KEYS.SERVICES, initialServices),
  saveServices: (items: ServiceItem[]) => setItem(STORAGE_KEYS.SERVICES, items),

  getCustomers: (): Customer[] => getOrInit(STORAGE_KEYS.CUSTOMERS, initialCustomers),
  saveCustomers: (items: Customer[]) => setItem(STORAGE_KEYS.CUSTOMERS, items),

  getSuppliers: (): Supplier[] => getOrInit(STORAGE_KEYS.SUPPLIERS, initialSuppliers),
  saveSuppliers: (items: Supplier[]) => setItem(STORAGE_KEYS.SUPPLIERS, items),

  getInvoices: (): Invoice[] => getOrInit(STORAGE_KEYS.INVOICES, initialInvoices),
  saveInvoices: (items: Invoice[]) => setItem(STORAGE_KEYS.INVOICES, items),

  getJobCards: (): JobCard[] => getOrInit(STORAGE_KEYS.JOB_CARDS, initialJobCards),
  saveJobCards: (items: JobCard[]) => setItem(STORAGE_KEYS.JOB_CARDS, items),

  getExpenses: (): ExpenseRecord[] => getOrInit(STORAGE_KEYS.EXPENSES, initialExpenses),
  saveExpenses: (items: ExpenseRecord[]) => setItem(STORAGE_KEYS.EXPENSES, items),

  getDuePayments: (): DuePaymentRecord[] => getOrInit(STORAGE_KEYS.DUE_PAYMENTS, initialDuePayments),
  saveDuePayments: (items: DuePaymentRecord[]) => setItem(STORAGE_KEYS.DUE_PAYMENTS, items),

  getMechanics: (): Mechanic[] => getOrInit(STORAGE_KEYS.MECHANICS, initialMechanics),
  saveMechanics: (items: Mechanic[]) => setItem(STORAGE_KEYS.MECHANICS, items),

  getSettings: (): ShopSettings => getOrInit(STORAGE_KEYS.SETTINGS, initialShopSettings),
  saveSettings: (items: ShopSettings) => setItem(STORAGE_KEYS.SETTINGS, items),

  getUsers: (): UserAccount[] => getOrInit(STORAGE_KEYS.USERS, initialUsers),
  saveUsers: (items: UserAccount[]) => setItem(STORAGE_KEYS.USERS, items),

  getCurrentUser: (): UserAccount | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  saveCurrentUser: (user: UserAccount | null) => {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      setItem(STORAGE_KEYS.CURRENT_USER, user);
    }
  },

  resetAllToDefault: () => {
    localStorage.removeItem(STORAGE_KEYS.PARTS);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.JOB_CARDS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.DUE_PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.MECHANICS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  exportFullBackup: (): string => {
    const data = {
      parts: AppStorage.getParts(),
      services: AppStorage.getServices(),
      customers: AppStorage.getCustomers(),
      suppliers: AppStorage.getSuppliers(),
      invoices: AppStorage.getInvoices(),
      jobCards: AppStorage.getJobCards(),
      expenses: AppStorage.getExpenses(),
      duePayments: AppStorage.getDuePayments(),
      mechanics: AppStorage.getMechanics(),
      settings: AppStorage.getSettings(),
      exportedAt: new Date().toISOString(),
      app: 'Tahomid Motoshop Accounts & Inventory',
    };
    return JSON.stringify(data, null, 2);
  },

  importFullBackup: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.parts) AppStorage.saveParts(data.parts);
      if (data.services) AppStorage.saveServices(data.services);
      if (data.customers) AppStorage.saveCustomers(data.customers);
      if (data.suppliers) AppStorage.saveSuppliers(data.suppliers);
      if (data.invoices) AppStorage.saveInvoices(data.invoices);
      if (data.jobCards) AppStorage.saveJobCards(data.jobCards);
      if (data.expenses) AppStorage.saveExpenses(data.expenses);
      if (data.duePayments) AppStorage.saveDuePayments(data.duePayments);
      if (data.mechanics) AppStorage.saveMechanics(data.mechanics);
      if (data.settings) AppStorage.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  },
};
