-- Add Meta WhatsApp Cloud API phone number ID per clinic
-- Each clinic can register their own WhatsApp Business number
-- If null, the platform's default WHATSAPP_PHONE_NUMBER_ID env var is used as fallback

ALTER TABLE clinics ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT;
