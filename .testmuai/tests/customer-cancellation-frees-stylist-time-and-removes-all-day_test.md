---
assurance:
  id: t-5
  base: sha256:c2ec797ed18f10c35132bdff5bb4da5479ac0a3c70ab494beaac24ba5b325c40
---
# Customer cancellation frees stylist time and removes all day-total contributions

> Using code and phone, cancel a booking more than 24 hours before start; inspect the freed stylist slot and the date's owner totals.

## Step 1

At {{start_url}}, open the Bloom & Co. salon site and reach its booking pages.

## Step 2 @verifies ac-30

On the Bloom & Co. booking page for {{eligible_booking_code}}, use that booking code and {{customer_phone}} to open the appointment, then assert the booking page for that appointment opens.

## Step 3

On that booking page for {{eligible_booking_code}}, record its appointment date, stylist, start time, duration, total and deposit for comparison with the owner day view.

## Step 4

At {{start_url}}, open the Bloom & Co. owner day view for the appointment date of {{eligible_booking_code}} and locate that booking on the timeline.

## Step 5

capture baseline: bookings count on the owner day view for the appointment date of {{eligible_booking_code}}

## Step 6

capture baseline: booked hours on the owner day view for the appointment date of {{eligible_booking_code}}

## Step 7

capture baseline: expected revenue on the owner day view for the appointment date of {{eligible_booking_code}}

## Step 8

capture baseline: deposits taken on the owner day view for the appointment date of {{eligible_booking_code}}

## Step 9 @verifies ac-22

At {{start_url}}, return to the customer booking page for {{eligible_booking_code}} using {{customer_phone}} and establish the available customer cancellation action more than 24 hours before the start, then assert customer cancellation is available.

## Step 10 @verifies ac-26, ac-27, ac-28, ac-29

On the customer booking page for {{eligible_booking_code}}, cancel the visit; on the Bloom & Co. owner day view for its recorded date inspect the day totals, then assert the count excludes that booking, booked hours exclude its duration, expected revenue excludes its total, and deposits taken exclude its deposit relative to the captured baselines.

## Step 11 @verifies ac-25

At {{start_url}}, on the Bloom & Co. booking flow's stylist-and-time step for the same recorded date, stylist and duration as cancelled booking {{eligible_booking_code}}, inspect the former start time, then assert that previously occupied time is available for a new booking.
