export type ProductCategory =
  | 'Engine & Transmission'
  | 'Lubricants & Fluids'
  | 'Braking System'
  | 'Electrical & Lighting'
  | 'Tires & Wheels'
  | 'Body & Suspension'
  | 'Cables & Levers'
  | 'Chain & Sprockets'
  | 'Accessories & Helmets'
  | 'Bearings & Seals';

export interface PartItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  banglaName?: string;
  category: ProductCategory;
  brand: string;
  compatibleBikes: string[]; // e.g. ["Pulsar 150", "FZ-S", "Apache 160 4V"]
  costPrice: number; // Purchase price in BDT
  sellingPrice: number; // Retail selling price in BDT
  stockQuantity: number;
  minStockAlert: number;
  unit: string; // 'Pcs', 'Litre', 'Set', 'Bottle', 'Pair'
  rackLocation: string; // e.g. 'Rack A-2', 'Shelf 3'
  notes?: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  banglaName?: string;
  standardCharge: number;
  estimatedMinutes: number;
  category: 'Tune-up' | 'Brakes' | 'Engine' | 'Electrical' | 'Washing & Lube' | 'Suspension';
}

export interface CartLineItem {
  partId: string;
  name: string;
  sku: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discount: number; // Flat discount on this line in BDT
  total: number;
  maxStock: number;
}

export interface CartLaborItem {
  id: string;
  serviceName: string;
  charge: number;
  mechanicId?: string;
  mechanicName?: string;
}

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Due';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. 'TMS-2026-1042'
  date: string; // ISO string
  customerName: string;
  customerPhone: string;
  bikeModel?: string;
  bikeRegNo?: string; // e.g. 'Dhaka Metro-HA 23-4567'
  customerId?: string;
  items: CartLineItem[];
  laborItems: CartLaborItem[];
  subtotalParts: number;
  subtotalLabor: number;
  discount: number; // Overall flat discount
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string; // TrxID or note
  jobCardId?: string;
  cashierName: string;
  notes?: string;
}

export type JobStatus = 'Pending' | 'In Progress' | 'Waiting for Parts' | 'Ready' | 'Delivered';

export interface JobCard {
  id: string;
  jobCardNumber: string; // e.g. 'JOB-2026-089'
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  bikeModel: string;
  bikeRegNo: string;
  currentOdoKm: number;
  assignedMechanicId: string;
  assignedMechanicName: string;
  customerReportedIssues: string[];
  diagnosticNotes: string;
  plannedServices: {
    serviceId?: string;
    serviceName: string;
    charge: number;
    done: boolean;
  }[];
  partsUsed: {
    partId: string;
    partName: string;
    quantity: number;
    unitPrice: number;
  }[];
  status: JobStatus;
  estimatedCompletionTime?: string;
  totalLaborCharge: number;
  totalPartsCharge: number;
  invoiceId?: string; // If already billed
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  bikeModel?: string;
  bikeRegNo?: string;
  totalSpent: number;
  totalDue: number;
  createdAt: string;
  lastVisit: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  address: string; // e.g. 'Chhoto Bazar, Netrokona' or 'Dhaka Wholesaler'
  categorySupplied: string; // e.g. 'Bajaj Genuine Parts', 'Engine Oils & Lubricants'
  totalPurchased: number;
  totalPayableDue: number; // Mahajani Baki
  lastPurchaseDate?: string;
  notes?: string;
}

export interface StockInRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierInvoiceNo: string;
  date: string;
  items: {
    partId: string;
    partName: string;
    quantity: number;
    purchaseRate: number;
    subtotal: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
}

export type ExpenseCategory =
  | 'Shop Rent'
  | 'Electricity Bill'
  | 'Mechanic Daily Allowance'
  | 'Tea & Refreshments'
  | 'Goods Transport (Chalan)'
  | 'Tools & Equipment'
  | 'Internet & Utility'
  | 'Miscellaneous';

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  recipient: string;
  paymentMethod: PaymentMethod;
  description: string;
}

export interface DuePaymentRecord {
  id: string;
  date: string;
  partyType: 'Customer' | 'Supplier';
  partyId: string;
  partyName: string;
  partyPhone: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  commissionRatePct: number; // e.g. 50% of labor or daily fixed
  active: boolean;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  banglaTitle: string;
  address: string;
  city: string;
  district: string;
  phonePrimary: string;
  phoneSecondary: string;
  bKashNumber: string;
  nagadNumber: string;
  invoiceFooterNotice: string;
  receiptFormat: 'Thermal80mm' | 'StandardA4';
  currencySymbol: string;
}
