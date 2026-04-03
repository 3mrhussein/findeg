"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";

interface PageStateErrorProps {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}

/**
 * Shared page-level error state with optional retry action.
 */
export function PageStateError({ title, description, retryLabel, onRetry }: PageStateErrorProps) {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
        {retryLabel && onRetry ? (
          <Button className="mt-6" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </Container>
  );
}
