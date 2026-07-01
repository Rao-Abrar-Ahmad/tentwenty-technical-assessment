"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Clock, LogOut, ArrowLeft, Plus, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/timesheet-detail/ProgressBar";
import EntryRow from "@/components/timesheet-detail/EntryRow";
import EntryFormModal from "@/components/timesheet-detail/EntryFormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Entry {
  _id: string;
  date: string;
  project: string;
  typeOfWork: string;
  taskDescription: string;
  hoursWorked: number;
}

interface TimesheetData {
  _id: string;
  year: number;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  entries: Entry[];
}

export default function TimesheetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();

  const [timesheet, setTimesheet] = useState<TimesheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | undefined>(undefined);
  const [activeDate, setActiveDate] = useState<Date>(new Date());

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [entryIdToDelete, setEntryIdToDelete] = useState<string | null>(null);

  const fetchTimesheet = async () => {
    try {
      const res = await fetch(`/api/timesheets/${id}`);
      if (res.status === 404) {
        setError("Timesheet not found");
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTimesheet(data);
      } else {
        setError("Failed to load timesheet");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTimesheet();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-550 animate-pulse font-medium">Loading timesheet...</div>
      </div>
    );
  }

  if (error || !timesheet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="text-red-500 font-bold text-lg">{error || "Something went wrong"}</div>
        <Button onClick={() => router.push("/timesheets")} className="bg-[#1C64F2] text-white">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const totalHours = timesheet.entries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
  const isReadOnly = totalHours >= 40;

  const weekdays = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(timesheet.weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    weekdays.push(d);
  }

  const isSameUTCDate = (d1: Date, d2: Date) => {
    return (
      d1.getUTCFullYear() === d2.getUTCFullYear() &&
      d1.getUTCMonth() === d2.getUTCMonth() &&
      d1.getUTCDate() === d2.getUTCDate()
    );
  };

  const handleAddClick = (date: Date) => {
    setSelectedEntry(undefined);
    setActiveDate(date);
    setModalOpen(true);
  };

  const handleEditClick = (entry: Entry, date: Date) => {
    setSelectedEntry(entry);
    setActiveDate(date);
    setModalOpen(true);
  };

  const handleDeleteClick = (entryId: string) => {
    setEntryIdToDelete(entryId);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    const url = selectedEntry
      ? `/api/timesheets/${id}/entries/${selectedEntry._id}`
      : `/api/timesheets/${id}/entries`;
    
    const method = selectedEntry ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedTimesheet = await res.json();
        setTimesheet(updatedTimesheet);
        setModalOpen(false);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save entry");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving");
    }
  };

  const confirmDelete = async () => {
    if (!entryIdToDelete) return;

    try {
      const res = await fetch(`/api/timesheets/${id}/entries/${entryIdToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const updatedTimesheet = await res.json();
        setTimesheet(updatedTimesheet);
        setDeleteOpen(false);
        setEntryIdToDelete(null);
      } else {
        alert("Failed to delete entry");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting");
    }
  };

  const formatDayLabel = (date: Date) => {
    const day = date.getUTCDate();
    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    return `${day} ${month}`;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleString("en-US", { weekday: "long", timeZone: "UTC" });
  };

  const formatHeaderRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const startDay = start.getUTCDate();
    const startMonth = start.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    
    const endDay = end.getUTCDate();
    const endMonth = end.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    
    if (startMonth !== endMonth) {
      return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
    }
    
    return `${startDay}–${endDay} ${startMonth}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/timesheets")}
              className="text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-gray-900 tracking-tight">
                Week {timesheet.weekNumber} Details
              </span>
            </div>
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 pb-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  This Week Timesheet
                </h1>
              </div>
              <p className="text-sm font-semibold text-gray-500">
                {formatHeaderRange(timesheet.weekStart, timesheet.weekEnd)}
              </p>
            </div>
            
            <div className="w-full sm:w-64">
              <ProgressBar hours={totalHours} />
            </div>
          </div>

          <div className="space-y-8">
            {weekdays.map((dayDate) => {
              const dayEntries = timesheet.entries.filter((entry) =>
                isSameUTCDate(new Date(entry.date), dayDate)
              );

              return (
                <div key={dayDate.toISOString()} className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                  
                  <div className="w-full md:w-1/5 pt-1 select-none">
                    <span className="block font-bold text-gray-900 text-sm">
                      {getDayName(dayDate)}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      {formatDayLabel(dayDate)}
                    </span>
                  </div>

                  <div className="w-full md:w-4/5 space-y-3">
                    {dayEntries.map((entry) => (
                      <EntryRow
                        key={entry._id}
                        entry={entry}
                        onEdit={() => handleEditClick(entry, dayDate)}
                        onDelete={() => handleDeleteClick(entry._id)}
                        isReadOnly={isReadOnly}
                      />
                    ))}

                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        onClick={() => handleAddClick(dayDate)}
                        className="w-full justify-center border-dashed border-gray-200 text-[#1C64F2] hover:bg-blue-50/50 hover:border-blue-300 font-semibold py-5 rounded-xl transition-all cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add new task
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <EntryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedEntry}
        targetDate={activeDate}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-white border-0 rounded-xl shadow-xl max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-bold text-lg">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-555 text-sm">
              This action will permanently delete this task entry from your timesheet. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-3">
            <AlertDialogCancel className="text-gray-550 hover:text-gray-900 border-gray-200 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-650 hover:bg-red-750 text-white font-medium cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
