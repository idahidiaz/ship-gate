---
assurance:
  id: t-2
  base: sha256:1dd947caf326baf36ca343e511bd0500c72c7501dbf8600a8f4de40461670e70
---
# Ineligible one-service PAIR15 gives error and no discount

> With only one service, applying PAIR15 yields an error and zero discount rather than the 15% reduction.

## Step 1

Open {{start_url}}/book in the Bloom & Co. browser site and reach the services phase of booking.

## Step 2 @verifies ac-14, ac-15

Choose only Signature cut ($45, 45 minutes) for the visit, then assert one selected service lasts 45 minutes.

## Step 3

Select Noor and an available booking date and start for the 45-minute cut, then reach the customer-details phase.

## Step 4 @verifies ac-9, ac-10, ac-4

On the booking details or review phase apply PAIR15 to the single Signature cut booking, then assert a clear ineligible-code error appears, the discount is $0.00, and the services total remains $45.00.
