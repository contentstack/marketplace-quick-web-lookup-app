import React from 'react';
import './LinkPreviewHeader.css';

interface LinkPreviewHeaderProps {
  title: string;
  icon?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  showRefresh?: boolean;
  urlCount?: number;
  subtitle?: string;
}

/**
 * Header component for link previews with title, URL count, and optional refresh button
 */
export const LinkPreviewHeader: React.FC<LinkPreviewHeaderProps> = ({
  title,
  icon,
  onRefresh,
  isLoading = false,
  showRefresh = false,
  urlCount,
  subtitle,
}) => {
  return (
    <div className="sidebar-header">
      <div className="header-left">
        <div className="header-title">
          {icon && <img src={icon} alt={title} className="header-icon" />}
          <h2>{title}</h2>
        </div>
        {subtitle && (
          <div className="header-subtitle">
            {subtitle}
          </div>
        )}
        {urlCount !== undefined && (
          <div className="header-url-count">
            {urlCount} URL{urlCount !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
      {showRefresh && onRefresh && (
        <button className="refresh-button" onClick={onRefresh} disabled={isLoading} title="Refresh previews">
          <svg
            className={`refresh-icon ${isLoading ? 'spinning' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default LinkPreviewHeader;
