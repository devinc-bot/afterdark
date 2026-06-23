CREATE TABLE `owners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text NOT NULL,
	`avatar` text,
	`birthday` text,
	`national_id` text,
	`tax_id` text,
	`status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `owners_document_id_unique` ON `owners` (`document_id`);--> statement-breakpoint
CREATE TABLE `owner_account_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`owner_id` integer NOT NULL,
	`account_id` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `owner_account_lnk_document_id_unique` ON `owner_account_lnk` (`document_id`);
