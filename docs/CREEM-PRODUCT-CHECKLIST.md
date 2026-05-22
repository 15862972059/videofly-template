# Creem Product Checklist

This checklist reflects the current image pricing model used by the site.

## Subscription Products

| Product | Type | Price | Credits | Billing |
| --- | --- | ---: | ---: | --- |
| Starter Plan | Subscription | $9.00 | 80 | Monthly |
| Creator Plan | Subscription | $19.00 | 220 | Monthly |
| Studio Plan | Subscription | $49.00 | 700 | Monthly |

## One-Time Credit Packages

| Product | Type | Price | Credits | Buyer |
| --- | --- | ---: | ---: | --- |
| 30 Credits | One-time | $5.00 | 30 | All users |
| 120 Credits | One-time | $15.00 | 120 | All users |
| 360 Credits | One-time | $39.00 | 360 | All users |

## Metadata

For each Creem product, keep metadata aligned with `src/config/pricing-user.ts`:

| Key | Value |
| --- | --- |
| `credits` | The credit amount from the tables above |
| `type` | `subscription` or `credits` |
| `period` | `month` or empty for one-time packages |

## After Updating Creem

- Confirm every product price matches this file.
- Confirm every product credit amount matches `src/config/pricing-user.ts`.
- Copy any new Product ID back into the matching `id` field in `src/config/pricing-user.ts`.
- Run `pnpm typecheck`.
- Open `/pricing` and confirm prices, credits, and FAQ numbers match.
