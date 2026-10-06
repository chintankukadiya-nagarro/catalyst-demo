'use client';

import { useLocale } from 'next-intl';
import React, { forwardRef, useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import { CategoryGrid, CategoryGridItem } from '~/components/category-grid';

export interface MakeswiftCategoryCard {
  title?: string;
  categoryPath?: string | { value?: string; label?: string; id?: string; path?: string };
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
}

export interface MSCategoryGridProps {
  className?: string;
  title?: string;
  subtitle?: string;
  columns?: '2' | '3' | '4';
  categories?: MakeswiftCategoryCard[];
}

type ComboboxSelection =
  string | { value?: unknown; label?: string; id?: unknown; path?: unknown } | null | undefined;

interface ParsedCombobox {
  entityId?: string;
  path?: string;
  label?: string;
}

interface ResolvedCategoryCard {
  title: string;
  href?: string;
  entityId?: string;
  image?: CategoryGridItem['image'];
}

const CategoryPathSchema = z.object({
  path: z.string(),
  name: z.string(),
});

function parseStringComboboxValue(trimmed: string): ParsedCombobox {
  if (!trimmed || trimmed === '#') {
    return {};
  }

  if (trimmed.startsWith('/') || trimmed.includes('/')) {
    return { path: trimmed };
  }

  if (/^\d+$/.test(trimmed)) {
    return { entityId: trimmed };
  }

  return { path: `/${trimmed}` };
}

function parseObjectComboboxValue(obj: {
  value?: unknown;
  label?: string;
  id?: unknown;
  path?: unknown;
}): ParsedCombobox {
  const label = typeof obj.label === 'string' ? obj.label : undefined;

  if (typeof obj.path === 'string') {
    const path = obj.path.trim();

    if (path && path !== '#') {
      return { path, label };
    }
  }

  const rawValue = obj.value ?? obj.id;

  if (typeof rawValue === 'number') {
    return { entityId: String(rawValue), label };
  }

  if (typeof rawValue === 'string') {
    return { ...parseStringComboboxValue(rawValue.trim()), label: label ?? undefined };
  }

  return { label };
}

function parseComboboxValue(selection: ComboboxSelection): ParsedCombobox {
  if (selection == null) {
    return {};
  }

  if (typeof selection === 'string') {
    return parseStringComboboxValue(selection.trim());
  }

  return parseObjectComboboxValue(selection);
}

function normalizeStorefrontPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function isValidCustomLink(href: string | undefined): href is string {
  const trimmed = href?.trim();

  return !!trimmed && trimmed !== '#';
}

function resolveCategoryCardStatic(cat: MakeswiftCategoryCard): ResolvedCategoryCard {
  const combobox = parseComboboxValue(cat.categoryPath);
  const title = cat.title?.trim() || combobox.label || 'Category';
  const image = cat.imageSrc
    ? {
        src: cat.imageSrc,
        alt: cat.imageAlt || title,
      }
    : undefined;

  if (combobox.path) {
    return {
      title,
      href: normalizeStorefrontPath(combobox.path),
      image,
    };
  }

  if (combobox.entityId) {
    return {
      title,
      entityId: combobox.entityId,
      image,
    };
  }

  if (isValidCustomLink(cat.link?.href)) {
    return {
      title,
      href: cat.link.href.trim(),
      image,
    };
  }

  return { title, image };
}

async function fetchCategoryPath(
  entityId: string,
  locale: string,
): Promise<{ path: string; name: string } | null> {
  const response = await fetch(`/api/categories/${entityId}?locale=${locale}`);

  if (!response.ok) {
    return null;
  }

  const parsed = CategoryPathSchema.safeParse(await response.json());

  return parsed.success ? parsed.data : null;
}

export const MSCategoryGrid = forwardRef<HTMLElement, MSCategoryGridProps>(
  function MakeswiftCategoryGrid(
    { className, title, subtitle, columns = '4', categories = [] },
    ref,
  ) {
    const locale = useLocale();
    const staticCards = useMemo(
      () => categories.map((cat) => resolveCategoryCardStatic(cat)),
      [categories],
    );

    const entityIdsToFetch = useMemo(
      () =>
        [
          ...new Set(
            staticCards.map((card) => card.entityId).filter((id): id is string => id != null),
          ),
        ].sort(),
      [staticCards],
    );

    const { data: categoryPathsByEntityId } = useSWR(
      entityIdsToFetch.length > 0
        ? ['category-grid-paths', locale, entityIdsToFetch.join(',')]
        : null,
      async () => {
        const entries = await Promise.all(
          entityIdsToFetch.map(async (entityId) => {
            const category = await fetchCategoryPath(entityId, locale);

            return [entityId, category] as const;
          }),
        );

        return Object.fromEntries(entries);
      },
    );

    const mappedCategories: CategoryGridItem[] = useMemo(() => {
      return staticCards.map((card) => {
        const fetchedCategory = card.entityId
          ? categoryPathsByEntityId?.[card.entityId]
          : undefined;
        const fetchedPath = fetchedCategory?.path
          ? normalizeStorefrontPath(fetchedCategory.path)
          : undefined;

        const href = card.href ?? fetchedPath;

        return {
          title: card.title,
          href,
          image: card.image,
        };
      });
    }, [staticCards, categoryPathsByEntityId]);

    return (
      <CategoryGrid
        categories={mappedCategories}
        className={className}
        columns={columns}
        ref={ref}
        subtitle={subtitle}
        title={title}
      />
    );
  },
);

MSCategoryGrid.displayName = 'MSCategoryGrid';
