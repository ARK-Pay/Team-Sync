import React from 'react';

const ChannelDetailsModal = ({ channel, onClose }) => {
  if (!channel) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{channel.channel} Channel Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reach:</span>
            <span className="font-medium">{channel.reach.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Engagement:</span>
            <span className="font-medium">{channel.engagement.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Conversion:</span>
            <span className="font-medium">{channel.conversion.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Conversion Rate:</span>
            <span className="font-medium text-green-600">{((channel.conversion / channel.reach) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetailsModal;
