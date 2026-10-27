-- INFS7903 Assignment 2 | Public teaching edition
CREATE INDEX IDX_MEMBER_DOMAIN
ON MEMBERS (LOWER(SPLIT_PART(email, '@', 2)));
