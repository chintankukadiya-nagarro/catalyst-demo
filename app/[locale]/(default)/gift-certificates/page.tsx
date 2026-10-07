import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { GiftCertificatesSection } from '@/vibes/soul/sections/gift-certificates-section';
import { redirect } from '~/i18n/navigation-server';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { getGiftCertificatesData } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'GiftCertificates' });
  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: '/gift-certificates', locale });

  return {
    title: makeswiftMetadata?.title || t('title') || 'Gift certificates',
    ...(makeswiftMetadata?.description && { description: makeswiftMetadata.description }),
    alternates: await getMetadataAlternates({ path: '/gift-certificates', locale }),
  };
}

export default async function GiftCertificates(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('GiftCertificates');
  const format = await getFormatter();
  const currencyCode = await getPreferredCurrencyCode();
  const data = await getGiftCertificatesData(currencyCode);

  if (!data.giftCertificatesEnabled) {
    return await redirect({ href: '/', locale });
  }

  const exampleBalance = format.number(25.0, {
    style: 'currency',
    currency: currencyCode ?? data.defaultCurrency,
  });

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: t('title'), href: '#' },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-screen-2xl px-4 pt-6 @xl:px-6 @4xl:px-8">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <GiftCertificatesSection
        checkBalanceHref="/gift-certificates/balance"
        checkBalanceLabel={t('checkBalanceLabel')}
        description={t('description')}
        exampleBalance={exampleBalance}
        logo={data.logo}
        purchaseHref="/gift-certificates/purchase"
        purchaseLabel={t('purchaseLabel')}
        title={t('title')}
      />
    </>
  );
}
