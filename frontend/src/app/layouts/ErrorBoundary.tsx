import {
  Component,
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
} from "react";

type FallbackRender = (args: {
  error: unknown;
  resetErrorBoundary: () => void;
}) => ReactNode;

export interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?:
    | ReactNode
    | ComponentType<{ error: unknown; resetErrorBoundary?: () => void }>;
  fallbackRender?: FallbackRender;

  // если поменялись resetKeys — сбрасываем ошибку (например, при смене роута)
  resetKeys?: readonly unknown[];

  // сюда можно прокинуть react-query reset (или любую очистку)
  onReset?: () => void;
}

interface ErrorBoundaryState {
  error: unknown | null;
}

function areResetKeysEqual(a?: readonly unknown[], b?: readonly unknown[]) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("Uncaught error in ErrorBoundary:", error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.error &&
      !areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    const { fallback: Fallback, fallbackRender, children } = this.props;

    if (error != null) {
      if (fallbackRender) {
        return fallbackRender({ error, resetErrorBoundary: this.resetErrorBoundary });
      }

      if (Fallback) {
        if (typeof Fallback === "function") {
          const FallbackComponent = Fallback as ComponentType<{
            error: unknown;
            resetErrorBoundary?: () => void;
          }>;
          return (
            <FallbackComponent
              error={error}
              resetErrorBoundary={this.resetErrorBoundary}
            />
          );
        }
        return Fallback;
      }
    }

    return children;
  }
}
