import React, { useState } from 'react';

const CampaignFilterDropdown = ({ filters, applyFilters, campaignNames, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Campaign Name</label>
        <select
          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
          value={localFilters.name}
          onChange={e => setLocalFilters(f => ({ ...f, name: e.target.value }))}
        >
          <option value="">All</option>
          {campaignNames.map((name, idx) => (
            <option key={idx} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Min Sent</label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
          value={localFilters.minSent}
          onChange={e => setLocalFilters(f => ({ ...f, minSent: e.target.value }))}
          min="0"
        />
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Max Sent</label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
          value={localFilters.maxSent}
          onChange={e => setLocalFilters(f => ({ ...f, maxSent: e.target.value }))}
          min="0"
        />
      </div>
      <button
        className="w-full bg-blue-600 text-white py-1.5 rounded-md text-sm hover:bg-blue-700"
        onClick={() => { applyFilters(localFilters); onClose && onClose(); }}
      >
        Apply Filter
      </button>
    </div>
  );
};

export default CampaignFilterDropdown;
