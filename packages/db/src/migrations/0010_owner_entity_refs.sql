PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_clubs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`capacity` text NOT NULL,
	`description` text,
	`owner_id` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_clubs` (`id`, `document_id`, `created_at`, `updated_at`, `name`, `capacity`, `description`, `owner_id`, `status`)
SELECT
	`clubs`.`id`,
	`clubs`.`document_id`,
	`clubs`.`created_at`,
	`clubs`.`updated_at`,
	`clubs`.`name`,
	`clubs`.`capacity`,
	`clubs`.`description`,
	COALESCE((SELECT `owners`.`id` FROM `owners` ORDER BY `owners`.`id` LIMIT 1), 0),
	`clubs`.`status`
FROM `clubs`;--> statement-breakpoint
DROP TABLE `clubs`;--> statement-breakpoint
ALTER TABLE `__new_clubs` RENAME TO `clubs`;--> statement-breakpoint
CREATE UNIQUE INDEX `clubs_document_id_unique` ON `clubs` (`document_id`);--> statement-breakpoint
CREATE TABLE `__new_staff_invitations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`email` text NOT NULL,
	`club_id` integer NOT NULL,
	`invited_by_owner_id` integer NOT NULL,
	`slug` text NOT NULL,
	`token` text NOT NULL,
	`security_word_hash` text,
	`expires_at` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`accepted_at` integer,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invited_by_owner_id`) REFERENCES `owners`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_staff_invitations` (
	`id`,
	`document_id`,
	`created_at`,
	`updated_at`,
	`email`,
	`club_id`,
	`invited_by_owner_id`,
	`slug`,
	`token`,
	`security_word_hash`,
	`expires_at`,
	`status`,
	`role`,
	`accepted_at`
)
SELECT
	`staff_invitations`.`id`,
	`staff_invitations`.`document_id`,
	`staff_invitations`.`created_at`,
	`staff_invitations`.`updated_at`,
	`staff_invitations`.`email`,
	`staff_invitations`.`club_id`,
	COALESCE((SELECT `owners`.`id` FROM `owners` ORDER BY `owners`.`id` LIMIT 1), 0),
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
PRAGMA foreign_keys=ON;
