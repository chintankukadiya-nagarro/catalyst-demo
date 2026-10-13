import { type MakeswiftClient } from '@makeswift/runtime/client';
import { Makeswift } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { strict } from 'assert';
import { getLocale } from 'next-intl/server';
import { cache } from 'react';

import { getLocaleRouting } from '~/i18n/locale-config';

import { runtime } from './runtime';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

// `Makeswift` narrows this to a non-null site version, but the client passes `null` for the
// published site.
type SiteVersionArg = Parameters<MakeswiftClient['fetchOptions']>[0];

// Makeswift tags its API responses but declares no revalidate window, and
// `app/[locale]/layout.tsx` sets `fetchCache = 'default-cache'`, so without a TTL Next.js
// caches them indefinitely. In production the publish webhook revalidates the `@@makeswift`
// tag, making this only a backstop; it stays long because time-based expiry serves the
// previous response to the request that triggers the refresh. Makeswift cannot reach a local
// dev server, where the TTL is the only invalidation, so development defaults to 0.
const MAKESWIFT_REVALIDATE_TARGET = resolveRevalidateTarget();

function resolveRevalidateTarget(): number {
  const override = process.env.MAKESWIFT_REVALIDATE_TARGET;

  if (override) {
    return Number(override);
  }

  return process.env.NODE_ENV === 'development' ? 0 : 3600;
}

class CatalystMakeswift extends Makeswift {
  fetchOptions(siteVersion: SiteVersionArg): Record<string, unknown> {
    // The base implementation ignores this argument despite typing it as required.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const options = super.fetchOptions(siteVersion!);

    // Draft mode already sets `cache: 'no-store'`; pairing that with `revalidate` makes
    // Next.js discard both and fall back to caching the builder's edits indefinitely.
    if (siteVersion != null) {
      return options;
    }

    const { next } = options;

    return {
      ...options,
      next: {
        ...(typeof next === 'object' && next !== null ? next : {}),
        revalidate: MAKESWIFT_REVALIDATE_TARGET,
      },
    };
  }
}

export const client = new CatalystMakeswift(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
});

export const getPageSnapshot = async ({ path, locale }: { path: string; locale: string }) => {
  const siteVersion = await getSiteVersion();
  const normalizedLocale = await normalizeLocale(locale);

  try {
    const snapshot = await client.getPageSnapshot(path, {
      siteVersion,
      locale: normalizedLocale,
    });

    if (snapshot != null) {
      return snapshot;
    }
  } catch {
    // localized snapshot fetch failed, fall through to default locale fallback
  }

  // Fallback to default locale if a localized snapshot was not found
  if (normalizedLocale !== undefined) {
    try {
      return await client.getPageSnapshot(path, {
        siteVersion,
        locale: undefined,
      });
    } catch {
      return null;
    }
  }

  return null;
};

export const getComponentSnapshot = async (snapshotId: string) => {
  const locale = await getLocale();
  const siteVersion = await getSiteVersion();
  const normalizedLocale = locale ? await normalizeLocale(locale) : undefined;

  try {
    const snapshot = await client.getComponentSnapshot(snapshotId, {
      siteVersion,
      locale: normalizedLocale,
    });

    if (snapshot != null) {
      return snapshot;
    }
  } catch {
    // localized component fetch failed, fall through to default locale fallback
  }

  // Fallback to default locale if localized component was not found
  if (normalizedLocale !== undefined) {
    try {
      return await client.getComponentSnapshot(snapshotId, {
        siteVersion,
        locale: undefined,
      });
    } catch {
      return null;
    }
  }

  return null;
};

const getMakeswiftSupportedLocales = cache(async (): Promise<string[]> => {
  const apiKey = process.env.MAKESWIFT_SITE_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    const res = await fetch('https://api.makeswift.com/graphql', {
      method: 'POST',
      headers: {
        'makeswift-site-api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: 'query GetSite($apiKey: String!) { siteByApiKey(apiKey: $apiKey) { id } }',
        variables: { apiKey },
      }),
      next: { revalidate: MAKESWIFT_REVALIDATE_TARGET || 3600 },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const rawId = data?.data?.siteByApiKey?.id;

    if (!rawId) {
      return [];
    }

    const siteUuid = Buffer.from(rawId, 'base64').toString('utf8').replace(/^Site:/, '');
    const localesRes = await fetch(`https://api.makeswift.com/v2/locales?siteId=${siteUuid}`, {
      headers: { 'makeswift-site-api-key': apiKey },
      next: { revalidate: MAKESWIFT_REVALIDATE_TARGET || 3600 },
    });

    if (!localesRes.ok) {
      return [];
    }

    const localesData = await localesRes.json();

    if (Array.isArray(localesData?.data)) {
      return localesData.data.map((l: { locale: string }) => l.locale);
    }

    return [];
  } catch {
    return [];
  }
});

async function normalizeLocale(locale: string): Promise<string | undefined> {
  const { defaultLocale } = await getLocaleRouting();

  if (locale.toLowerCase() === defaultLocale.toLowerCase()) {
    return undefined;
  }

  const supportedLocales = await getMakeswiftSupportedLocales();

  if (supportedLocales.length > 0) {
    const matchedLocale = supportedLocales.find(
      (supported) => supported.toLowerCase() === locale.toLowerCase(),
    );

    // If the locale is configured in Makeswift, return its canonical name;
    // otherwise fallback to undefined so Makeswift serves the default locale cleanly.
    return matchedLocale;
  }

  return locale;
}

export async function getMakeswiftPageMetadata({ path, locale }: { path: string; locale: string }) {
  const siteVersion = await getSiteVersion();
  const normalizedLocale = await normalizeLocale(locale);

  let pages: Awaited<ReturnType<typeof client.getPages>>['data'] = [];

  try {
    const { data } = await client.getPages({
      pathPrefix: path,
      locale: normalizedLocale,
      siteVersion,
    });

    pages = data;
  } catch {
    pages = [];
  }

  if ((pages.length === 0 || !pages[0]) && normalizedLocale !== undefined) {
    try {
      const { data } = await client.getPages({
        pathPrefix: path,
        locale: undefined,
        siteVersion,
      });

      pages = data;
    } catch {
      pages = [];
    }
  }

  if (pages.length === 0 || !pages[0]) {
    return null;
  }

  const { title, description } = pages[0];

  return {
    ...(title && { title }),
    ...(description && { description }),
  };
}
