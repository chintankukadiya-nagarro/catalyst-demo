import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';

export interface ProductCareGuideProps {
  className?: string;
  careInstructions?: string;
  washNotice?: string;
  title?: string;
}

export function ProductCareGuide({
  className,
  careInstructions,
  washNotice,
  title,
}: ProductCareGuideProps) {
  const t = useTranslations('Product.ProductDetails.CareGuide');
  const sectionTitle = title ?? t('title', { defaultMessage: 'CARE GUIDE' });
  const subTitle = t('subtitle', { defaultMessage: 'お手入れについて' });
  const defaultNotice =
    washNotice ?? t('washNotice', { defaultMessage: '洗濯表示 ー ※洗濯表示の詳細は商品をご確認ください' });

  return (
    <div className={clsx('space-y-3 text-sm text-[var(--product-detail-primary-text,hsl(var(--foreground))]', className)}>
      <div className="flex items-center gap-2">
        <h4 className="font-semibold tracking-wide text-black">{sectionTitle}</h4>
        <span className="text-xs text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
          {subTitle}
        </span>
      </div>

      <div className="rounded-sm bg-contrast-100/50 p-3 text-xs leading-relaxed text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
        <p className="font-medium text-black">{defaultNotice}</p>
        {careInstructions && (
          <p className="mt-2 whitespace-pre-line text-contrast-500">{careInstructions}</p>
        )}
      </div>
    </div>
  );
}

