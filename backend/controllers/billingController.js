const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe checkout session for premium upgrade
// @route   POST /api/billing/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const domain = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'StudyGenie Premium Upgrade',
              description: 'Unlock Study Planner and AI Chat features',
            },
            unit_amount: 999,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user._id.toString(),
      },
      success_url: `${domain}/upgrade?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/upgrade?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe session creation failed:', error);
    res.status(500).json({ message: 'Failed to create Stripe checkout session' });
  }
};

// @desc    Confirm premium upgrade after Stripe checkout
// @route   POST /api/billing/confirm
// @access  Private
const confirmCheckoutSession = async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Missing checkout session ID' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    if (session.metadata?.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Session does not belong to the authenticated user' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isPremium = true;
    if (session.customer) {
      user.stripeCustomerId = session.customer;
    }
    await user.save();

    res.status(200).json({ isPremium: true });
  } catch (error) {
    console.error('Stripe session confirmation failed:', error);
    res.status(500).json({ message: 'Failed to confirm premium upgrade' });
  }
};

// @desc    Cancel premium access
// @route   POST /api/billing/cancel
// @access  Private
const cancelPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isPremium = false;
    user.stripeCustomerId = undefined;
    await user.save();

    res.status(200).json({ isPremium: false, message: 'Premium membership canceled' });
  } catch (error) {
    console.error('Cancel premium failed:', error);
    res.status(500).json({ message: 'Failed to cancel premium membership' });
  }
};

module.exports = {
  createCheckoutSession,
  confirmCheckoutSession,
  cancelPremium,
};
