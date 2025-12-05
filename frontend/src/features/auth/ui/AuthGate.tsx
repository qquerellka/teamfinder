import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isLoading, isError } = useAuth();

  if (isLoading) {
    return <div>Загрузка…</div>; // сюда можно воткнуть нормальный full-screen loader
  }

  if (isError) {
    return <div>Ошибка авторизации. Обновите страницу.</div>;
  }

  return <>{children}</>;
}
