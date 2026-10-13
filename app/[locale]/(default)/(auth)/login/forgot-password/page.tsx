import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { ForgotPasswordSection } from '@/vibes/soul/sections/forgot-password-section';

import { resetPassword } from './_actions/reset-password';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Auth.Login.ForgotPassword' });

  return {
    title: t('title'),
  };
}

export default async function Reset(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Auth.Login.ForgotPassword');
  const tLogin = await getTranslations('Auth.Login');

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: tLogin('heading'), href: '/login' },
    { label: t('title'), href: '#' },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-screen-2xl px-4 pt-6 @xl:px-6 @4xl:px-8">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <ForgotPasswordSection action={resetPassword} subtitle={t('subtitle')} title={t('title')} />
    </>
  );
}
