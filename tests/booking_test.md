---
url: http://localhost:4173/
---

## Check the empty booking page
Before anything is filled in, the "You're booked!" confirmation must NOT be visible on the page.

## Book a haircut
Choose "Haircut" as the service, pick tomorrow's date, click the first free time button,
type "Sam Lee" as the name and "0300 1234567" as the phone, then click "Book now".

## Check the confirmation
The page shows "You're booked!" with a booking code that starts with "SG-".
The booking form is no longer visible.

## Check the owner sees it
Click "Owner view". The bookings table has a row for "Sam Lee" with service "Haircut".
