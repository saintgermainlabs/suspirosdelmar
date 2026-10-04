-- Universal Multi-Tenant Database Initialization

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema for Evolution API
CREATE SCHEMA IF NOT EXISTS evolution;

-- Schema for shared apps
CREATE SCHEMA IF NOT EXISTS apps;

-- Universal Submissions Table (multi-tenant with app_id)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id VARCHAR(100) NOT NULL DEFAULT 'default', -- e.g. 'suspiros', 'app_b', 'agency_client'
    form_type VARCHAR(50) NOT NULL,                 -- 'booking', 'contact', 'lead', 'survey'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',             -- 'pending', 'processed', 'archived'
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,       -- Stores custom/dynamic form fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Universal Bookings Table (multi-tenant with app_id)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id VARCHAR(100) NOT NULL DEFAULT 'default',
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    guests_count INT DEFAULT 1,
    room_name VARCHAR(255),
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'pending',             -- 'pending', 'confirmed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_app_type ON public.submissions(app_id, form_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_app_dates ON public.bookings(app_id, checkin_date, checkout_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
