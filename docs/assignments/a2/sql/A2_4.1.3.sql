-- INFS7903 Assignment 2 | Public teaching edition
-- connection 1, after connection 2 has committed
INSERT INTO BOOKING_EVENTS
    (member_id, vehicle_id, event_type, event_time, amount)
VALUES (1, 'VEH-0001', 'Collect', NOW(), NULL);
-- The trigger raises an exception, so COMMIT ends this failed transaction as ROLLBACK.
COMMIT;
SELECT event_id, member_id, vehicle_id, event_type, event_time, amount
FROM BOOKING_EVENTS
WHERE vehicle_id = 'VEH-0001'
ORDER BY event_time DESC, event_id DESC LIMIT 3;
