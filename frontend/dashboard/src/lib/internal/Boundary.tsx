'use client';

import React, { useRef, useEffect, useState } from 'react';

import { useBoundaryMode } from './BoundaryProvider';
import { cn } from '../utils';

type RenderingType = 'static' | 'dynamic' | 'hybrid';
type HydrationType = 'server' | 'client' | 'hybrid';

type Props = {
  children: React.ReactNode;
  rendering?: RenderingType;
  hydration?: HydrationType;
  label?: string;
  showLabel?: boolean;
  cached?: boolean;
};

const renderingColors = {
  dynamic: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
  hybrid: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20',
  static: 'border-red-500 bg-red-50 dark:bg-red-950/20',
} as const;

const componentColors = {
  client: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
  hybrid: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20',
  server: 'border-red-500 bg-red-50 dark:bg-red-950/20',
} as const;

/**
 *
 */
export default function Boundary({
  children,
  rendering,
  hydration,
  label,
  showLabel = true,
  cached = false,
}: Props) {
  const { mode } = useBoundaryMode();

  if (mode === 'off') {
    return <>{children}</>;
  }

  const showRendering = mode === 'rendering' && rendering;
  const showComponent = mode === 'hydration' && hydration;

  if (!showRendering && !showComponent) {
    return <>{children}</>;
  }

  let colorClasses = '';
  let labelText = '';
  let labelColor = '';

  if (showRendering) {
    colorClasses = renderingColors[rendering!];
    if (showLabel) {
      labelText = label || `${rendering} rendering`;
      labelColor =
        rendering === 'dynamic'
          ? 'text-blue-700 dark:text-blue-300'
          : rendering === 'hybrid'
            ? 'text-purple-700 dark:text-purple-300'
            : 'text-red-700 dark:text-red-300';
    }
  } else if (showComponent) {
    colorClasses = componentColors[hydration!];
    if (showLabel) {
      labelText = label || `${hydration} component`;
      labelColor =
        hydration === 'client'
          ? 'text-blue-700 dark:text-blue-300'
          : hydration === 'hybrid'
            ? 'text-purple-700 dark:text-purple-300'
            : 'text-red-700 dark:text-red-300';
    }
  }

  // Determine circle color for small mode
  let circleColorClasses = '';
  if (showRendering) {
    circleColorClasses =
      rendering === 'dynamic'
        ? 'border-blue-500'
        : rendering === 'hybrid'
          ? 'border-purple-500'
          : 'border-red-500';
  } else if (showComponent) {
    circleColorClasses =
      hydration === 'client'
        ? 'border-blue-500'
        : hydration === 'hybrid'
          ? 'border-purple-500'
          : 'border-red-500';
  }

  return (
    <div
      className={cn(
        'relative rounded-md border-2 border-dashed @container', // Tailwind 4 Container Queries
        colorClasses,
      )}
    >
      {/* Small mode indicator (circle) - only visible if container is very small */}
      <div
        className={cn(
          'absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-dashed z-50',
          'hidden @max-w-[60px]:block @max-h-[60px]:block',
          circleColorClasses,
        )}
        title={labelText || 'Boundary indicator'}
      />

      {/* Large mode label - only visible if container has enough space */}
      {showLabel && labelText && (
        <div className="absolute -top-2 left-2 z-10 flex gap-2 @max-w-[60px]:hidden @max-h-[60px]:hidden">
          <div
            className={cn(
              'rounded border bg-white px-2 py-0.5 font-mono text-xs font-normal lowercase shadow-sm dark:bg-black',
              labelColor,
            )}
          >
            {labelText}
          </div>
          {cached && mode === 'rendering' && (
            <div className="rounded border border-green-500 bg-green-50 px-2 py-0.5 font-mono text-xs font-normal text-green-700 lowercase shadow-sm dark:bg-green-950/20 dark:text-green-300">
              cached
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
