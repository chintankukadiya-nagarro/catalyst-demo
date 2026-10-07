export type SecondaryNavKey = 'new-arrivals' | 'brands' | 'category' | 'features' | 'blog';

export interface SecondaryNavLink {
  key: SecondaryNavKey;
  label: string;
  href: string;
}

export const SECONDARY_NAV_KEYS: SecondaryNavKey[] = [
  'new-arrivals',
  'brands',
  'category',
  'features',
  'blog',
];

export function isSecondaryNavKey(key: string): key is SecondaryNavKey {
  return SECONDARY_NAV_KEYS.some((candidate) => candidate === key);
}

export function asSecondaryNavLinks(
  links: Array<{ key?: string; label: string; href: string }>,
): SecondaryNavLink[] {
  return links.flatMap((link) => {
    if (link.key == null || !isSecondaryNavKey(link.key)) {
      return [];
    }

    return [{ key: link.key, label: link.label, href: link.href }];
  });
}

type SecondaryNavTranslator = (key: SecondaryNavKey) => string;

export function getDefaultSecondaryNavLinks(t: SecondaryNavTranslator): SecondaryNavLink[] {
  return [
    { key: 'new-arrivals', label: t('new-arrivals'), href: '/search?sort=newest' },
    { key: 'brands', label: t('brands'), href: '/search' },
    { key: 'category', label: t('category'), href: '/search' },
    { key: 'features', label: t('features'), href: '/blog' },
    { key: 'blog', label: t('blog'), href: '/blog' },
  ];
}

export function mergeSecondaryNavLinks(
  defaults: SecondaryNavLink[],
  overrides: Array<{
    key?: SecondaryNavKey;
    label?: string;
    href?: string;
  }>,
): SecondaryNavLink[] {
  const overrideByKey = new Map<SecondaryNavKey, { label?: string; href?: string }>();

  overrides.forEach((item) => {
    if (item.key != null) {
      overrideByKey.set(item.key, {
        label: item.label?.trim() || undefined,
        href: item.href?.trim() || undefined,
      });
    }
  });

  return defaults.map((link) => {
    const override = overrideByKey.get(link.key);

    if (override == null) {
      return link;
    }

    return {
      ...link,
      label: override.label ?? link.label,
      href: override.href ?? link.href,
    };
  });
}
