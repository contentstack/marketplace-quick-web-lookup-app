import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppFailed } from './AppFailed';
import { ErrorBoundary } from './ErrorBoundary';
import {
  LinkPreviewCard,
  LinkPreviewEmptyState,
  LinkPreviewGrid,
  LinkPreviewHeader,
  LinkPreviewImage,
  LinkPreviewLoading,
  LinkPreviewModal,
} from './LinkPreview';
import PageNotFound from '../containers/404/404';
import Tooltip from '../containers/Tooltip/Tooltip';
import { useResponsiveWidth } from '../common/hooks/useResponsiveWidth';
import { LinkPreview } from '../types/linkPreview';

const base: LinkPreview = {
  id: 'p1',
  url: 'https://p.example',
  originalUrl: 'https://p.example',
  ok: true,
  title: 'A title',
  description: 'A description',
  siteName: 'Site',
  image: { thumbnail: { url: 'https://p.example/t.png', width: 1, height: 1 } },
};

afterEach(() => vi.restoreAllMocks());

describe('AppFailed, ErrorBoundary, 404, Tooltip', () => {
  it('AppFailed explains the app was opened outside Contentstack and opens the docs', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<AppFailed />);
    expect(screen.getByRole('alert')).toHaveTextContent('loaded outside Contentstack');
    fireEvent.click(screen.getByRole('button'));
    expect(open).toHaveBeenCalledWith(expect.stringContaining('contentstack.com'), '_blank');
  });

  it('ErrorBoundary renders children, then a fallback when one throws', () => {
    const Boom = () => {
      throw new Error('boom');
    };
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { unmount } = render(
      <ErrorBoundary>
        <p>fine</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('fine')).toBeInTheDocument();
    unmount();
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.queryByText('fine')).toBeNull();
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('404 page shows the title and a docs link', () => {
    render(<PageNotFound />);
    expect(screen.getByText('404: Not Found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More' })).toHaveAttribute(
      'href',
      expect.stringContaining('contentstack.com'),
    );
  });

  it('Tooltip shows its text on hover only', () => {
    render(<Tooltip content="help text" />);
    expect(screen.queryByText('help text')).toBeNull();
    fireEvent.mouseEnter(screen.getByAltText('info-icon').parentElement!.parentElement!);
    expect(screen.getByText('help text')).toBeInTheDocument();
    fireEvent.mouseLeave(screen.getByAltText('info-icon').parentElement!.parentElement!);
    expect(screen.queryByText('help text')).toBeNull();
  });
});

