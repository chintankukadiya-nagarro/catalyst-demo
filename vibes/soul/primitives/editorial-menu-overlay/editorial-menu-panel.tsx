'use client';

import { clsx } from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';

import { EditorialMenuEditorialColumn } from './editorial-menu-editorial-column';
import { EditorialMenuShopColumn } from './editorial-menu-shop-column';
import {
  type EditorialMenuOverlayState,
  type EditorialMenuPrimaryLink,
  resolveMenuForActiveTab,
} from './types';

export interface EditorialMenuPanelProps {
  flyoutOpen?: boolean;
  menuOverlayState: EditorialMenuOverlayState;
  onNavigate?: () => void;
  primaryLinks: EditorialMenuPrimaryLink[];
}

export function EditorialMenuPanel({
  flyoutOpen = true,
  menuOverlayState,
  onNavigate,
  primaryLinks,
}: EditorialMenuPanelProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (flyoutOpen && !wasOpenRef.current) {
      setActiveTabIndex(0);
    }

    wasOpenRef.current = flyoutOpen;
  }, [flyoutOpen]);

  const close = () => onNavigate?.();

  const safeTabIndex =
    primaryLinks.length > 0 ? Math.min(activeTabIndex, primaryLinks.length - 1) : 0;
  const activeCategory = primaryLinks[safeTabIndex];

  const { items, trendLinks, panel } = useMemo(
    () => resolveMenuForActiveTab(menuOverlayState, activeCategory),
    [activeCategory, menuOverlayState],
  );

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden bg-[#f5f5f4] lg:block lg:left-[calc(50%-1280px/2+545px)]" />
      <div className="relative mx-auto grid h-full min-h-0 w-full max-w-[1280px] grid-cols-1 lg:grid-cols-[545px_minmax(0,1fr)]">
        <div className="min-h-0 overflow-y-auto overscroll-contain bg-white">
          <EditorialMenuShopColumn
            activeCategory={activeCategory}
            activeTabIndex={safeTabIndex}
            items={items}
            onNavigate={close}
            onTabChange={setActiveTabIndex}
            primaryLinks={primaryLinks}
            trendLinks={trendLinks}
          />
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain bg-[#f5f5f4]">
          <EditorialMenuEditorialColumn
            featured={panel.featured}
            onNavigate={close}
            panel={panel}
          />
        </div>
      </div>
    </div>
  );
}
