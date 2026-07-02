"use client";
import React from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Entry {
  _id: string;
  project: string;
  typeOfWork: string;
  taskDescription: string;
  hoursWorked: number;
}

interface EntryRowProps {
  entry: Entry;
  onEdit: () => void;
  onDelete: () => void;
  isReadOnly: boolean;
}

export default function EntryRow({
  entry,
  onEdit,
  onDelete,
  isReadOnly,
}: EntryRowProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-3 py-2 rounded-md border border-gray-200 bg-white hover:border-gray-200 transition-all">
      <div className="">
        <p className="text-gray-900 text-base font-medium leading-relaxed break-words">
          {entry.taskDescription}
        </p>
      </div>

      <div className="flex items-center space-x-3 shrink-0 w-full md:w-auto">
        <span className="text-sm font-normal text-gray-400">
          {entry.hoursWorked} hrs
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#E1EFFE] text-[#1E429F] border border-blue-100/50">
          {entry.project}
        </span>

        {!isReadOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto md:ml-0 h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer"
                />
              }
            >
              <MoreVertical className="h-4 w-4 rotate-90" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-100 shadow-md">
              <DropdownMenuItem
                onClick={onEdit}
                className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer flex items-center"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer flex items-center"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
