import React from 'react';
import { SkeletonPage } from '@/components/ui/Skeleton';

/**
 * Loading state for individual page view
 * Shows skeleton blocks while page content loads
 */
export default function PageLoading() {
  return (
    <div className="main-content">
      <SkeletonPage />
    </div>
  );
}
