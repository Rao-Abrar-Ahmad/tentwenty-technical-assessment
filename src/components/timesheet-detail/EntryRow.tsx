"use client";

import React from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
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
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm hover:border-gray-200 transition-all">
      <div className="space-y-1.5 flex-1 min-w-0 pr-4">
        <p className="text-gray-900 text-sm font-medium leading-relaxed break-words">
          {entry.taskDescription}
        </p>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100/50">
            {entry.project}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-200">
            {entry.typeOfWork}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <span className="text-sm font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
          {entry.hoursWorked} hrs
        </span>
        
        {!isReadOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer"
                />
              }
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-100 shadow-md">
              <DropdownMenuItem
                onClick={onEdit}
                className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer flex items-center"
              >
                <Edit2 className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer flex items-center"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
