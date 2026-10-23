import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { HomeOnly } from '~/components/home-only';
import { Slot } from '~/lib/makeswift/slot';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <HomeOnly>
        <Slot label="Home top content" snapshotId="home-top-content" />
      </HomeOnly>
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}
