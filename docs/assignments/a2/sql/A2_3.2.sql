-- INFS7903 Assignment 2 | Public teaching edition
-- Setting 1: index scans enabled; sequential scans enabled.
SET enable_indexscan = on;
SET enable_indexonlyscan = on;
SET enable_bitmapscan = on;
SET enable_seqscan = on;
-- Query C
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM BOOKING_EVENTS WHERE event_type < 'Collect';
-- Query D
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM BOOKING_EVENTS WHERE event_type >= 'Collect';
-- Setting 2: index scans enabled; sequential scans suppressed.
SET enable_indexscan = on;
SET enable_indexonlyscan = on;
SET enable_bitmapscan = on;
SET enable_seqscan = off;
-- Query C
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM BOOKING_EVENTS WHERE event_type < 'Collect';
-- Query D
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM BOOKING_EVENTS WHERE event_type >= 'Collect';
-- Setting 3: index scans suppressed; sequential scans enabled.
SET enable_indexscan = off;
SET enable_indexonlyscan = off;
SET enable_bitmapscan = off;
SET enable_seqscan = on;
-- Query C
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM BOOKING_EVENTS WHERE event_type < 'Collect';
-- Query D
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM BOOKING_EVENTS WHERE event_type >= 'Collect';
-- Restore all four scan settings.
SET enable_indexscan = on;
SET enable_indexonlyscan = on;
SET enable_bitmapscan = on;
SET enable_seqscan = on;
