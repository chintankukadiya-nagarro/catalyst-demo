import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { getSessionCustomerAccessToken } from '~/auth';
import { getMakeswiftPageMetadata, getPageSnapshot, Page as MakeswiftPage } from '~/lib/makeswift';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { BrandsDirectoryClient } from './_components/brands-directory-client';
import { getBrandsDirectoryData } from './page-data';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const metadata = await getMakeswiftPageMetadata({ path: '/brands', locale });

  return {
    title: metadata?.title ?? 'Brand List | Designers & Collections',
    description:
      metadata?.description ??
      'Browse all designers and luxury brands available in our catalog. Find your favorite labels.',
    alternates: await getMetadataAlternates({ path: '/brands', locale }),
  };
}

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  // If a published Makeswift page exists for '/brands', render it
  const snapshot = await getPageSnapshot({ path: '/brands', locale });

  if (snapshot) {
    return <MakeswiftPage locale={locale} path="/brands" />;
  }

  const customerAccessToken = await getSessionCustomerAccessToken();
  const brands = await getBrandsDirectoryData(customerAccessToken);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/brands' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <BrandsDirectoryClient brands={brands} subtitle="Browse by designer label or alphabet" title="BRAND LIST" />
    </div>
  );
}
