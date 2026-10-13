'use client';

import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Link } from '~/components/link';

import { type EditorialMenuLink, type EditorialMenuPrimaryLink } from './types';

export function EditorialMenuShopColumn({
  activeCategory,
  activeTabIndex,
  items,
  onNavigate,
  onTabChange,
  primaryLinks,
  trendLinks,
}: {
  activeCategory: EditorialMenuPrimaryLink | undefined;
  activeTabIndex: number;
  items: EditorialMenuLink[];
  onNavigate: () => void;
  onTabChange: (index: number) => void;
  primaryLinks: EditorialMenuPrimaryLink[];
  trendLinks: EditorialMenuLink[];
}) {
  const t = useTranslations('Components.Header.MenuOverlay');
  const categoryGroups = activeCategory?.groups ?? [];

  return (
    <div className="min-h-0 min-w-0 pb-16 pl-[86px] pr-14 pt-12">
      {primaryLinks.length > 0 ? (
        <nav className="mb-12 flex flex-wrap gap-x-6 gap-y-2">
          {primaryLinks.map((tab, index) => (
            <button
              className={clsx(
                'text-[12px] font-medium uppercase tracking-[0.16em] text-[#161616] transition-opacity',
                index === activeTabIndex
                  ? 'underline decoration-1 underline-offset-4'
                  : 'opacity-40 hover:opacity-100',
              )}
              key={`${tab.href}-${tab.label}`}
              onClick={() => onTabChange(index)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
      ) : null}

      {items.length > 0 || trendLinks.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-5 text-[13px] font-medium uppercase tracking-[0.14em] text-[#161616]">
            {t('items')}
          </h2>
          {items.length > 0 ? (
            <ul className="space-y-[14px]">
              {items.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    className="text-[14px] font-light text-[#161616] transition-opacity hover:opacity-60"
                    href={link.href}
                    onClick={onNavigate}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {trendLinks.length > 0 ? (
            <ul className="mt-4 space-y-[14px]">
              {trendLinks.map((link) => (
                <li key={`trend-${link.href}-${link.label}`}>
                  <Link
                    className="text-[14px] font-light text-[#161616] transition-opacity hover:opacity-60"
                    href={link.href}
                    onClick={onNavigate}
                  >
                    + {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {categoryGroups.length > 0 ? (
        <section>
          <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.14em] text-[#161616]">
            {t('category')}
          </h2>
          <AccordionPrimitive.Root collapsible type="single">
            {categoryGroups.map((group, groupIndex) => {
              const groupKey = `${group.label ?? 'group'}-${groupIndex}`;
              const title = group.label != null && group.label !== '' ? group.label : groupKey;

              return (
                <AccordionPrimitive.Item key={groupKey} value={groupKey}>
                  <AccordionPrimitive.Header>
                    <AccordionPrimitive.Trigger className="group flex w-full items-center py-2 text-left text-[14px] font-light uppercase tracking-[0.04em] text-[#161616]">
                      <span className="group-data-[state=open]:hidden">+ {title}</span>
                      <span className="hidden group-data-[state=open]:inline">− {title}</span>
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionPrimitive.Content>
                    <ul className="space-y-2 pb-3 pl-4">
                      {group.href != null && group.href !== '' ? (
                        <li>
                          <Link
                            className="text-[13px] font-medium text-[#161616]"
                            href={group.href}
                            onClick={onNavigate}
                          >
                            {group.label}
                          </Link>
                        </li>
                      ) : null}
                      {group.links.map((link) => (
                        <li key={`${link.href}-${link.label}`}>
                          <Link
                            className="text-[13px] font-light text-[#161616] transition-opacity hover:opacity-60"
                            href={link.href}
                            onClick={onNavigate}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              );
            })}
          </AccordionPrimitive.Root>
        </section>
      ) : null}
    </div>
  );
}
