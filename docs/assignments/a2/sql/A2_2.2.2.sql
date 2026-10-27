-- INFS7903 Assignment 2 | Public teaching edition
EXPLAIN (ANALYZE, BUFFERS) SELECT LOWER(SPLIT_PART(email, '@', 2)) AS provider_domain,
       COUNT(*) AS member_count
FROM MEMBERS
GROUP BY LOWER(SPLIT_PART(email, '@', 2))
ORDER BY member_count DESC, provider_domain;
