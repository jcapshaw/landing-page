'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { getActiveProspects, type Prospect } from '@/lib/prospects';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const HotProspects: FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const allProspects = await getActiveProspects();
        setProspects(allProspects);
      } catch (error) {
        console.error('Error fetching prospects:', error);
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
  const addedLast72Hours = prospects.filter(p => {
    if (!p.date) return false;
    const prospectDate = new Date(p.date).getTime();
    return now - prospectDate <= seventyTwoHoursMs;
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
              <span className="dashboard-subtitle">Total Hot Prospects</span>
              <span className="dashboard-title">{totalHotProspects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="dashboard-subtitle">Added in Last 72 Hours</span>
              <span className="dashboard-title">{addedLast72Hours}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HotProspects;