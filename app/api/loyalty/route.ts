import { NextResponse } from 'next/server';

import { auth } from '~/auth';

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const AUTH_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

const BC_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-Auth-Token': AUTH_TOKEN ?? '',
};

interface CustomerMetafield {
  id: number;
  key: string;
  value: string;
  namespace: string;
}

interface BCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface RedeemedCouponRecord {
  id: number;
  code: string;
  points: number;
  discountAmount: string;
  dateCreated: string;
  used?: boolean;
}

interface BCCoupon {
  id: number;
  code: string;
  num_uses: number;
  enabled: boolean;
}

async function getBCCustomer(email: string): Promise<BCCustomer | null> {
  const res = await fetch(
    `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/customers?email:in=${encodeURIComponent(email)}`,
    { headers: BC_HEADERS, cache: 'no-store' },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as { data?: BCCustomer[] };

  return data.data?.[0] ?? null;
}

async function getCustomerMetafields(
  customerId: number,
): Promise<{
  pointsMf?: CustomerMetafield;
  points: number;
  couponsMf?: CustomerMetafield;
  coupons: RedeemedCouponRecord[];
}> {
  const res = await fetch(
    `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/customers/${customerId}/metafields?namespace=loyalty`,
    { headers: BC_HEADERS, cache: 'no-store' },
  );

  if (!res.ok) {
    return { points: 500, coupons: [] };
  }

  const data = (await res.json()) as { data?: CustomerMetafield[] };
  const pointsMf = data.data?.find((m) => m.key === 'points');
  const couponsMf = data.data?.find((m) => m.key === 'active_coupons');

  let points = 500;
  if (pointsMf) {
    const parsed = parseInt(pointsMf.value, 10);
    points = isNaN(parsed) ? 500 : parsed;
  } else {
    // Initialize default points
    await fetch(
      `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/customers/${customerId}/metafields`,
      {
        method: 'POST',
        headers: BC_HEADERS,
        body: JSON.stringify({
          permission_set: 'write_and_sf_access',
          namespace: 'loyalty',
          key: 'points',
          value: '500',
          description: 'Customer loyalty reward points',
        }),
      },
    );
  }

  let coupons: RedeemedCouponRecord[] = [];
  if (couponsMf) {
    try {
      coupons = JSON.parse(couponsMf.value) as RedeemedCouponRecord[];
    } catch {
      coupons = [];
    }
  }

  return { pointsMf, points, couponsMf, coupons };
}

async function updatePointsMetafield(
  customerId: number,
  metafieldId: number | undefined,
  newPoints: number,
): Promise<void> {
  if (metafieldId) {
    await fetch(
      `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/customers/${customerId}/metafields/${metafieldId}`,
      {
        method: 'PUT',
        headers: BC_HEADERS,
        body: JSON.stringify({ value: newPoints.toString() }),
      },
    );
  } else {
    await fetch(
      `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/customers/${customerId}/metafields`,
      {
        method: 'POST',
        headers: BC_HEADERS,
        body: JSON.stringify({
          permission_set: 'write_and_sf_access',
          namespace: 'loyalty',
          key: 'points',
          value: newPoints.toString(),
          description: 'Customer loyalty reward points',
        }),
      },
    );
  }
}

async function updateCouponsMetafield(
  customerId: number,
  metafieldId: number | undefined,
  coupons: RedeemedCouponRecord[],
): Promise<void> {
  const jsonVal = JSON.stringify(coupons);

  if (metafieldId) {
    await fetch(
      `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/customers/${customerId}/metafields/${metafieldId}`,
      {
        method: 'PUT',
        headers: BC_HEADERS,
        body: JSON.stringify({ value: jsonVal }),
      },
    );
  } else {
    await fetch(
      `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/customers/${customerId}/metafields`,
      {
        method: 'POST',
        headers: BC_HEADERS,
        body: JSON.stringify({
          permission_set: 'write_and_sf_access',
          namespace: 'loyalty',
          key: 'active_coupons',
          value: jsonVal,
          description: 'Customer active rewards coupon history',
        }),
      },
    );
  }
}

// Check BigCommerce live coupon usage
async function checkCouponUsage(couponId: number): Promise<{ exists: boolean; used: boolean }> {
  try {
    const res = await fetch(
      `https://api.bigcommerce.com/stores/${STORE_HASH}/v2/coupons/${couponId}`,
      { headers: BC_HEADERS, cache: 'no-store' },
    );

    if (res.status === 404) {
      return { exists: false, used: true };
    }

    if (!res.ok) {
      return { exists: true, used: false };
    }

    const data = (await res.json()) as BCCoupon;
    return { exists: true, used: data.num_uses > 0 };
  } catch {
    return { exists: true, used: false };
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ loggedIn: false, points: 0, activeCoupons: [] }, { status: 200 });
    }

    const customer = await getBCCustomer(userEmail);

    if (!customer) {
      return NextResponse.json({ loggedIn: false, points: 0, activeCoupons: [] }, { status: 200 });
    }

    const { points, coupons, couponsMf } = await getCustomerMetafields(customer.id);

    // Filter coupons against real-time BigCommerce status
    const verifiedCoupons: RedeemedCouponRecord[] = [];
    let stateChanged = false;

    for (const c of coupons) {
      const status = await checkCouponUsage(c.id);
      if (status.exists) {
        verifiedCoupons.push({
          ...c,
          used: status.used,
        });
        if (c.used !== status.used) {
          stateChanged = true;
        }
      }
    }

    if (stateChanged && couponsMf) {
      await updateCouponsMetafield(customer.id, couponsMf.id, verifiedCoupons);
    }

    return NextResponse.json({
      loggedIn: true,
      customerId: customer.id,
      customerName: `${customer.first_name} ${customer.last_name}`.trim(),
      email: customer.email,
      points,
      activeCoupons: verifiedCoupons,
      referralCode: `REF-${customer.id}-${customer.first_name.toUpperCase()}`,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Loyalty GET error:', error);

    return NextResponse.json({ error: 'Failed to fetch loyalty details' }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'Please log in to manage points' }, { status: 401 });
    }

    const customer = await getBCCustomer(userEmail);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const body = (await req.json()) as {
      action?: 'redeem' | 'refund';
      pointsToRedeem?: number;
      couponId?: number;
    };

    const { pointsMf, points: currentPoints, couponsMf, coupons } =
      await getCustomerMetafields(customer.id);

    // ==========================================
    // ACTION: REFUND / CANCEL UNUSED COUPON
    // ==========================================
    if (body.action === 'refund') {
      const couponId = body.couponId;
      if (!couponId) {
        return NextResponse.json({ error: 'Coupon ID is required for refund' }, { status: 400 });
      }

      const existingRecord = coupons.find((c) => c.id === couponId);
      if (!existingRecord) {
        return NextResponse.json({ error: 'Coupon not found in your account' }, { status: 404 });
      }

      // Check BigCommerce if coupon was already used in an order
      const status = await checkCouponUsage(couponId);
      if (status.used) {
        return NextResponse.json(
          { error: 'This coupon has already been used in an order and cannot be refunded.' },
          { status: 400 },
        );
      }

      // 1. Delete coupon from BigCommerce
      await fetch(
        `https://api.bigcommerce.com/stores/${STORE_HASH}/v2/coupons/${couponId}`,
        {
          method: 'DELETE',
          headers: BC_HEADERS,
        },
      );

      // 2. Refund points to customer
      const pointsToRefund = existingRecord.points;
      const newPoints = currentPoints + pointsToRefund;
      await updatePointsMetafield(customer.id, pointsMf?.id, newPoints);

      // 3. Remove coupon from active list
      const updatedCoupons = coupons.filter((c) => c.id !== couponId);
      await updateCouponsMetafield(customer.id, couponsMf?.id, updatedCoupons);

      return NextResponse.json({
        success: true,
        message: `Coupon cancelled and ${pointsToRefund} points refunded to your balance!`,
        newPoints,
        activeCoupons: updatedCoupons,
      });
    }

    // ==========================================
    // ACTION: REDEEM POINTS FOR NEW COUPON
    // ==========================================
    const pointsToRedeem = body.pointsToRedeem ?? 100;

    if (pointsToRedeem < 100) {
      return NextResponse.json({ error: 'Minimum redemption is 100 points' }, { status: 400 });
    }

    if (currentPoints < pointsToRedeem) {
      return NextResponse.json(
        { error: `Insufficient points. You have ${currentPoints} points.` },
        { status: 400 },
      );
    }

    const discountAmount = (pointsToRedeem / 100).toFixed(2);
    const newPoints = currentPoints - pointsToRedeem;

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const couponCode = `REW-${pointsToRedeem}-${randomSuffix}`;

    const couponRes = await fetch(
      `https://api.bigcommerce.com/stores/${STORE_HASH}/v2/coupons`,
      {
        method: 'POST',
        headers: BC_HEADERS,
        body: JSON.stringify({
          name: `Loyalty Reward $${discountAmount} OFF`,
          type: 'per_total_discount',
          amount: discountAmount,
          code: couponCode,
          max_uses: 1,
          max_uses_per_customer: 1,
          enabled: true,
          applies_to: {
            entity: 'categories',
            ids: [0], // all categories
          },
        }),
      },
    );

    if (!couponRes.ok) {
      const errText = await couponRes.text();
      // eslint-disable-next-line no-console
      console.error('Failed to create BigCommerce coupon:', errText);

      return NextResponse.json(
        { error: 'Failed to generate discount coupon. Please try again.' },
        { status: 500 },
      );
    }

    const createdCoupon = (await couponRes.json()) as BCCoupon;

    // Decrement points
    await updatePointsMetafield(customer.id, pointsMf?.id, newPoints);

    // Save coupon to customer active coupons
    const newRecord: RedeemedCouponRecord = {
      id: createdCoupon.id,
      code: createdCoupon.code,
      points: pointsToRedeem,
      discountAmount,
      dateCreated: new Date().toISOString(),
      used: false,
    };
    const updatedCoupons = [newRecord, ...coupons];
    await updateCouponsMetafield(customer.id, couponsMf?.id, updatedCoupons);

    return NextResponse.json({
      success: true,
      couponCode: createdCoupon.code,
      discountAmount,
      pointsRedeemed: pointsToRedeem,
      newPoints,
      activeCoupons: updatedCoupons,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Loyalty POST error:', error);

    return NextResponse.json({ error: 'Redemption failed' }, { status: 500 });
  }
}
