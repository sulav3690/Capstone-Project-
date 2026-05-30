import React from 'react';
import Card from './Card';

const StatCard = ({ label, value, color = 'bg-primary-green', subLabel }) => {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
        {subLabel && <span className="text-sm text-gray-400 mb-1">{subLabel}</span>}
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full mt-1">
        <div className={`h-full rounded-full ${color}`} style={{ width: value }}></div>
      </div>
    </Card>
  );
};

export default StatCard;
