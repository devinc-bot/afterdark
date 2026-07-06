CREATE TABLE `owner_addresses_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`owner_id` integer NOT NULL,
	`address_id` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `owner_addresses_lnk_document_id_unique` ON `owner_addresses_lnk` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `owner_addresses_lnk_owner_id_unique` ON `owner_addresses_lnk` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `owner_addresses_lnk_address_id_unique` ON `owner_addresses_lnk` (`address_id`);--> statement-breakpoint
DROP TABLE `user_addresses_lnk`;