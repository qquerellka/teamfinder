import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  useAuth();

  return <>{children}</>;
}
