import React, { useMemo } from 'react';
import { useResponsiveWidth } from '../../common/hooks/useResponsiveWidth';
import { LinkPreview } from '../../types/linkPreview';
import { LinkPreviewCard } from './LinkPreviewCard';
import './LinkPreviewGrid.css';
import { LinkPreviewLoading } from './LinkPreviewLoading';

interface LinkPreviewGridProps {
  previews: LinkPreview[];
  loading: boolean;
}

/**
 * Grid container component for displaying link preview cards with responsive layout
 */
export const LinkPreviewGrid: React.FC<LinkPreviewGridProps> = ({ 
  previews, 
  loading 
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Use centralized responsive width hook
  const { layoutType } = useResponsiveWidth({
    containerRef
  });

  // Determine loading skeleton count
  const skeletonCount = useMemo(() => {
    return Math.min(previews.length || 3, 3);
  }, [previews.length]);

  return (
    <div className="previews-container" ref={containerRef}>
      {loading && previews.length === 0 ? (
        <LinkPreviewLoading count={skeletonCount} />
      ) : (
        <div className={`previews-grid layout-${layoutType}`}>
          {previews.map((preview) => (
            <LinkPreviewCard key={preview.id} preview={preview} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkPreviewGrid;
