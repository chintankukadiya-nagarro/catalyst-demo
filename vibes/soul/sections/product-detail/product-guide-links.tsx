import { clsx } from 'clsx';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '~/components/link';

export interface GuideLinkItem {
  label: string;
  href: string;
  target?: string;
}

export interface ProductGuideLinksProps {
  className?: string;
  links?: GuideLinkItem[];
}

export function ProductGuideLinks({ className, links }: ProductGuideLinksProps) {
  const t = useTranslations('Product.ProductDetails.GuideLinks');

  const defaultLinks: GuideLinkItem[] = [
    {
      label: t('wrapping', { defaultMessage: 'About wrapping and message cards' }),
      href: '/contents/guide/gift/',
      target: '_blank',
    },
    {
      label: t('shipping', { defaultMessage: 'Shipping and Delivery Information' }),
      href: '/contents/guide/delivery?anchor=chapter06',
      target: '_blank',
    },
    {
      label: t('returns', { defaultMessage: 'Non-returnable and non-exchangeable items' }),
      href: '/contents/guide/cancel/',
      target: '_blank',
    },
    {
      label: t('preorder', { defaultMessage: 'About pre-orders and made-to-order products' }),
      href: '/contents/guide/commodity/?anchor=chapter02',
      target: '_blank',
    },
  ];

  const items = links ?? defaultLinks;

  return (
    <div className={clsx('border-t border-[var(--product-detail-border,hsl(var(--contrast-100)))] py-6', className)}>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-3 text-xs sm:grid-cols-2 text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
        {items.map((item, idx) => (
          <li key={idx}>
            <Link
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-black hover:underline"
              href={item.href}
              target={item.target}
            >
              <ChevronRight
                aria-hidden="true"
                className="text-[var(--product-detail-secondary-text,hsl(var(--contrast-400)))] transition-transform group-hover:translate-x-0.5"
                size={14}
                strokeWidth={1.5}
              />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

