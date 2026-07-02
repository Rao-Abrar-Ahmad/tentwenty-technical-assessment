"use client";
import React, { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import DateRangeFilter from "./_components/DateRangeFilter";
import StatusFilter from "./_components/StatusFilter";
import TimesheetsTable from "./_components/TimesheetsTable";
import PaginationControls from "./_components/PaginationControls";
import { httpClient } from "@/lib/httpClient";

export default function TimesheetsDashboardPage() {
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

        const res = await httpClient<any>(`/api/timesheets?${params.toString()}`);
        if (res) {
          setRows(res.rows);
          setTotal(res.total);
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
    <div className="bg-white rounded-xl card-shadow p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Your Timesheets
          </h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start md:items-center justify-start gap-3">
        <div className="block min-w-[260px]">
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
  );
}
