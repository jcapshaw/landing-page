"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Prospect, Note } from "@/lib/prospects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ProspectsTableProps {
  prospects: Prospect[];
  onEditClick: (prospect: Prospect) => void;
  onDispositionChange?: (id: string, disposition: string) => void;
  onAddNote?: (id: string, note: string) => void;
  currentUser?: string;
}

export function ProspectsTable({
  prospects,
  onEditClick,
  onDispositionChange,
  onAddNote,
  currentUser = "Unknown User"
}: ProspectsTableProps) {
  const [newNote, setNewNote] = useState("");

  const handleAddNote = (id: string) => {
    if (newNote.trim() && onAddNote) {
      onAddNote(id, newNote.trim());
      setNewNote("");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Added
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deal/Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Salesperson
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Desk Manager
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deposit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              OOS
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Disposition
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prospects.map((prospect) => (
            <tr key={prospect.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(prospect.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {prospect.customerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {prospect.dealType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {prospect.salesperson}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {prospect.deskManager}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {prospect.hasDeposit
                  ? prospect.depositAmount || "Yes"
                  : "No"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {prospect.isOOS ? "Yes" : "No"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <Select
                  value={prospect.disposition}
                  onValueChange={(value) =>
                    onDispositionChange?.(prospect.id, value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select disposition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Working">Working</SelectItem>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(prospect)}
                >
                  Edit
                </Button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Notes</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Notes for {prospect.customerName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        {prospect.notes?.map((note, index) => (
                          <div key={index} className="mb-4 last:mb-0">
                            <div className="text-sm text-gray-500">
                              {note.userName} - {formatDate(note.timestamp)}
                            </div>
                            <div className="text-sm mt-1">{note.text}</div>
                          </div>
                        ))}
                        {(!prospect.notes || prospect.notes.length === 0) && (
                          <div className="text-sm text-gray-500">No notes yet</div>
                        )}
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Input
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddNote(prospect.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleAddNote(prospect.id)}
                          disabled={!newNote.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {prospects.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No prospects found
        </div>
      )}
    </div>
  );
}