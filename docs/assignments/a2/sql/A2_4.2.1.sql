-- INFS7903 Assignment 2 | Public teaching edition
-- Run the statements one at a time in the labelled connections.
-- When step 5 blocks, leave it waiting and run step 6 in connection 2.
-- step 1: connection 1
BEGIN;
-- step 2: connection 2
BEGIN;
-- step 3: connection 1
UPDATE VEHICLES SET odometer = odometer + 10 WHERE vehicle_id = 'VEH-0401';
-- step 4: connection 2
UPDATE VEHICLES SET odometer = odometer + 20 WHERE vehicle_id = 'VEH-0501';
-- step 5: connection 1
UPDATE VEHICLES SET odometer = odometer + 10 WHERE vehicle_id = 'VEH-0501';
-- step 6: connection 2
UPDATE VEHICLES SET odometer = odometer + 20 WHERE vehicle_id = 'VEH-0401';
-- step 7: connection 1
COMMIT;
-- step 8: connection 2
COMMIT;
-- step 9: connection 1
SELECT vehicle_id, odometer FROM VEHICLES WHERE vehicle_id IN ('VEH-0401', 'VEH-0501') ORDER BY vehicle_id;
