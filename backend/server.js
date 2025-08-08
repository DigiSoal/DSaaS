const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const crypto = require('crypto');
const axios = require('axios');

// Load environment variables for API keys
require('dotenv').config();

const app = express();
const port = 4242;

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'YOUR_STRIPE_SECRET_KEY');

// Placeholder for other payment gateways' SDKs and keys
const payfastKey = process.env.PAYFAST_SECRET_KEY || 'YOUR_PAYFAST_SECRET_KEY';
const payfastPassphrase = process.env.PAYFAST_PASSPHRASE || 'YOUR_PAYFAST_PASSPHRASE';
const peachPaymentsKey = process.env.PEACH_PAYMENTS_SECRET_KEY || 'YOUR_PEACH_PAYMENTS_SECRET_KEY';
const ozowKey = process.env.OZOW_SECRET_KEY || 'YOUR_OZOW_SECRET_KEY';

app.use(cors());
app.use(bodyParser.json());

// --- REAL API CALLS AND LOGIC (MOCK IMPLEMENTATIONS) ---
const getExchangeRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  console.log(`Fetching exchange rate for ${fromCurrency} to ${toCurrency}...`);
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    if (response.data && response.data.rates && response.data.rates[toCurrency]) {
      return response.data.rates[toCurrency];
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error.message);
  }
  const rates = {
    'USD': 0.055,
    'GBP': 0.045,
    'EUR': 0.050,
  };
  return rates[toCurrency] || 1;
};

const createStripeSession = async (totalAmount, currency, isOnceOff) => {
  const mode = isOnceOff ? 'payment' : 'subscription';
  const name = isOnceOff ? 'DigiSoal Services (Once-off)' : 'DigiSoal Services (Monthly Subscription)';

  const sessionConfig = {
    payment_method_types: ['card'],
    mode: mode,
    line_items: [{
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: name,
        },
        unit_amount: totalAmount * 100,
        ...(mode === 'subscription' && {
          recurring: {
            interval: 'month',
          },
        }),
      },
      quantity: 1,
    }],
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
  };
  const session = await stripe.checkout.sessions.create(sessionConfig);
  return session.id;
};

const createPayfastSession = async (totalAmount, currency) => {
  console.log(`Creating mock Payfast session for ${totalAmount} ${currency}...`);
  const merchantId = '10000100';
  const merchantKey = payfastKey;
  const signature = crypto.createHash('md5').update(`${merchantId}|${merchantKey}|${totalAmount}|${currency}`).digest('hex');

  return `https://www.payfast.co.za/eng/process?merchant_id=${merchantId}&amount=${totalAmount}&signature=${signature}`;
};

const createOzowSession = async (totalAmount, currency) => {
  console.log(`Creating mock Ozow session for ${totalAmount} ${currency}...`);
  return `ozow_session_id_${Math.random().toString(36).substr(2, 9)}`;
};

const createPayflexSession = async (totalAmount, currency) => {
  console.log(`Creating mock Payflex session for ${totalAmount} ${currency}...`);
  return `payflex_session_id_${Math.random().toString(36).substr(2, 9)}`;
};

const createApplePaySession = async (totalAmount, currency) => {
  console.log(`Creating mock Apple Pay session for ${totalAmount} ${currency}...`);
  return `apple_pay_session_id_${Math.random().toString(36).substr(2, 9)}`;
};

const createGooglePaySession = async (totalAmount, currency) => {
  console.log(`Creating mock Google Pay session for ${totalAmount} ${currency}...`);
  return `google_pay_session_id_${Math.random().toString(36).substr(2, 9)}`;
};

const createPeachPaymentsSession = async (totalAmount, currency) => {
  console.log(`Creating mock Peach Payments session for ${totalAmount} ${currency}...`);
  return `peach_payments_session_id_${Math.random().toString(36).substr(2, 9)}`;
};

// --- API ROUTES ---
app.post('/create-checkout', async (req, res) => {
  const { onceOffTotal, monthlyTotal, gateway, currency } = req.body;

  if (onceOffTotal === 0 && monthlyTotal === 0) {
    return res.status(400).json({ error: 'No services selected for payment.' });
  }

  const sessionIds = {};
  const targetCurrency = currency || 'ZAR';

  try {
    const exchangeRate = await getExchangeRate('ZAR', targetCurrency);
    const convertedOnceOffTotal = Math.round(onceOffTotal * exchangeRate);
    const convertedMonthlyTotal = Math.round(monthlyTotal * exchangeRate);
    const combinedTotal = convertedOnceOffTotal + convertedMonthlyTotal;

    switch (gateway) {
      case 'stripe':
        if (convertedOnceOffTotal > 0) {
          sessionIds.onceOff = await createStripeSession(convertedOnceOffTotal, targetCurrency, true);
        }
        if (convertedMonthlyTotal > 0) {
          sessionIds.monthly = await createStripeSession(convertedMonthlyTotal, targetCurrency, false);
        }
        break;
      case 'payfast':
        if (combinedTotal > 0) {
          sessionIds.combined = await createPayfastSession(combinedTotal, targetCurrency);
        }
        break;
      case 'peach-payments':
        if (combinedTotal > 0) {
          sessionIds.combined = await createPeachPaymentsSession(combinedTotal, targetCurrency);
        }
        break;
      case 'ozow':
        if (combinedTotal > 0) {
          sessionIds.combined = await createOzowSession(combinedTotal, targetCurrency);
        }
        break;
      case 'payflex':
        if (combinedTotal > 0) {
          sessionIds.combined = await createPayflexSession(combinedTotal, targetCurrency);
        }
        break;
      case 'apple-pay':
        if (combinedTotal > 0) {
          sessionIds.combined = await createApplePaySession(combinedTotal, targetCurrency);
        }
        break;
      case 'google-pay':
        if (combinedTotal > 0) {
          sessionIds.combined = await createGooglePaySession(combinedTotal, targetCurrency);
        }
        break;
      default:
        return res.status(400).json({ error: 'Invalid payment gateway selected.' });
    }

    res.json(sessionIds);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`DigiSoal backend listening at http://localhost:${port}`);
});
