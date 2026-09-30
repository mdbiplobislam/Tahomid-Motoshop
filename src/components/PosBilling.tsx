import React, { useState, useMemo } from 'react';
import {
  PartItem,
  ServiceItem,
  Customer,
  Mechanic,
  CartLineItem,
  CartLaborItem,
  Invoice,
  PaymentMethod,
  ShopSettings,
} from '../types';
import { formatBDT, generateInvoiceNumber } from '../utils/formatters';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Wrench,
  UserCheck,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bike,
} from 'lucide-react';

interface PosBillingProps {
  parts: PartItem[];
  services: ServiceItem[];
  customers: Customer[];
  mechanics: Mechanic[];
  settings: ShopSettings;
  onCompleteSale: (invoice: Invoice, updatedParts: PartItem[], updatedCustomer?: Customer) => void;
  initialJobCardData?: {
    customerName: string;
    customerPhone: string;
    bikeModel: string;
    bikeRegNo: string;
    jobCardId: string;
    parts: { partId: string; quantity: number }[];
    services: { serviceName: string; charge: number }[];
  } | null;
  onClearInitialJobCard?: () => void;
}

const CATEGORIES = [
  'All',
  'Lubricants & Fluids',
  'Braking System',
  'Chain & Sprockets',
  'Electrical & Lighting',
  'Engine & Transmission',
  'Tires & Wheels',
  'Bearings & Seals',
];

const BIKE_MODELS = [
  'All Bikes',
  'Bajaj Pulsar 150',
  'Yamaha FZ-S',
  'Yamaha R15 / MT-15',
  'TVS Apache RTR 160',
  'Honda CB Shine',
  'Suzuki Gixxer',
  'Hero Hunk / Splendor',
];

