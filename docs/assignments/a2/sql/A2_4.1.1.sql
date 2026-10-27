-- INFS7903 Assignment 2 | Public teaching edition
-- connection 1
BEGIN;
SHOW transaction_isolation;
SELECT v.vehicle_id, latest.event_id,
       latest.event_type, latest.event_time
FROM VEHICLES v
CROSS JOIN LATERAL (
    SELECT e.event_id, e.event_type, e.event_time
    FROM BOOKING_EVENTS e
    WHERE e.vehicle_id = v.vehicle_id
    ORDER BY e.event_time DESC, e.event_id DESC
    LIMIT 1
) latest
WHERE v.vehicle_id = 'VEH-0001'
  AND latest.event_type = 'Return';
-- Keep this transaction open. Run 4.1.2 in connection 2.
