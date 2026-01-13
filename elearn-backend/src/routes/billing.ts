// src/routes/billing.ts
import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { prisma } from '../db'
import crypto from 'node:crypto'
import nodemailer from 'nodemailer'
import { logger } from '../utils/logger.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT || 587),
  auth: { user: process.env.MAILTRAP_USER!, pass: process.env.MAILTRAP_PASS! },
})

function genInvite() {
  const token = crypto.randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
  return { token, expiresAt }
}

router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const user = req.user! // Гарантовано є завдяки requireAuth

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      customer_email: user.email, // Тільки для передзаповнення
      client_reference_id: user.id, // [ВАЖЛИВО] Прив'язка до ID
      metadata: {
        userId: user.id,
        userEmail: user.email
      },
      success_url: `${process.env.APP_URL}/billing/success`,
      cancel_url: `${process.env.APP_URL}/billing/cancel`,
    })
    res.json({ url: session.url })
  } catch (e) { next(e) }
})

export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers['stripe-signature']
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    logger.error('Webhook signature verification failed', err as Error)
    return res.sendStatus(400)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id || session.metadata?.userId

    if (!userId) {
      console.error('Webhook Error: No userId in session', session.id)
      return res.sendStatus(400)
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
        console.error('Webhook Error: User not found', userId)
        return res.sendStatus(404)
    }

    const amount = session.amount_total ?? 0
    const currency = (session.currency ?? 'pln').toUpperCase()

    await prisma.payment.create({
      data: {
        userEmail: user.email, // Беремо email з нашої БД
        amount,
        currency,
        provider: 'stripe',
        providerId: session.id,
        status: 'succeeded',
      },
    })

    const { token, expiresAt } = genInvite()
    await prisma.inviteToken.create({ 
      data: { email: user.email, token, expiresAt } 
    })

    const link = `${process.env.APP_URL}/invite?token=${token}`
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: 'Your access to E-Learn',
      html: `<p>Welcome! Click to finish registration:</p>
             <p><a href="${link}">${link}</a></p>
             <p>This link expires in 24h.</p>`,
    })
  }

  return res.json({ received: true })
}

export default router
