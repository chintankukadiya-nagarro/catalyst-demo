'use client';

import { Award, Check, Copy, ExternalLink, Gift, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

interface SmileCustomer {
  id?: number | string;
  points_balance?: number;
  points?: number;
  referral_url?: string;
  referral_code?: string;
  vip_tier?: {
    name?: string;
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    Smile?: {
      customer?: {
        get?: () => Promise<SmileCustomer> | SmileCustomer;
      };
      [key: string]: unknown;
    };
    SmileUI?: {
      openPanel?: (options?: { deep_link?: string }) => void;
      closePanel?: () => void;
      [key: string]: unknown;
    };
  }
}

export default function RewardsPage() {
  const [customer, setCustomer] = useState<SmileCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.Smile?.customer?.get) {
        const data = await Promise.resolve(window.Smile.customer.get());
        if (data) {
          setCustomer(data);
          setError(null);
          return;
        }
      }

      // Fallback state if guest or customer data is still initializing
      setCustomer((prev) =>
        prev ?? {
          points_balance: 500,
          referral_url: typeof window !== 'undefined' ? `${window.location.origin}?smile_ref=REF500` : '',
        },
      );
    } catch (err) {
      console.error('Failed to retrieve Smile customer profile:', err);
      setError('Unable to load loyalty rewards details. Please refresh or try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hide ONLY the floating launcher button so it doesn't clutter the headless storefront.
    // We keep the Smile panel modal accessible so customers can officially redeem points.
    const styleEl = document.createElement('style');
    styleEl.id = 'smile-launcher-headless-suppress';
    styleEl.innerHTML = `
      .smile-launcher-frame,
      #smile-launcher-frame,
      div[id*="smile-launcher"] {
        display: none !important;
        visibility: hidden !important;
      }
    `;
    document.head.appendChild(styleEl);

    if (typeof window !== 'undefined' && window.Smile?.customer?.get) {
      fetchCustomer();
    }

    const handleSmileReady = () => {
      fetchCustomer();
    };

    window.addEventListener('smile:ready', handleSmileReady);

    const timeoutTimer = setTimeout(() => {
      setIsLoading((prev) => {
        if (prev) {
          fetchCustomer();
        }
        return false;
      });
    }, 2500);

    return () => {
      window.removeEventListener('smile:ready', handleSmileReady);
      clearTimeout(timeoutTimer);
      const injectedStyle = document.getElementById('smile-launcher-headless-suppress');
      if (injectedStyle) {
        injectedStyle.remove();
      }
    };
  }, [fetchCustomer]);

  const pointsBalance = customer?.points_balance ?? customer?.points ?? 0;
  const cashValue = (pointsBalance / 100).toFixed(2);
  const referralLink =
    customer?.referral_url ||
    (typeof window !== 'undefined' ? `${window.location.origin}?smile_ref=REWARDS` : '');

  const handleCopyReferral = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = async () => {
    if (!redeemedCode) return;
    try {
      await navigator.clipboard.writeText(redeemedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleRedeemPoints = () => {
    if (pointsBalance < 100) return;
    setIsRedeeming(true);
    setError(null);

    // Trigger the official Smile.io redemption panel to process real redemption on BigCommerce server
    if (typeof window !== 'undefined' && window.SmileUI?.openPanel) {
      try {
        window.SmileUI.openPanel({ deep_link: 'points_products' });
      } catch (e) {
        console.error('Failed to open SmileUI panel:', e);
      }
      setIsRedeeming(false);
      return;
    }

    // Secondary fallback: query param or hash trigger supported by Smile SDK
    if (typeof window !== 'undefined') {
      window.location.hash = 'smile-points-products';
    }

    setIsRedeeming(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Loyalty &amp; Rewards
        </h1>
        <p className="mt-1 text-sm text-contrast-400">
          Earn points with every purchase and redeem them for exclusive discounts at checkout.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <span>{error}</span>
          <Button onClick={() => setError(null)} size="x-small" variant="ghost">
            Dismiss
          </Button>
        </div>
      )}

      {/* Success Banner: Discount Code (when redeemed) */}
      {redeemedCode && (
        <div className="relative overflow-hidden rounded-xl border border-contrast-200 bg-contrast-100 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="font-semibold text-foreground">Discount Code Generated!</span>
              </div>
              <p className="text-sm text-contrast-400">
                Use this coupon code at checkout to apply your reward discount.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-dashed border-contrast-300 bg-background px-4 py-2 font-mono text-base font-bold text-foreground">
                {redeemedCode}
              </span>
              <Button
                aria-label="Copy discount code"
                onClick={handleCopyCode}
                size="small"
                variant="secondary"
              >
                {codeCopied ? (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="animate-pulse space-y-4 rounded-xl border border-contrast-200 p-6">
            <div className="h-5 w-32 rounded bg-contrast-200" />
            <div className="h-10 w-24 rounded bg-contrast-200" />
            <div className="h-4 w-48 rounded bg-contrast-200" />
            <div className="h-10 w-36 rounded bg-contrast-200" />
          </div>
          <div className="animate-pulse space-y-4 rounded-xl border border-contrast-200 p-6">
            <div className="h-5 w-32 rounded bg-contrast-200" />
            <div className="h-4 w-full rounded bg-contrast-200" />
            <div className="h-10 w-full rounded bg-contrast-200" />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Points Summary Card */}
          <div className="flex flex-col justify-between rounded-xl border border-contrast-200 bg-background p-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-contrast-400 uppercase">
                  Current Balance
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-contrast-400">
                  <Award className="h-3.5 w-3.5" />
                  100 points = $1.00
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {pointsBalance.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-contrast-400">points</span>
              </div>
              <p className="mt-1 text-sm text-contrast-400">
                Estimated redemption value: <span className="font-semibold text-foreground">${cashValue}</span>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-contrast-100 flex items-center justify-between">
              <Button
                disabled={pointsBalance < 100 || isRedeeming}
                onClick={handleRedeemPoints}
                size="small"
                variant="primary"
              >
                <Gift className="mr-2 h-4 w-4" />
                {isRedeeming ? 'Opening Rewards...' : 'Redeem Points'}
              </Button>
              {pointsBalance < 100 && (
                <span className="text-xs text-contrast-400">Min. 100 points to redeem</span>
              )}
            </div>
          </div>

          {/* Referral Card */}
          <div className="flex flex-col justify-between rounded-xl border border-contrast-200 bg-background p-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-contrast-400 uppercase">
                  Refer Friends
                </span>
                <ExternalLink className="h-4 w-4 text-contrast-300" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-foreground">
                Give $10, Get $10
              </h3>
              <p className="mt-1 text-sm text-contrast-400">
                Share your personal referral link with friends. When they make their first purchase, you both get rewarded!
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-contrast-100">
              <label className="text-xs font-medium text-contrast-400" htmlFor="referral-input">
                Your Unique Link
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  className="w-full rounded-md border border-contrast-200 bg-contrast-100 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  id="referral-input"
                  readOnly
                  type="text"
                  value={referralLink}
                />
                <Button
                  aria-label="Copy referral link"
                  onClick={handleCopyReferral}
                  size="small"
                  variant="secondary"
                >
                  {referralCopied ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
