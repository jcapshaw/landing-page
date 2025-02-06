"use client";

import { useState, useEffect } from "react";
import type { FC } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot
} from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Salesperson {
  id: string;
  name: string;
  status: Status;
  upStartTime?: number;
}

type Status = "OFF" | "w/Customer" | "Available" | "Up Next" | "Up Now";

const initialSalespeople: Salesperson[] = [
  { id: "1", name: "Alice", status: "Available" },
  { id: "2", name: "Bob", status: "Up Next" },
  { id: "3", name: "Charlie", status: "OFF" },
  { id: "4", name: "Diana", status: "w/Customer" }
];

const statuses: Status[] = ["Up Now", "Up Next", "Available", "w/Customer", "OFF"];

const getStatusColor = (status: Status): string => {
  switch (status) {
    case "Up Now":
      return "bg-green-500 hover:bg-green-600";
    case "Up Next":
      return "bg-blue-500 hover:bg-blue-600";
    case "Available":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "w/Customer":
      return "bg-purple-500 hover:bg-purple-600";
    case "OFF":
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

const NextUpPage: FC = () => {
  const [salespeople, setSalespeople] = useState<Salesperson[]>(initialSalespeople);

  const getSalespeopleByStatus = (status: Status): Salesperson[] => {
    return salespeople.filter((sp: Salesperson) => sp.status === status);
  };

  const moveToUpNow = (salespersonId: string): void => {
    setSalespeople((prev: Salesperson[]) => {
      const newSalespeople = prev.map((sp: Salesperson) => ({...sp}));
      const currentUpNow = newSalespeople.find((sp: Salesperson) => sp.status === "Up Now");
      
      if (currentUpNow) {
        currentUpNow.status = "Available";
        currentUpNow.upStartTime = undefined;
      }
      
      const targetPerson = newSalespeople.find((sp: Salesperson) => sp.id === salespersonId);
      if (targetPerson) {
        targetPerson.status = "Up Now";
        targetPerson.upStartTime = Date.now();
      }
      
      return newSalespeople;
    });
  };

  const onDragEnd = (result: DropResult): void => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Status;

    setSalespeople((prev: Salesperson[]) => {
      const newSalespeople = [...prev];
      const personIndex = newSalespeople.findIndex((sp: Salesperson) => sp.id === draggableId);
      
      if (personIndex === -1) return prev;
      
      const person = newSalespeople[personIndex];
      const oldStatus = person.status;
      
      person.status = newStatus;
      
      if (oldStatus === "Up Now") {
        person.upStartTime = undefined;
      } else if (newStatus === "Up Now") {
        const currentUpNow = newSalespeople.find(
          (sp: Salesperson) => sp.status === "Up Now" && sp.id !== person.id
        );
        if (currentUpNow) {
          currentUpNow.status = "Available";
          currentUpNow.upStartTime = undefined;
        }
        person.upStartTime = Date.now();
      }
      
      const statusPeople = newSalespeople.filter((sp: Salesperson) => sp.status === newStatus);
      const otherPeople = newSalespeople.filter((sp: Salesperson) => sp.status !== newStatus);
      
      statusPeople.splice(destination.index, 0, person);
      
      return [...otherPeople, ...statusPeople];
    });
  };

  const [elapsedTime, setElapsedTime] = useState<string>('0:00');
  const upNowPerson = salespeople.find((sp: Salesperson) => sp.status === "Up Now");

  useEffect(() => {
    if (!upNowPerson?.upStartTime) {
      setElapsedTime('0:00');
      return;
    }

    const startTime = upNowPerson.upStartTime;
    const intervalId = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [upNowPerson?.upStartTime]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Salesperson Rotation</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statuses.map((status: Status) => {
            const salespeopleForStatus = getSalespeopleByStatus(status);
            return (
              <Droppable droppableId={status} key={status}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <Card className="h-[500px]">
                    <div className="p-4 border-b">
                      <Badge className={`${getStatusColor(status)} text-white`}>
                        {status}
                        {status === "Up Now" && (
                          <span className="ml-2 font-normal">({elapsedTime})</span>
                        )}
                      </Badge>
                    </div>
                    <ScrollArea className="h-[420px]">
                      <CardContent 
                        className={`p-4 min-h-[400px] ${snapshot.isDraggingOver ? 'bg-slate-100' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {salespeopleForStatus.map((sp: Salesperson, index: number) => (
                          <Draggable
                            draggableId={sp.id}
                            index={index}
                            key={sp.id}
                          >
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-2 p-4 rounded-lg border bg-white shadow-sm ${
                                  snapshot.isDragging ? 'ring-2 ring-primary' : ''
                                }`}
                              >
                                <div className="font-medium">{sp.name}</div>
                                {(sp.status === "Available" || sp.status === "Up Next") && (
                                  <Button
                                    onClick={() => moveToUpNow(sp.id)}
                                    className="w-full mt-2"
                                    variant="secondary"
                                    size="sm"
                                  >
                                    Move to Up Now
                                  </Button>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </CardContent>
                    </ScrollArea>
                  </Card>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default NextUpPage;