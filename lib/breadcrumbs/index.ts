export interface BreadcrumbItem {
  label: string;
  href: string;
}

export const ROUTE_LABELS: Record<string, string> = {
  account: 'Your Account',
  orders: 'Orders',
  addresses: 'Addresses',
  settings: 'Account Settings',
  wishlists: 'Wish Lists',
  brands: 'Brands',
  blog: 'Blog',
  cart: 'Cart',
  compare: 'Compare',
  'gift-certificates': 'Gift Certificates',
  balance: 'Check Balance',
  purchase: 'Purchase',
  login: 'Sign In',
  register: 'Create Account',
  'forgot-password': 'Forgot Password',
  'change-password': 'Reset Password',
  'contact-us': 'Contact Us',
  'shop-all': 'Shop All',
};

export function formatSegmentLabel(segment: string): string {
  const normalized = segment.toLowerCase();

  if (ROUTE_LABELS[normalized]) {
    return ROUTE_LABELS[normalized];
  }

  return segment
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function generateBreadcrumbsFromPathname(pathname: string | null): BreadcrumbItem[] {
  if (!pathname || pathname === '/' || pathname === '') {
    return [];
  }

  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  const rawSegments = cleanPath.split('/').filter(Boolean);

  const localePattern = /^[a-z]{2}(-[a-z]{2,4})?$/i;
  const firstSegment = rawSegments[0];
  const segments =
    firstSegment && localePattern.test(firstSegment) ? rawSegments.slice(1) : rawSegments;

  if (segments.length === 0) {
    return [];
  }

  const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  let accumulatedPath = '';

  segments.forEach((segment, index) => {
    if (segment) {
      accumulatedPath += `/${segment}`;

      const isLast = index === segments.length - 1;

      crumbs.push({
        label: formatSegmentLabel(segment),
        href: isLast ? '#' : accumulatedPath,
      });
    }
  });

  return crumbs;
}
