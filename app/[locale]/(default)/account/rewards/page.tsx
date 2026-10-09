'use client';

import { Award, Check, Copy, Gift, RotateCcw, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

export interface RedeemedCouponRecord {
  id: number;
  code: string;
  points: number;
  discountAmount: string;
  dateCreated: string;
  used?: boolean;
}

interface LoyaltyData {
  loggedIn: boolean;
  customerId?: number;
  customerName?: string;
  email?: string;
  points: number;
  activeCoupons: RedeemedCouponRecord[];
  referralCode?: string;
}

export default function RewardsPage() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [refundingId, setRefundingId] = useState<number | null>(null);
  const [selectedPoints, setSelectedPoints] = useState(100);

  const fetchLoyaltyData = useCallback(async () => {
    try {
      const res = await fetch('/api/loyalty/');
      if (!res.ok) {
        throw new Error('Failed to fetch rewards details');
      }
      const json = (await res.json()) as LoyaltyData;
      setData(json);
      setError(null);
    } catch (err) {
      console.error('Error fetching loyalty profile:', err);
      setError('Unable to load loyalty rewards details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  const pointsBalance = data?.points ?? 0;
  const cashValue = (pointsBalance / 100).toFixed(2);
  const activeCoupons = data?.activeCoupons ?? [];
  const referralLink =
    typeof window !== 'undefined' && data?.referralCode
      ? `${window.location.origin}?ref=${data.referralCode}`
      : typeof window !== 'undefined'
      ? `${window.location.origin}?ref=VIPREWARDS`
      : '';

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

  const handleCopyCoupon = async (coupon: RedeemedCouponRecord) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedCodeId(coupon.id);
      setTimeout(() => setCopiedCodeId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleRedeem = async () => {
    if (pointsBalance < selectedPoints) {
      setError(`You need at least ${selectedPoints} points to redeem this discount.`);
      return;
    }

    setIsRedeeming(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/loyalty/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem', pointsToRedeem: selectedPoints }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to redeem points');
        return;
      }

      setSuccessMsg(
        `Reward created! Code ${result.couponCode} ($${result.discountAmount} OFF) is now ready to use at checkout.`,
      );

      // Instantly update data
      setData((prev) =>
        prev
          ? {
              ...prev,
              points: result.newPoints,
              activeCoupons: result.activeCoupons,
            }
          : prev,
      );
    } catch (err) {
      console.error('Redeem error:', err);
      setError('Network error while redeeming points. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleRefund = async (couponId: number) => {
    setRefundingId(couponId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/loyalty/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund', couponId }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to cancel coupon');
        return;
      }

      setSuccessMsg(result.message);

      // Instantly update state
      setData((prev) =>
        prev
          ? {
              ...prev,
              points: result.newPoints,
              activeCoupons: result.activeCoupons,
            }
          : prev,
      );
    } catch (err) {
      console.error('Refund error:', err);
      setError('Failed to cancel coupon and refund points. Please try again.');
    } finally {
      setRefundingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Loyalty &amp; Rewards
        </h1>
        <p className="mt-1 text-sm text-contrast-400">
          Earn points with every purchase and redeem them for genuine discounts at checkout.
        </p>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div
          className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          role="alert"
        >
          <span>{successMsg}</span>
          <Button onClick={() => setSuccessMsg(null)} size="x-small" variant="ghost">
            Dismiss
          </Button>
        </div>
      )}

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

      {/* Main Grid: Balance & Referral Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Balance & Redeem */}
        <div className="flex flex-col justify-between rounded-2xl border border-contrast-200 bg-background p-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-contrast-400">
                Current Balance
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-contrast-400">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                100 points = $1.00
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-10 w-28 animate-pulse rounded bg-contrast-200" />
              ) : (
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {pointsBalance.toLocaleString()}
                </span>
              )}
              <span className="text-base font-medium text-contrast-400">points</span>
            </div>

            <p className="mt-1 text-sm text-contrast-400">
              Estimated redemption value:{' '}
              <span className="font-semibold text-foreground">${cashValue}</span>
            </p>

            {/* Redemption tier selector */}
            <div className="mt-6 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-contrast-400">
                Select Reward Amount
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { pts: 100, val: '$1.00' },
                  { pts: 200, val: '$2.00' },
                  { pts: 500, val: '$5.00' },
                ].map((tier) => (
                  <button
                    key={tier.pts}
                    type="button"
                    onClick={() => setSelectedPoints(tier.pts)}
                    disabled={pointsBalance < tier.pts}
                    className={`rounded-lg border p-2.5 text-center text-xs font-medium transition ${
                      selectedPoints === tier.pts
                        ? 'border-primary bg-primary/10 text-foreground'
                        : pointsBalance < tier.pts
                        ? 'border-contrast-200 opacity-40 cursor-not-allowed text-contrast-300'
                        : 'border-contrast-200 hover:border-contrast-300 text-contrast-500'
                    }`}
                  >
                    <div className="font-bold text-sm">{tier.val} OFF</div>
                    <div className="text-[11px] text-contrast-400">{tier.pts} pts</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              className="w-full sm:w-auto"
              disabled={isLoading || isRedeeming || pointsBalance < selectedPoints}
              onClick={handleRedeem}
            >
              <Gift className="mr-2 h-4 w-4" />
              {isRedeeming
                ? 'Creating BigCommerce Coupon...'
                : `Redeem ${selectedPoints} Points (${(selectedPoints / 100).toFixed(2)}$ OFF)`}
            </Button>
          </div>
        </div>

        {/* Card 2: Refer a Friend */}
        <div className="flex flex-col justify-between rounded-2xl border border-contrast-200 bg-background p-6 shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-contrast-400">
              Refer Friends
            </span>
            <h3 className="mt-2 text-lg font-bold text-foreground">Give $10, Get $10</h3>
            <p className="mt-1 text-sm text-contrast-400">
              Share your personal referral link with friends. When they make their first purchase, you both get rewarded!
            </p>

            <div className="mt-6 space-y-2">
              <label className="text-xs font-medium text-contrast-400">Your Unique Link</label>
              <div className="flex items-center gap-2">
                <input
                  aria-label="Referral Link"
                  className="w-full rounded-lg border border-contrast-200 bg-contrast-100 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  readOnly
                  value={referralLink}
                />
                <Button onClick={handleCopyReferral} size="small" variant="secondary">
                  {referralCopied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-contrast-400">
            <Award className="h-4 w-4 text-primary" />
            <span>Referrals are credited automatically upon checkout.</span>
          </div>
        </div>
      </div>

      {/* Active Rewards Coupons Section */}
      <div className="rounded-2xl border border-contrast-200 bg-background p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
              My Reward Coupons
            </h2>
            <p className="mt-0.5 text-xs text-contrast-400">
              Unused coupons remain active in your account. You can cancel any unused coupon to restore your points.
            </p>
          </div>
          <Button asChild size="small" variant="secondary">
            <Link href="/cart">
              <ShoppingBag className="mr-1.5 h-4 w-4" />
              View Cart
            </Link>
          </Button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-14 animate-pulse rounded-lg bg-contrast-100" />
              <div className="h-14 animate-pulse rounded-lg bg-contrast-100" />
            </div>
          ) : activeCoupons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-contrast-200 p-8 text-center">
              <Gift className="mx-auto h-8 w-8 text-contrast-300" />
              <p className="mt-2 text-sm text-contrast-400">You haven't redeemed any reward coupons yet.</p>
              <p className="mt-0.5 text-xs text-contrast-300">
                Redeem your points above to generate instant discount coupons for checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex flex-col gap-3 rounded-xl border border-contrast-200 bg-contrast-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold tracking-wider text-foreground">
                          {coupon.code}
                        </span>
                        <span className="rounded bg-contrast-200 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                          ${coupon.discountAmount} OFF
                        </span>
                        {coupon.used ? (
                          <span className="rounded bg-contrast-200 px-2 py-0.5 text-[11px] font-medium text-contrast-400">
                            Used in Order
                          </span>
                        ) : (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-contrast-400">
                        Redeemed for {coupon.points} points
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!coupon.used && (
                      <>
                        <Button
                          onClick={() => handleCopyCoupon(coupon)}
                          size="x-small"
                          variant="secondary"
                        >
                          {copiedCodeId === coupon.id ? (
                            <>
                              <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3.5 w-3.5" />
                              Copy Code
                            </>
                          )}
                        </Button>
                        <Button
                          disabled={refundingId === coupon.id}
                          onClick={() => handleRefund(coupon.id)}
                          size="x-small"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <RotateCcw className="mr-1 h-3.5 w-3.5" />
                          {refundingId === coupon.id
                            ? 'Refunding...'
                            : `Cancel & Refund (${coupon.points} pts)`}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="rounded-2xl border border-contrast-200 bg-contrast-100 p-6 md:p-8">
        <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
          How to Earn &amp; Redeem Points
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">1. Place an Order</h4>
              <p className="mt-1 text-xs text-contrast-400">
                Earn 1 point for every $1 spent on all eligible store products.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">2. Redeem Rewards</h4>
              <p className="mt-1 text-xs text-contrast-400">
                Turn points into genuine BigCommerce discount coupon codes right from this page.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">3. Save at Checkout</h4>
              <p className="mt-1 text-xs text-contrast-400">
                Apply your coupon code in the cart or checkout summary for instant savings!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
