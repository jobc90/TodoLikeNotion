import React from 'react';

/**
 * Base Skeleton Component
 * Provides a shimmer animation for loading states
 */
export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width, height, className = '', style = {} }) => {
  const baseStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return <div className={`skeleton ${className}`} style={baseStyle} />;
};

/**
 * SkeletonText Component
 * Used for text line placeholders with varying widths
 */
export const SkeletonText: React.FC<{
  lines?: number;
  width?: string | number;
  lineHeight?: number;
  gap?: number;
}> = ({ lines = 1, width = '100%', lineHeight = 16, gap = 8 }) => {
  const widths = ['100%', '95%', '90%', '85%', '92%'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? widths[i % widths.length] : width}
          height={lineHeight}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonBlock Component
 * Used for block editor block placeholders
 */
export const SkeletonBlock: React.FC<{
  type?: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'todo' | 'bullet';
  lines?: number;
}> = ({ type = 'paragraph', lines = 1 }) => {
  const getBlockHeight = () => {
    switch (type) {
      case 'heading1':
        return 36;
      case 'heading2':
        return 28;
      case 'heading3':
        return 24;
      default:
        return 20;
    }
  };

  const getBlockWidth = () => {
    switch (type) {
      case 'heading1':
        return '60%';
      case 'heading2':
        return '55%';
      case 'heading3':
        return '50%';
      default:
        return '100%';
    }
  };

  const blockHeight = getBlockHeight();
  const blockWidth = getBlockWidth();

  if (type === 'todo' || type === 'bullet') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '3px 2px',
        }}
      >
        <Skeleton width={16} height={16} style={{ marginTop: '4px', flexShrink: 0 }} />
        <SkeletonText lines={lines} lineHeight={blockHeight} />
      </div>
    );
  }

  return (
    <div style={{ padding: '3px 2px' }}>
      <SkeletonText lines={lines} width={blockWidth} lineHeight={blockHeight} />
    </div>
  );
};

/**
 * SkeletonTable Component
 * Used for database table loading state
 */
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 4 }) => {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `32px repeat(${columns}, 1fr) 32px`,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ padding: '6px 8px' }}>
          <Skeleton width={14} height={14} />
        </div>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} style={{ padding: '6px 8px', borderLeft: '1px solid var(--border)' }}>
            <Skeleton width="60%" height={13} />
          </div>
        ))}
        <div style={{ padding: '6px 8px', borderLeft: '1px solid var(--border)' }}>
          <Skeleton width={16} height={16} />
        </div>
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `32px repeat(${columns}, 1fr) 32px`,
            borderBottom: rowIndex === rows - 1 ? 'none' : '1px solid var(--border)',
          }}
        >
          <div style={{ padding: '6px 8px' }}>
            <Skeleton width={14} height={14} />
          </div>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              style={{
                padding: '6px 8px',
                borderLeft: '1px solid var(--border)',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Skeleton width={`${70 + (colIndex * 5)}%`} height={14} />
            </div>
          ))}
          <div style={{ padding: '6px 8px', borderLeft: '1px solid var(--border)' }} />
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonCard Component
 * Used for general card content loading
 */
export const SkeletonCard: React.FC<{
  showIcon?: boolean;
  showImage?: boolean;
  lines?: number;
}> = ({ showIcon = false, showImage = false, lines = 3 }) => {
  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
      }}
    >
      {showImage && (
        <Skeleton
          width="100%"
          height={160}
          style={{ marginBottom: '12px', borderRadius: 'var(--radius-sm)' }}
        />
      )}

      {showIcon && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Skeleton width={40} height={40} style={{ borderRadius: 'var(--radius-md)' }} />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height={18} />
          </div>
        </div>
      )}

      {!showIcon && !showImage && (
        <Skeleton width="50%" height={20} style={{ marginBottom: '12px' }} />
      )}

      <SkeletonText lines={lines} lineHeight={16} gap={8} />
    </div>
  );
};

/**
 * SkeletonPage Component
 * Used for full page loading state
 */
export const SkeletonPage: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div style={{ padding: '80px 96px 30px', maxWidth: '900px' }}>
        <Skeleton width={72} height={72} style={{ marginBottom: '16px' }} />
        <Skeleton width="40%" height={40} style={{ marginBottom: '8px' }} />
      </div>

      {/* Blocks */}
      <div style={{ padding: '0 96px 100px', maxWidth: '900px' }}>
        <SkeletonBlock type="heading1" />
        <div style={{ marginTop: '12px' }}>
          <SkeletonBlock type="paragraph" lines={2} />
        </div>

        <div style={{ marginTop: '20px' }}>
          <SkeletonBlock type="heading2" />
        </div>

        <div style={{ marginTop: '12px' }}>
          <SkeletonBlock type="bullet" />
          <SkeletonBlock type="bullet" />
          <SkeletonBlock type="bullet" />
        </div>

        <div style={{ marginTop: '16px' }}>
          <SkeletonBlock type="paragraph" lines={3} />
        </div>

        <div style={{ marginTop: '16px' }}>
          <SkeletonBlock type="todo" />
          <SkeletonBlock type="todo" />
          <SkeletonBlock type="todo" />
        </div>
      </div>
    </div>
  );
};

/**
 * SkeletonDatabase Component
 * Used for database view loading state
 */
export const SkeletonDatabase: React.FC = () => {
  return (
    <div style={{ padding: '0 96px 60px', maxWidth: '100%' }}>
      {/* Database Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', marginBottom: '8px' }}>
        <Skeleton width={32} height={32} />
        <Skeleton width="30%" height={24} />
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 0',
          borderBottom: '1px solid var(--border)',
          marginBottom: '12px',
        }}
      >
        <Skeleton width={80} height={24} style={{ borderRadius: 'var(--radius-sm)' }} />
        <Skeleton width={80} height={24} style={{ borderRadius: 'var(--radius-sm)' }} />
        <Skeleton width={80} height={24} style={{ borderRadius: 'var(--radius-sm)' }} />
      </div>

      {/* Table */}
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
};
