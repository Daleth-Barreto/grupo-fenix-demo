import { loadStripe } from '@stripe/stripe-js'

const stripeKey = import.meta.env.PUBLIC_STRIPE_KEY ?? ''

export const stripePromise = stripeKey ? loadStripe(stripeKey) : null
export const isStripeConfigured = !!stripeKey
