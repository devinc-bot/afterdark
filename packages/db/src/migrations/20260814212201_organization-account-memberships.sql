PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`tax_id` text
);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_document_id_unique` ON `organizations` (`document_id`);--> statement-breakpoint
INSERT INTO `organizations` (`id`, `document_id`, `created_at`, `updated_at`, `name`, `tax_id`)
SELECT
	`id`,
	lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
	`created_at`,
	`updated_at`,
	coalesce(nullif(trim(`organization_name`), ''), nullif(trim(`name`) || ' ' || trim(`last_name`), ' '), 'Organization'),
	`tax_id`
FROM `owners`;--> statement-breakpoint
CREATE TABLE `organization_accounts_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`organization_id` integer NOT NULL,
	`account_id` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_accounts_lnk_document_id_unique` ON `organization_accounts_lnk` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_accounts_lnk_organization_id_account_id_unique` ON `organization_accounts_lnk` (`organization_id`,`account_id`);--> statement-breakpoint
INSERT INTO `organization_accounts_lnk` (`document_id`, `created_at`, `updated_at`, `organization_id`, `account_id`)
SELECT
	lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
	`created_at`,
	`updated_at`,
	`organization_id`,
	`account_id`
FROM (
	SELECT DISTINCT
		`owners`.`created_at` AS `created_at`,
		`owners`.`updated_at` AS `updated_at`,
		`owners`.`id` AS `organization_id`,
		`owner_account_lnk`.`account_id` AS `account_id`
	FROM `owners`
	INNER JOIN `owner_account_lnk` ON `owner_account_lnk`.`owner_id` = `owners`.`id`
);--> statement-breakpoint
INSERT INTO `organization_accounts_lnk` (`document_id`, `created_at`, `updated_at`, `organization_id`, `account_id`)
SELECT
	lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
	`created_at`,
	`updated_at`,
	`organization_id`,
	`account_id`
FROM (
	SELECT
		min(`staff_location_lnk`.`created_at`) AS `created_at`,
		max(`staff_location_lnk`.`updated_at`) AS `updated_at`,
		`locations`.`owner_id` AS `organization_id`,
		`staff_account_lnk`.`account_id` AS `account_id`
	FROM `staff_location_lnk`
	INNER JOIN `locations` ON `locations`.`id` = `staff_location_lnk`.`location_id`
	INNER JOIN `staff_account_lnk` ON `staff_account_lnk`.`staff_id` = `staff_location_lnk`.`staff_id`
	GROUP BY `locations`.`owner_id`, `staff_account_lnk`.`account_id`
);--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`location_id` integer NOT NULL,
	`organization_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`location` text,
	`status` text DEFAULT 'draft' NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
INSERT INTO `__new_events` (`id`, `document_id`, `created_at`, `updated_at`, `location_id`, `organization_id`, `name`, `description`, `starts_at`, `ends_at`, `location`, `status`)
SELECT
	`events`.`id`,
	`events`.`document_id`,
	`events`.`created_at`,
	`events`.`updated_at`,
	`events`.`location_id`,
	(SELECT `locations`.`owner_id` FROM `locations` WHERE `locations`.`id` = `events`.`location_id`),
	`events`.`name`,
	`events`.`description`,
	`events`.`starts_at`,
	`events`.`ends_at`,
	`events`.`location`,
	`events`.`status`
FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
CREATE UNIQUE INDEX `events_document_id_unique` ON `events` (`document_id`);--> statement-breakpoint
CREATE TABLE `__new_staff_invitations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`email` text NOT NULL,
	`organization_id` integer NOT NULL,
	`invited_by_owner_id` integer NOT NULL,
	`slug` text NOT NULL,
	`token` text NOT NULL,
	`security_word_hash` text,
	`expires_at` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`accepted_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invited_by_owner_id`) REFERENCES `owners`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
INSERT INTO `__new_staff_invitations` (`id`, `document_id`, `created_at`, `updated_at`, `email`, `organization_id`, `invited_by_owner_id`, `slug`, `token`, `security_word_hash`, `expires_at`, `status`, `role`, `accepted_at`)
SELECT
	`staff_invitations`.`id`,
	`staff_invitations`.`document_id`,
	`staff_invitations`.`created_at`,
	`staff_invitations`.`updated_at`,
	`staff_invitations`.`email`,
	(SELECT `locations`.`owner_id` FROM `locations` WHERE `locations`.`id` = `staff_invitations`.`location_id`),
	`staff_invitations`.`invited_by_owner_id`,
	`staff_invitations`.`slug`,
	`staff_invitations`.`token`,
	`staff_invitations`.`security_word_hash`,
	`staff_invitations`.`expires_at`,
	`staff_invitations`.`status`,
	`staff_invitations`.`role`,
	`staff_invitations`.`accepted_at`
FROM `staff_invitations`;--> statement-breakpoint
DROP TABLE `staff_invitations`;--> statement-breakpoint
ALTER TABLE `__new_staff_invitations` RENAME TO `staff_invitations`;--> statement-breakpoint
CREATE UNIQUE INDEX `staff_invitations_document_id_unique` ON `staff_invitations` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `staff_invitations_token_unique` ON `staff_invitations` (`token`);--> statement-breakpoint
DROP TABLE `staff_location_lnk`;--> statement-breakpoint
ALTER TABLE `owners` DROP COLUMN `organization_name`;--> statement-breakpoint
ALTER TABLE `owners` DROP COLUMN `tax_id`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
