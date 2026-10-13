'use client';

import { Instagram, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '~/components/link';

import { EditorialMenuFeaturedBlock } from './editorial-menu-featured-block';
import {
  type EditorialMenuLink,
  type EditorialMenuOverlayContent,
  type EditorialMenuOverlayFeatured,
  featuredHasContent,
} from './types';

function looksLikeStayInTheLoop(value: string | undefined): boolean {
  return Boolean(value?.trim().toLowerCase().includes('stay in the loop'));
}

function EditorialSocialIcons({
  footerLinks,
  onNavigate,
}: {
  footerLinks: EditorialMenuLink[];
  onNavigate: () => void;
}) {
  if (footerLinks.length === 0) {
    return null;
  }

  return (
    <ul className="mt-5 flex flex-wrap items-center gap-4">
      {footerLinks.map((link) => {
        const label = link.label.trim();
        const lower = label.toLowerCase();
        const isInstagram = lower.includes('instagram') || lower === 'ig';
        const isMail = lower.includes('mail') || lower.includes('email') || lower.includes('newsletter');

        return (
          <li key={`${link.href}-${link.label}`}>
            <Link
              aria-label={label}
              className="inline-flex items-center text-[11px] font-medium uppercase tracking-[0.12em] text-[#161616] transition-opacity hover:opacity-60"
              href={link.href}
              onClick={onNavigate}
            >
              {isInstagram ? <Instagram aria-hidden size={16} strokeWidth={1.25} /> : null}
              {isMail ? <Mail aria-hidden size={16} strokeWidth={1.25} /> : null}
              {!isInstagram && !isMail ? label : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function EditorialMenuEditorialColumn({
  featured,
  onNavigate,
  panel,
}: {
  featured: EditorialMenuOverlayFeatured | undefined;
  onNavigate: () => void;
  panel: EditorialMenuOverlayContent;
}) {
  const t = useTranslations('Components.Header.MenuOverlay');
  const showFeatured = featuredHasContent(featured);
  const featuredCaptionLooksLikeFooter = looksLikeStayInTheLoop(featured?.caption);
  const footerTitle =
    panel.footerTitle?.trim() ||
    (featuredCaptionLooksLikeFooter ? featured?.caption?.split('\n')[0] : undefined) ||
    t('stayInTheLoop');
  const featuredForPromo =
    featured != null && featuredCaptionLooksLikeFooter
      ? { ...featured, caption: featured.caption?.split('\n').slice(1).join('\n').trim() || undefined }
      : featured;
  const showPromo = featuredHasContent(featuredForPromo);
  const linked = featuredForPromo?.href != null && featuredForPromo.href !== '';

  return (
    <div className="grid min-h-full items-start gap-x-[83px] gap-y-10 px-14 py-12 lg:grid-cols-[167px_262px]">
      <div className="flex min-h-[520px] min-w-0 flex-col">
        {panel.contentsLinks.length > 0 ? (
          <section>
            <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#161616]">
              {t('contents')}
            </h2>
            <ul className="space-y-[14px]">
              {panel.contentsLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    className="text-[14px] font-light text-[#161616] transition-opacity hover:opacity-60"
                    href={link.href}
                    onClick={onNavigate}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-auto pt-10">
          <p className="font-[family-name:var(--font-family-dm-serif-text,serif)] text-[42px] font-light italic leading-[1.05] text-[#161616]">
            {looksLikeStayInTheLoop(footerTitle) ? (
              <>
                Stay in
                <br />
                the Loop
              </>
            ) : (
              footerTitle
            )}
          </p>
          <EditorialSocialIcons footerLinks={panel.footerLinks} onNavigate={onNavigate} />
        </div>
      </div>

      {showPromo && featuredForPromo != null ? (
        <EditorialMenuFeaturedBlock
          featured={featuredForPromo}
          linked={linked}
          onNavigate={onNavigate}
        />
      ) : showFeatured && featured != null ? (
        <EditorialMenuFeaturedBlock featured={featured} linked={linked} onNavigate={onNavigate} />
      ) : null}
    </div>
  );
}
