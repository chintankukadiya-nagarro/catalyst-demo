import { describe, expect, it } from 'vitest';

import { generateBreadcrumbsFromPathname } from './index';

describe('generateBreadcrumbsFromPathname', () => {
  it('returns empty array for root and null pathnames', () => {
    expect(generateBreadcrumbsFromPathname(null)).toEqual([]);
    expect(generateBreadcrumbsFromPathname('')).toEqual([]);
    expect(generateBreadcrumbsFromPathname('/')).toEqual([]);
  });

  it('strips locale prefixes like /en', () => {
    expect(generateBreadcrumbsFromPathname('/en')).toEqual([]);
    expect(generateBreadcrumbsFromPathname('/en/cart')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Cart', href: '#' },
    ]);
    expect(generateBreadcrumbsFromPathname('/es-MX/cart')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Cart', href: '#' },
    ]);
  });

  it('generates multi-level breadcrumbs with active last item', () => {
    const crumbs = generateBreadcrumbsFromPathname('/account/orders/123');

    expect(crumbs).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Your Account', href: '/account' },
      { label: 'Orders', href: '/account/orders' },
      { label: '123', href: '#' },
    ]);
  });

  it('maps recognized route segments to friendly labels', () => {
    expect(generateBreadcrumbsFromPathname('/gift-certificates/balance')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Gift Certificates', href: '/gift-certificates' },
      { label: 'Check Balance', href: '#' },
    ]);
  });

  it('formats kebab-case and snake_case unknown segments cleanly', () => {
    expect(generateBreadcrumbsFromPathname('/custom-landing_page')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Custom Landing Page', href: '#' },
    ]);
  });
});
