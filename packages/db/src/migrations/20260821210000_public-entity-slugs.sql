ALTER TABLE `organizations` ADD `slug` text;
ALTER TABLE `events` ADD `slug` text;

WITH normalized AS (
  SELECT `id`,
    CASE WHEN trim(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(lower(`name`), ' ', '-'), '/', '-'), '_', '-'), '.', '-'), ',', '-'), '''', ''), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n')) = '' THEN 'item'
    ELSE trim(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(lower(`name`), ' ', '-'), '/', '-'), '_', '-'), '.', '-'), ',', '-'), '''', ''), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), '-') END AS `base_slug`
  FROM `organizations`
), ranked AS (
  SELECT `id`, `base_slug`, row_number() OVER (PARTITION BY `base_slug` ORDER BY `id`) AS `position` FROM normalized
)
UPDATE `organizations`
SET `slug` = (SELECT CASE WHEN `position` = 1 THEN `base_slug` ELSE `base_slug` || '-' || `position` END FROM ranked WHERE ranked.`id` = organizations.`id`);

WITH normalized AS (
  SELECT `id`,
    CASE WHEN trim(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(lower(`name`), ' ', '-'), '/', '-'), '_', '-'), '.', '-'), ',', '-'), '''', ''), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n')) = '' THEN 'item'
    ELSE trim(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(lower(`name`), ' ', '-'), '/', '-'), '_', '-'), '.', '-'), ',', '-'), '''', ''), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), '-') END AS `base_slug`
  FROM `events`
), ranked AS (
  SELECT `id`, `base_slug`, row_number() OVER (PARTITION BY `base_slug` ORDER BY `id`) AS `position` FROM normalized
)
UPDATE `events`
SET `slug` = (SELECT CASE WHEN `position` = 1 THEN `base_slug` ELSE `base_slug` || '-' || `position` END FROM ranked WHERE ranked.`id` = events.`id`);

CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);
