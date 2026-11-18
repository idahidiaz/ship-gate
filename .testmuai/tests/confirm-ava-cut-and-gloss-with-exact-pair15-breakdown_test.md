---
assurance:
  id: t-1
  base: sha256:cf5b882bc5fa28378b7d06139cb6ce36e481252ce07896cf2c38d104dacf6177
---
# Confirm Ava cut and gloss with exact PAIR15 breakdown

> Book the worked example on an eligible future date and check the quoted duration, complete price breakdown and confirmation.

## Step 1

Open {{start_url}}/book in the Bloom & Co. browser site and reach the services phase of booking.

## Step 2 @verifies ac-14, ac-15

On the booking services phase select Signature cut ($45, 45 minutes) followed by Gloss treatment ($40, 30 minutes), then assert two selected services have a combined booking duration of 75 minutes.

## Step 3 @verifies ac-12, ac-13

On the stylist-and-time phase select Ava and an available start on a date within the coming 30 days that fits the full 75-minute booking, then assert offered starts follow 15-minute intervals and the chosen visit ends by that day's salon-local closing time.

## Step 4

On the customer-details phase enter name {{customer_name}} and phone {{customer_phone}}, leave optional email blank, and apply PAIR15 to the two services.

## Step 5 @verifies ac-2, ac-3, ac-4, ac-5, ac-6, ac-7, ac-8

On review of the Ava Signature cut plus Gloss treatment booking with PAIR15, then assert the displayed services total is $102.00, discount $15.30, tax $6.94, total $93.64, deposit $18.73 and pay-at-salon balance $74.91, with deposit plus balance equal to $93.64 and each amount rounded half-up to cents.

## Step 6 @verifies ac-16, ac-17

Confirm the reviewed booking, then assert its confirmation shows a booking code, selected salon-local date, start and end, Ava, Signature cut, Gloss treatment, and the money breakdown.
