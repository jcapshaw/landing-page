import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AccessDeniedProps {
  message?: string;
  action?: string;
  role?: string;
}

export function AccessDenied({
  message = "You don't have permission to perform this action.",
  action = "this action",
  role = "higher access level"
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h3 className="text-lg font-semibold text-yellow-700 mb-2">Access Denied</h3>
      <p className="text-yellow-600 mb-4">{message}</p>
      <p className="text-sm text-yellow-600">
        {`To ${action}, you need a ${role}.`}
      </p>
    </div>
  );
}