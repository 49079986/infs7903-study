-- INFS7903 Assignment 2 | Public teaching edition
INSERT INTO BOOKING_EVENTS (member_id, vehicle_id, event_type, event_time, amount)
SELECT member_id, 'VEH-0001', 'Incident', TIMESTAMP '2026-05-04 09:15:00', 90000.00
FROM MEMBERS WHERE sponsor_id IS NOT NULL ORDER BY member_id DESC LIMIT 1;
-- Query A reflects the inserted charge immediately.
SELECT * FROM V_ACCOUNT_LIABILITY;
-- Query B still contains its stored result.
SELECT * FROM MV_ACCOUNT_LIABILITY;
REFRESH MATERIALIZED VIEW MV_ACCOUNT_LIABILITY;
-- Query B after refresh.
SELECT * FROM MV_ACCOUNT_LIABILITY;
