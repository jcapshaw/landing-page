"use client";

import { useState, useEffect } from "react";
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
import styles from "./styles.module.css";

interface Salesperson {
  id: string;
  name: string;
  status: Status;
  upStartTime?: number; // Timestamp when person becomes Up Now
}

type Status = "OFF" | "w/Customer" | "Available" | "Up Next" | "Up Now";

const initialSalespeople: Salesperson[] = [
  { id: "1", name: "Alice", status: "Available" },
  { id: "2", name: "Bob", status: "Up Next" },
  { id: "3", name: "Charlie", status: "OFF" },
  { id: "4", name: "Diana", status: "w/Customer" }
];

const statuses: Status[] = ["Up Now", "Up Next", "Available", "w/Customer", "OFF"];

export default function NextUpPage() {
  const [salespeople, setSalespeople] = useState<Salesperson[]>(initialSalespeople);

  // Helper: Group salespeople by status
  const getSalespeopleByStatus = (status: Status) => {
    return salespeople.filter(sp => sp.status === status);
  };

  // Move salesperson to Up Now
  const moveToUpNow = (salespersonId: string) => {
    setSalespeople(prev => {
      const newSalespeople = prev.map(sp => ({...sp})); // Create deep copy
      const currentUpNow = newSalespeople.find(sp => sp.status === "Up Now");
      
      if (currentUpNow) {
        currentUpNow.status = "Available";
        currentUpNow.upStartTime = undefined; // Clear timestamp when moving out
      }
      
      const targetPerson = newSalespeople.find(sp => sp.id === salespersonId);
      if (targetPerson) {
        targetPerson.status = "Up Now";
        targetPerson.upStartTime = Date.now(); // Set timestamp when becoming Up Now
      }
      
      return newSalespeople;
    });
  };

  // Drag event handler
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Status;

    setSalespeople(prev => {
      const newSalespeople = [...prev];
      const personIndex = newSalespeople.findIndex(sp => sp.id === draggableId);
      
      if (personIndex === -1) return prev;
      
      const person = newSalespeople[personIndex];
      const oldStatus = person.status;
      
      // Update status and handle timestamps
      person.status = newStatus;
      
      // Handle Up Now status changes
      if (oldStatus === "Up Now") {
        person.upStartTime = undefined; // Clear timestamp when leaving Up Now
      } else if (newStatus === "Up Now") {
        // Clear any existing Up Now person
        const currentUpNow = newSalespeople.find(sp => sp.status === "Up Now" && sp.id !== person.id);
        if (currentUpNow) {
          currentUpNow.status = "Available";
          currentUpNow.upStartTime = undefined;
        }
        person.upStartTime = Date.now(); // Set timestamp for new Up Now
      }
      
      // Reorder within the same status
      const statusPeople = newSalespeople.filter(sp => sp.status === newStatus);
      const otherPeople = newSalespeople.filter(sp => sp.status !== newStatus);
      
      statusPeople.splice(destination.index, 0, person);
      
      return [...otherPeople, ...statusPeople];
    });
  };

  // Timer state for Up Now person
  const [elapsedTime, setElapsedTime] = useState<string>('0:00');
  const upNowPerson = salespeople.find(sp => sp.status === "Up Now");

  // Update timer every second
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
    <div className={styles.app}>
      <h1>Salesperson Rotation</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.columns}>
          {statuses.map(status => {
            const salespeopleForStatus = getSalespeopleByStatus(status);
            return (
              <Droppable droppableId={status} key={status}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div className={styles.column}>
                    <h2>
                      {status}
                      {status === "Up Now" && (
                        <span className={styles.timer}> - Up for {elapsedTime}</span>
                      )}
                    </h2>
                    <div 
                      className={`${styles.dropArea} ${snapshot.isDraggingOver ? styles.isDraggingOver : ''}`}
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                    >
                      {salespeopleForStatus.map((sp, index) => (
                        <Draggable
                          draggableId={sp.id}
                          index={index}
                          key={sp.id}
                        >
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div
                              className={`${styles.salespersonCard} ${snapshot.isDragging ? styles.isDragging : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div>{sp.name}</div>
                              {(sp.status === "Available" || sp.status === "Up Next") && (
                                <button
                                  onClick={() => moveToUpNow(sp.id)}
                                  className={styles.upNowButton}
                                >
                                  Move to Up Now
                                </button>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}