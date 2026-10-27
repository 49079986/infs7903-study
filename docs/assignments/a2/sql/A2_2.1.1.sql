-- INFS7903 Assignment 2 | Public teaching edition
CREATE INDEX IDX_EVENT_TYPE_TIME
ON BOOKING_EVENTS (event_type, event_time);
