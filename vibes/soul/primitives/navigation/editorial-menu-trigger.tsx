'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  type EditorialMenuOverlayState,
  EditorialMenuPanel,
  type EditorialMenuPrimaryLink,
} from '@/vibes/soul/primitives/editorial-menu-overlay';

export interface EditorialMenuFlyoutProps {
  menuOverlayState: EditorialMenuOverlayState;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  primaryLinks: Streamable<EditorialMenuPrimaryLink[]>;
}

function EditorialMenuPanelFallback() {
  return (
    <div className="animate-pulse space-y-4 px-4 py-6 @4xl:px-8">
      <div className="h-4 w-32 rounded bg-contrast-100" />
      <div className="h-4 w-48 rounded bg-contrast-100" />
      <div className="h-4 w-40 rounded bg-contrast-100" />
    </div>
  );
}

export function EditorialMenuFlyout({
  menuOverlayState,
  onOpenChange,
  open,
  primaryLinks,
}: EditorialMenuFlyoutProps) {
  const t = useTranslations('Components.Header.MenuOverlay');

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        aria-hidden
        className="fixed inset-0 z-[55] cursor-default bg-black/40"
        onClick={() => onOpenChange(false)}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-label={t('contents')}
        className="absolute left-0 right-0 top-full z-[60] flex h-[min(740px,calc(100dvh-4.5rem))] min-h-0 w-full flex-col overflow-hidden border-t border-[var(--nav-menu-border,hsl(var(--foreground)/10%))] bg-[var(--nav-background,hsl(var(--background)))] shadow-sm @container"
        role="dialog"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Stream fallback={<EditorialMenuPanelFallback />} value={primaryLinks}>
            {(resolvedPrimary) => (
              <EditorialMenuPanel
                flyoutOpen={open}
                menuOverlayState={menuOverlayState}
                onNavigate={() => onOpenChange(false)}
                primaryLinks={resolvedPrimary}
              />
            )}
          </Stream>
        </div>
      </div>
    </>
  );
}
