ALTER TABLE `clubs` RENAME TO `locations`;--> statement-breakpoint
DROP INDEX `clubs_document_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `locations_document_id_unique` ON `locations` (`document_id`);--> statement-breakpoint
ALTER TABLE `locations` ADD `type` text DEFAULT 'permanent' NOT NULL;--> statement-breakpoint
UPDATE `locations` SET `type` = 'permanent' WHERE `type` IS NULL;--> statement-breakpoint
ALTER TABLE `locations` DROP COLUMN `status`;--> statement-breakpoint

ALTER TABLE `club_addresses_lnk` RENAME TO `location_addresses_lnk`;--> statement-breakpoint
ALTER TABLE `location_addresses_lnk` RENAME COLUMN `club_id` TO `location_id`;--> statement-breakpoint
DROP INDEX `club_addresses_lnk_document_id_unique`;--> statement-breakpoint
DROP INDEX `club_addresses_lnk_club_id_unique`;--> statement-breakpoint
DROP INDEX `club_addresses_lnk_address_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `location_addresses_lnk_document_id_unique` ON `location_addresses_lnk` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `location_addresses_lnk_location_id_unique` ON `location_addresses_lnk` (`location_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `location_addresses_lnk_address_id_unique` ON `location_addresses_lnk` (`address_id`);--> statement-breakpoint

ALTER TABLE `club_assets_lnk` RENAME TO `location_assets_lnk`;--> statement-breakpoint
ALTER TABLE `location_assets_lnk` RENAME COLUMN `club_id` TO `location_id`;--> statement-breakpoint
DROP INDEX `club_assets_lnk_document_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `location_assets_lnk_document_id_unique` ON `location_assets_lnk` (`document_id`);--> statement-breakpoint

ALTER TABLE `staff_club_lnk` RENAME TO `staff_location_lnk`;--> statement-breakpoint
ALTER TABLE `staff_location_lnk` RENAME COLUMN `club_id` TO `location_id`;--> statement-breakpoint
DROP INDEX `staff_club_lnk_document_id_unique`;--> statement-breakpoint
DROP INDEX `staff_club_lnk_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `staff_location_lnk_document_id_unique` ON `staff_location_lnk` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `staff_location_lnk_unique` ON `staff_location_lnk` (`staff_id`, `location_id`);--> statement-breakpoint

ALTER TABLE `events` RENAME COLUMN `club_id` TO `location_id`;--> statement-breakpoint
ALTER TABLE `staff_invitations` RENAME COLUMN `club_id` TO `location_id`;
