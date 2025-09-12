import React from 'react';
import LinkIcon from '../../assets/link-icon.svg';
import { useEntry } from '../../common/hooks/useEntry';
import { useLinkPreviews } from '../../common/hooks/useLinkPreviews';
import { LinkPreviewEmptyState, LinkPreviewGrid, LinkPreviewHeader } from '../../components/LinkPreview';
import './EntrySidebar.css';

const EntrySidebarExtension: React.FC = () => {
  const { entryData } = useEntry();

  // Use the custom hook for all link preview logic
  const { previews, loading, error, urls, refreshPreviews } = useLinkPreviews({
    entryData,
  });

  // Calculate preview statistics
  const successfulCount = previews.filter(p => p.ok).length;
  const failedCount = previews.filter(p => !p.ok).length;
  const hasMixedResults = successfulCount > 0 && failedCount > 0;

  // Determine which content to show
  const renderContent = () => {
    if (urls.length === 0) {
      return <LinkPreviewEmptyState type="no-urls" />;
    }

    if (error) {
      return <LinkPreviewEmptyState type="error" error={error} onRetry={refreshPreviews} />;
    }

    return <LinkPreviewGrid previews={previews} loading={loading} />;
  };

  return (
    <div className="ui-container">
      <div className="entry-sidebar-container link-preview-sidebar">
        <LinkPreviewHeader
          title="Link Previews"
          icon={LinkIcon}
          onRefresh={refreshPreviews}
          isLoading={loading}
          showRefresh={urls.length > 0}
          urlCount={urls.length}
          subtitle={hasMixedResults ? `${successfulCount} successful, ${failedCount} failed` : undefined}
        />

        <div className="sidebar-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default EntrySidebarExtension;