export const PosBilling: React.FC<PosBillingProps> = ({
  parts,
  services,
  customers,
  mechanics,
  settings,
  onCompleteSale,
  initialJobCardData,
  onClearInitialJobCard,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBikeFilter, setSelectedBikeFilter] = useState('All Bikes');

  // Customer state
  const [customerMode, setCustomerMode] = useState<'walkin' | 'existing' | 'new'>('walkin');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('Walk-in Rider');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [bikeRegNo, setBikeRegNo] = useState('');

  // Cart
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [laborItems, setLaborItems] = useState<CartLaborItem[]>([]);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState('');
  const [cashierNotes, setCashierNotes] = useState('');

  // Service modal / quick picker
  const [showAddService, setShowAddService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceCharge, setCustomServiceCharge] = useState<number>(100);
  const [selectedMechanicId, setSelectedMechanicId] = useState(mechanics[0]?.id || '');

  // Prepopulate if incoming from workshop job card
  React.useEffect(() => {
    if (initialJobCardData) {
      setCustomerMode('new');
      setCustomerName(initialJobCardData.customerName || 'Customer');
      setCustomerPhone(initialJobCardData.customerPhone || '');
      setBikeModel(initialJobCardData.bikeModel || '');
      setBikeRegNo(initialJobCardData.bikeRegNo || '');

      // Load parts
      const loadedCart: CartLineItem[] = [];
      initialJobCardData.parts.forEach((item) => {
        const p = parts.find((pt) => pt.id === item.partId);
        if (p) {
          loadedCart.push({
            partId: p.id,
            name: p.name,
            sku: p.sku,
            unitPrice: p.sellingPrice,
            costPrice: p.costPrice,
            quantity: item.quantity,
            discount: 0,
            total: p.sellingPrice * item.quantity,
            maxStock: p.stockQuantity,
          });
        }
      });
      setCartItems(loadedCart);

      // Load services
      const loadedLabor: CartLaborItem[] = initialJobCardData.services.map((s, idx) => ({
        id: `labor-init-${idx}`,
        serviceName: s.serviceName,
        charge: s.charge,
        mechanicName: mechanics[0]?.name || 'Shop Mechanic',
      }));
      setLaborItems(loadedLabor);

      if (onClearInitialJobCard) {
        onClearInitialJobCard();
      }
    }
  }, [initialJobCardData]);

  // Handle existing customer selection
  const handleSelectExistingCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setBikeModel(found.bikeModel || '');
      setBikeRegNo(found.bikeRegNo || '');
    }
  };

  // Filtered Parts
  const filteredParts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return parts.filter((part) => {
      // Category match
      if (selectedCategory !== 'All' && part.category !== selectedCategory) {
        return false;
      }
      // Bike filter
      if (selectedBikeFilter !== 'All Bikes') {
        const matchesBike = part.compatibleBikes.some((b) =>
          b.toLowerCase().includes(selectedBikeFilter.toLowerCase().replace('all bikes', ''))
        );
        if (!matchesBike) return false;
      }
      // Text query
      if (!q) return true;
      return (
        part.name.toLowerCase().includes(q) ||
        part.sku.toLowerCase().includes(q) ||
        part.barcode.toLowerCase().includes(q) ||
        (part.banglaName && part.banglaName.toLowerCase().includes(q)) ||
        part.brand.toLowerCase().includes(q) ||
        part.compatibleBikes.some((b) => b.toLowerCase().includes(q))
      );
    });
  }, [parts, searchQuery, selectedCategory, selectedBikeFilter]);

  // Cart operations
  const addToCart = (part: PartItem) => {
    if (part.stockQuantity <= 0) {
      alert(`"${part.name}" is currently Out of Stock.`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.partId === part.id);
      if (existing) {
        if (existing.quantity >= part.stockQuantity) {
          alert(`Cannot add more than available stock (${part.stockQuantity} ${part.unit}).`);
          return prev;
        }
        return prev.map((item) =>
          item.partId === part.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice - item.discount,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            partId: part.id,
            name: part.name,
            sku: part.sku,
            unitPrice: part.sellingPrice,
            costPrice: part.costPrice,
            quantity: 1,
            discount: 0,
            total: part.sellingPrice,
            maxStock: part.stockQuantity,
          },
        ];
      }
    });
  };

  const updateQuantity = (partId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.partId === partId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.maxStock) {
              alert(`Maximum available stock is ${item.maxStock}.`);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice - item.discount,
            };
          }
          return item;
        })
        .filter(Boolean) as CartLineItem[]
    );
  };

  const updateItemDiscount = (partId: string, disc: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.partId === partId) {
          const discountVal = Math.max(0, Math.min(disc, item.unitPrice * item.quantity));
          return {
            ...item,
            discount: discountVal,
            total: item.unitPrice * item.quantity - discountVal,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (partId: string) => {
    setCartItems((prev) => prev.filter((item) => item.partId !== partId));
  };

  // Add Labor
  const handleAddLabor = () => {
    let name = customServiceName;
    let charge = customServiceCharge;
    const selectedSrv = services.find((s) => s.id === selectedServiceId);
    if (selectedSrv) {
      name = selectedSrv.name;
      charge = selectedSrv.standardCharge;
    }
    if (!name) {
      alert('Please enter or select a service name.');
      return;
    }

    const mech = mechanics.find((m) => m.id === selectedMechanicId);

    const newLabor: CartLaborItem = {
      id: `labor-${Date.now()}`,
      serviceName: name,
      charge: charge || 0,
      mechanicId: mech?.id,
      mechanicName: mech?.name || 'Workshop Mechanic',
    };

    setLaborItems((prev) => [...prev, newLabor]);
    setShowAddService(false);
    setSelectedServiceId('');
    setCustomServiceName('');
  };

  const removeLabor = (id: string) => {
    setLaborItems((prev) => prev.filter((l) => l.id !== id));
  };

  // Computations
  const subtotalParts = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.total, 0),
    [cartItems]
  );

  const subtotalLabor = useMemo(
    () => laborItems.reduce((acc, item) => acc + item.charge, 0),
    [laborItems]
  );

  const grandTotal = Math.max(0, subtotalParts + subtotalLabor - overallDiscount);

  // Default paid amount is grand total unless user modified it or payment method is 'Due'
  const computedPaid = useMemo(() => {
    if (paymentMethod === 'Due') return 0;
    if (paidAmountInput === '') return grandTotal;
    const val = parseFloat(paidAmountInput);
    return isNaN(val) ? 0 : Math.max(0, val);
  }, [paidAmountInput, grandTotal, paymentMethod]);

  const dueAmount = Math.max(0, grandTotal - computedPaid);

  const handleClearAll = () => {
    if (cartItems.length === 0 && laborItems.length === 0) return;
    if (confirm('Clear the current billing cart?')) {
      setCartItems([]);
      setLaborItems([]);
      setOverallDiscount(0);
      setPaidAmountInput('');
      setPaymentReference('');
      setCustomerMode('walkin');
      setCustomerName('Walk-in Rider');
      setCustomerPhone('');
      setBikeModel('');
      setBikeRegNo('');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0 && laborItems.length === 0) {
      alert('Your cart is empty. Add at least one spare part or workshop service.');
      return;
    }

    if (dueAmount > 0 && customerMode === 'walkin' && !customerPhone) {
      alert('For sales with Due balance (বকেয়া), please enter customer name and phone number so it can be recorded in the Baki Khata.');
      return;
    }

    // 1. Prepare invoice
    const invNumber = generateInvoiceNumber(Math.floor(1000 + Math.random() * 9000));
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      date: new Date().toISOString(),
      customerName: customerName || 'Walk-in Rider',
      customerPhone: customerPhone || 'N/A',
      bikeModel: bikeModel || undefined,
      bikeRegNo: bikeRegNo || undefined,
      customerId: selectedCustomerId || undefined,
      items: cartItems,
      laborItems: laborItems,
      subtotalParts,
      subtotalLabor,
      discount: overallDiscount,
      grandTotal,
      paidAmount: computedPaid,
      dueAmount,
      paymentMethod,
      paymentReference: paymentReference || undefined,
      cashierName: 'Tahomid (Proprietor)',
      notes: cashierNotes || undefined,
    };

    // 2. Deduct inventory
    const updatedParts = parts.map((pt) => {
      const line = cartItems.find((c) => c.partId === pt.id);
      if (line) {
        return {
          ...pt,
          stockQuantity: Math.max(0, pt.stockQuantity - line.quantity),
          updatedAt: new Date().toISOString(),
        };
      }
      return pt;
    });

    // 3. Update customer if existing or creating new
    let updatedCustomer: Customer | undefined;
    if (selectedCustomerId) {
      const ex = customers.find((c) => c.id === selectedCustomerId);
      if (ex) {
        updatedCustomer = {
          ...ex,
          totalSpent: ex.totalSpent + grandTotal,
          totalDue: ex.totalDue + dueAmount,
          lastVisit: new Date().toISOString(),
          bikeModel: bikeModel || ex.bikeModel,
          bikeRegNo: bikeRegNo || ex.bikeRegNo,
        };
      }
    } else if (customerPhone && customerName !== 'Walk-in Rider') {
      updatedCustomer = {
        id: `cust-${Date.now()}`,
        name: customerName,
        phone: customerPhone,
        bikeModel,
        bikeRegNo,
        totalSpent: grandTotal,
        totalDue: dueAmount,
        createdAt: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
      };
    }

    onCompleteSale(newInvoice, updatedParts, updatedCustomer);

    // Reset cart
    setCartItems([]);
    setLaborItems([]);
    setOverallDiscount(0);
    setPaidAmountInput('');
    setPaymentReference('');
    setCashierNotes('');
    setCustomerMode('walkin');
    setCustomerName('Walk-in Rider');
    setCustomerPhone('');
    setBikeModel('');
    setBikeRegNo('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Catalog & Item Selection (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search & Filter Header */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parts by name, SKU, barcode, brand, or bike model..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-neutral-950 font-semibold'
                    : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bike Model Filter */}
          <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-xs">
            <div className="flex items-center gap-2 text-neutral-400">
              <Bike className="w-3.5 h-3.5 text-amber-400" />
              <span>Bike Compatibility:</span>
            </div>
            <select
              value={selectedBikeFilter}
              onChange={(e) => setSelectedBikeFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-md px-2.5 py-1 focus:outline-hidden focus:border-amber-400"
            >
              {BIKE_MODELS.map((bike) => (
                <option key={bike} value={bike}>
                  {bike}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredParts.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <p className="text-sm font-semibold text-neutral-300">No spare parts found</p>
              <p className="text-xs text-neutral-500 mt-1">
                Try searching for a different keyword or bike model
              </p>
            </div>
          ) : (
            filteredParts.map((part) => {
              const inCart = cartItems.find((i) => i.partId === part.id);
              const isLow = part.stockQuantity <= part.minStockAlert;
              const isOut = part.stockQuantity <= 0;

              return (
                <div
                  key={part.id}
                  onClick={() => !isOut && addToCart(part)}
                  className={`group relative p-3.5 rounded-xl border transition-all select-none text-left ${
                    isOut
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-60 cursor-not-allowed'
                      : inCart
                      ? 'bg-amber-500/5 border-amber-400/50 shadow-xs cursor-pointer hover:border-amber-400'
                      : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 cursor-pointer hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">
                        {part.brand} · {part.sku}
                      </div>
                      <h4 className="text-xs font-bold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1 mt-0.5">
                        {part.name}
                      </h4>
                      {part.banglaName && (
                        <p className="text-[11px] text-neutral-400 line-clamp-1">
                          {part.banglaName}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-amber-400 font-mono tabular-nums">
                        {formatBDT(part.sellingPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Bike compatibility tags & Location */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] border-t border-neutral-800/70 pt-2">
                    <span className="text-neutral-400 truncate max-w-[170px]" title={part.compatibleBikes.join(', ')}>
                      {part.compatibleBikes.slice(0, 2).join(', ')}
                      {part.compatibleBikes.length > 2 && ' +more'}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-neutral-500 text-[9px]">{part.rackLocation}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums font-semibold ${
                          isOut
                            ? 'bg-rose-500/20 text-rose-400'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {isOut ? 'Out of stock' : `${part.stockQuantity} ${part.unit}`}
                      </span>
                    </div>
                  </div>

                  {inCart && (
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-neutral-950 text-[10px] font-extrabold font-mono w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                      {inCart.quantity}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Live Counter Bill & Checkout (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <span>Active Bill</span>
                <span className="text-xs font-mono font-medium text-neutral-400">
                  ({cartItems.length} parts, {laborItems.length} services)
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddService(true)}
                className="px-2.5 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>+ Labor</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                title="Clear Cart"
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Customer Selection Row */}
          <div className="p-3.5 bg-neutral-950/40 border-b border-neutral-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-medium">Customer:</span>
              <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('walkin');
                    setCustomerName('Walk-in Rider');
                    setCustomerPhone('');
                    setSelectedCustomerId('');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    customerMode === 'walkin'
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('existing')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    customerMode === 'existing'
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Existing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('new');
                    setCustomerName('');
                    setSelectedCustomerId('');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    customerMode === 'new'
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  + New
                </button>
              </div>
            </div>

            {customerMode === 'existing' && (
              <div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden focus:border-amber-400"
                >
                  <option value="">-- Choose registered customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.bikeModel || 'Bike'} {c.totalDue > 0 ? `[Due: ৳${c.totalDue}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(customerMode === 'new' || customerMode === 'existing') && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Mobile (017...)"
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
                />
                <input
                  type="text"
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                  placeholder="Bike Model (e.g. Pulsar 150)"
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
                />
                <input
                  type="text"
                  value={bikeRegNo}
                  onChange={(e) => setBikeRegNo(e.target.value)}
                  placeholder="Reg No (Netrokona-HA...)"
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="p-3 max-h-56 overflow-y-auto space-y-2">
            {cartItems.length === 0 && laborItems.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-xs">
                Cart is empty. Click parts on the left or add labor.
              </div>
            ) : (
              <>
                {/* Parts */}
                {cartItems.map((item) => (
                  <div
                    key={item.partId}
                    className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-neutral-200 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {item.sku} · {formatBDT(item.unitPrice)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center border border-neutral-800 rounded bg-neutral-900">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.partId, -1)}
                          className="px-1.5 py-1 text-neutral-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-neutral-100">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.partId, 1)}
                          className="px-1.5 py-1 text-neutral-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="w-16 text-right font-mono font-bold text-xs text-neutral-100 tabular-nums">
                        {formatBDT(item.total)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.partId)}
                        className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Labor items */}
                {laborItems.map((labor) => (
                  <div
                    key={labor.id}
                    className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-amber-300 truncate">
                        {labor.serviceName}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Mechanic: {labor.mechanicName || 'Shop'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-xs text-amber-300 tabular-nums">
                        {formatBDT(labor.charge)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLabor(labor.id)}
                        className="p-1 text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Pricing & Checkout Summary */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Parts Subtotal:</span>
                <span className="font-mono font-semibold text-neutral-200 tabular-nums">
                  {formatBDT(subtotalParts)}
                </span>
              </div>

              {subtotalLabor > 0 && (
                <div className="flex justify-between">
                  <span>Labor / Servicing:</span>
                  <span className="font-mono font-semibold text-amber-400 tabular-nums">
                    {formatBDT(subtotalLabor)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Special Discount:</span>
                <div className="flex items-center gap-1">
                  <span className="text-neutral-500 text-[10px]">৳</span>
                  <input
                    type="number"
                    min="0"
                    value={overallDiscount || ''}
                    onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-18 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-right font-mono text-xs text-neutral-200 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm font-bold text-neutral-100">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-amber-400 tabular-nums">
                  {formatBDT(grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2">
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['Cash', 'bKash', 'Nagad', 'Due'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method === 'Due') {
                        setPaidAmountInput('0');
                      } else {
                        setPaidAmountInput(String(grandTotal));
                      }
                    }}
                    className={`py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-amber-400 text-neutral-950 shadow-xs'
                        : 'bg-neutral-850 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Paid & Due Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-0.5 uppercase">
                    Paid Amount (জমা)
                  </label>
                  <input
                    type="number"
                    value={paidAmountInput}
                    onChange={(e) => setPaidAmountInput(e.target.value)}
                    placeholder={String(grandTotal)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 font-mono font-bold text-xs text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-0.5 uppercase">
                    Due Balance (বাকি)
                  </label>
                  <div
                    className={`px-2.5 py-1.5 rounded border font-mono font-bold text-xs tabular-nums ${
                      dueAmount > 0
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {formatBDT(dueAmount)}
                  </div>
                </div>
              </div>

              {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
                <div>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter TrxID or Sender Mobile No (optional)"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {/* Complete Sale Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={cartItems.length === 0 && laborItems.length === 0}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold rounded-xl transition-all shadow-md active:scale-99 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Complete &amp; Print Bill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Labor Modal */}
      {showAddService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Add Servicing Labor Charge</span>
              </h3>
              <button
                onClick={() => setShowAddService(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Select Predefined Service:
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    const s = services.find((sv) => sv.id === e.target.value);
                    if (s) {
                      setCustomServiceName(s.name);
                      setCustomServiceCharge(s.standardCharge);
                    }
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="">-- Or enter custom service below --</option>
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} — ৳{srv.standardCharge}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Service / Job Description:
                </label>
                <input
                  type="text"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="e.g. Master Servicing, Carburetor Clean, Wiring Fix..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">
                    Labor Fee (BDT):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customServiceCharge}
                    onChange={(e) => setCustomServiceCharge(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 font-mono font-bold text-amber-400 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">
                    Assigned Mechanic:
                  </label>
                  <select
                    value={selectedMechanicId}
                    onChange={(e) => setSelectedMechanicId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-hidden focus:border-amber-400"
                  >
                    {mechanics.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddService(false)}
                className="px-4 py-2 text-neutral-400 hover:text-neutral-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLabor}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-lg cursor-pointer"
              >
                Add to Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
