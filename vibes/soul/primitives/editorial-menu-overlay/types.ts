export interface EditorialMenuLink {
  label: string;
  href: string;
}

export interface EditorialMenuPrimaryLink {
  entityId?: number;
  label: string;
  href: string;
  groups?: Array<{
    label?: string;
    href?: string;
    links: EditorialMenuLink[];
  }>;
}

export interface EditorialMenuOverlayFeatured {
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
  href?: string;
}

export interface EditorialMenuOverlayContent {
  contentsLinks: EditorialMenuLink[];
  featured?: EditorialMenuOverlayFeatured;
  footerTitle?: string;
  footerLinks: EditorialMenuLink[];
}

export interface EditorialMenuAudiencePanel {
  itemsLinks?: EditorialMenuLink[];
  trendLinks?: EditorialMenuLink[];
  contentsLinks?: EditorialMenuLink[];
  featured?: EditorialMenuOverlayFeatured;
  footerTitle?: string;
  footerLinks?: EditorialMenuLink[];
}

export interface EditorialMenuOverlayState {
  defaultPanel: EditorialMenuOverlayContent;
  defaultItems: EditorialMenuLink[];
  panelsByEntityId: Record<number, EditorialMenuAudiencePanel>;
}

export const emptyEditorialMenuOverlayState: EditorialMenuOverlayState = {
  defaultPanel: { contentsLinks: [], footerLinks: [] },
  defaultItems: [],
  panelsByEntityId: {},
};

function mergeFeatured(
  defaultFeatured: EditorialMenuOverlayFeatured | undefined,
  override: EditorialMenuOverlayFeatured | undefined,
): EditorialMenuOverlayFeatured | undefined {
  if (override == null) {
    return defaultFeatured;
  }

  const merged = { ...defaultFeatured, ...override };
  const hasContent = merged.caption?.trim() || merged.imageSrc?.trim();

  return hasContent ? merged : defaultFeatured;
}

export function resolveMenuForActiveTab(
  state: EditorialMenuOverlayState,
  activeRoot: EditorialMenuPrimaryLink | undefined,
): {
  items: EditorialMenuLink[];
  trendLinks: EditorialMenuLink[];
  panel: EditorialMenuOverlayContent;
} {
  const entityId = activeRoot?.entityId;
  const panelOverride = entityId != null ? state.panelsByEntityId[entityId] : undefined;

  const items =
    panelOverride?.itemsLinks != null && panelOverride.itemsLinks.length > 0
      ? panelOverride.itemsLinks
      : state.defaultItems;

  const trendLinks = panelOverride?.trendLinks ?? [];

  const contentsLinks =
    panelOverride?.contentsLinks != null && panelOverride.contentsLinks.length > 0
      ? panelOverride.contentsLinks
      : state.defaultPanel.contentsLinks;

  const footerLinks =
    panelOverride?.footerLinks != null && panelOverride.footerLinks.length > 0
      ? panelOverride.footerLinks
      : state.defaultPanel.footerLinks;

  const footerTitle =
    panelOverride?.footerTitle?.trim() || state.defaultPanel.footerTitle?.trim() || undefined;

  const featured = mergeFeatured(state.defaultPanel.featured, panelOverride?.featured);

  return {
    items,
    trendLinks,
    panel: { contentsLinks, footerLinks, footerTitle, featured },
  };
}

export function featuredHasContent(featured: EditorialMenuOverlayFeatured | undefined): boolean {
  if (featured == null) {
    return false;
  }

  return Boolean(featured.caption?.trim() || featured.imageSrc?.trim());
}
