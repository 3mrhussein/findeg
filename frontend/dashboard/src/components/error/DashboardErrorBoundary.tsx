/**
 * Dashboard Error Boundary Component (Phase 6.3: T138)
 *
 * React Error Boundary that gracefully handles errors in dashboard widgets.
 * Displays a user-friendly error card instead of crashing the page.
 *
 * Usage:
 * <DashboardErrorBoundary fallback={<ErrorFallback />}>
 *   <SomeWidget />
 * </DashboardErrorBoundary>
 */

"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@findeg/ui";

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  widgetName?: string;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

/**
 * Error Boundary for dashboard widgets
 * Catches rendering errors and displays graceful fallback
 */
export class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error("[DashboardErrorBoundary]", this.props.widgetName, error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Track error count to prevent infinite loops
    this.setState((prev) => ({
      errorCount: prev.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6"
          role="alert"
        >
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                {this.props.widgetName
                  ? `${this.props.widgetName} Failed to Load`
                  : "Widget Failed to Load"}
              </h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                An error occurred while loading this widget. Please try again.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-3 text-xs text-red-700 dark:text-red-300">
                  <summary className="cursor-pointer font-mono">Error Details</summary>
                  <pre className="mt-2 overflow-auto bg-red-100/50 dark:bg-red-900/30 p-2 rounded">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <Button
                onClick={this.handleReset}
                size="sm"
                variant="outline"
                className="mt-4 text-red-600 border-red-200 hover:bg-red-100 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error fallback component
 */
export function ErrorFallback({
  title = "Something went wrong",
  message = "We encountered an error loading this widget. Please refresh the page.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 p-4">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">{title}</h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="mt-2 text-yellow-600 border-yellow-200"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
