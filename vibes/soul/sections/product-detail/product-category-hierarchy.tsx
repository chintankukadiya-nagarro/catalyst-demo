import { clsx } from 'clsx';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '~/components/link';

export interface ProductCategoryHierarchyItem {
  label: string;
  href: string;
}

export interface ProductCategoryHierarchyProps {
  className?: string;
  label?: string;
  categories: ProductCategoryHierarchyItem[];
}

export function ProductCategoryHierarchy({
  className,
  label,
  categories,
}: ProductCategoryHierarchyProps) {
  const t = useTranslations('Product.ProductDetails.CategoryHierarchy');
  const sectionLabel = label ?? t('label', { defaultMessage: 'Product Category:' });

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--product-detail-primary-text,hsl(var(--foreground)))]',
        className,
      )}
    >
      <span className="font-semibold text-black">{sectionLabel}</span>
      <div className="flex flex-wrap items-center gap-x-1.5 text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
        {categories.map((cat, index) => (
          <span className="inline-flex items-center gap-x-1.5" key={index}>
            <Link
              className="hover:text-black hover:underline transition-colors"
              href={cat.href}
            >
              {cat.label}
            </Link>
            {index < categories.length - 1 && (
              <ChevronRight
                aria-hidden="true"
                className="text-[var(--product-detail-secondary-text,hsl(var(--contrast-400)))]"
                size={14}
                strokeWidth={1.5}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

