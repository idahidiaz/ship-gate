---
assurance:
  id: t-9
  base: sha256:f02f1f0cb61c44875cfff3e8bcb723e36e8574bc62fb89aec457a12d4ccc8a9c
---
# Owner cancellation removes visit from timeline and recalculates day totals

> Establish a confirmed booking on the owner timeline, cancel it as owner, and inspect that date's timeline and all day totals for the booking's absence.

## Step 1

At {{start_url}}, open the Bloom & Co. salon browser site and reach its four-step booking flow at /book.

## Step 2

Book Signature cut with Noor at an available future appointment; provide {{customer_name}} and {{customer_phone}}, confirm, and record the new booking's code, salon-local date, duration, total and deposit.

## Step 3

At {{start_url}}, visit the Bloom & Co. owner view at /owner, select the new booking's salon-local date and locate its entry on the day timeline.

## Step 4

capture baseline: bookings count on the owner day view for the new booking's salon-local date

## Step 5

capture baseline: booked hours on the owner day view for the new booking's salon-local date

## Step 6

capture baseline: expected revenue on the owner day view for the new booking's salon-local date

## Step 7

capture baseline: deposits taken on the owner day view for the new booking's salon-local date

## Step 8 @verifies ac-36

On the selected owner day timeline, inspect the newly confirmed booking's entry, then assert an owner cancellation action is available on that entry.

## Step 9 @verifies ac-37, ac-35

On that owner-day booking entry, cancel the newly confirmed visit and inspect the updated timeline, then assert the cancelled booking is absent and any remaining non-cancelled bookings for the selected date are shown.

## Step 10 @verifies ac-33, ac-34, ac-31, ac-32

On the selected owner's day view after that cancellation, inspect the four daily figures against the captured baselines and the cancelled booking's recorded duration, total and deposit, accounting independently for any other active bookings; then assert the count equals the remaining non-cancelled bookings, booked hours equal their summed durations, expected revenue equals their summed totals and deposits taken equal their summed deposits.
