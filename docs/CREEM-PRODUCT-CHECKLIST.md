# Creem Product Checklist

This checklist reflects the current image-generation credit economy.

## Subscription Products

| Product | Type | Price | Credits | Billing |
| --- | --- | ---: | ---: | --- |
| Basic Plan | Subscription | $9.90 | 160 | Monthly |
| Pro Plan | Subscription | $29.90 | 540 | Monthly |
| Ultimate Plan | Subscription | $79.90 | 1,600 | Monthly |
| Basic Plan (Yearly) | Subscription | $99.00 | 1,920 | Yearly |
| Pro Plan (Yearly) | Subscription | $299.00 | 6,480 | Yearly |
| Ultimate Plan (Yearly) | Subscription | $799.00 | 19,200 | Yearly |

## One-Time Credit Packages

| Product | Type | Price | Credits | Buyer |
| --- | --- | ---: | ---: | --- |
| Starter Pack | One-time | $9.90 | 150 | All users |
| Standard Pack | One-time | $24.90 | 430 | Subscribers |
| Pro Pack | One-time | $59.90 | 1,100 | Subscribers |

## Metadata

For each Creem product, keep metadata aligned with `src/config/pricing-user.ts`:

| Key | Value |
| --- | --- |
| `credits` | The credit amount from the tables above |
| `type` | `subscription` or `credits` |
| `period` | `month`, `year`, or empty for one-time packages |

## After Updating Creem

- Confirm every product price matches this file.
- Confirm every product credit amount matches `src/config/pricing-user.ts`.
- Copy any new Product ID back into the matching `id` field in `src/config/pricing-user.ts`.
- Run `pnpm typecheck`.
- Open `/pricing` and confirm prices, credits, and FAQ numbers match.
