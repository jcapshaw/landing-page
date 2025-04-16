"use client"

import React, { useState } from 'react';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const LoaderDemo = () => {
  const [showSpinner, setShowSpinner] = useState(false);
  const [spinnerSize, setSpinnerSize] = useState<'small' | 'medium' | 'large'>('medium');

  const toggleSpinner = () => {
    setShowSpinner(prev => !prev);
    
    if (!showSpinner) {
      // Auto-hide spinner after 4 seconds
      setTimeout(() => {
        setShowSpinner(false);
      }, 4000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Spinner Component</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            onClick={() => { setSpinnerSize('small'); toggleSpinner(); }}
            variant={spinnerSize === 'small' ? 'default' : 'outline'}
          >
            Small
          </Button>
          <Button 
            onClick={() => { setSpinnerSize('medium'); toggleSpinner(); }}
            variant={spinnerSize === 'medium' ? 'default' : 'outline'}
          >
            Medium
          </Button>
          <Button 
            onClick={() => { setSpinnerSize('large'); toggleSpinner(); }}
            variant={spinnerSize === 'large' ? 'default' : 'outline'}
          >
            Large
          </Button>
        </div>
        
        <div className="flex justify-center items-center min-h-[300px] bg-gray-50 rounded-lg">
          {showSpinner ? (
            <Spinner size={spinnerSize} onComplete={() => setShowSpinner(false)} />
          ) : (
            <Button onClick={toggleSpinner}>Show Spinner</Button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Page Transitions</h2>
        <p className="mb-4">
          Navigate between pages to see the loading animation in action:
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
          <Link href="/inventory">
            <Button>Inventory</Button>
          </Link>
          <Link href="/daily-log">
            <Button>Daily Log</Button>
          </Link>
          <Link href="/service-request">
            <Button>Service Request</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoaderDemo;