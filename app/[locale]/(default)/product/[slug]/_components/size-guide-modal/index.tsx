'use client';

import { Ruler } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Modal } from '@/vibes/soul/primitives/modal';

interface SizeGuideModalProps {
  content: string;
}

export function SizeGuideModal({ content }: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Product.ProductDetails');

  return (
    <>
      <button
        aria-label={t('sizeGuide')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 underline underline-offset-4 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Ruler aria-hidden="true" className="h-3.5 w-3.5" />
        <span>{t('sizeGuide')}</span>
      </button>

      <Modal
        className="w-full max-w-2xl p-6"
        isOpen={isOpen}
        setOpen={setIsOpen}
        title={t('sizeGuide')}
      >
        <div
          className="prose max-w-none pt-4 text-gray-800"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Modal>
    </>
  );
}
