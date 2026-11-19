---
assurance:
  id: t-6
  base: sha256:f1d5bc0a208c700dc39dc53cd50d46ed8c3a5f9bab5b3a80b6f83451e61536b2
---
# Late customer booking shows call-salon text with no cancellation button

> Open a booking with code and phone less than 24 hours before start; check online cancellation unavailable and the exact call-salon notice displayed.

## Step 1

At {{start_url}}, open the Bloom & Co. salon site and reach its booking pages.

## Step 2 @verifies ac-30

On the booking page for {{late_booking_code}}, use that code and {{customer_phone}} to open the appointment whose start is less than 24 hours away, then assert the appointment's booking page opens.

## Step 3 @verifies ac-23, ac-24

On the Bloom & Co. customer booking page for {{late_booking_code}}, inspect the cancellation area before that appointment starts, then assert the customer cancellation button is absent and the replacement text equals “Please call the salon to cancel within 24 hours.”
