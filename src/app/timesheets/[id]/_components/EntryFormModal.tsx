"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Plus, Minus, LoaderCircle } from "lucide-react";
import { PROJECTS, TYPES_OF_WORK } from "@/lib/constants";
import { entryInputSchema } from "@/lib/zodSchemas";

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    project: string;
    typeOfWork: string;
    taskDescription: string;
    hoursWorked: number;
    date: Date;
  }) => void;
  initialData?: {
    project: string;
    typeOfWork: string;
    taskDescription: string;
    hoursWorked: number;
    date: string;
  };
  targetDate: Date;
  loading: boolean;
}

export default function EntryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  targetDate,
  loading
}: EntryFormModalProps) {
  const [project, setProject] = useState<string>("");
  const [typeOfWork, setTypeOfWork] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [hoursWorked, setHoursWorked] = useState<number>(8);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setProject(initialData.project);
      setTypeOfWork(initialData.typeOfWork);
      setTaskDescription(initialData.taskDescription);
      setHoursWorked(initialData.hoursWorked);
    } else {
      setProject("");
      setTypeOfWork("");
      setTaskDescription("");
      setHoursWorked(8);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      date: targetDate,
      project,
      typeOfWork,
      taskDescription,
      hoursWorked,
    };

    const validation = entryInputSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const fieldName = err.path[0] as string;
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleDecrement = () => {
    setHoursWorked((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setHoursWorked((prev) => prev + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-white px-0 py-0 border-0 shadow-xl rounded-xl">
        <DialogHeader className="border-b border-gray-200 pb-2 px-3 py-2">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {initialData ? "Edit Entry" : "Add New Entry"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="px-3">
            <div className="space-y-1.5 max-w-96 me-auto">
              <div className="flex items-center space-x-1.5">
                <label className="text-sm font-medium text-gray-900">Select Project *</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Select the project you worked on
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={project} onValueChange={(val) => val !== null && setProject(val)}>
                <SelectTrigger className="border-gray-200 w-full rounded-md">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECTS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project && <p className="text-xs text-red-500 py-1">{errors.project}</p>}
            </div>

            <div className="space-y-1.5 max-w-96 me-auto">
              <div className="flex items-center space-x-1.5">
                <label className="text-sm font-semibold text-gray-700">Type of Work </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Select the type of work performed
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={typeOfWork} onValueChange={(val) => val !== null && setTypeOfWork(val)}>
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue placeholder="Select type of work" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_OF_WORK.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.typeOfWork && <p className="text-xs text-red-500 py-1">{errors.typeOfWork}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">
                Task Description *
              </label>
              <Textarea
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Write text here..."
                className="border-gray-200 h-24 resize-none"
              />
              <p className="text-xs text-gray-500">a note for extra info</p>
              {errors.taskDescription && <p className="text-xs text-red-500 py-1">{errors.taskDescription}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 block">Hours *</label>
              <div className="flex rounded-md border border-gray-200 w-fit overflow-hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  className="h-8 w-8 rounded-none border-none bg-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-12 h-8 flex items-center justify-center text-center font-medium text-gray-900 text-base border-r border-l border-gray-200">
                  {hoursWorked}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  className="h-8 w-8 rounded-none border-none bg-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {errors.hoursWorked && <p className="text-xs text-red-500 mt-0.5">{errors.hoursWorked}</p>}
            </div>
          </div>

          <div className="px-3 py-4 border-t border-gray-100 flex justify-between gap-3 relative bg-transparent w-full m-0 overflow-hidden">
            <Button
              type="button"
              variant="outline"
              size={'default'}
              onClick={onClose}
              className="text-gray-500 h-10 hover:text-gray-900 px-0 py-3 flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size={'default'}
              className=" btn-primary flex-1 bg-[#1C64F2] hover:bg-blue-700 text-white font-medium px-5 animate-pulse-once"
            >
              {initialData ? "Save" : "Add Entry"}
              {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

