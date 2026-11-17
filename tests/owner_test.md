---
url: http://localhost:4180/book
---
<!-- Written from SPEC.md only (Opening hours "ends at 11:00 does not block 11:00", Owner day totals, Cancelling), never from the code. -->

## Book a haircut with Noor at 11:00
Tick only "Signature cut". Choose the stylist "Noor". Choose a Wednesday at least 3 days from today and remember that exact date (call it DATE). Click the start time 11:00. Fill in name "Ana Ray", phone "0300 1111111", no promo code. Review: Total must be $48.60 and deposit $9.72. Confirm. The page says "You're booked!" and the time is 11:00 to 11:45.

## Book a blow-dry that starts exactly when the first one ends
Start a new booking at /book. Tick only "Blow-dry". Choose "Noor" and the same DATE. The start time 11:45 MUST be offered (the first booking ends at 11:45 and does not block it). Pick 11:45. Name "Ben Cole", phone "0300 2222222", no promo code. Review: Total must be $32.40 and deposit $6.48. Confirm. The time is 11:45 to 12:15.

## Check the owner's day totals
Open /owner and choose DATE. Two bookings are listed (Ana Ray, Ben Cole). The day totals must be: 2 bookings, 1.25 booked hours (1 h 15 min), expected revenue $81.00, deposits taken $16.20.

## Owner cancels the first booking
Click Cancel on Ana Ray's booking. A browser popup asks "Cancel booking ...?": accept it (press OK, do not dismiss it). She leaves the day totals. Totals must now be: 1 booking, 0.5 booked hours (30 min), revenue $32.40, deposits $6.48.

## Cancelled time is free again
Start a new booking at /book, tick only "Signature cut", choose "Noor" and DATE. The start time 11:00 must be offered again.
