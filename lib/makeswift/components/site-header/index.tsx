import { MakeswiftComponent } from '@makeswift/runtime/next';
import { type ComponentPropsWithoutRef } from 'react';

import {
  type EditorialMenuOverlayState,
  emptyEditorialMenuOverlayState,
} from '@/vibes/soul/primitives/editorial-menu-overlay';
import { HeaderSection } from '@/vibes/soul/sections/header-section';
import { asSecondaryNavLinks } from '~/lib/header/secondary-nav';
import { getComponentSnapshot } from '~/lib/makeswift/client';

import { PropsContextProvider } from './client';
import { COMPONENT_TYPE } from './register';

type Props = ComponentPropsWithoutRef<typeof HeaderSection> & {
  snapshotId?: string;
  label?: string;
};

export const SiteHeader = async ({
  snapshotId = 'site-header',
  label = 'Site Header',
  navigation,
  ...props
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);
  const [links, primaryLinks, secondaryLinksRaw] = await Promise.all([
    navigation.links,
    navigation.primaryLinks ?? navigation.links,
    navigation.secondaryLinks ?? Promise.resolve([]),
  ]);
  const secondaryLinks = asSecondaryNavLinks(secondaryLinksRaw);
  const menuOverlayState: EditorialMenuOverlayState =
    navigation.menuOverlayState ?? emptyEditorialMenuOverlayState;

  return (
    <PropsContextProvider
      value={{
        ...props,
        navigation: {
          ...navigation,
          links,
          primaryLinks,
          secondaryLinks,
          menuOverlayState,
        },
      }}
    >
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};
