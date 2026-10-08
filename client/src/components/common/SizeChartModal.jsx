import React from 'react';
import { X, Ruler, Info } from 'lucide-react';

const sizeData = [
  { size: 'S', bust: '36"', waist: '32"', hip: '38"', kurtaLength: '44"', pantLength: '38"', shoulder: '14.5"' },
  { size: 'M', bust: '38"', waist: '34"', hip: '40"', kurtaLength: '44.5"', pantLength: '38"', shoulder: '15"' },
  { size: 'L', bust: '40"', waist: '36"', hip: '42"', kurtaLength: '45"', pantLength: '38.5"', shoulder: '15.5"' },
  { size: 'XL', bust: '42"', waist: '38"', hip: '44"', kurtaLength: '45.5"', pantLength: '39"', shoulder: '16"' },
  { size: 'XXL', bust: '44"', waist: '40"', hip: '46"', kurtaLength: '46"', pantLength: '39"', shoulder: '16.5"' },
];

const SizeChartModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-brand-gold/20">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-brand-cream border-b border-brand-gold/20">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-brand-gold-dark" />
              <h3 className="font-serif text-lg font-bold text-brand-dark">
                Kurta Set Size Guide &amp; Measurements
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            <p className="text-xs text-gray-500 font-sans">
              All garment measurements are stated in <span className="font-semibold text-brand-dark">inches</span>. 
              Measurements represent the finished garment size. For the best festive fit, choose a garment size 2 inches larger than your body measurements.
            </p>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-center text-xs font-sans">
                <thead className="bg-brand-cream/60">
                  <tr>
                    <th scope="col" className="px-3 py-3 font-bold text-brand-dark uppercase tracking-wider">Size</th>
                    <th scope="col" className="px-3 py-3 font-semibold text-gray-700">Kurta Bust</th>
                    <th scope="col" className="px-3 py-3 font-semibold text-gray-700">Kurta Waist</th>
                    <th scope="col" className="px-3 py-3 font-semibold text-gray-700">Hip</th>
                    <th scope="col" className="px-3 py-3 font-semibold text-gray-700">Shoulder</th>
                    <th scope="col" className="px-3 py-3 font-semibold text-gray-700">Kurta Length</th>
                    <th scope="col" className="px-3 py-3 font-semibold text-gray-700">Pant Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {sizeData.map((row) => (
                    <tr key={row.size} className="hover:bg-brand-cream/30 transition-colors">
                      <td className="px-3 py-3 font-bold text-brand-magenta">{row.size}</td>
                      <td className="px-3 py-3 text-gray-700">{row.bust}</td>
                      <td className="px-3 py-3 text-gray-700">{row.waist}</td>
                      <td className="px-3 py-3 text-gray-700">{row.hip}</td>
                      <td className="px-3 py-3 text-gray-700">{row.shoulder}</td>
                      <td className="px-3 py-3 text-gray-700">{row.kurtaLength}</td>
                      <td className="px-3 py-3 text-gray-700">{row.pantLength}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Measurement Tips */}
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3 text-left">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-semibold">How to measure for ethnic sets:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                  <li><strong>Bust:</strong> Measure around the fullest part of your chest with a soft measuring tape.</li>
                  <li><strong>Waist:</strong> Measure at your natural narrowest waistline.</li>
                  <li><strong>Hips:</strong> Measure around the fullest part of your hips/seat.</li>
                  <li><strong>Dupatta:</strong> Standard festive dupatta length is 2.25 meters.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-brand-dark text-white hover:bg-gray-800 transition-colors"
            >
              Got it
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
