import {
  Checkbox,
  Combobox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Slot,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';
import { searchCategories } from '~/lib/makeswift/utils/search-categories';

import { MakeswiftHeader } from './client';

export const COMPONENT_TYPE = 'catalyst-makeswift-header';

const banner = Group({
  label: 'Banner',
  preferredLayout: Group.Layout.Popover,
  props: {
    show: Checkbox({ label: 'Show banner', defaultValue: false }),
    allowClose: Checkbox({ label: 'Allow banner to close', defaultValue: true }),
    id: TextInput({ label: 'Banner ID', defaultValue: 'black_friday_2025' }),
    children: Slot(),
  },
});

const logoGroup = (
  label: string,
  defaults: {
    width: number;
    height: number;
  },
) =>
  Group({
    label,
    props: {
      src: Image({ label: 'Logo' }),
      alt: TextInput({ label: 'Alt text', defaultValue: 'Logo alt' }),
      width: Number({ label: 'Max width', suffix: 'px', defaultValue: defaults.width }),
      height: Number({ label: 'Max height', suffix: 'px', defaultValue: defaults.height }),
    },
  });

const logo = Group({
  label: 'Logo',
  preferredLayout: Group.Layout.Popover,
  props: {
    desktop: logoGroup('Desktop', { width: 200, height: 40 }),
    mobile: logoGroup('Mobile', { width: 100, height: 40 }),
    link: Link({ label: 'Logo link' }),
  },
});

const links = List({
  label: 'Links',
  type: Group({
    label: 'Link',
    props: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

const groups = List({
  label: 'Groups',
  type: Group({
    label: 'Link group',
    props: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
      links,
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

const secondaryNavKeyOptions = [
  { value: 'new-arrivals', label: 'new-arrivals' },
  { value: 'brands', label: 'brands' },
  { value: 'category', label: 'category' },
  { value: 'features', label: 'features' },
  { value: 'blog', label: 'blog' },
] as const;

const menuFeatured = Group({
  label: 'Featured promo',
  preferredLayout: Group.Layout.Popover,
  props: {
    imageSrc: Image({ label: 'Image' }),
    imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Promo image' }),
    title: TextInput({ label: 'Title', defaultValue: '' }),
    description: TextInput({ label: 'Description', defaultValue: '' }),
    caption: TextInput({
      label: 'Caption (optional; overrides title + description)',
      defaultValue: '',
    }),
    link: Link({ label: 'Link' }),
  },
});

const menuLinkList = (label: string) =>
  List({
    label,
    type: Group({
      label: 'Link',
      props: {
        label: TextInput({ label: 'Text', defaultValue: 'Link' }),
        link: Link({ label: 'URL' }),
      },
    }),
    getItemLabel: (item) => item?.label ?? 'Link',
  });

const menuAudiencePanels = List({
  label: 'Menu overlay — Per root category panels',
  type: Group({
    label: 'Audience panel',
    props: {
      categoryEntityId: Combobox({
        label: 'BigCommerce root category',
        async getOptions(query) {
          const categories = await searchCategories(query);

          return categories.map((cat) => ({
            id: cat.id,
            label: cat.label,
            value: cat.value,
          }));
        },
      }),
      itemsLinks: menuLinkList('ITEMS links'),
      trendLinks: menuLinkList('Trend / sub-links (optional)'),
      contentsLinks: menuLinkList('CONTENTS links'),
      featured: menuFeatured,
      footerTitle: TextInput({
        label: 'Footer heading (e.g. Stay in the Loop)',
        defaultValue: '',
      }),
      footerLinks: menuLinkList('Footer links'),
    },
  }),
  getItemLabel(item) {
    const categoryLabel =
      item?.categoryEntityId != null && typeof item.categoryEntityId === 'object'
        ? item.categoryEntityId.label
        : undefined;

    return categoryLabel ?? 'Audience panel';
  },
});

runtime.registerComponent(MakeswiftHeader, {
  type: COMPONENT_TYPE,
  label: 'Site Header',
  hidden: true,
  props: {
    banner,
    logo,
    layoutVariant: Select({
      label: 'Header layout',
      options: [
        { value: 'editorial', label: 'Editorial (ELLE-style)' },
        { value: 'default', label: 'Default Catalyst' },
      ],
      defaultValue: 'editorial',
    }),
    menuContentsLinks: menuLinkList('Menu overlay — Default CONTENTS links'),
    menuFeatured,
    menuFooterTitle: TextInput({
      label: 'Menu overlay — Footer heading (e.g. Stay in the Loop)',
      defaultValue: 'Stay in the Loop',
    }),
    menuFooterLinks: menuLinkList('Menu overlay — Default footer links'),
    menuAudiencePanels,
    secondaryLinks: List({
      label: 'Secondary navigation overrides',
      type: Group({
        label: 'Secondary link',
        props: {
          key: Select({
            label: 'Link key',
            options: secondaryNavKeyOptions,
          }),
          label: TextInput({
            label: 'Custom label (optional)',
          }),
          link: Link({
            label: 'Custom URL (optional)',
          }),
        },
      }),
      getItemLabel(item) {
        return item?.key ?? 'Secondary link';
      },
    }),
    links: List({
      label: 'Primary mega-menu extras',
      type: Group({
        label: 'Link',
        props: {
          label: TextInput({ label: 'Text', defaultValue: 'Text' }),
          link: Link({ label: 'URL' }),
          groups,
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Text',
    }),
    linksPosition: Select({
      label: 'Links position (default layout only)',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
  },
});
