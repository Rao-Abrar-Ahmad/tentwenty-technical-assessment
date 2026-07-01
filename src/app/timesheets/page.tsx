"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { DateRange } from "react-day-picker";
import DateRangeFilter from "@/components/timesheets/DateRangeFilter";
import StatusFilter from "@/components/timesheets/StatusFilter";
import TimesheetsTable from "@/components/timesheets/TimesheetsTable";
import PaginationControls from "@/components/timesheets/PaginationControls";
import { Clock, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TimesheetsDashboardPage() {
  const { data: session } = useSession();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    to.setDate(to.getDate() + 7);
    
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - 30);
    
    return { from, to };
  });

  const [status, setStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("week");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;

    const fetchTimesheets = async () => {
      setLoading(true);
      try {
        const fromStr = dateRange.from!.toISOString();
        const toStr = dateRange.to!.toISOString();
        
        const params = new URLSearchParams({
          from: fromStr,
          to: toStr,
          status,
          sortBy,
          sortDir,
          page: String(page),
          pageSize: String(pageSize),
        });

        const res = await fetch(`/api/timesheets?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRows(data.rows);
          setTotal(data.total);
        } else {
          console.error("Failed to fetch timesheets");
        }
      } catch (err) {
        console.error("Error fetching timesheets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheets();
  }, [dateRange, status, sortBy, sortDir, page, pageSize]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#1C64F2] p-2 rounded-lg text-white">
              <Clock className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Timesheet Manager
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <div className="h-8 w-8 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center font-semibold border border-blue-100">
                {session?.user?.name ? session.user.name.charAt(0) : <User className="h-4 w-4" />}
              </div>
              <span className="hidden sm:inline font-medium">
                {session?.user?.name || "Loading..."}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Your Timesheets
              </h1>
              <p className="text-sm text-gray-500">
                View, create, and update your weekly logs.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
            <div className="flex-1 min-w-[260px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Date Range
              </label>
              <DateRangeFilter date={dateRange} setDate={setDateRange} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <StatusFilter status={status} setStatus={(val) => { setStatus(val); setPage(1); }} />
            </div>
          </div>

          <div className="space-y-4">
            <TimesheetsTable
              rows={rows}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              loading={loading}
            />
            
            <PaginationControls
              page={page}
              pageSize={pageSize}
              total={total}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
