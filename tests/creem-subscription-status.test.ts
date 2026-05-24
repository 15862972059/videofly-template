// @vitest-environment node

import { describe, expect, test } from "vitest";

import {
  hasLocalCreemAccess,
  selectBestLocalCreemSubscription,
  type LocalCreemSubscriptionRecord,
} from "@/services/creem-subscription";

describe("Creem subscription status", () => {
  test("treats active subscriptions as having access", () => {
    expect(
      hasLocalCreemAccess({
        status: "active",
        currentPeriodEnd: null,
      })
    ).toBe(true);
  });

  test("treats paid subscriptions as having access", () => {
    expect(
      hasLocalCreemAccess({
        status: "paid",
        currentPeriodEnd: null,
      })
    ).toBe(true);
  });

  test("treats canceled subscriptions as active until the paid period ends", () => {
    expect(
      hasLocalCreemAccess(
        {
          status: "canceled",
          currentPeriodEnd: new Date("2026-06-01T00:00:00.000Z"),
        },
        new Date("2026-05-24T00:00:00.000Z")
      )
    ).toBe(true);
  });

  test("treats canceled subscriptions without remaining period as inactive", () => {
    expect(
      hasLocalCreemAccess(
        {
          status: "canceled",
          currentPeriodEnd: new Date("2026-05-01T00:00:00.000Z"),
        },
        new Date("2026-05-24T00:00:00.000Z")
      )
    ).toBe(false);
  });

  test("prefers the active subscription when multiple records exist", () => {
    const records: LocalCreemSubscriptionRecord[] = [
      {
        productId: "prod_old",
        subscriptionId: "sub_old",
        status: "expired",
        currentPeriodEnd: new Date("2026-05-01T00:00:00.000Z"),
        updatedAt: new Date("2026-05-20T00:00:00.000Z"),
      },
      {
        productId: "prod_live",
        subscriptionId: "sub_live",
        status: "active",
        currentPeriodEnd: new Date("2026-06-01T00:00:00.000Z"),
        updatedAt: new Date("2026-05-21T00:00:00.000Z"),
      },
    ];

    expect(
      selectBestLocalCreemSubscription(
        records,
        new Date("2026-05-24T00:00:00.000Z")
      )
    ).toMatchObject({
      subscriptionId: "sub_live",
      hasAccess: true,
    });
  });
});
