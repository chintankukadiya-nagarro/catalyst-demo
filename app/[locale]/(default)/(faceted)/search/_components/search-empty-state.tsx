import { Search, HelpCircle, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { Product } from '@/vibes/soul/primitives/product-card';
import { Link } from '~/components/link';

interface CategoryItem {
  id: string;
  name: string;
  href: string;
}

interface BrandItem {
  id: string;
  name: string;
  href: string;
}

interface Props {
  searchTerm: string;
  categories?: Streamable<CategoryItem[]>;
  brands?: Streamable<BrandItem[]>;
  featuredProducts?: Streamable<Product[]>;
}

export async function SearchEmptyState({
  searchTerm,
  categories,
  brands,
  featuredProducts,
}: Props) {
  const t = await getTranslations('Search');

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 @xl:px-6 @xl:py-12 @4xl:px-8">
      {/* 1. Empty Search Banner */}
      <div className="rounded-2xl border border-contrast-100 bg-contrast-100/30 p-8 text-center @xl:p-12">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-contrast-100 text-contrast-500">
          <Search className="h-7 w-7" />
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground @xl:text-3xl">
          {searchTerm
            ? t('Empty.title', { term: searchTerm })
            : t('Empty.noSearchTermTitle', { defaultMessage: 'What are you looking for?' })}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-contrast-500 @xl:text-base">
          {t('Empty.subtitle', {
            defaultMessage:
              'Check your spelling, try broader keywords, or explore popular categories and brands below.',
          })}
        </p>

        {/* Search input quick retry */}
        <form
          action="/search"
          method="GET"
          className="mx-auto mt-6 flex max-w-md items-center gap-2"
        >
          <input
            type="text"
            name="term"
            defaultValue={searchTerm}
            placeholder={t('Empty.inputPlaceholder', {
              defaultMessage: 'Search again...',
            })}
            className="flex-1 rounded-full border border-contrast-200 bg-background px-4 py-2.5 text-sm outline-none transition focus:border-foreground"
          />
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {t('Empty.submitLabel', { defaultMessage: 'Search' })}
          </button>
        </form>
      </div>

      {/* 2. Popular / Top Categories */}
      {categories && (
        <div className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground @xl:text-xl">
              {t('Empty.popularCategories', { defaultMessage: 'Popular Categories' })}
            </h2>
          </div>
          <Stream
            fallback={
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <span
                    key={i}
                    className="h-9 w-28 animate-pulse rounded-full bg-contrast-100"
                  />
                ))}
              </div>
            }
            value={categories}
          >
            {(cats) => (
              <div className="flex flex-wrap gap-2.5">
                {cats.map((category) => (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-contrast-100 bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-contrast-300 hover:bg-contrast-100/50"
                  >
                    <span>{category.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-contrast-400 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </Stream>
        </div>
      )}

      {/* 3. Top Brands */}
      {brands && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-foreground" />
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground @xl:text-xl">
              {t('Empty.popularBrands', { defaultMessage: 'Featured Brands' })}
            </h2>
          </div>
          <Stream
            fallback={
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="h-8 w-24 animate-pulse rounded-full bg-contrast-100"
                  />
                ))}
              </div>
            }
            value={brands}
          >
            {(brandList) => (
              <div className="flex flex-wrap gap-2">
                {brandList.map((brand) => (
                  <Link
                    key={brand.id}
                    href={brand.href}
                    className="rounded-lg bg-contrast-100/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-contrast-600 transition-colors hover:bg-contrast-200 hover:text-foreground"
                  >
                    {brand.name}
                  </Link>
                ))}
                <Link
                  href="/brands"
                  className="rounded-lg border border-dashed border-contrast-200 px-3 py-1.5 text-xs font-semibold text-contrast-500 transition-colors hover:border-contrast-400 hover:text-foreground"
                >
                  {t('Empty.viewAllBrands', { defaultMessage: 'View all brands →' })}
                </Link>
              </div>
            )}
          </Stream>
        </div>
      )}

      {/* 4. Customer Assistance Links */}
      <div className="mt-12 rounded-xl border border-contrast-100 bg-contrast-100/20 p-6 @xl:p-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-foreground" />
          <h3 className="font-heading text-base font-semibold text-foreground">
            {t('Empty.needHelpTitle', { defaultMessage: 'Need help finding something?' })}
          </h3>
        </div>
        <p className="mt-1 text-sm text-contrast-500">
          {t('Empty.needHelpDescription', {
            defaultMessage:
              'Our customer support team is always ready to help you locate products, answer sizing questions, or place an order.',
          })}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href="/contact" size="small" variant="secondary">
            {t('Empty.contactUs', { defaultMessage: 'Contact Us' })}
          </ButtonLink>
          <ButtonLink href="/faqs" size="small" variant="tertiary">
            {t('Empty.faq', { defaultMessage: 'FAQs' })}
          </ButtonLink>
          <ButtonLink href="/shop-all" size="small" variant="tertiary">
            {t('Empty.shopAll', { defaultMessage: 'Browse Full Catalog' })}
          </ButtonLink>
        </div>
      </div>

      {/* 5. Trending / Best Selling Carousel */}
      {featuredProducts && (
        <div className="mt-16">
          <FeaturedProductCarousel
            cta={{
              label: t('Empty.browseAll', { defaultMessage: 'View all products' }),
              href: '/shop-all',
            }}
            emptyStateSubtitle=""
            emptyStateTitle=""
            nextLabel={t('Empty.next', { defaultMessage: 'Next' })}
            previousLabel={t('Empty.previous', { defaultMessage: 'Previous' })}
            products={featuredProducts}
            scrollbarLabel={t('Empty.scrollbar', { defaultMessage: 'Scroll' })}
            title={t('Empty.recommendedForYou', {
              defaultMessage: 'Trending & Recommended Products',
            })}
          />
        </div>
      )}
    </div>
  );
}

