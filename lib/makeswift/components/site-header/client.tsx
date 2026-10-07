'use client';

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
  useContext,
} from 'react';

import {
  type EditorialMenuAudiencePanel,
  type EditorialMenuOverlayContent,
  type EditorialMenuOverlayState,
  emptyEditorialMenuOverlayState,
} from '@/vibes/soul/primitives/editorial-menu-overlay';
import { HeaderSection } from '@/vibes/soul/sections/header-section';
import {
  isSecondaryNavKey,
  mergeSecondaryNavLinks,
  type SecondaryNavKey,
  type SecondaryNavLink,
} from '~/lib/header/secondary-nav';

type HeaderSectionProps = ComponentPropsWithoutRef<typeof HeaderSection>;

type NavigationProps = HeaderSectionProps['navigation'];

type NavLink = Awaited<NavigationProps['links']>[number];

type ContextProps = Omit<HeaderSectionProps, 'navigation'> & {
  navigation: Omit<
    NavigationProps,
    'links' | 'primaryLinks' | 'secondaryLinks' | 'layoutVariant' | 'menuOverlayState'
  > & {
    links: NavLink[];
    primaryLinks: NavLink[];
    secondaryLinks: SecondaryNavLink[];
    layoutVariant?: NavigationProps['layoutVariant'];
    menuOverlayState: EditorialMenuOverlayState;
  };
};

const PropsContext = createContext<ContextProps>({
  navigation: {
    giftCertificatesHref: '',
    accountHref: '',
    cartHref: '',
    searchHref: '',
    links: [],
    primaryLinks: [],
    secondaryLinks: [],
    menuOverlayState: emptyEditorialMenuOverlayState,
  },
});

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: ContextProps }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

interface ImageProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
}

interface Props {
  banner: {
    id: string;
    show: boolean;
    allowClose: boolean;
    children?: ReactNode;
  };
  layoutVariant: 'default' | 'editorial';
  links: Array<{
    label: string;
    link: { href: string };
    groups: Array<{
      label: string;
      link: { href: string };
      links: Array<{
        label: string;
        link: { href: string };
      }>;
    }>;
  }>;
  secondaryLinks: Array<{
    key?: string;
    label?: string;
    link?: { href?: string };
  }>;
  menuContentsLinks: Array<{
    label?: string;
    link?: { href?: string };
  }>;
  menuFeatured: {
    imageSrc?: string;
    imageAlt?: string;
    caption?: string;
    title?: string;
    description?: string;
    link?: { href?: string };
  };
  menuFooterTitle?: string;
  menuFooterLinks: Array<{
    label?: string;
    link?: { href?: string };
  }>;
  menuAudiencePanels?: Array<{
    categoryEntityId?: { value?: string; id?: string } | string;
    itemsLinks: Array<{ label?: string; link?: { href?: string } }>;
    trendLinks: Array<{ label?: string; link?: { href?: string } }>;
    contentsLinks: Array<{ label?: string; link?: { href?: string } }>;
    featured: Props['menuFeatured'];
    footerTitle?: string;
    footerLinks: Array<{ label?: string; link?: { href?: string } }>;
  }>;
  logo: {
    desktop: ImageProps;
    mobile: ImageProps;
    link?: { href: string };
  };
  linksPosition: 'center' | 'left' | 'right';
}

function combinePrimaryLinks(passedLinks: NavLink[], links: Props['links']): NavLink[] {
  return [
    ...passedLinks,
    ...links.map(({ label, link, groups }) => ({
      label,
      href: link.href,
      groups: groups.map((group) => ({
        label: group.label,
        href: group.link.href,
        links: group.links.map((item) => ({ label: item.label, href: item.link.href })),
      })),
    })),
  ];
}

function mapSecondaryOverrides(
  overrides: Props['secondaryLinks'],
): Array<{ key?: SecondaryNavKey; label?: string; href?: string }> {
  return overrides.map((item) => ({
    key: item.key != null && isSecondaryNavKey(item.key) ? item.key : undefined,
    label: item.label,
    href: item.link?.href,
  }));
}

function mapMenuLinks(
  items: Array<{ label?: string; link?: { href?: string } }>,
): EditorialMenuOverlayContent['contentsLinks'] {
  return items.flatMap((item) => {
    const label = item.label?.trim();
    const href = item.link?.href?.trim();

    if (!label || !href) {
      return [];
    }

    return [{ label, href }];
  });
}

function buildFeatured(featured: Props['menuFeatured']) {
  const featuredImage = featured.imageSrc?.trim();
  const featuredHref = featured.link?.href?.trim();
  const captionFromField = featured.caption?.trim();
  const legacyCaption = [featured.title?.trim(), featured.description?.trim()]
    .filter(Boolean)
    .join('\n');
  const caption = captionFromField || legacyCaption || undefined;

  if (!caption && !featuredImage) {
    return undefined;
  }

  return {
    imageSrc: featuredImage,
    imageAlt: featured.imageAlt,
    caption,
    href: featuredHref,
  };
}

