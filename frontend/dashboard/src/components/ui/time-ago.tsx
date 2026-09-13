'use client';

import { formatDistanceToNow } from 'date-fns';

interface TimeAgoProps {
  date: Date | string | number;
  addSuffix?: boolean;
}

export function TimeAgo({ date, addSuffix = true }: TimeAgoProps) {
  const d = new Date(date);

  const isClient = typeof window !== 'undefined';

  return (
    <span suppressHydrationWarning>
      {isClient ? formatDistanceToNow(d, { addSuffix }) : d.toLocaleDateString()}
    </span>
  );
}
