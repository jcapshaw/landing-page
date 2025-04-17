import { Suspense } from "react";

// Move the entire client logic into a separate component
import SoldLogClientPage from "./SoldLogClientPage";

export default function SoldLogPage() {
  return (
    <Suspense>
      <SoldLogClientPage />
    </Suspense>
  );
}

// --- Client component moved from this file to SoldLogClientPage.tsx ---