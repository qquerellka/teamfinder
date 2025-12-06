import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { LoaderPage } from "@/shared/ui/LoaderPage";

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isLoading, isError } = useAuth();

  if (isLoading) {
    return <LoaderPage />;
  }

  if (isError) {
    return <div>Ошибка авторизации. Обновите страницу.</div>;
  }

  return <>{children}</>;
}
