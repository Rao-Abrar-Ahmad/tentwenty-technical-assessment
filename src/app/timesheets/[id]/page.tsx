"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "./_components/ProgressBar";
import EntryRow from "./_components/EntryRow";
import EntryFormModal from "./_components/EntryFormModal";
import BackHeader from "./_components/BackHeader";
import DeleteEntry from "./_components/DeleteEntry";
import { formatDayLabel, formatHeaderRange, getDayName, isSameUTCDate } from "@/lib/utils";
import { httpClient } from "@/lib/httpClient";

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

  const [timesheet, setTimesheet] = useState<TimesheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | undefined>(undefined);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [entryIdToDelete, setEntryIdToDelete] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);


  const fetchTimesheet = async () => {
    try {
      const res = await httpClient<TimesheetData>(`/api/timesheets/${id}`);
      if (res) {
        setTimesheet(res);
      } else {
        setError("Timesheet not found");
        setLoading(false);
        return;
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
      setFormLoading(true);
      const res = await httpClient<TimesheetData>(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res) {
        setTimesheet(res);
        setModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entryIdToDelete) return;
    try {
      setFormLoading(true);
      const res = await httpClient<any>(`/api/timesheets/${id}/entries/${entryIdToDelete}`, {
        method: "DELETE",
      })
      if (res) {
        setTimesheet(res);
        setDeleteOpen(false);
        setEntryIdToDelete(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };





  return (
    <div className="space-y-4 flex flex-col">
      <BackHeader />
      <div className="bg-white rounded-xl card-shadow p-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-3">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {`This week’s timesheet`}
            </h1>
            <p className="text-sm font-normal text-gray-500">
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
                  <span className="block font-semibold text-gray-900 text-lg">
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
                      className="bg-[#E1EFFE] w-full justify-center border-dashed border-2 border-[#1A56DB] text-[#1C64F2] hover:bg-blue-50/50 hover:border-blue-300 font-medium py-5 rounded-xl transition-all cursor-pointer text-sm"
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
      <EntryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedEntry}
        targetDate={activeDate}
        loading={formLoading}
      />
      <DeleteEntry
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        confirmDelete={confirmDelete}
        loading={formLoading}
      />
    </div>
  );
}

