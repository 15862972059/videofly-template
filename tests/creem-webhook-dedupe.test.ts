// @vitest-environment node

import { describe, expect, test } from "vitest";

import {
  buildCreemOneTimeOrderNo,
  buildCreemSubscriptionCreditOrderNo,
} from "@/lib/auth/creem-webhook";

describe("Creem subscription webhook dedupe", () => {
  test("does not grant credits for non-payment subscription access events", () => {
    const activeOrderNo = buildCreemSubscriptionCreditOrderNo({
      reason: "subscription_active",
      subscriptionId: "sub_123",
      userId: "user_1",
    });

    expect(activeOrderNo).toBeNull();
  });

  test("uses the paid transaction id as the subscription credit dedupe key", () => {
    const orderNo = buildCreemSubscriptionCreditOrderNo({
      reason: "subscription_paid",
      subscriptionId: "sub_123",
      lastTransactionId: "txn_123",
      userId: "user_1",
    });

    expect(orderNo).toBe("creem_sub_txn_txn_123");
  });

  test("falls back to the paid event id when no transaction id is available", () => {
    const orderNo = buildCreemSubscriptionCreditOrderNo({
      reason: "subscription_paid",
      subscriptionId: "sub_123",
      webhookId: "evt_456",
      userId: "user_1",
    });

    expect(orderNo).toBe("creem_sub_event_evt_456");
  });

  test("uses subscription billing period as the last stable fallback", () => {
    const orderNo = buildCreemSubscriptionCreditOrderNo({
      reason: "subscription_paid",
      subscriptionId: "sub_123",
      currentPeriodStart: "2026-05-01T00:00:00.000Z",
      currentPeriodEnd: "2026-06-01T00:00:00.000Z",
      userId: "user_1",
    });

    expect(orderNo).toBe(
      "creem_sub_period_sub_123_2026-05-01T00:00:00.000Z_2026-06-01T00:00:00.000Z"
    );
  });

  test("refuses subscription credit grants without a stable paid-event key", () => {
    const orderNo = buildCreemSubscriptionCreditOrderNo({
      reason: "subscription_paid",
      userId: "user_2",
    });

    expect(orderNo).toBeNull();
  });
});

describe("Creem one-time checkout dedupe", () => {
  test("uses order id before webhook event id", () => {
    const orderNo = buildCreemOneTimeOrderNo({
      orderId: "ord_123",
      checkoutId: "chk_123",
      webhookId: "evt_123",
    });

    expect(orderNo).toBe("creem_order_ord_123");
  });

  test("falls back to checkout id and then webhook event id", () => {
    expect(
      buildCreemOneTimeOrderNo({
        checkoutId: "chk_123",
        webhookId: "evt_123",
      })
    ).toBe("creem_checkout_chk_123");

    expect(buildCreemOneTimeOrderNo({ webhookId: "evt_123" })).toBe(
      "creem_event_evt_123"
    );
  });

  test("refuses one-time grants without a stable payment key", () => {
    expect(buildCreemOneTimeOrderNo({})).toBeNull();
  });
});
