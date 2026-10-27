-- INFS7903 Assignment 2 | Public teaching edition
SELECT count(*), sum(amount) FROM BOOKING_EVENTS
WHERE event_type = 'Incident'
  AND event_time >= TIMESTAMP '2026-03-01'
  AND event_time <  TIMESTAMP '2026-04-01';
EXPLAIN (ANALYZE, BUFFERS) SELECT count(*), sum(amount) FROM BOOKING_EVENTS
WHERE event_type = 'Incident'
  AND event_time >= TIMESTAMP '2026-03-01'
  AND event_time <  TIMESTAMP '2026-04-01';
