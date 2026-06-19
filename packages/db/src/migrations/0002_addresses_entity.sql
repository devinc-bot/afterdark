CREATE TABLE `addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`address` text NOT NULL,
	`street_number` text NOT NULL,
	`state` text NOT NULL,
	`city` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `addresses_document_id_unique` ON `addresses` (`document_id`);--> statement-breakpoint
CREATE TABLE `club_addresses_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`club_id` integer NOT NULL,
	`address_id` integer NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `club_addresses_lnk_document_id_unique` ON `club_addresses_lnk` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `club_addresses_lnk_club_id_unique` ON `club_addresses_lnk` (`club_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `club_addresses_lnk_address_id_unique` ON `club_addresses_lnk` (`address_id`);--> statement-breakpoint
CREATE TABLE `user_addresses_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` integer NOT NULL,
	`address_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_addresses_lnk_document_id_unique` ON `user_addresses_lnk` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_addresses_lnk_user_id_unique` ON `user_addresses_lnk` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_addresses_lnk_address_id_unique` ON `user_addresses_lnk` (`address_id`);--> statement-breakpoint
INSERT INTO `addresses` (`document_id`, `created_at`, `updated_at`, `address`, `street_number`, `state`, `city`)
SELECT
	`document_id` || '-address',
	`created_at`,
	`updated_at`,
	`address`,
	`street_number`,
	`state`,
	`city`
FROM `clubs`;--> statement-breakpoint
INSERT INTO `club_addresses_lnk` (`document_id`, `created_at`, `updated_at`, `club_id`, `address_id`)
SELECT
	`clubs`.`document_id` || '-club-address-lnk',
	`clubs`.`created_at`,
	`clubs`.`updated_at`,
	`clubs`.`id`,
	`addresses`.`id`
FROM `clubs`
INNER JOIN `addresses` ON `addresses`.`document_id` = `clubs`.`document_id` || '-address';--> statement-breakpoint
ALTER TABLE `clubs` DROP COLUMN `address`;--> statement-breakpoint
ALTER TABLE `clubs` DROP COLUMN `street_number`;--> statement-breakpoint
ALTER TABLE `clubs` DROP COLUMN `state`;--> statement-breakpoint
ALTER TABLE `clubs` DROP COLUMN `city`;
