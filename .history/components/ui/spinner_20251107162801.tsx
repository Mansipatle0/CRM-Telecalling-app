// app/components/ui/spinner.tsx
import React from "react";

export function Spinner() {
  return (
    <div className="flex items-center justify-center p-2">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
    </div>
  );
}