type MenuAudiencePanelRow = NonNullable<Props['menuAudiencePanels']>[number];

function parseCategoryEntityId(value: MenuAudiencePanelRow['categoryEntityId']): number | null {
  if (value == null) {
    return null;
  }

  const raw = typeof value === 'string' ? value : (value.value ?? value.id);

  if (raw == null || raw === '') {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);

  return Number.isNaN(parsed) ? null : parsed;
}

function buildPanelsByEntityId(
  rows: MenuAudiencePanelRow[],
): Record<number, EditorialMenuAudiencePanel> {
  return rows.reduce<Record<number, EditorialMenuAudiencePanel>>((acc, row) => {
    const entityId = parseCategoryEntityId(row.categoryEntityId);

    if (entityId == null) {
      return acc;
    }

    return {
      ...acc,
      [entityId]: {
        itemsLinks: mapMenuLinks(row.itemsLinks),
        trendLinks: mapMenuLinks(row.trendLinks),
        contentsLinks: mapMenuLinks(row.contentsLinks),
        featured: buildFeatured(row.featured),
        footerTitle: row.footerTitle?.trim() || undefined,
        footerLinks: mapMenuLinks(row.footerLinks),
      },
    };
  }, {});
}

function buildMenuOverlayState(
  props: Props,
  defaultItems: SecondaryNavLink[],
): EditorialMenuOverlayState {
  const defaultPanel: EditorialMenuOverlayContent = {
    contentsLinks: mapMenuLinks(props.menuContentsLinks),
    featured: buildFeatured(props.menuFeatured),
    footerTitle: props.menuFooterTitle?.trim() || undefined,
    footerLinks: mapMenuLinks(props.menuFooterLinks),
  };

  const panelsByEntityId = buildPanelsByEntityId(props.menuAudiencePanels ?? []);

  return {
    defaultPanel,
    defaultItems: defaultItems.map(({ label, href }) => ({ label, href })),
    panelsByEntityId,
  };
}

export const MakeswiftHeader = forwardRef(
  (
    {
      banner,
      layoutVariant,
      links,
      secondaryLinks,
      menuContentsLinks,
      menuFeatured,
      menuFooterTitle,
      menuFooterLinks,
      menuAudiencePanels,
      logo,
      linksPosition,
    }: Props,
    ref: Ref<HTMLDivElement>,
  ) => {
    const { navigation: passedProps, banner: passedBanner } = useContext(PropsContext);
    const combinedBanner = banner.show
      ? {
          ...passedBanner,
          id: banner.id,
          hideDismiss: !banner.allowClose,
          children: banner.children ?? passedBanner?.children,
        }
      : undefined;

    const mergedSecondaryLinks = mergeSecondaryNavLinks(
      passedProps.secondaryLinks,
      mapSecondaryOverrides(secondaryLinks),
    );

    const resolvedLayoutVariant = layoutVariant;
    const combinedPrimaryLinks =
      resolvedLayoutVariant === 'editorial'
        ? passedProps.primaryLinks
        : combinePrimaryLinks(passedProps.primaryLinks, links);
    const combinedDefaultLinks = combinePrimaryLinks(passedProps.links, links);
    const menuOverlayState = buildMenuOverlayState(
      {
        banner,
        layoutVariant,
        links,
        secondaryLinks,
        menuContentsLinks,
        menuFeatured,
        menuFooterTitle,
        menuFooterLinks,
        menuAudiencePanels: menuAudiencePanels ?? [],
        logo,
        linksPosition,
      },
      mergedSecondaryLinks,
    );

    return (
      <HeaderSection
        banner={combinedBanner}
        navigation={{
          ...passedProps,
          layoutVariant: resolvedLayoutVariant,
          links:
            resolvedLayoutVariant === 'editorial' ? combinedPrimaryLinks : combinedDefaultLinks,
          primaryLinks: combinedPrimaryLinks,
          secondaryLinks: mergedSecondaryLinks,
          menuOverlayState,
          logo: logo.desktop.src
            ? { src: logo.desktop.src, alt: logo.desktop.alt }
            : passedProps.logo,
          logoWidth: logo.desktop.width,
          logoHeight: logo.desktop.height,
          mobileLogo: logo.mobile.src
            ? { src: logo.mobile.src, alt: logo.mobile.alt }
            : passedProps.mobileLogo,
          mobileLogoWidth: logo.mobile.width,
          mobileLogoHeight: logo.mobile.height,
          linksPosition,
          logoHref: logo.link?.href ?? passedProps.logoHref,
        }}
        ref={ref}
      />
    );
  },
);
