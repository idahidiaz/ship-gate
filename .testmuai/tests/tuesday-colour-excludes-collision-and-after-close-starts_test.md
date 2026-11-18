---
assurance:
  id: t-3
  base: sha256:228145e28e361234fb858b9d693d0ae82d3e283fb6be59b9794955562167f505
---
# Tuesday colour excludes collision and after-close starts

> For a future Tuesday, reject starts after the 16:00 latest Full colour start and any start whose two-hour interval overlaps an existing booking for the selected stylist.

## Step 1

Open {{start_url}}/book in the Bloom & Co. browser site and reach the services phase of booking.

## Step 2

Choose one Signature cut for Ava on a future Tuesday within the next 30 days with an available start between 10:00 and 14:00 salon local time; complete its booking using {{customer_name}} and {{customer_phone}} to establish an occupied Ava interval on that Tuesday.

## Step 3 @verifies ac-14, ac-15

Return to {{start_url}}/book and choose only Full colour (120 minutes), then assert the single selected service lasts 120 minutes.

## Step 4 @verifies ac-1, ac-12, ac-13, ac-18

For Ava on that same future Tuesday inspect offered starts for Full colour, then assert all offered starts align to 15-minute intervals, end by 18:00 salon local time, exclude 16:15, and exclude the occupied Signature cut start because the two booking intervals overlap.
