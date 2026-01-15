import React from 'react';
import { SkeletonDatabase } from '@/components/ui/Skeleton';

/**
 * Loading state for database view
 * Shows skeleton table while database content loads
 */
export default function DatabaseLoading() {
  return (
    <div className="main-content">
      <SkeletonDatabase />
    </div>
  );
}
