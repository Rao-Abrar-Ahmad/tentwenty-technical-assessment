"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProgressBarProps {
  hours: number;
}

export default function ProgressBar({ hours }: ProgressBarProps) {
  const percentage = Math.min((hours / 40) * 100, 100);
  const roundedPercentage = Math.round(percentage);

  return (
    <TooltipProvider>
      <div className="space-y-1">
        <div className="flex justify-end">
          <span className="text-xs font-medium text-gray-500">
            {roundedPercentage}%
          </span>
        </div>
        <Tooltip>
          <TooltipTrigger className={'w-full h-2.5 rounded-full bg-gray-200 overflow-hidden cursor-default'}>
            <div
              className="h-full rounded-full bg-orange-400 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </TooltipTrigger>
          <TooltipContent className={''}>
            <p className="text-sm">
              <span className="font-semibold">{hours}</span> / 40 hours
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}