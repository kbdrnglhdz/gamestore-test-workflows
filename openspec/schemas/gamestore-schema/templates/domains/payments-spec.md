# Delta for Payments

## ADDED Requirements

### Requirement: [METODO_PAGO]
<!-- Ejemplo: Credit Card, PayPal, MercadoPago -->

#### Scenario: Successful payment
- GIVEN a user with items in cart
- WHEN the user completes checkout with valid payment details
- THEN the order status becomes "PAID"
- AND a confirmation email is sent
- AND the cart is cleared

#### Scenario: Failed payment
- GIVEN invalid payment details
- WHEN payment is attempted
- THEN error message "Payment failed: [razon]" is shown
- AND cart remains unchanged
- AND order status is not updated

#### Scenario: Insufficient stock during checkout
- GIVEN a product with stock = [STOCK]
- WHEN user tries to buy more than available
- THEN payment is rejected
- AND error message "Product out of stock" is shown

## PCI Compliance Requirements (always include)
- NEVER log credit card details (numbers, CVV, expiry)
- Use payment processor SDK (Stripe/PayPal) – never store raw card data
- Store only payment reference ID (e.g., stripe_payment_intent_id)
- All payment requests MUST be over HTTPS
- Webhook endpoints MUST verify signatures