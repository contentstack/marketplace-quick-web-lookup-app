import React from 'react';
import './LinkPreviewEmptyState.css';

interface LinkPreviewEmptyStateProps {
  type: 'no-urls' | 'error';
  error?: string;
  onRetry?: () => void;
}

/**
 * Component for handling empty states and errors in link previews
 */
export const LinkPreviewEmptyState: React.FC<LinkPreviewEmptyStateProps> = ({ type, error, onRetry }) => {
  if (type === 'no-urls') {
    return (
      <div className="empty-state no-urls-message">
        <div className="empty-state-icon">🔗</div>
        <h3>No URLs Found</h3>
        <p>No URLs found in this entry.</p>
        <p>Add some links to your content to see previews here.</p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="empty-state error-message">
        <div className="empty-state-icon">⚠️</div>
        <h3>Error Loading Previews</h3>
        <p className="error-text">{error}</p>
        <br />
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default LinkPreviewEmptyState;
