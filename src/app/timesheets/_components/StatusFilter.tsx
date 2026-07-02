"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusFilterProps {
  status: string;
  setStatus: (status: string) => void;
}

export default function StatusFilter({ status, setStatus }: StatusFilterProps) {
  return (
    <Select value={status} onValueChange={(val) => val !== null && setStatus(val)}>
      <SelectTrigger className="w-[180px] border-gray-200 hover:bg-gray-50 transition-colors rounded-sm">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All Statuses</SelectItem>
        <SelectItem value="Missing">Missing</SelectItem>
        <SelectItem value="Incomplete">Incomplete</SelectItem>
        <SelectItem value="Completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  );
}
