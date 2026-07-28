CREATE TABLE `owner_registration_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`token` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`last_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `owner_registration_tokens_document_id_unique` ON `owner_registration_tokens` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `owner_registration_tokens_token_unique` ON `owner_registration_tokens` (`token`);