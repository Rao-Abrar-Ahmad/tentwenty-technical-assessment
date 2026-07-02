"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { formatWeekRange } from "@/lib/status";

interface TimesheetRow {
  id: string | null;
  weekNumber: number;
  year: number;
  weekStart: string;
  weekEnd: string;
  status: "Missing" | "Incomplete" | "Completed";
  action: "Create" | "Update" | "View";
}

interface TimesheetsTableProps {
  rows: TimesheetRow[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  loading: boolean;
}

export default function TimesheetsTable({
  rows,
  sortBy,
  sortDir,
  onSort,
  loading,
}: TimesheetsTableProps) {
  const router = useRouter();
  const [creatingRowIndex, setCreatingRowIndex] = useState<number | null>(null);

  const handleAction = async (row: TimesheetRow, index: number) => {
    if (row.action === "Create") {
      setCreatingRowIndex(index);
      try {
        const res = await fetch("/api/timesheets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            year: row.year,
            weekNumber: row.weekNumber,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          router.push(`/timesheets/${data.id}`);
        } else {
          console.error("Failed to create timesheet");
        }
      } catch (err) {
        console.error("Error creating timesheet:", err);
      } finally {
        setCreatingRowIndex(null);
      }
    } else {
      router.push(`/timesheets/${row.id}`);
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-blue-600" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case "Incomplete":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
            Incomplete
          </span>
        );
      case "Missing":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-pink-100 text-pink-800">
            Missing
          </span>
        );
    }
  };

  const getActionButton = (row: TimesheetRow, index: number) => {
    const isCreating = creatingRowIndex === index;

    switch (row.action) {
      case "Create":
        return (
          <Button
            size="sm"
            onClick={() => handleAction(row, index)}
            disabled={isCreating}
            variant="link"
            className="text-primary-600 font-normal"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        );
      case "Update":
        return (
          <Button
            variant="link"
            size="sm"
            onClick={() => handleAction(row, index)}
            className="text-primary-600 font-normal"
          >
            Update
          </Button>
        );
      case "View":
      default:
        return (
          <Button
            variant="link"
            size="sm"
            onClick={() => handleAction(row, index)}
            className="text-primary-600 font-normal transition-all"
          >
            View
          </Button>
        );
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-sm bg-white card-shadow">
      <Table>
        <TableHeader className="bg-gray-50 select-none text-xs text-gray-500">
          <TableRow>
            <TableHead className="w-[150px]">
              <button
                onClick={() => onSort("week")}
                className="flex items-center hover:text-gray-900 font-semibold cursor-pointer"
              >
                Week # {renderSortIcon("week")}
              </button>
            </TableHead>
            <TableHead className="">
              <button
                onClick={() => onSort("date")}
                className="flex items-center hover:text-gray-900 font-semibold cursor-pointer"
              >
                Date {renderSortIcon("date")}
              </button>
            </TableHead>
            <TableHead className="w-[180px] ">
              <button
                onClick={() => onSort("status")}
                className="flex items-center hover:text-gray-900 font-semibold cursor-pointer"
              >
                Status {renderSortIcon("status")}
              </button>
            </TableHead>
            <TableHead className="w-[120px] text-center pr-6">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="py-4 bg-gray-50">
                  <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse" />
                </TableCell>
                <TableCell className="py-4 text-right pr-6">
                  <div className="h-8 bg-gray-100 rounded w-16 ml-auto animate-pulse" />
                </TableCell>
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-gray-500 font-medium">
                No timesheets found in this date range.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={`${row.year}-W${row.weekNumber}`}
                className="hover:bg-gray-50/50 transition-colors text-sm"
              >
                <TableCell className=" text-gray-900 py-4 bg-gray-50">
                  Week {row.weekNumber}
                </TableCell>
                <TableCell className="text-gray-600 py-4">
                  {formatWeekRange(row.weekStart, row.weekEnd)}
                </TableCell>
                <TableCell className="py-4">
                  {getStatusBadge(row.status)}
                </TableCell>
                <TableCell className="text-right pr-6 py-4 text-center">
                  {getActionButton(row, index)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
