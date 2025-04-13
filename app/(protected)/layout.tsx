import ProtectedLayout from "@/app/components/ProtectedLayout";
import { ReactNode } from "react";

export default function ProtectedRouteLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}