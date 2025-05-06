"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import type { FC } from "react";
import { getActiveProspects, type Prospect } from "@/lib/prospects";
import { Timestamp } from "firebase/firestore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

const HotProspects: FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const allProspects = await getActiveProspects();
        setProspects(allProspects);
      } catch (error) {
        console.error("Error fetching prospects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProspects();
  }, []);

  // Calculate stats
  const totalHotProspects = prospects.length;
  const now = Date.now();
  const seventyTwoHoursMs = 72 * 60 * 60 * 1000;
  const addedLast72Hours = prospects.filter((p) => {
    if (!p.date || typeof p.date.toMillis !== "function") return false;
    return now - p.date.toMillis() <= seventyTwoHoursMs;
  }).length;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="dashboard-title">Hot Prospects</CardTitle>
        <CardDescription className="dashboard-subtitle">
          Overview of your current hot prospects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Hot Prospects</span>
              <span className="text-sm font-bold">{totalHotProspects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Added in Last 72 Hours
              </span>
              <span className="text-sm font-bold">{addedLast72Hours}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HotProspects;
