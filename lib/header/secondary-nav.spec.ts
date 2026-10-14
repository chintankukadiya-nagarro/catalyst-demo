import { describe, expect, it } from 'vitest';

import { getDefaultSecondaryNavLinks, mergeSecondaryNavLinks } from './secondary-nav';

describe('getDefaultSecondaryNavLinks', () => {
  it('returns default secondary nav links with /brands for the brands key', () => {
    const t = (key: string) => `label-${key}`;
    const links = getDefaultSecondaryNavLinks(t);

    expect(links).toEqual([
      { key: 'new-arrivals', label: 'label-new-arrivals', href: '/search?sort=newest' },
      { key: 'brands', label: 'label-brands', href: '/brands' },
      { key: 'category', label: 'label-category', href: '/search' },
      { key: 'features', label: 'label-features', href: '/blog' },
      { key: 'blog', label: 'label-blog', href: '/blog' },
    ]);
  });
});

describe('mergeSecondaryNavLinks', () => {
  it('allows overriding href and label while keeping default /brands when not overridden', () => {
    const t = (key: string) => `label-${key}`;
    const defaults = getDefaultSecondaryNavLinks(t);
    const merged = mergeSecondaryNavLinks(defaults, [
      { key: 'features', label: 'Custom Feature', href: '/custom-features' },
    ]);

    const brandLink = merged.find((item) => item.key === 'brands');

    expect(brandLink).toEqual({
      key: 'brands',
      label: 'label-brands',
      href: '/brands',
    });
  });
});

