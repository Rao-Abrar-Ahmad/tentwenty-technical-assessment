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
    <div className="flex flex-col sm:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Select
          value={String(pageSize)}
          onValueChange={(val) => {
            if (val === null) return;
            setPageSize(Number(val));
            setPage(1);
          }}
        >
          <SelectTrigger className=" h-8 border-gray-200 rounded-md bg-[#F9FAFB]"
            style={{
              boxShadow: "0px 1px 0.5px 0.05px #1D293D05",
            }}>
            <SelectValue placeholder={`${pageSize} per page`}>
              <span className="">{pageSize} per page</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full flex justify-end">
        <div className="pagination-wrapper flex items-center justify-end border border-gray-200 rounded-md w-fit">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={page === 1}
            className="h-9 w-auto px-2 py-1 rounded-t-md border-none disabled:opacity-50"
          >
            Previous
          </Button>

          {pages.map((p) => (
            <Button
              key={p}
              variant={page === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
              className={`pagination-button h-9 w-8 p-0 m-0 bg-transparent rounded-none ${page === p
                ? "text-[#1C64F2] bg-transparent font-medium"
                : " text-gray-600 hover:bg-gray-50"
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
            className="h-9 w-auto px-2 rounded-none bg-transparent border-none disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
