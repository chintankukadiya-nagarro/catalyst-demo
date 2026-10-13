import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Breadcrumb } from '@/vibes/soul/sections/breadcrumbs';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { ProductVideos } from '@/vibes/soul/sections/product-detail/product-videos';
import { auth, getSessionCustomerAccessToken } from '~/auth';
import { breadcrumbsTransformer } from '~/data-transformers/breadcrumbs-transformer';
import { rewriteWysiwygContentUrls } from '~/data-transformers/html-content-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { productOptionsTransformer } from '~/data-transformers/product-options-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { ProductDetail } from '~/lib/makeswift/components/product-detail';
import { getRecaptchaSiteKey } from '~/lib/recaptcha';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { addToCart } from './_actions/add-to-cart';
import { getMoreProductImages } from './_actions/get-more-images';
import { submitReview } from './_actions/submit-review';
import { ProductAnalyticsProvider } from './_components/product-analytics-provider';
import { ProductSchema } from './_components/product-schema';
import { ProductViewed } from './_components/product-viewed';
import { Reviews } from './_components/reviews';
import { SizeGuideModal } from './_components/size-guide-modal';
import { getSizeGuideContent } from './_components/size-guide-modal/get-size-guide';
import { WishlistButton } from './_components/wishlist-button';
import { WishlistButtonForm } from './_components/wishlist-button/form';
import {
  getProduct,
  getProductPageMetadata,
  getProductPricingAndRelatedProducts,
  getStreamableInventorySettingsQuery,
  getStreamableProduct,
  getStreamableProductInventory,
  getStreamableProductVariantInventory,
} from './page-data';

/**
 * Custom field names used for the Care Guide section.
 * These are managed by the client in BigCommerce Admin → Products → Custom Fields.
 * Fields matching these names (or the `guide_link_` prefix) are extracted
 * separately and excluded from the Specifications accordion.
 */
const CARE_GUIDE_FIELD_NAMES = new Set([
  'care_guide_title',
  'care_guide_subtitle',
  'care_wash_notice',
  'care_instructions',
]);

const GUIDE_LINK_PREFIX = 'guide_link_';

/** Returns true if the custom field is reserved for care guide / guide links / guide visibility. */
function isCareGuideField(name: string): boolean {
  const normalized = name.trim().toLowerCase();

  return (
    CARE_GUIDE_FIELD_NAMES.has(name) ||
    name.startsWith(GUIDE_LINK_PREFIX) ||
    normalized === 'show guide' ||
    normalized === 'show guid' ||
    normalized === 'show_guide'
  );
}

const STAFF_VOICE_FIELD_NAMES = new Set([
  'staff_voice',
  'staff_note',
  'staff_voice_title',
  'staff_note_title',
  'staff_voice_html',
  'staff_note_html',
  'staff_voice_content',
  'staff_note_content',
]);

const STAFF_VOICE_LINK_PREFIX = 'staff_voice_link_';
const STAFF_NOTE_LINK_PREFIX = 'staff_note_link_';

function isStaffVoiceField(name: string): boolean {
  const normalized = name.trim().toLowerCase();

  return (
    STAFF_VOICE_FIELD_NAMES.has(normalized) ||
    normalized.startsWith(STAFF_VOICE_LINK_PREFIX) ||
    normalized.startsWith(STAFF_NOTE_LINK_PREFIX) ||
    normalized === 'show staff voice' ||
    normalized === 'show_staff_voice' ||
    normalized === 'show staff note' ||
    normalized === 'show_staff_note'
  );
}

