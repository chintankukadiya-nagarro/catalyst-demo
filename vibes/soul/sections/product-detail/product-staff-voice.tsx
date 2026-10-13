import { clsx } from 'clsx';
import { ReactNode } from 'react';

import { Link } from '~/components/link';

export interface StaffVoiceLinkItem {
  label: string;
  href: string;
  target?: string;
}

export interface ProductStaffVoiceProps {
  className?: string;
  title?: string;
  content?: string;
  html?: string;
  links?: StaffVoiceLinkItem[];
  children?: ReactNode;
}

const DEFAULT_LINKS: StaffVoiceLinkItem[] = [
  {
    label: "ELLE DIGITAL – Outdoor Editor's Pick! 10 of Patagonia's Latest Lightweight and Comfortable Wear Items –",
    href: 'https://www.elle.com/jp/fashion/shopping/',
    target: '_blank',
  },
  {
    label:
      'ELLE DIGITAL – Why Do Stylish People Own Patagonia? A Comprehensive Look at 10 Favorite Items and Popular Models from Industry Professionals –',
    href: 'https://www.elle.com/jp/fashion/shopping/',
    target: '_blank',
  },
];

export function ProductStaffVoice({
  className,
  title = 'STAFF VOICE',
  content,
  html,
  links = DEFAULT_LINKS,
  children,
}: ProductStaffVoiceProps) {
  const activeLinks = links.length > 0 ? links : DEFAULT_LINKS;

  return (
    <div className={clsx('relative my-8 border border-[#ccc] px-6 py-6 sm:px-8 sm:py-7', className)}>
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[hsl(var(--background))] px-3">
        <span className="text-xs font-normal tracking-[0.2em] text-[#161616] uppercase">
          {title}
        </span>
      </div>

      <div className="text-xs sm:text-sm leading-relaxed text-[#161616]">
        {children ? (
          children
        ) : html ? (
          <div
            className="prose prose-sm max-w-none text-[#161616] [&_a]:text-[#e50083] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : content ? (
          <p className="whitespace-pre-line">{content}</p>
        ) : (
          <p>
            For styling inspiration, please see “
            <Link
              className="text-[#e50083] underline underline-offset-2 transition-opacity hover:opacity-80"
              href={activeLinks[0]?.href ?? 'https://www.elle.com/jp/fashion/shopping/'}
              rel="noopener noreferrer"
              target={activeLinks[0]?.target ?? '_blank'}
            >
              {activeLinks[0]?.label}
            </Link>
            ” and “
            <Link
              className="text-[#e50083] underline underline-offset-2 transition-opacity hover:opacity-80"
              href={activeLinks[1]?.href ?? 'https://www.elle.com/jp/fashion/shopping/'}
              rel="noopener noreferrer"
              target={activeLinks[1]?.target ?? '_blank'}
            >
              {activeLinks[1]?.label}
            </Link>
            ”.
          </p>
        )}
      </div>
    </div>
  );
}
