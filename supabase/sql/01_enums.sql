-- ============================================================================
-- 01_enums.sql
-- ENUMS & CONSTANTS
-- ============================================================================

-- Helper block to create types safely
DO $$
BEGIN
    -- User Roles
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE user_role_type AS ENUM (
            'super_admin', 'admin', 'ops_manager', 'relocation_coordinator', 'finance', 'driver', 'customer'
        );
    END IF;

    -- Entity Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type_enum') THEN
        CREATE TYPE entity_type_enum AS ENUM (
            'individual', 'corporate', 'military', 'government', 'vet_clinic', 'airline', 'freight_forwarder', 'agent', 'kennel'
        );
    END IF;

    -- Booking Status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status_type') THEN
        CREATE TYPE booking_status_type AS ENUM (
            'enquiry', 'quoting', 'quoted', 'confirmed', 'payment_pending', 'docs_prep', 'docs_pending', 'docs_received', 'docs_verified', 'scheduled', 'pickup_scheduled', 'picked_up', 'in_transit', 'customs_clearance', 'cleared', 'out_for_delivery', 'delivered', 'completed', 'cancelled', 'on_hold'
        );
    END IF;

    -- Payment Status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_type') THEN
        CREATE TYPE payment_status_type AS ENUM (
            'unpaid', 'partial', 'paid', 'overpaid', 'refunded'
        );
    END IF;

    -- Service Types


    -- Communication Channels
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comm_channel_enum') THEN
        CREATE TYPE comm_channel_enum AS ENUM (
            'email', 'sms', 'whatsapp', 'note'
        );
    END IF;

    -- Communication Direction
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comm_direction_enum') THEN
        CREATE TYPE comm_direction_enum AS ENUM (
            'inbound', 'outbound'
        );
    END IF;

    -- Finance Document Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'finance_doc_type_enum') THEN
        CREATE TYPE finance_doc_type_enum AS ENUM (
            'quotation', 'proforma_invoice', 'invoice', 'receipt', 'credit_note', 'debit_note', 'vendor_bill', 'expense_claim'
        );
    END IF;

    -- Node Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'node_type_enum') THEN
        CREATE TYPE node_type_enum AS ENUM (
            'airport', 'residence', 'quarantine_station', 'warehouse', 'vet_clinic', 'kennel', 'port'
        );
    END IF;

    -- Pet Gender
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_gender_enum') THEN
        CREATE TYPE pet_gender_enum AS ENUM (
            'Male', 'Female', 'Male_Neutered', 'Female_Spayed', 'Unknown'
        );
    END IF;

    -- Pricing Models
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_model_enum') THEN
        CREATE TYPE pricing_model_enum AS ENUM (
            'fixed', 'per_kg', 'per_km', 'per_hour', 'percentage', 'custom'
        );
    END IF;
END$$;
