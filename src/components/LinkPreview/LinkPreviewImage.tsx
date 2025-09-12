import React, { useCallback } from 'react';
import NoPreviewIcon from '../../assets/no-preview-icon.svg';
import { LinkPreview } from '../../types/linkPreview';
import { selectBestImageUrl } from '../../utils/imageUtils';

interface LinkPreviewImageProps {
  preview: LinkPreview;
  sidebarWidth: number;
}

/**
 * Focused component for handling link preview images
 */
export const LinkPreviewImage: React.FC<LinkPreviewImageProps> = ({ 
  preview, 
  sidebarWidth
}) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).style.display = 'none';
  }, []);

  const bestImageUrl = selectBestImageUrl(preview, sidebarWidth);

  // Show error message if preview failed
  if (!preview.ok && preview.error) {
    return (
      <div className="preview-image error-display">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{preview.error}</span>
        </div>
      </div>
    );
  }

  // Show no preview image if there's no title or no image
  if (!preview.title || !bestImageUrl) {
    return (
      <div className="preview-image no-preview">
        <img 
          src={NoPreviewIcon} 
          alt={`No preview available for ${preview.originalUrl}`}
          className="no-preview-icon"
        />
      </div>
    );
  }

  return (
    <div className="preview-image">
      <img 
        src={bestImageUrl} 
        alt={preview.title || `Link preview for ${preview.originalUrl}`} 
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default LinkPreviewImage; 