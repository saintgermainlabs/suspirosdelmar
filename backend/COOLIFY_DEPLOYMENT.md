# Coolify Deployment Guide for Los Suspiros del Mar

This guide details how to deploy the **PostgreSQL Database** and **Evolution API (WhatsApp Gateway)** stack to your Coolify production server.

---

## Step 1: Create a Docker Compose Stack in Coolify

1. Open your Coolify Dashboard.
2. Select your **Project** and **Environment**.
3. Click **+ Add Resource** → Select **Docker Compose**.
4. Set the Resource Name: `suspiros-backend-stack`.
5. Paste the contents of [`backend/coolify-docker-compose.yml`](file:///home/god/websites/suspiros/backend/coolify-docker-compose.yml) into the Docker Compose configuration editor.

---

## Step 2: Configure Environment Variables in Coolify

In the Coolify **Environment Variables** tab for this stack, add the following variables:

```env
POSTGRES_USER=suspiros_admin
POSTGRES_PASSWORD=your_strong_postgres_password_here
POSTGRES_DB=suspiros_db
EVOLUTION_DOMAIN=evolution.suspirosdelmar.com
EVOLUTION_API_KEY=your_secret_evolution_api_key_here
```

*(Coolify will automatically assign an SSL certificate to `EVOLUTION_DOMAIN` via Traefik/Caddy).*

---

## Step 3: Deploy & Run Initial Database Migration

1. Click **Deploy** in Coolify.
2. Once the containers are running:
   - Connect to PostgreSQL (either via Coolify Terminal or database tool).
   - Execute the SQL script in [`backend/init.sql`](file:///home/god/websites/suspiros/backend/init.sql) to create the `submissions` and `bookings` tables.

---

## Step 4: Pair WhatsApp on Evolution API

1. Open `https://evolution.suspirosdelmar.com` (or your domain).
2. Create an instance (e.g. `suspiros_instance`).
3. Scan the generated QR code using WhatsApp on your phone to link your business WhatsApp number.

---

## Step 5: Connect n8n Workflow

1. Open your existing remote n8n server.
2. Import `backend/n8n/workflows/booking_submission_pipeline.json`.
3. Set up the PostgreSQL credential in n8n pointing to your PostgreSQL container address/port.
4. Set up the Resend API credential and Evolution API key.
5. Activate the workflow and copy the Production Webhook URL (`https://n8n.yourdomain.com/webhook/submit`).
6. Add `VITE_N8N_WEBHOOK_URL` to your frontend deployment settings in Coolify.
