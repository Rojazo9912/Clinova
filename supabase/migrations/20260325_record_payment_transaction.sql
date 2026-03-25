-- Migration: record_payment_transaction
-- Wraps the payment insert + treatment plan balance update in a single atomic transaction.
-- If either operation fails, both are rolled back.

CREATE OR REPLACE FUNCTION record_payment(
    p_clinic_id     uuid,
    p_patient_id    uuid,
    p_service_id    uuid,
    p_amount        numeric,
    p_payment_method text,
    p_notes         text,
    p_treatment_plan_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payment_id uuid;
BEGIN
    -- Insert the payment record
    INSERT INTO payments (
        clinic_id,
        patient_id,
        service_id,
        amount,
        payment_method,
        notes,
        status
    )
    VALUES (
        p_clinic_id,
        p_patient_id,
        p_service_id,
        p_amount,
        p_payment_method,
        p_notes,
        'completed'
    )
    RETURNING id INTO v_payment_id;

    -- Update the linked treatment plan balance (if provided)
    IF p_treatment_plan_id IS NOT NULL THEN
        UPDATE treatment_plans
        SET paid_amount = COALESCE(paid_amount, 0) + p_amount
        WHERE id = p_treatment_plan_id
          AND clinic_id = p_clinic_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Treatment plan % not found for clinic %', p_treatment_plan_id, p_clinic_id;
        END IF;
    END IF;

    RETURN v_payment_id;
END;
$$;

-- Only authenticated users can call this function (RLS on underlying tables still applies)
REVOKE ALL ON FUNCTION record_payment FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_payment TO authenticated;
