import {
  Component,
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
} from "react";

export interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode | ComponentType<{ error: unknown }>;
}

interface ErrorBoundaryState {
  error: unknown | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // сюда можно повесить Sentry / логирование
    console.error("Uncaught error in ErrorBoundary:", error, info);
  }

  render() {
    const { error } = this.state;
    const { fallback: Fallback, children } = this.props;

    if (error != null && Fallback) {
      if (typeof Fallback === "function") {
        const FallbackComponent = Fallback as ComponentType<{ error: unknown }>;
        return <FallbackComponent error={error} />;
      }
      return Fallback;
    }

    return children;
  }
}
