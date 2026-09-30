import React, { useState } from 'react';
import { PartItem, ProductCategory } from '../types';
import { generateBarcode } from '../utils/formatters';
import { Package, X } from 'lucide-react';

interface NewPartModalProps {
  onSave: (part: PartItem) => void;
  onClose: () => void;
  editingPart?: PartItem | null;
}

const CATEGORIES: ProductCategory[] = [
  'Engine & Transmission',
  'Lubricants & Fluids',
  'Braking System',
  'Electrical & Lighting',
  'Tires & Wheels',
  'Body & Suspension',
  'Cables & Levers',
  'Chain & Sprockets',
  'Accessories & Helmets',
  'Bearings & Seals',
];

export const NewPartModal: React.FC<NewPartModalProps> = ({
  onSave,
  onClose,
  editingPart,
}) => {
  const [sku, setSku] = useState(editingPart?.sku || '');
  const [barcode, setBarcode] = useState(editingPart?.barcode || generateBarcode());
  const [name, setName] = useState(editingPart?.name || '');
  const [banglaName, setBanglaName] = useState(editingPart?.banglaName || '');
  const [category, setCategory] = useState<ProductCategory>(
    editingPart?.category || 'Engine & Transmission'
  );
  const [brand, setBrand] = useState(editingPart?.brand || '');
  const [compatibleBikesText, setCompatibleBikesText] = useState(
    editingPart?.compatibleBikes.join(', ') || ''
  );
  const [costPrice, setCostPrice] = useState<number>(editingPart?.costPrice || 0);
  const [sellingPrice, setSellingPrice] = useState<number>(editingPart?.sellingPrice || 0);
  const [stockQuantity, setStockQuantity] = useState<number>(editingPart?.stockQuantity || 0);
  const [minStockAlert, setMinStockAlert] = useState<number>(editingPart?.minStockAlert || 5);
  const [unit, setUnit] = useState(editingPart?.unit || 'Pcs');
  const [rackLocation, setRackLocation] = useState(editingPart?.rackLocation || 'Rack A-1');
  const [notes, setNotes] = useState(editingPart?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Part name is required.');
      return;
    }

    const bikes = compatibleBikesText
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const partData: PartItem = {
      id: editingPart?.id || `part-${Date.now()}`,
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: barcode.trim() || generateBarcode(),
      name: name.trim(),
      banglaName: banglaName.trim() || undefined,
      category,
      brand: brand.trim() || 'Generic Genuine',
      compatibleBikes: bikes.length > 0 ? bikes : ['Universal / All Models'],
      costPrice: Math.max(0, costPrice),
      sellingPrice: Math.max(0, sellingPrice),
      stockQuantity: Math.max(0, stockQuantity),
      minStockAlert: Math.max(0, minStockAlert),
      unit: unit || 'Pcs',
      rackLocation: rackLocation.trim() || 'Main Shelf',
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(partData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4 my-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-100">
              {editingPart ? 'Edit Spare Part Details' : 'Add New Spare Part to Inventory'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Part Name (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rolon Chain Sprocket Kit"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Bangla Name (Optional)
              </label>
              <input
                type="text"
                value={banglaName}
                onChange={(e) => setBanglaName(e.target.value)}
                placeholder="e.g. রোলন চেইন স্প্রোকেট কিট"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-hidden focus:border-amber-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Brand / Manufacturer</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Motul, Bajaj Genuine, NGK"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Unit of Measure</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-hidden focus:border-amber-400"
              >
                <option value="Pcs">Pcs</option>
                <option value="Bottle">Bottle (Litre)</option>
                <option value="Set">Set</option>
                <option value="Pair">Pair</option>
                <option value="Can">Can / Spray</option>
                <option value="Roll">Roll</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">SKU / Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. MOT-7100-10W40"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 font-mono text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Barcode / QR Tag</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 font-mono text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Cost Price (BDT) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 font-mono text-neutral-100 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Selling Price (BDT) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 font-mono font-bold text-amber-400 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 font-mono text-neutral-100 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Low Stock Alert</label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 font-mono text-neutral-100 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Compatible Motorcycle Models
              </label>
              <input
                type="text"
                value={compatibleBikesText}
                onChange={(e) => setCompatibleBikesText(e.target.value)}
                placeholder="e.g. Pulsar 150, FZ-S V2/V3, Apache 160 4V (comma separated)"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Shop Rack / Shelf Location
              </label>
              <input
                type="text"
                value={rackLocation}
                onChange={(e) => setRackLocation(e.target.value)}
                placeholder="e.g. Rack A-2, Bin C-4, Tire Stand"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg transition-colors cursor-pointer"
            >
              {editingPart ? 'Save Changes' : 'Add Part to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
