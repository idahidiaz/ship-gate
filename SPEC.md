# Bloom & Co. salon: what the site must do

This is the spec the coding agent builds from and the spec Kane CLI tests against.
Kane's tests are written from THIS file, not from the code, so they catch places where the code disagrees.

## Pages
- `/`: home. Hero, the service menu with prices and durations, the three stylists, opening hours, and a "Book a visit" button.
- `/book`: booking in 4 steps: services, stylist and time, your details, review and confirm.
- `/booking/<code>`: a booking's page, opened with the code + phone. You can cancel it there.
- `/owner`: the owner's day view. Pick a date and see that day's bookings on a timeline with day totals. Cancel button on each booking.

## Services (price in $, duration in minutes)
| id | Service | Price | Minutes |
|---|---|---|---|
| cut | Signature cut | 45 | 45 |
| blow | Blow-dry | 30 | 30 |
| color | Full colour | 95 | 120 |
| gloss | Gloss treatment | 40 | 30 |
| mani | Manicure | 28 | 45 |
| pedi | Pedicure | 38 | 60 |
| facial | Calm facial | 70 | 60 |

A booking can have 1 to 4 services. They happen back to back, so the booking lasts the SUM of their minutes.

## Stylists
- Ava (Senior): prices x 1.20.
- Noor (Stylist): normal prices.
- Leo (Junior): prices x 0.85.
- "Any stylist": the first stylist, in the order Noor, Ava, Leo, who is free for the whole booking.

## Opening hours (salon's local time)
- Monday: closed.
- Tuesday to Thursday: 10:00–18:00. Friday: 10:00–20:00. Saturday: 09:00–17:00. Sunday: 11:00–16:00.
- Start times are offered every 15 minutes.
- The WHOLE booking must end at or before closing. A 120-minute colour on a Tuesday can start at 16:00 at the latest.
- A stylist can't have two bookings that overlap. A booking that ends at 11:00 does not block a start at 11:00.
- Bookings can be made from today up to 30 days ahead. Times earlier than now are not offered for today.
- Dates are the salon's local dates. The site must never shift a date by a day because of time zones.

## Money
1. Services total = sum of service prices, each times the stylist's factor.
2. Promo codes (one per booking, case does not matter):
   - `WELCOME10`: 10% off the services total.
   - `PAIR15`: 15% off, only when the booking has 2 or more services.
   - Unknown or not-allowed code: clear error message, no discount.
3. Tax: 8% on (services total minus discount).
4. Total = services total - discount + tax.
5. Deposit due now = 20% of the total. Pay at the salon = total - deposit.
6. Every amount is rounded to cents only when shown and saved, half up (12.345 -> 12.35).
   Deposit + pay at salon must always add up exactly to the total shown.

Worked example: Signature cut + Gloss with Ava, code PAIR15:
services (45 + 40) x 1.20 = 102.00; discount 15.30; tax 8% of 86.70 = 6.94; total 93.64;
deposit 18.73; pay at salon 74.91; lasts 75 minutes.

## Your details
- Name: at least 2 letters. Phone: 7 to 15 digits (spaces, dashes and a leading + allowed). Email optional, but valid if given.

## After booking
- Confirmation shows a code like `BC-7KQ2M`, the date, start and end time, stylist, services, and the money breakdown.
- The owner view shows the booking on that date, and the day totals include it.

## Cancelling
- Customers can cancel from `/booking/<code>` up to 24 hours before the start. Later than that: the button is replaced by
  "Please call the salon to cancel within 24 hours."
- The owner can always cancel. A cancelled booking frees its time and leaves the day totals.

## Owner day totals
- Bookings count, booked hours, expected revenue (sum of totals), deposits taken (sum of deposits). Cancelled bookings are not counted.
