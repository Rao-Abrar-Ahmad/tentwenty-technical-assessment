"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export default function PaginationControls({
  page,
  pageSize,
  total,
  setPage,
  setPageSize,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(total / pageSize) || 1;

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-gray-100 bg-white">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Rows per page:</span>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => {
            if (val === null) return;
            setPageSize(Number(val));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[70px] h-8 border-gray-200">
            <SelectValue placeholder={String(pageSize)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
          </SelectContent>
        </Select>
        <span className="hidden sm:inline">
          • Showing {startIdx} to {endIdx} of {total} weeks
        </span>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          disabled={page === 1}
          className="h-8 w-8 p-0 border-gray-200 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p) => (
          <Button
            key={p}
            variant={page === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPage(p)}
            className={`h-8 w-8 p-0 ${
              page === p
                ? "bg-[#1C64F2] hover:bg-blue-700 text-white font-medium"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={page === totalPages}
          className="h-8 w-8 p-0 border-gray-200 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
