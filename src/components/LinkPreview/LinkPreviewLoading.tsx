import React from 'react';
import './LinkPreviewLoading.css';

interface LinkPreviewLoadingProps {
  count?: number;
}

/**
 * Loading skeleton component for link previews
 */
export const LinkPreviewLoading: React.FC<LinkPreviewLoadingProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="preview-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-domain-section">
              <div className="skeleton-domain"></div>
              <div className="skeleton-info-icon"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LinkPreviewLoading;