function isSizeGuideField(name: string): boolean {
  const normalized = name.trim().toLowerCase();

  return (
    normalized === 'size chart' ||
    normalized === 'size_chart' ||
    normalized === 'sizechart' ||
    normalized === 'size guide' ||
    normalized === 'size_guide' ||
    normalized === 'sizeguide'
  );
}

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  setRequestLocale(locale);

  const customerAccessToken = await getSessionCustomerAccessToken();

  const productId = Number(slug);

  const product = await getProductPageMetadata(productId, customerAccessToken);

  if (!product) {
    return notFound();
  }

  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: product.path, locale });

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: makeswiftMetadata?.title || pageTitle || product.name,
    description:
      makeswiftMetadata?.description ||
      metaDescription ||
      `${product.plainTextDescription.replaceAll(/\s+/g, ' ').trim().slice(0, 150)}...`,
    ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    alternates: await getMetadataAlternates({ path: product.path, locale }),
    ...(url && { openGraph: { images: [{ url, alt }] } }),
  };
}

export default async function Product({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const options = await searchParams;

  const optionValueIds = Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(options[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );

  const customerAccessToken = await getSessionCustomerAccessToken();
  const detachedWishlistFormId = 'product-add-to-wishlist-form';

  setRequestLocale(locale);

  const t = await getTranslations('Product');
  const format = await getFormatter();

  const productId = Number(slug);

  const [{ product: baseProduct, settings }, recaptchaSiteKey] = await Promise.all([
    getProduct(productId, customerAccessToken),
    getRecaptchaSiteKey(),
  ]);

  const reviewsEnabled = Boolean(settings?.reviews.enabled && !settings.display.showProductRating);
  const showRating = Boolean(settings?.reviews.enabled && settings.display.showProductRating);
  const taxDisplay = settings?.tax?.pdp;

  if (!baseProduct) {
    return notFound();
  }

  const baseCustomFields = removeEdgesAndNodes(baseProduct.customFields);
  const sizeChartField =
    baseCustomFields.find((f) => {
      const name = f.name.trim().toLowerCase();

      return name === 'size chart' || name === 'size_chart' || name === 'sizechart';
    })?.value ??
    (() => {
      const title = baseProduct.name.toLowerCase();
      const categoryName = (
        removeEdgesAndNodes(baseProduct.categories).at(0)?.name ?? ''
      ).toLowerCase();
      const combined = `${title} ${categoryName}`;

      if (/bag|pack|backpack|daypack|バッグ|リュック/.test(combined)) {
        return 'bag';
      }

      if (/shoe|boot|sneaker|footwear|sandal|シューズ|靴|ブーツ/.test(combined)) {
        return 'shoe';
      }

      return undefined;
    })();

  const sizeGuideContent = await getSizeGuideContent(sizeChartField, customerAccessToken);

  const streamableProduct = Streamable.from(async () => {
    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
    };

    const product = await getStreamableProduct(variables, customerAccessToken);

    if (!product) {
      return notFound();
    }

    return product;
  });

  const streamableProductSku = Streamable.from(async () => (await streamableProduct).sku);

  const streamableProductInventory = Streamable.from(async () => {
    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
    };

    const product = await getStreamableProductInventory(variables, customerAccessToken);

    if (!product) {
      return notFound();
    }

    return product;
  });

  const streamableProductVariantInventory = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (!product.inventory.hasVariantInventory) {
      return undefined;
    }

    const variables = {
      productId,
      sku: product.sku,
    };

    const variants = await getStreamableProductVariantInventory(variables, customerAccessToken);

    if (!variants) {
      return undefined;
    }

    return removeEdgesAndNodes(variants).find((v) => v.sku === product.sku);
  });

  const streamableProductPricingAndRelatedProducts = Streamable.from(async () => {
    const currencyCode = await getPreferredCurrencyCode();

    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
      currencyCode,
    };

    return await getProductPricingAndRelatedProducts(variables, customerAccessToken);
  });

  const streamablePrices = Streamable.from(async () => {
    const product = await streamableProductPricingAndRelatedProducts;

    if (!product) {
      return null;
    }

    return pricesTransformer(product, format, taxDisplay ?? 'INC') ?? null;
  });

  const streamableImages = Streamable.from(async () => {
    const product = await streamableProduct;

    const images = removeEdgesAndNodes(product.images)
      .filter((image) => image.url !== product.defaultImage?.url)
      .map((image) => ({
        src: image.url,
        alt: image.altText,
      }));

    return {
      images: product.defaultImage
        ? [{ src: product.defaultImage.url, alt: product.defaultImage.altText }, ...images]
        : images,
      pageInfo: product.images.pageInfo,
    };
  });

  // Product videos render in their own section below the primary content, so
  // they're streamed independently of the gallery images. The Storefront
  // GraphQL API returns each video as { title, url } (a YouTube watch URL).
  const streamableVideos = Streamable.from(async () => {
    const product = await streamableProduct;

    return removeEdgesAndNodes(product.videos).map((video) => ({
      url: video.url,
      title: video.title,
    }));
  });

  const streameableCtaLabel = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (product.availabilityV2.status === 'Unavailable') {
      return t('ProductDetails.Submit.unavailable');
    }

    if (product.availabilityV2.status === 'Preorder') {
      return t('ProductDetails.Submit.preorder');
    }

    if (!product.inventory.isInStock) {
      return t('ProductDetails.Submit.outOfStock');
    }

    return t('ProductDetails.Submit.addToCart');
  });

  const streameableCtaDisabled = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (product.availabilityV2.status === 'Unavailable') {
      return true;
    }

    if (product.availabilityV2.status === 'Preorder') {
      return false;
    }

    if (!product.inventory.isInStock) {
      return true;
    }

    return false;
  });

  const streamableInventorySettings = Streamable.from(async () => {
    return await getStreamableInventorySettingsQuery(customerAccessToken);
  });

  const getBackorderAvailabilityPrompt = ({
    showBackorderAvailabilityPrompt,
    backorderAvailabilityPrompt,
    availableForBackorder,
    unlimitedBackorder,
  }: {
    showBackorderAvailabilityPrompt: boolean;
    backorderAvailabilityPrompt: string | null;
    availableForBackorder?: number | null;
    unlimitedBackorder?: boolean;
  }) => {
    if (!showBackorderAvailabilityPrompt || !backorderAvailabilityPrompt) {
      return null;
    }

    const hasBackorderAvailablity = !!availableForBackorder || unlimitedBackorder;

    if (!hasBackorderAvailablity) {
      return null;
    }

    return backorderAvailabilityPrompt;
  };

  const streamableStockDisplayData = Streamable.from(async () => {
    const [product, variant, inventorySetting] = await Streamable.all([
      streamableProductInventory,
      streamableProductVariantInventory,
      streamableInventorySettings,
    ]);

    if (!inventorySetting) {
      return null;
    }

    let inventory;

    if (product.inventory.hasVariantInventory) {
      inventory = variant?.inventory;
    } else {
      inventory = product.inventory;
    }

    if (!inventory) {
      return null;
    }

    const {
      showOutOfStockMessage,
      stockLevelDisplay,
      defaultOutOfStockMessage,
      showBackorderAvailabilityPrompt,
      showBackorderMessage,
      showQuantityOnBackorder,
      backorderAvailabilityPrompt,
    } = inventorySetting;

    if (!inventory.isInStock) {
      return showOutOfStockMessage
        ? { stockLevelMessage: defaultOutOfStockMessage, backorderAvailabilityPrompt: null }
        : null;
    }

    const {
      availableToSell,
      warningLevel,
      availableOnHand,
      availableForBackorder,
      unlimitedBackorder,
    } = inventory.aggregated ?? {};

    if (stockLevelDisplay === 'DONT_SHOW') {
      return {
        stockLevelMessage: t('ProductDetails.inStock'),
        backorderAvailabilityPrompt: null,
      };
    }

    const showsBackorderInfo =
      showBackorderAvailabilityPrompt || showBackorderMessage || showQuantityOnBackorder;

    // if no backorder info is to be displayed, then availableToSell is the stock quantity to be used
    const stockQuantity = showsBackorderInfo ? availableOnHand : availableToSell;

    if (!showsBackorderInfo && !stockQuantity) {
      return null;
    }

    if (stockLevelDisplay === 'SHOW_WHEN_LOW') {
      if (!warningLevel) {
        return null;
      }

      if (stockQuantity && stockQuantity > warningLevel) {
        return null;
      }
    }

    const availabilityMessage = getBackorderAvailabilityPrompt({
      showBackorderAvailabilityPrompt,
      backorderAvailabilityPrompt,
      availableForBackorder,
      unlimitedBackorder,
    });

    if (!availabilityMessage && stockQuantity === undefined) {
      return null;
    }

    return {
      stockLevelMessage: t('ProductDetails.currentStock', {
        quantity: stockQuantity ?? 0,
      }),
      backorderAvailabilityPrompt: availabilityMessage,
    };
  });

  const streamableBackorderDisplayData = Streamable.from(async () => {
    const [product, variant, inventorySetting] = await Streamable.all([
      streamableProductInventory,
      streamableProductVariantInventory,
      streamableInventorySettings,
    ]);

    let inventory;

    if (!product.inventory.hasVariantInventory) {
      inventory = product.inventory;
    } else {
      inventory = variant?.inventory;
    }

    if (!inventory?.aggregated || !inventorySetting) {
      return {
        availableOnHand: 0,
        availableForBackorder: 0,
        unlimitedBackorder: false,
        showQuantityOnBackorder: false,
        backorderMessage: null,
      };
    }

    const inventoryData = {
      availableOnHand: inventory.aggregated.availableOnHand,
      availableForBackorder: inventory.aggregated.availableForBackorder ?? 0,
      unlimitedBackorder: inventory.aggregated.unlimitedBackorder,
    };

    const { showQuantityOnBackorder, showBackorderMessage } = inventorySetting;

    const hasBackorderAvailablity =
      inventoryData.availableForBackorder > 0 || inventoryData.unlimitedBackorder;

    if (!hasBackorderAvailablity || !showBackorderMessage) {
      return {
        ...inventoryData,
        showQuantityOnBackorder: showQuantityOnBackorder && hasBackorderAvailablity,
        backorderMessage: null,
      };
    }

    let variantLocations;

    if (product.inventory.hasVariantInventory) {
      variantLocations = variant?.inventory?.byLocation;
    } else {
      const variants = removeEdgesAndNodes(product.variants);
      const baseVariant = variants.find((v) => v.sku === product.sku);

      variantLocations = baseVariant?.inventory?.byLocation;
    }

    if (!variantLocations) {
      return {
        ...inventoryData,
        showQuantityOnBackorder,
        backorderMessage: null,
      };
    }

    const inventoryByLocation = removeEdgesAndNodes(variantLocations).at(0);

    return {
      ...inventoryData,
      showQuantityOnBackorder,
      backorderMessage: inventoryByLocation?.backorderMessage || null,
    };
  });

  const streameableAccordions = Streamable.from(async () => {
    const product = await streamableProduct;

    const customFields = removeEdgesAndNodes(product.customFields);

    const specifications = [
      {
        name: t('ProductDetails.Accordions.sku'),
        value: product.sku,
      },
      {
        name: t('ProductDetails.Accordions.weight'),
        value: `${product.weight?.value} ${product.weight?.unit}`,
      },
      {
        name: t('ProductDetails.Accordions.condition'),
        value: product.condition,
      },
      ...customFields
        .filter(
          (field) =>
            !isCareGuideField(field.name) &&
            !isStaffVoiceField(field.name) &&
            !isSizeGuideField(field.name),
        )
        .map((field) => ({
          name: field.name,
          value: field.value,
        })),
    ];

    return [
      ...(specifications.length
        ? [
            {
              title: t('ProductDetails.Accordions.specifications'),
              content: (
                <div className="prose @container">
                  <dl className="flex flex-col gap-4">
                    {specifications.map((field, index) => (
                      <div className="grid grid-cols-1 gap-2 @lg:grid-cols-2" key={index}>
                        <dt>
                          <strong>{field.name}</strong>
                        </dt>
                        <dd>{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ),
            },
          ]
        : []),
      ...(product.warranty
        ? [
            {
              title: t('ProductDetails.Accordions.warranty'),
              content: (
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{
                    __html: rewriteWysiwygContentUrls(product.warranty),
                  }}
                />
              ),
            },
          ]
        : []),
    ];
  });

  /**
   * Extracts care-guide and guide-link data from product custom fields.
   * The client manages these via BigCommerce Admin → Products → Custom Fields.
   *
   * Recognised field names:
   *   care_guide_title, care_guide_subtitle, care_wash_notice, care_instructions
   *   guide_link_1_label / guide_link_1_url, guide_link_2_label / guide_link_2_url, …
   */
  const streamableCareGuideData = Streamable.from(async () => {
    const product = await streamableProduct;
    const customFields = removeEdgesAndNodes(product.customFields);

    const getField = (name: string) => {
      const lower = name.toLowerCase();

      return customFields.find((f) => f.name.trim().toLowerCase() === lower)?.value;
    };

    // Check if "Show Guide" is set to "Yes"
    const showGuideVal =
      getField('show guide') ?? getField('show guid') ?? getField('show_guide');
    const isGuideEnabled =
      showGuideVal != null &&
      ['yes', 'true', '1', 'y'].includes(showGuideVal.trim().toLowerCase());

    if (!isGuideEnabled) {
      return null;
    }

    // Care guide section overrides
    const careGuide = {
      title: getField('care_guide_title'),
      subtitle: getField('care_guide_subtitle'),
      washNotice: getField('care_wash_notice'),
      careInstructions: getField('care_instructions'),
    };

    // Guide links: collect pairs of guide_link_N_label / guide_link_N_url
    const links: Array<{ label: string; href: string; target?: string }> = [];

    for (let i = 1; i <= 10; i++) {
      const label = getField(`guide_link_${i}_label`);
      const url = getField(`guide_link_${i}_url`);

      if (label && url) {
        links.push({ label, href: url, target: '_blank' });
      }
    }

    return { careGuide, links: links.length > 0 ? links : undefined };
  });

  const streamableStaffNote = Streamable.from(async () => {
    const product = await streamableProduct;
    const customFields = removeEdgesAndNodes(product.customFields);

    const getField = (name: string) => {
      const lower = name.toLowerCase();

      return customFields.find((f) => f.name.trim().toLowerCase() === lower)?.value;
    };

    // Check if staff voice / note is explicitly disabled
    const showVoiceVal =
      getField('show staff voice') ??
      getField('show_staff_voice') ??
      getField('show staff note') ??
      getField('show_staff_note');

    if (
      showVoiceVal != null &&
      ['no', 'false', '0', 'n'].includes(showVoiceVal.trim().toLowerCase())
    ) {
      return null;
    }

    const title =
      getField('staff_voice_title') ??
      getField('staff_note_title') ??
      'STAFF VOICE';

    const content =
      getField('staff_voice') ??
      getField('staff_note') ??
      getField('staff_voice_content') ??
      getField('staff_note_content');

    const html =
      getField('staff_voice_html') ??
      getField('staff_note_html');

    const links: Array<{ label: string; href: string }> = [];

    for (let i = 1; i <= 5; i++) {
      const label =
        getField(`staff_voice_link_${i}_label`) ??
        getField(`staff_note_link_${i}_label`);
      const href =
        getField(`staff_voice_link_${i}_url`) ??
        getField(`staff_note_link_${i}_url`) ??
        getField(`staff_voice_link_${i}_href`) ??
        getField(`staff_note_link_${i}_href`);

      if (label && href) {
        links.push({ label, href });
      }
    }

    return {
      title,
      content,
      html,
      links: links.length > 0 ? links : undefined,
    };
  });

  const streameableRelatedProducts = Streamable.from(async () => {
    const product = await streamableProductPricingAndRelatedProducts;

    if (!product) {
      return [];
    }

    const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

    return productCardTransformer(relatedProducts, format, undefined, undefined, taxDisplay);
  });

  const streamableMinQuantity = Streamable.from(async () => {
    const product = await streamableProduct;

    return product.minPurchaseQuantity;
  });

  const streamableMaxQuantity = Streamable.from(async () => {
    const product = await streamableProduct;

    return product.maxPurchaseQuantity;
  });

  const streamableAnalyticsData = Streamable.from(async () => {
    const [extendedProduct, pricingProduct] = await Streamable.all([
      streamableProduct,
      streamableProductPricingAndRelatedProducts,
    ]);

    return {
      id: extendedProduct.entityId,
      name: extendedProduct.name,
      sku: extendedProduct.sku,
      brand: extendedProduct.brand?.name ?? '',
      price: pricingProduct?.pricesIncludingTax?.price.value ?? 0,
      currency: pricingProduct?.pricesIncludingTax?.price.currencyCode ?? '',
    };
  });

  const promotionCallouts = removeEdgesAndNodes(baseProduct.featuredPromotions).map((p) => ({
    id: p.entityId.toString(),
    text: p.text,
  }));

  const streamableUser = Streamable.from(async () => {
    const session = await auth();
    const firstName = session?.user?.firstName ?? '';
    const lastName = session?.user?.lastName ?? '';

    if (!firstName || !lastName) {
      return { email: session?.user?.email ?? '', name: '' };
    }

    const lastInitial = lastName.charAt(0).toUpperCase();
    const obfuscatedName = `${firstName} ${lastInitial}.`;

    return { email: session?.user?.email ?? '', name: obfuscatedName };
  });

  const streamableBreadcrumbs = Streamable.from(async (): Promise<Breadcrumb[]> => {
    const category = removeEdgesAndNodes(baseProduct.categories).at(0);
    const categoryBreadcrumbs = category ? breadcrumbsTransformer(category.breadcrumbs) : [];

    return [
      { label: 'Home', href: '/' },
      ...categoryBreadcrumbs,
      { label: baseProduct.name, href: '#' },
    ];
  });

  return (
    <>
      <ProductAnalyticsProvider data={streamableAnalyticsData}>
        <ProductDetail
          action={addToCart}
          additionalActions={
            <WishlistButton
              formId={detachedWishlistFormId}
              productId={productId}
              productSku={streamableProductSku}
            />
          }
          additionalInformationTitle={t('ProductDetails.additionalInformation')}
          breadcrumbs={streamableBreadcrumbs}
          ctaDisabled={streameableCtaDisabled}
          ctaLabel={streameableCtaLabel}
          decrementLabel={t('ProductDetails.decreaseQuantity')}
          emptySelectPlaceholder={t('ProductDetails.emptySelectPlaceholder')}
          fields={productOptionsTransformer(
            baseProduct.productOptions,
            sizeGuideContent ? <SizeGuideModal content={sizeGuideContent} /> : undefined,
          )}
          incrementLabel={t('ProductDetails.increaseQuantity')}
          loadMoreImagesAction={getMoreProductImages}
          prefetch={true}
          product={{
            id: baseProduct.entityId.toString(),
            title: baseProduct.name,
            description: (
              <div
                dangerouslySetInnerHTML={{
                  __html: rewriteWysiwygContentUrls(baseProduct.description),
                }}
              />
            ),
            href: baseProduct.path,
            images: streamableImages,
            price: streamablePrices,
            reviewsEnabled,
            showRating,
            numberOfReviews: baseProduct.reviewSummary.numberOfReviews,
            badge:
              'customFields' in baseProduct && baseProduct.customFields
                ? removeEdgesAndNodes(baseProduct.customFields).find(
                    (field) => field.name.toLowerCase() === 'badge',
                  )?.value
                : undefined,
            subtitle: baseProduct.brand?.name,
            brandLink: baseProduct.brand?.name ? `/brands/${baseProduct.brand.name.toLowerCase().replace(/\s+/g, '-')}` : undefined,
            category: (() => {
              const category = removeEdgesAndNodes(baseProduct.categories).at(0);
              const crumbs = category ? breadcrumbsTransformer(category.breadcrumbs) : [];
              const lastCrumb = crumbs.at(-1);
              if (lastCrumb && lastCrumb.href) {
                return { name: lastCrumb.label, href: lastCrumb.href };
              }
              return undefined;
            })(),
            categoryHierarchy: (() => {
              const category = removeEdgesAndNodes(baseProduct.categories).at(0);
              const crumbs = category ? breadcrumbsTransformer(category.breadcrumbs) : [];
              return crumbs.map((c) => ({ label: c.label, href: c.href }));
            })(),
            rating: baseProduct.reviewSummary.averageRating,
            accordions: streameableAccordions,
            minQuantity: streamableMinQuantity,
            maxQuantity: streamableMaxQuantity,
            stockDisplayData: streamableStockDisplayData,
            backorderDisplayData: streamableBackorderDisplayData,
          }}
          careGuideData={streamableCareGuideData}
          staffNoteData={streamableStaffNote}
          productId={baseProduct.entityId}
          promotionCallouts={promotionCallouts}
          quantityLabel={t('ProductDetails.quantity')}
          recaptchaSiteKey={recaptchaSiteKey}
          reviewFormAction={submitReview}
          thumbnailLabel={t('ProductDetails.thumbnail')}
          user={streamableUser}
        />
      </ProductAnalyticsProvider>

      <Stream fallback={null} value={streamableVideos}>
        {(videos) => videos.length > 0 && <ProductVideos videos={videos} />}
      </Stream>

      <FeaturedProductCarousel
        cta={{ label: t('RelatedProducts.cta'), href: '/shop-all' }}
        emptyStateSubtitle={t('RelatedProducts.browseCatalog')}
        emptyStateTitle={t('RelatedProducts.noRelatedProducts')}
        nextLabel={t('RelatedProducts.nextProducts')}
        previousLabel={t('RelatedProducts.previousProducts')}
        products={streameableRelatedProducts}
        scrollbarLabel={t('RelatedProducts.scrollbar')}
        title={t('RelatedProducts.title')}
      />

      {showRating && (
        <div id="reviews">
          <Reviews
            productId={productId}
            recaptchaSiteKey={recaptchaSiteKey}
            searchParams={searchParams}
            streamableImages={streamableImages}
            streamableProduct={streamableProduct}
          />
        </div>
      )}

      <Stream
        fallback={null}
        value={Streamable.from(async () =>
          Streamable.all([streamableProduct, streamableProductPricingAndRelatedProducts]),
        )}
      >
        {([extendedProduct, pricingProduct]) => (
          <>
            <ProductSchema
              product={{
                ...extendedProduct,
                pricesIncludingTax: pricingProduct?.pricesIncludingTax ?? null,
                pricesExcludingTax: pricingProduct?.pricesExcludingTax ?? null,
              }}
              taxDisplay={taxDisplay}
            />
            <ProductViewed
              product={{
                ...extendedProduct,
                pricesIncludingTax: pricingProduct?.pricesIncludingTax ?? null,
                pricesExcludingTax: pricingProduct?.pricesExcludingTax ?? null,
              }}
              taxDisplay={taxDisplay}
            />
          </>
        )}
      </Stream>

      <WishlistButtonForm
        formId={detachedWishlistFormId}
        productId={productId}
        productSku={streamableProductSku}
        searchParams={searchParams}
      />
    </>
  );
}
