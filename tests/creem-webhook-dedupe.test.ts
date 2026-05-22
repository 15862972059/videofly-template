// @vitest-environment node

import { describe, expect, test } from "vitest";

import { buildCreemSubscriptionOrderNo } from "@/lib/auth/creem-webhook";

describe("Creem subscription webhook dedupe", () => {
  test("uses the subscription event id as the canonical dedupe key", () => {
    const activeOrderNo = buildCreemSubscriptionOrderNo({
      subscriptionId: "sub_123",
      customerId: "cust_aaa",
      userId: "user_1",
      productType: "subscription",
    });

    const paidOrderNo = buildCreemSubscriptionOrderNo({
      subscriptionId: "sub_123",
      metadataSubscriptionId: "sub_123",
      customerId: "cust_aaa",
      userId: "user_1",
      productType: "subscription",
    });

    expect(activeOrderNo).toBe("creem_sub_sub_123");
    expect(paidOrderNo).toBe(activeOrderNo);
  });

  test("falls back to metadata subscription id when top-level id is unavailable", () => {
    const orderNo = buildCreemSubscriptionOrderNo({
      metadataSubscriptionId: "sub_meta_456",
      customerId: "cust_bbb",
      userId: "user_2",
      productType: "subscription",
    });

    expect(orderNo).toBe("creem_sub_sub_meta_456");
  });
});
