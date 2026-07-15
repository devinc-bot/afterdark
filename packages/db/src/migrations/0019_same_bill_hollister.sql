PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`provider` text DEFAULT 'local' NOT NULL,
	`provider_account_id` text
);
--> statement-breakpoint
INSERT INTO `__new_accounts`("id", "document_id", "created_at", "updated_at", "email", "password", "provider", "provider_account_id") SELECT "id", "document_id", "created_at", "updated_at", "email", "password", 'local', NULL FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_document_id_unique` ON `accounts` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_email_unique` ON `accounts` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_account_id_unique` ON `accounts` (`provider_account_id`);