describe('LinkPreviewHeader and EmptyState', () => {
  it('header pluralises the url count and shows refresh only when asked', () => {
    const onRefresh = vi.fn();
    const { rerender } = render(
      <LinkPreviewHeader title="T" icon="i.svg" urlCount={1} showRefresh onRefresh={onRefresh} subtitle="1 ok" />,
    );
    expect(screen.getByText('1 URL found')).toBeInTheDocument();
    expect(screen.getByText('1 ok')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Refresh previews'));
    expect(onRefresh).toHaveBeenCalledOnce();
    rerender(<LinkPreviewHeader title="T" urlCount={2} showRefresh isLoading onRefresh={onRefresh} />);
    expect(screen.getByText('2 URLs found')).toBeInTheDocument();
    expect(screen.getByTitle('Refresh previews')).toBeDisabled();
    rerender(<LinkPreviewHeader title="T" />);
    expect(screen.queryByTitle('Refresh previews')).toBeNull();
    expect(screen.queryByText(/found/)).toBeNull();
  });

  it('empty state: no urls, error with retry, error without retry', () => {
    const onRetry = vi.fn();
    const { rerender } = render(<LinkPreviewEmptyState type="no-urls" />);
    expect(screen.getByText('No URLs Found')).toBeInTheDocument();
    rerender(<LinkPreviewEmptyState type="error" error="Rate Limited" onRetry={onRetry} />);
    expect(screen.getByText('Rate Limited')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledOnce();
    rerender(<LinkPreviewEmptyState type="error" error="x" />);
    expect(screen.queryByText('Try Again')).toBeNull();
  });
});

describe('LinkPreviewImage', () => {
  it('shows the best image for the width', () => {
    render(<LinkPreviewImage preview={base} sidebarWidth={300} />);
    expect(screen.getByAltText('A title')).toHaveAttribute('src', 'https://p.example/t.png');
  });

  it('hides a broken image', () => {
    render(<LinkPreviewImage preview={base} sidebarWidth={300} />);
    const img = screen.getByAltText('A title');
    fireEvent.error(img);
    expect(img.style.display).toBe('none');
  });

  it('shows the error text for a failed preview', () => {
    render(<LinkPreviewImage preview={{ ...base, ok: false, error: 'Unauthorized' }} sidebarWidth={300} />);
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });

  it('shows the placeholder without a title or without an image', () => {
    const { rerender } = render(<LinkPreviewImage preview={{ ...base, title: undefined }} sidebarWidth={300} />);
    expect(screen.getByAltText(/No preview available/)).toBeInTheDocument();
    rerender(<LinkPreviewImage preview={{ ...base, image: undefined }} sidebarWidth={300} />);
    expect(screen.getByAltText(/No preview available/)).toBeInTheDocument();
  });

  it('a failed preview without an error message still gets the placeholder', () => {
    render(<LinkPreviewImage preview={{ ...base, ok: false, image: undefined }} sidebarWidth={300} />);
    expect(screen.getByAltText(/No preview available/)).toBeInTheDocument();
  });
});

describe('LinkPreviewModal', () => {
  const open = (p: Partial<LinkPreview> = {}, isOpen = true) => {
    const onClose = vi.fn();
    render(<LinkPreviewModal preview={{ ...base, ...p }} isOpen={isOpen} onClose={onClose} sidebarWidth={550} />);
    return onClose;
  };

  it('renders nothing when closed', () => {
    open({}, false);
    expect(screen.queryByText('Link Details')).toBeNull();
  });

  it('shows details, closes by button, overlay and Escape, and opens the link', () => {
    const win = vi.spyOn(window, 'open').mockImplementation(() => null);
    const onClose = open();
    expect(screen.getByText('A description')).toBeInTheDocument();
    expect(screen.getByText('Site')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close modal'));
    fireEvent.click(screen.getByText('Close'));
    fireEvent.click(document.querySelector('.modal-overlay')!);
    fireEvent.click(document.querySelector('.modal-content')!);
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(4);
    fireEvent.click(screen.getByText('Open Link'));
    expect(win).toHaveBeenCalledWith('https://p.example', '_blank', 'noopener,noreferrer');
  });

  it('shows the url as the title when there is none, and the error for a failed preview', () => {
    open({ title: undefined, description: undefined, siteName: undefined, ok: false, error: 'Invalid URL' });
    expect(screen.getAllByText('https://p.example').length).toBeGreaterThan(0);
    expect(screen.getByText('Invalid URL')).toBeInTheDocument();
    expect(screen.queryByText('Description:')).toBeNull();
    expect(screen.queryByText('Site:')).toBeNull();
  });
});

describe('LinkPreviewCard, Grid, Loading', () => {
  it('opens the link on card click, and the modal (not the link) from the info icon', () => {
    const win = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<LinkPreviewCard preview={base} />);
    fireEvent.click(screen.getByText('A title'));
    expect(win).toHaveBeenCalledWith('https://p.example', '_blank', 'noopener,noreferrer');
    win.mockClear();
    fireEvent.click(screen.getByTitle('View details'));
    expect(win).not.toHaveBeenCalled();
    expect(screen.getByText('Link Details')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(screen.queryByText('Link Details')).toBeNull();
  });

  it('card falls back to the url title, hides the info icon, and explains a failure on hover', () => {
    render(
      <LinkPreviewCard
        preview={{ ...base, title: undefined, description: undefined, siteName: undefined, ok: false, error: 'Nope' }}
      />,
    );
    expect(screen.getByText('https://p.example', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.queryByTitle('View details')).toBeNull();
    expect(document.querySelector('.preview-card')).toHaveAttribute('title', 'Preview failed: Nope');
  });

  it('card title text for a failure with no message', () => {
    render(<LinkPreviewCard preview={{ ...base, ok: false }} />);
    expect(document.querySelector('.preview-card')).toHaveAttribute('title', 'Preview failed: Unable to load preview');
  });

  it('grid renders cards, or skeletons while the first load is pending', () => {
    const { rerender } = render(<LinkPreviewGrid previews={[]} loading />);
    expect(document.querySelectorAll('.preview-skeleton')).toHaveLength(3);
    rerender(<LinkPreviewGrid previews={[base, { ...base, id: 'p2', title: 'Second' }]} loading={false} />);
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(document.querySelectorAll('.preview-skeleton')).toHaveLength(0);
  });

  it('loading renders the requested number of skeletons', () => {
    const { rerender } = render(<LinkPreviewLoading />);
    expect(document.querySelectorAll('.preview-skeleton')).toHaveLength(1);
    rerender(<LinkPreviewLoading count={2} />);
    expect(document.querySelectorAll('.preview-skeleton')).toHaveLength(2);
  });
});

describe('useResponsiveWidth', () => {
  const Probe = ({ width, selector }: { width: number; selector?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);
    const r = useResponsiveWidth({ containerRef: selector ? { current: null } : ref, fallbackSelector: selector });
    return (
      <div ref={ref}>
        <p data-testid="out">{`${r.width}:${r.layoutType}:${r.isTwoColumnLayout}`}</p>
      </div>
    );
  };

  it.each([
    [700, '700:grid-auto-fit:false'],
    [550, '550:two-column:true'],
    [200, '200:single-column:false'],
  ])('maps width %i to a layout', (w, out) => {
    render(<Probe width={w} />);
    expect(screen.getByTestId('out')).toHaveTextContent(out);
  });

  it('measures a fallback container by selector and follows window resizes', () => {
    render(
      <>
        <div id="fallback" />
        <Probe width={520} selector="#fallback" />
      </>,
    );
    expect(screen.getByTestId('out')).toHaveTextContent('520:two-column:true');
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('out')).toHaveTextContent('520');
  });

  it('stays at 0 when neither the ref nor the selector resolves', () => {
    render(<Probe width={520} selector="#missing" />);
    expect(screen.getByTestId('out')).toHaveTextContent('0:single-column:false');
  });
});
