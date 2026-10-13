import { ReactNode } from 'react';
import {
  Content as CalloutContent,
  Header as CalloutHeader,
  Root as CalloutRoot,
  Title as CalloutTitle,
} from 'storefront-kit/callout';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Link } from '~/components/link';
import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';
import { AnimatedUnderline } from '@/vibes/soul/primitives/animated-underline';
import { Badge } from '@/vibes/soul/primitives/badge';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { type Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import {
  ProductGallery,
  ProductGalleryLoadMoreAction,
} from '@/vibes/soul/sections/product-detail/product-gallery';
import { ReviewForm, SubmitReviewAction } from '@/vibes/soul/sections/reviews/review-form';

import {
  BackorderDisplayData,
  ProductDetailForm,
  ProductDetailFormAction,
  StockDisplayData,
} from './product-detail-form';
import { ProductCareGuide } from './product-care-guide';
import { ProductCategoryHierarchy, ProductCategoryHierarchyItem } from './product-category-hierarchy';
import { GuideLinkItem, ProductGuideLinks } from './product-guide-links';
import { ProductStaffVoice, type StaffVoiceLinkItem } from './product-staff-voice';
import { RatingLink } from './rating-link';
import { Field } from './schema';

interface ProductDetailProduct {
  id: string;
  title: string;
  href: string;
  images: Streamable<{
    images: Array<{ src: string; alt: string }>;
    pageInfo?: { hasNextPage: boolean; endCursor: string | null };
  }>;
  price?: Streamable<Price | null>;
  subtitle?: string;
  brandLink?: string;
  category?: { name: string; href: string };
  badge?: string;
  rating?: Streamable<number | null>;
  reviewsEnabled?: boolean;
  showRating?: boolean;
  numberOfReviews?: number;
  summary?: Streamable<string>;
  description?: Streamable<string | ReactNode | null>;
  accordions?: Streamable<
    Array<{
      title: string;
      content: ReactNode;
    }>
  >;
  minQuantity?: Streamable<number | null>;
  maxQuantity?: Streamable<number | null>;
  stockDisplayData?: Streamable<StockDisplayData | null>;
  backorderDisplayData?: Streamable<BackorderDisplayData | null>;
  categoryHierarchy?: ProductCategoryHierarchyItem[];
}

/**
 * Care guide data extracted from BigCommerce product custom fields.
 * All fields are optional — when absent, the component falls back to
 * translated defaults from the messages file.
 */
export interface CareGuideData {
  careGuide: {
    title?: string;
    subtitle?: string;
    washNotice?: string;
    careInstructions?: string;
  };
  /** Guide links. When undefined, the component renders its default links. */
  links?: GuideLinkItem[];
}

export interface StaffNoteData {
  title?: string;
  content?: string;
  html?: string;
  links?: StaffVoiceLinkItem[];
}

export interface ProductDetailProps<F extends Field> {
  breadcrumbs?: Streamable<Breadcrumb[]>;
  promotionCallouts?: Streamable<Array<{ id: string; text: string }>>;
  product: Streamable<ProductDetailProduct | null>;
  action: ProductDetailFormAction<F>;
  fields: Streamable<F[]>;
  quantityLabel?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  emptySelectPlaceholder?: string;
  ctaLabel?: Streamable<string | null>;
  ctaDisabled?: Streamable<boolean | null>;
  prefetch?: boolean;
  thumbnailLabel?: string;
  additionalInformationTitle?: string;
  additionalActions?: ReactNode;
  reviewFormEmailLabel?: string;
  reviewFormModalTitle?: string;
  reviewFormNameLabel?: string;
  reviewFormRatingLabel?: string;
  reviewFormReviewLabel?: string;
  reviewFormSubmitLabel?: string;
  reviewFormTitleLabel?: string;
  reviewFormAction: SubmitReviewAction;
  user: Streamable<{ email: string; name: string }>;
  loadMoreImagesAction?: ProductGalleryLoadMoreAction;
  recaptchaSiteKey?: string;
  /** Care guide data from product custom fields. Falls back to defaults when absent. */
  careGuideData?: Streamable<CareGuideData | null>;
  /** Staff voice / staff note data from product custom fields or editorial defaults. */
  staffNoteData?: Streamable<StaffNoteData | null>;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-detail-border: hsl(var(--contrast-100));
 *   --product-detail-subtitle-font-family: var(--font-family-mono);
 *   --product-detail-title-font-family: var(--font-family-heading);
 *   --product-detail-primary-text: hsl(var(--foreground));
 *   --product-detail-secondary-text:  hsl(var(--contrast-500));
 * }
 * ```
 */
export function ProductDetail<F extends Field>({
  product: streamableProduct,
  action,
  fields: streamableFields,
  breadcrumbs,
  promotionCallouts,
  quantityLabel,
  incrementLabel,
  decrementLabel,
  emptySelectPlaceholder,
  ctaLabel: streamableCtaLabel,
  ctaDisabled: streamableCtaDisabled,
  prefetch,
  thumbnailLabel,
  additionalInformationTitle = 'Additional information',
  additionalActions,
  reviewFormEmailLabel,
  reviewFormModalTitle,
  reviewFormNameLabel,
  reviewFormRatingLabel,
  reviewFormReviewLabel,
  reviewFormSubmitLabel,
  reviewFormTitleLabel,
  reviewFormAction,
  user,
  loadMoreImagesAction,
  recaptchaSiteKey,
  careGuideData: streamableCareGuideData,
  staffNoteData: streamableStaffNoteData,
}: ProductDetailProps<F>) {
  return (
    <section className="@container">
      <div className="group/product-detail mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        {breadcrumbs && (
          <div className="group/breadcrumbs mb-6">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
        )}
        <Stream fallback={<ProductDetailSkeleton />} value={streamableProduct}>
          {(product) =>
            product && (
              <div className="grid grid-cols-1 items-stretch gap-x-8 gap-y-8 @2xl:grid-cols-2 @5xl:gap-x-12">
                <div className="group/product-gallery relative z-30 hidden @2xl:block">
                  <Stream fallback={<ProductGallerySkeleton />} value={product.images}>
                    {(imagesData) => (
                      <ProductGallery
                        images={imagesData.images}
                        loadMoreAction={loadMoreImagesAction}
                        pageInfo={imagesData.pageInfo}
                        productId={Number(product.id)}
                      />
                    )}
                  </Stream>
                </div>
                {/* Product Details */}
                <div className="text-[var(--product-detail-primary-text,hsl(var(--foreground)))]">
                  {Boolean(product.subtitle || product.category) && (
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      {product.subtitle && (
                        <div>
                          {product.brandLink ? (
                            <Link
                              className="font-[family-name:var(--product-detail-subtitle-font-family,var(--font-family-mono))] text-sm font-semibold tracking-wider text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))] hover:underline"
                              href={product.brandLink}
                            >
                              {product.subtitle}
                            </Link>
                          ) : (
                            <span className="font-[family-name:var(--product-detail-subtitle-font-family,var(--font-family-mono))] text-sm font-semibold tracking-wider text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
                              {product.subtitle}
                            </span>
                          )}
                        </div>
                      )}
                      {product.category && (
                        <div>
                          {product.category.href ? (
                            <Link
                              className="inline-block rounded-sm bg-contrast-100 px-2.5 py-0.5 text-xs font-medium text-contrast-600 transition-colors hover:bg-contrast-200"
                              href={product.category.href}
                            >
                              {product.category.name}
                            </Link>
                          ) : (
                            <span className="inline-block rounded-sm bg-contrast-100 px-2.5 py-0.5 text-xs font-medium text-contrast-600">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {product.badge != null && product.badge !== '' && (
                    <div className="mb-2">
                      <Badge shape="rounded">{product.badge}</Badge>
                    </div>
                  )}
                  <h1 className="mb-3 mt-2 font-[family-name:var(--product-detail-title-font-family,var(--font-family-heading))] text-2xl font-medium leading-none @xl:mb-4 @xl:text-3xl @4xl:text-4xl">
                    {product.title}
                  </h1>
                  {product.reviewsEnabled && (
                    <div className="group/product-rating">
                      <ReviewForm
                        action={reviewFormAction}
                        formEmailLabel={reviewFormEmailLabel}
                        formModalTitle={reviewFormModalTitle}
                        formNameLabel={reviewFormNameLabel}
                        formRatingLabel={reviewFormRatingLabel}
                        formReviewLabel={reviewFormReviewLabel}
                        formSubmitLabel={reviewFormSubmitLabel}
                        formTitleLabel={reviewFormTitleLabel}
                        productId={Number(product.id)}
                        recaptchaSiteKey={recaptchaSiteKey}
                        streamableImages={product.images}
                        streamableProduct={{ name: product.title }}
                        streamableUser={user}
                        trigger={
                          <AnimatedUnderline className="cursor-pointer">
                            Write a review
                          </AnimatedUnderline>
                        }
                      />
                    </div>
                  )}
                  {product.showRating && (
                    <div className="group/product-rating">
                      <Stream
                        fallback={<RatingSkeleton />}
                        value={Streamable.all([product.rating, product.numberOfReviews])}
                      >
                        {([rating, numberOfReviews]) => (
                          <RatingLink
                            numberOfReviews={numberOfReviews ?? 0}
                            rating={rating ?? 0}
                            scrollTargetId="reviews"
                          />
                        )}
                      </Stream>
                    </div>
                  )}
                  <div className="group/product-price flex items-center gap-3">
                    <Stream fallback={<PriceLabelSkeleton />} value={product.price}>
                      {(price) => (
                        <PriceLabel className="my-3 text-xl @xl:text-2xl" price={price ?? ''} />
                      )}
                    </Stream>
                    <Stream fallback={null} value={product.stockDisplayData}>
                      {(stock) =>
                        stock?.stockLevelMessage ? (
                          <span className="inline-flex items-center rounded-sm bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            {stock.stockLevelMessage}
                          </span>
                        ) : null
                      }
                    </Stream>
                  </div>
                  {promotionCallouts != null && (
                    <div className="group/product-promotions mb-4">
                      <Stream fallback={null} value={promotionCallouts}>
                        {(callouts) =>
                          callouts.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {callouts.map((callout) => (
                                <CalloutRoot key={callout.id} size="small" variant="warning">
                                  <CalloutContent>
                                    <CalloutHeader>
                                      <CalloutTitle>{callout.text}</CalloutTitle>
                                    </CalloutHeader>
                                  </CalloutContent>
                                </CalloutRoot>
                              ))}
                            </div>
                          ) : null
                        }
                      </Stream>
                    </div>
                  )}
                  <div className="group/product-gallery mb-8 @2xl:hidden">
                    <Stream fallback={<ProductGallerySkeleton />} value={product.images}>
                      {(imagesData) => (
                        <ProductGallery
                          images={imagesData.images}
                          loadMoreAction={loadMoreImagesAction}
                          pageInfo={imagesData.pageInfo}
                          productId={Number(product.id)}
                          thumbnailLabel={thumbnailLabel}
                        />
                      )}
                    </Stream>
                  </div>
                  <div className="group/product-summary">
                    <Stream fallback={<ProductSummarySkeleton />} value={product.summary}>
                      {(summary) =>
                        Boolean(summary) && (
                          <p className="text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
                            {summary}
                          </p>
                        )
                      }
                    </Stream>
                  </div>
                  <div className="group/product-detail-form">
                    <Stream
                      fallback={<ProductDetailFormSkeleton />}
                      value={Streamable.all([
                        streamableFields,
                        streamableCtaLabel,
                        streamableCtaDisabled,
                        product.minQuantity,
                        product.maxQuantity,
                        product.stockDisplayData,
                        product.backorderDisplayData,
                      ])}
                    >
                      {([
                        fields,
                        ctaLabel,
                        ctaDisabled,
                        minQuantity,
                        maxQuantity,
                        stockDisplayData,
                        backorderDisplayData,
                      ]) => (
                        <ProductDetailForm
                          action={action}
                          additionalActions={additionalActions}
                          backorderDisplayData={backorderDisplayData ?? undefined}
                          ctaDisabled={ctaDisabled ?? undefined}
                          ctaLabel={ctaLabel ?? undefined}
                          decrementLabel={decrementLabel}
                          emptySelectPlaceholder={emptySelectPlaceholder}
                          fields={fields}
                          incrementLabel={incrementLabel}
                          maxQuantity={maxQuantity ?? undefined}
                          minQuantity={minQuantity ?? undefined}
                          prefetch={prefetch}
                          productId={product.id}
                          quantityLabel={quantityLabel}
                          stockDisplayData={stockDisplayData ?? undefined}
                        />
                      )}
                    </Stream>
                  </div>
                  {product.categoryHierarchy && product.categoryHierarchy.length > 0 && (
                    <div className="border-t border-[var(--product-detail-border,hsl(var(--contrast-100)))] pt-6 pb-2">
                      <ProductCategoryHierarchy categories={product.categoryHierarchy} />
                    </div>
                  )}

                  <div className="group/product-description">
                    <Stream fallback={<ProductDescriptionSkeleton />} value={product.description}>
                      {(description) =>
                        Boolean(description) && (
                          <div className="prose prose-sm max-w-none border-t border-[var(--product-detail-border,hsl(var(--contrast-100)))] py-8 [&>div>*:first-child]:mt-0 [&>div>*:last-child]:mb-0">
                            {description}
                          </div>
                        )
                      }
                    </Stream>
                  </div>

                  <Stream fallback={null} value={streamableStaffNoteData}>
                    {(staffNote) =>
                      staffNote ? (
                        <ProductStaffVoice
                          content={staffNote.content}
                          html={staffNote.html}
                          links={staffNote.links}
                          title={staffNote.title}
                        />
                      ) : null
                    }
                  </Stream>

                  <Stream fallback={null} value={streamableCareGuideData}>
                    {(data) =>
                      data ? (
                        <>
                          <div className="border-t border-[var(--product-detail-border,hsl(var(--contrast-100)))] pt-6">
                            <ProductCareGuide
                              careInstructions={data.careGuide.careInstructions}
                              title={data.careGuide.title}
                              washNotice={data.careGuide.washNotice}
                            />
                          </div>

                          <ProductGuideLinks links={data.links} />
                        </>
                      ) : null
                    }
                  </Stream>

                  <h2 className="sr-only">{additionalInformationTitle}</h2>
                  <div className="group/product-accordion">
                    <Stream fallback={<ProductAccordionsSkeleton />} value={product.accordions}>
                      {(accordions) =>
                        accordions && (
                          <Accordion
                            className="border-t border-[var(--product-detail-border,hsl(var(--contrast-100)))] pt-4"
                            type="multiple"
                          >
                            {accordions.map((accordion, index) => (
                              <AccordionItem
                                key={index}
                                title={accordion.title}
                                value={index.toString()}
                              >
                                {accordion.content}
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )
                      }
                    </Stream>
                  </div>
                </div>
              </div>
            )
          }
        </Stream>
      </div>
    </section>
  );
}

function ProductGallerySkeleton() {
  return (
    <Skeleton.Root className="group-has-[[data-pending]]/product-gallery:animate-pulse" pending>
      <div className="w-full overflow-hidden rounded-xl @xl:rounded-2xl">
        <div className="flex">
          <Skeleton.Box className="aspect-[4/5] h-full w-full shrink-0 grow-0 basis-full" />
        </div>
      </div>
      <div className="mt-2 flex max-w-full gap-2 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton.Box className="h-12 w-12 shrink-0 rounded-lg @md:h-16 @md:w-16" key={idx} />
        ))}
      </div>
    </Skeleton.Root>
  );
}

function PriceLabelSkeleton() {
  return <Skeleton.Box className="my-5 h-4 w-20 rounded-md" />;
}

function RatingSkeleton() {
  return (
    <Skeleton.Root
      className="flex w-[136px] items-center gap-1 group-has-[[data-pending]]/product-rating:animate-pulse"
      pending
    >
      <Skeleton.Box className="h-4 w-[100px] rounded-md" />
      <Skeleton.Box className="h-6 w-8 rounded-xl" />
    </Skeleton.Root>
  );
}

function ProductSummarySkeleton() {
  return (
    <Skeleton.Root
      className="flex w-full flex-col gap-3.5 pb-6 group-has-[[data-pending]]/product-summary:animate-pulse"
      pending
    >
      {Array.from({ length: 3 }).map((_, idx) => (
        <Skeleton.Box className="h-2.5 w-full" key={idx} />
      ))}
    </Skeleton.Root>
  );
}

function ProductDescriptionSkeleton() {
  return (
    <Skeleton.Root
      className="flex w-full flex-col gap-3.5 pb-6 group-has-[[data-pending]]/product-description:animate-pulse"
      pending
    >
      {Array.from({ length: 2 }).map((_, idx) => (
        <Skeleton.Box className="h-2.5 w-full" key={idx} />
      ))}
      <Skeleton.Box className="h-2.5 w-3/4" />
    </Skeleton.Root>
  );
}

function ProductDetailFormSkeleton() {
  return (
    <Skeleton.Root
      className="flex flex-col gap-8 py-8 group-has-[[data-pending]]/product-detail-form:animate-pulse"
      pending
    >
      <div className="flex flex-col gap-5">
        <Skeleton.Box className="h-2 w-10 rounded-md" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton.Box className="h-11 w-[72px] rounded-full" key={idx} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <Skeleton.Box className="h-3 w-16 rounded-md" />
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton.Box className="h-10 w-10 rounded-full" key={idx} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton.Box className="h-12 w-[120px] rounded-lg" />
        <Skeleton.Box className="h-12 w-[216px] rounded-full" />
      </div>
    </Skeleton.Root>
  );
}

function ProductAccordionsSkeleton() {
  return (
    <Skeleton.Root
      className="flex h-[600px] w-full flex-col gap-8 pt-4 group-has-[[data-pending]]/product-accordion:animate-pulse"
      pending
    >
      <div className="flex items-center justify-between">
        <Skeleton.Box className="h-2 w-20 rounded-sm" />
        <Skeleton.Box className="h-3 w-3 rounded-sm" />
      </div>
      <div className="mb-1 flex flex-col gap-4">
        <Skeleton.Box className="h-3 w-full rounded-sm" />
        <Skeleton.Box className="h-3 w-full rounded-sm" />
        <Skeleton.Box className="h-3 w-3/5 rounded-sm" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton.Box className="h-2 w-24 rounded-sm" />
        <Skeleton.Box className="h-3 w-3 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton.Box className="h-2 w-20 rounded-sm" />
        <Skeleton.Box className="h-3 w-3 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton.Box className="h-2 w-32 rounded-sm" />
        <Skeleton.Box className="h-3 w-3 rounded-full" />
      </div>
    </Skeleton.Root>
  );
}

export function ProductDetailSkeleton() {
  return (
    <Skeleton.Root
      className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 group-has-[[data-pending]]/product-detail:animate-pulse @2xl:grid-cols-2 @5xl:gap-x-12"
      pending
    >
      <div className="hidden @2xl:block">
        <ProductGallerySkeleton />
      </div>
      <div>
        <Skeleton.Box className="mb-6 h-4 w-20 rounded-lg" />
        <Skeleton.Box className="mb-6 h-6 w-72 rounded-lg" />
        <RatingSkeleton />
        <PriceLabelSkeleton />
        <ProductSummarySkeleton />
        <div className="mb-8 @2xl:hidden">
          <ProductGallerySkeleton />
        </div>
        <ProductDetailFormSkeleton />
      </div>
    </Skeleton.Root>
  );
}
