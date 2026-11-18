---
assurance:
  id: t-4
  base: sha256:871c0d39186863effc79f035abfb06e6e8bd94f19b2a8405249aeb87caee8178
---
# Invalid name, phone and supplied email block booking progress

> Do not advance a booking when the name, phone or supplied email violates its stated input rule.

## Step 1

Open {{start_url}}/book in the Bloom & Co. browser site and reach the services phase of booking.

## Step 2 @verifies ac-14, ac-15

Choose one Signature cut (45 minutes), then assert the one-service booking duration is 45 minutes.

## Step 3

Select an available date, stylist and start for that cut and reach the customer-details phase.

## Step 4 @verifies ac-19

On customer details try to advance with name A and valid phone {{customer_phone}}, then assert review and confirmation cannot be reached with that one-letter name.

## Step 5 @verifies ac-20

On customer details replace the name with {{customer_name}} and supply six-digit phone 123456, then try to advance and assert review and confirmation cannot be reached with that phone.

## Step 6 @verifies ac-21

On customer details supply valid name {{customer_name}}, valid phone {{customer_phone}} and email not-an-email, then try to advance and assert review and confirmation cannot be reached with that supplied invalid email.
