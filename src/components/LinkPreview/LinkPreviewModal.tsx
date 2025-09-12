import React, { useCallback, useEffect } from 'react';
import { LinkPreview } from '../../types/linkPreview';
import { calculateModalSize } from '../../utils/imageUtils';

interface LinkPreviewModalProps {
  preview: LinkPreview;
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth: number;
}

/**
 * Focused component for the link preview modal
 */
export const LinkPreviewModal: React.FC<LinkPreviewModalProps> = ({ 
  preview, 
  isOpen, 
  onClose, 
  sidebarWidth 
}) => {
  // Handle escape key for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleCloseModal = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleOpenLink = useCallback(() => {
    window.open(preview.url, '_blank', 'noopener,noreferrer');
    onClose();
  }, [preview.url, onClose]);

  const modalSize = calculateModalSize(sidebarWidth);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: modalSize.width,
          maxWidth: modalSize.maxWidth
        }}
      >
        <div className="modal-header">
          <h3 className="modal-title">Link Details</h3>
          <button 
            className="modal-close" 
            onClick={handleCloseModal}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {preview.title ? (
            <div className="modal-section">
              <strong>Title:</strong>
              <p>{preview.title}</p>
            </div>
          ) : (
            <div className="modal-section">
              <strong>Title:</strong>
              <p className="url-title-text">{preview.originalUrl}</p>
            </div>
          )}
          
          {preview.description && (
            <div className="modal-section">
              <strong>Description:</strong>
              <p>{preview.description}</p>
            </div>
          )}
          
          {preview.siteName && (
            <div className="modal-section">
              <strong>Site:</strong>
              <p>{preview.siteName}</p>
            </div>
          )}
          
          <div className="modal-section">
            <strong>URL:</strong>
            <div className="modal-url">
              <a 
                href={preview.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {preview.url}
              </a>
            </div>
          </div>
          
          {/* Show error information if preview failed */}
          {!preview.ok && preview.error && (
            <div className="modal-section">
              <strong>Error:</strong>
              <p className="error-message">{preview.error}</p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="modal-button" onClick={handleCloseModal}>
            Close
          </button>
          <button 
            className="modal-button primary" 
            onClick={handleOpenLink}
          >
            Open Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkPreviewModal; 