# Universal Multi-Tenant Backend Automation Stack

A production-ready, reusable backend stack designed to run on **Coolify** to power webhooks, databases, WhatsApp notifications, transactional email dispatching, caching, and database management across **all your websites, apps, and client projects.**

---

## 📦 What's Included in the Stack

| Service | Technology | Role |
|---------|------------|------|
| **Database** | PostgreSQL 16 Alpine | Central SQL datastore for all apps (`submissions`, `bookings`, `users`). |
| **Workflow Engine** | n8n | Webhook routing, automated email/SMS/WhatsApp flows, cron jobs, API syncs. |
| **WhatsApp Gateway** | Evolution API v2.1.1 | Multi-instance WhatsApp gateway (supports separate instances per phone number/app). |
| **Cache & Queue** | Redis 7 Alpine | High-speed cache, pub/sub, and execution queue manager for n8n and apps. |
| **Database GUI** | Adminer | Web UI to manage, view, and query your database tables visually. |

---

## 🚀 How to Deploy on Coolify

### Step 1: Create Docker Compose Resource in Coolify
1. In Coolify, navigate to your desired Project & Environment.
2. Click **+ Add Resource** → Select **Docker Compose**.
3. Set Name: `universal-shared-backend`.
4. Copy and paste the contents of [`shared-backend-stack/docker-compose.yml`](file:///home/god/websites/suspiros/shared-backend-stack/docker-compose.yml).

### Step 2: Set Environment Variables in Coolify
In the **Environment Variables** tab of the resource, add:

```env
POSTGRES_USER=master_admin
POSTGRES_PASSWORD=your_secure_master_password
POSTGRES_DB=shared_backend_db
REDIS_PASSWORD=your_secure_redis_password
N8N_ENCRYPTION_KEY=32_character_random_encryption_key
N8N_DOMAIN=n8n.yourdomain.com
EVOLUTION_DOMAIN=whatsapp.yourdomain.com
EVOLUTION_API_KEY=your_secure_evolution_api_key
```

### Step 3: Deploy
Click **Deploy** in Coolify. Coolify will automatically provision container networking, SSL certificates, persistent storage volumes, and health checks.

---

## 💡 How Multiple Websites Use This Stack

### 1. Webhook Isolation using `app_id`
Every website passes its unique `app_id` in the webhook JSON body:
- Website A (`Los Suspiros del Mar`): `{ "app_id": "suspiros", "form_type": "booking", ... }`
- Website B (`E-Commerce Store`): `{ "app_id": "store_b", "form_type": "contact", ... }`

The `public.submissions` and `public.bookings` tables store `app_id` as a column, allowing you to query or separate submissions per website cleanly!

### 2. Multi-Instance WhatsApp via Evolution API
Evolution API supports **unlimited instances**. You can connect multiple WhatsApp numbers:
- Instance 1: `suspiros_wa` (Connected to Suspiros WhatsApp)
- Instance 2: `store_wa` (Connected to E-Commerce WhatsApp)

In n8n, simply target `http://evolution-api:8080/message/sendText/${json.body.app_id}_wa`.

### 3. Unified Transactional Email (Resend / Postmark)
In n8n, set up a master Resend/Postmark credential. n8n dynamically formats HTML templates per `app_id`.
