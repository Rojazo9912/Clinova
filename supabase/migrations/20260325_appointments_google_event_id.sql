-- Migration: appointments_google_event_id
-- Adds google_event_id to appointments table for bidirectional Google Calendar sync.
-- When a Clinova appointment is created, the Google Calendar event ID is stored here
-- so that updates and cancellations can be reflected in Google Calendar.

ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS google_event_id text;
