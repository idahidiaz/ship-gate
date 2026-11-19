---
assurance:
  id: t-8
  base: sha256:fae1c5ea1857b4d01fa8e989914ee537f4c7f9e9f1ad9ce72d598b7d515b24a4
---
# Confirmed visit appears on the owner date with calculated day totals

> After a new booking is confirmed, select its salon-local date in the owner view and independently check its timeline membership, booking count, booked hours, expected revenue and deposits taken.

## Step 1

At {{start_url}}, open the Bloom & Co. salon browser site and reach the four-step booking flow at /book.

## Step 2

In the booking flow, choose Signature cut with Noor and a future available appointment that finishes within the salon's opening hours.

## Step 3

On the booking details and review steps, enter {{customer_name}} and {{customer_phone}} without a promotion; confirm the booking and record its confirmation code, salon-local date, start and end times, total and deposit.

## Step 4

At {{start_url}}, open the Bloom & Co. owner day view at /owner and select the confirmed booking's recorded salon-local date.

## Step 5 @verifies ac-35, ac-33, ac-34, ac-31, ac-32

On the selected owner day view, inspect the timeline and independently account for the active bookings on that date using their booking details; then assert the newly confirmed booking appears on its date's timeline, the displayed booking count equals the number of non-cancelled bookings, booked hours equal their summed durations, expected revenue equals their summed booking totals and deposits taken equal their summed deposits.
