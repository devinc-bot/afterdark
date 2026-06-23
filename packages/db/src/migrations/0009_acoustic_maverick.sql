CREATE TABLE `staff` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text NOT NULL,
	`avatar` text,
	`status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_document_id_unique` ON `staff` (`document_id`);--> statement-breakpoint
CREATE TABLE `staff_account_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`staff_id` integer NOT NULL,
	`account_id` integer NOT NULL,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_account_lnk_document_id_unique` ON `staff_account_lnk` (`document_id`);
