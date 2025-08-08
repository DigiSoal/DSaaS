The following JSON structure represents the services and pricing used in the prototype. This is a static representation; in a production environment, this would likely be stored in a database and managed via a content management system.

[
  {
    "id": "compliance-registration",
    "name": "Startup Registration",
    "description": "CIPC company registration, SARS tax number, and BEE certificate.",
    "price": 2500,
    "type": "one-time"
  },
  {
    "id": "compliance-onboarding",
    "name": "Multi-jurisdiction Onboarding",
    "description": "Assistance with compliance for international operations.",
    "price": 5000,
    "type": "one-time"
  },
  {
    "id": "website-basic",
    "name": "Website Design & Dev (Basic)",
    "description": "A 5-page static website with basic features.",
    "price": 6500,
    "type": "one-time"
  },
  {
    "id": "website-pro",
    "name": "Website Design & Dev (Pro)",
    "description": "Custom website with dynamic content and database integration.",
    "price": 12000,
    "type": "one-time"
  },
  {
    "id": "social-media",
    "name": "Social Media Integration",
    "description": "Integration of social media platforms and content strategy.",
    "price": 1500,
    "type": "one-time"
  },
  {
    "id": "hosting-shared",
    "name": "Shared Web Hosting",
    "description": "Reliable hosting with cPanel, unlimited traffic, and SSD storage.",
    "price": 79,
    "type": "recurring"
  },
  {
    "id": "hosting-pro",
    "name": "Pro Web Hosting",
    "description": "High-performance hosting for larger websites.",
    "price": 159,
    "type": "recurring"
  },
  {
    "id": "domain-registration",
    "name": "Domain Registration (.co.za)",
    "description": "Annual registration of a .co.za domain name.",
    "price": 99,
    "type": "one-time"
  },
  {
    "id": "email-basic",
    "name": "Basic Email Hosting",
    "description": "10 email accounts with IMAP/POP3 support.",
    "price": 69,
    "type": "recurring"
  },
  {
    "id": "email-pro",
    "name": "Pro Email Hosting",
    "description": "50 email accounts with advanced spam filtering.",
    "price": 109,
    "type": "recurring"
  },
  {
    "id": "ultimate-package",
    "name": "Ultimate Package",
    "description": "Includes all Pro services, hosting, domain, and email at a bundled price.",
    "price": 14000,
    "type": "bundled",
    "components": ["website-pro", "social-media", "hosting-pro", "domain-registration", "email-pro"]
  }
]

README: Setup, Dependencies, and Deployment
This guide provides instructions to set up and run the DigiSoal prototype. The project consists of a React frontend and a Node.js/Express backend.

Prerequisites
Node.js (v14 or higher)

npm (or yarn)

A Stripe account to get your test API keys

1. Backend Setup
Navigate to the backend directory and install dependencies:

npm install

Configure Environment Variables:
Create a .env file in the backend directory with your Stripe secret key and webhook secret.

STRIPE_SECRET_KEY=sk_test_...YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_...YOUR_WEBHOOK_SECRET

Start the Backend Server:

node server.js

The server will run on http://localhost:4242.

2. Frontend Setup
Navigate to the frontend directory and install dependencies:

npm install

Configure Stripe Publishable Key:
In src/App.js, replace 'pk_test_..._YOUR_PUBLISHABLE_KEY' with your actual Stripe publishable key.

Start the React Development Server:

npm start

The frontend will be available at http://localhost:3000.

3. Stripe Webhook Setup
To test the webhook functionality, you'll need to use the Stripe CLI.

Install the Stripe CLI:
Follow the official Stripe documentation to install the CLI for your operating system.

Forward your webhook events:
In a new terminal window, run the following command. The Stripe CLI will forward events from your Stripe account to your local backend.
