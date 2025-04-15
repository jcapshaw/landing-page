"use client"

import React from 'react';
import LoaderDemo from './components/LoaderDemo';

export default function LoadingDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Loading Animation Demo</h1>
      <p className="mb-6">
        This page demonstrates the consistent loading animations used across the app.
        The animations feature the Lifted Trucks logo and a spinning wheel/tire.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <LoaderDemo />
      </div>
    </div>
  );
}