"use client";

import React from 'react';
import Spinner from '@/components/ui/loading-spinner';

export default function LoaderDemo() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#1d2630' }}>
      <h1 className="text-3xl font-bold mb-8 text-center text-white">Loading Spinner Demo</h1>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-center text-white">Default Spinner</h2>
          <Spinner 
            onComplete={() => console.log('Spinner completed')} 
          />
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-center text-white">Another Instance</h2>
          <Spinner 
            onComplete={() => console.log('Second spinner completed')}
          />
        </div>
      </div>
    </div>
  );
}