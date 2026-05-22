# Creem Product Checklist (Plan B)

This checklist reflects the new credit economy based on **Plan B** (where 1 credit = 0.2 RMB cost, exchange rate 7.2).

## Subscription Products

| Product | Type | Price | Credits | Billing |
| --- | --- | ---: | ---: | --- |
| Basic Plan | Subscription | $5.00 | 70 | Monthly |
| Pro Plan | Subscription | $15.00 | 220 | Monthly |
| Ultimate Plan | Subscription | $39.00 | 600 | Monthly |
| Basic Plan (Yearly) | Subscription | $50.00 | 840 | Yearly |
| Pro Plan (Yearly) | Subscription | $150.00 | 2,640 | Yearly |
| Ultimate Plan (Yearly) | Subscription | $390.00 | 7,200 | Yearly |

## One-Time Credit Packages

| Product | Type | Price | Credits | Buyer |
| --- | --- | ---: | ---: | --- |
| Starter Pack | One-time | $5.00 | 50 | All users |
| Standard Pack | One-time | $12.00 | 130 | Subscribers |
| Pro Pack | One-time | $30.00 | 350 | Subscribers |

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
