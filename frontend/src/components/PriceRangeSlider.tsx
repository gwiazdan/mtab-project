import React, { useState, useEffect } from 'react';

interface PriceRangeSliderProps {
  minPrice: number | null;
  maxPrice: number | null;
  onChange: (min: number | null, max: number | null) => void;
  minBound?: number;
  maxBound?: number;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minPrice,
  maxPrice,
  onChange,
  minBound = 0,
  maxBound = 1000,
}) => {
  const [minVal, setMinVal] = useState<string>(minPrice ? minPrice.toString() : '');
  const [maxVal, setMaxVal] = useState<string>(maxPrice ? maxPrice.toString() : '');

  useEffect(() => {
    setMinVal(minPrice ? minPrice.toString() : '');
    setMaxVal(maxPrice ? maxPrice.toString() : '');
  }, [minPrice, maxPrice]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1">Min</label>
        <input
          type="number"
          min={minBound}
          max={maxBound}
          step="10"
          value={minVal}
          onChange={(e) => {
            const val = e.target.value;
            setMinVal(val);
            onChange(val ? parseFloat(val) : null, maxVal ? parseFloat(maxVal) : null);
          }}
          className="w-full px-2 py-1.5 bg-neutral-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1">Max</label>
        <input
          type="number"
          min={minBound}
          max={maxBound}
          step="10"
          value={maxVal}
          onChange={(e) => {
            const val = e.target.value;
            setMaxVal(val);
            onChange(minVal ? parseFloat(minVal) : null, val ? parseFloat(val) : null);
          }}
          className="w-full px-2 py-1.5 bg-neutral-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          placeholder={maxBound.toString()}
        />
      </div>
    </div>
  );
};

export default PriceRangeSlider;
