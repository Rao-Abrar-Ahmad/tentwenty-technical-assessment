"use client";

import React from "react";

interface ProgressBarProps {
  hours: number;
}

export default function ProgressBar({ hours }: ProgressBarProps) {
  const percentage = Math.min((hours / 40) * 100, 100);
  const roundedPercentage = Math.round(percentage);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-gray-700">
          Logged Hours
        </span>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{hours}</span>
          <span className="text-sm font-medium text-gray-500">/40 hours</span>
          <span className="ml-2 text-sm font-bold text-[#1C64F2] bg-blue-50 px-2 py-0.5 rounded-md">
            {roundedPercentage}%
          </span>
        </div>
      </div>
      
      <div className="relative w-full h-3 bg-gray-150 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-[#1C64F2] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

