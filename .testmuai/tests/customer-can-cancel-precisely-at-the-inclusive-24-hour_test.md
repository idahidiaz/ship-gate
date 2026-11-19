---
assurance:
  id: t-7
  base: sha256:eef1376c39b48ba79497712233f43501e6316429a3fad75b9c9b557962f22f4b
---
# Customer can cancel precisely at the inclusive 24-hour deadline

> At precisely the inclusive 24-hour cutoff, access the booking with code and phone and cancel it while the customer action is still available.

## Step 1

At {{start_url}}, open the Bloom & Co. salon site and reach its booking pages.

## Step 2 @verifies ac-30

On the customer booking page for {{cutoff_booking_code}}, use the code and {{customer_phone}} to open the appointment whose start is exactly 24 hours after the execution clock, then assert that booking page opens.

## Step 3

On the booking page for {{cutoff_booking_code}}, record its date, stylist, start time, duration, total and deposit.

## Step 4

At {{start_url}}, open the Bloom & Co. owner day view for the date of {{cutoff_booking_code}} and locate that booking.

## Step 5

capture baseline: bookings count on the owner day view for the date of {{cutoff_booking_code}}

## Step 6

capture baseline: booked hours on the owner day view for the date of {{cutoff_booking_code}}

## Step 7

capture baseline: expected revenue on the owner day view for the date of {{cutoff_booking_code}}

## Step 8

capture baseline: deposits taken on the owner day view for the date of {{cutoff_booking_code}}

## Step 9 @verifies ac-22

At {{start_url}}, return to the booking page for {{cutoff_booking_code}} with {{customer_phone}} at exactly 24 hours before its start, then assert the customer cancellation action is available.

## Step 10 @verifies ac-26, ac-27, ac-28, ac-29

On the customer booking page for {{cutoff_booking_code}}, cancel that appointment; on the owner day view for its date inspect the totals, then assert bookings count excludes that booking, booked hours exclude its duration, expected revenue excludes its total, and deposits taken exclude its deposit relative to the captured baselines.

## Step 11 @verifies ac-25

At {{start_url}}, in the Bloom & Co. booking flow's stylist-and-time step for the recorded date, stylist and duration of {{cutoff_booking_code}}, inspect the previously booked start time, then assert it is available for a new booking.
