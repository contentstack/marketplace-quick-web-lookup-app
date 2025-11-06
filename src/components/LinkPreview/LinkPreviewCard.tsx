import React, { useCallback, useRef, useState } from 'react';
import InfoIcon from '../../assets/info_icon.svg';
import { useResponsiveWidth } from '../../common/hooks/useResponsiveWidth';
import { LinkPreview } from '../../types/linkPreview';
import './LinkPreviewCard.css';
import { LinkPreviewImage } from './LinkPreviewImage';
import { LinkPreviewModal } from './LinkPreviewModal';

interface LinkPreviewCardProps {
  preview: LinkPreview;
}

/**
 * Main link preview card component - now focused and clean
 */
export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ preview }) => {
  const [showModal, setShowModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Use centralized responsive width hook
  const { width, isTwoColumnLayout } = useResponsiveWidth({
    containerRef: cardRef,
    fallbackSelector: '.entry-sidebar-container',
  });

  // Event handlers
  const handleCardClick = useCallback(() => {
    window.open(preview.url, '_blank', 'noopener,noreferrer');
  }, [preview.url]);

  const handleInfoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <>
      <div
        className={`preview-card ${isTwoColumnLayout ? 'two-column-layout' : ''}`}
        onClick={handleCardClick}
        ref={cardRef}
        title={!preview.ok ? `Preview failed: ${preview.error || 'Unable to load preview'}` : undefined}>
        <LinkPreviewImage preview={preview} sidebarWidth={width} />

        <div className="preview-content">
          {preview.title ? (
            <h3 className="preview-title">{preview.title}</h3>
          ) : (
            <h3 className="preview-title url-title">{preview.originalUrl}</h3>
          )}

          {(preview.description || preview.siteName) && (
            <div className="info-icon-container">
              <img src={InfoIcon} alt="Info" className="info-icon" onClick={handleInfoClick} title="View details" />
            </div>
          )}
        </div>
      </div>

      <LinkPreviewModal preview={preview} isOpen={showModal} onClose={handleCloseModal} sidebarWidth={width} />
    </>
  );
};

export default LinkPreviewCard;
