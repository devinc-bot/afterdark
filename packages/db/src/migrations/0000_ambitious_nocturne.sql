CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text NOT NULL,
	`avatar` text,
	`age` integer,
	`status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_document_id_unique` ON `users` (`document_id`);--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_document_id_unique` ON `accounts` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_email_unique` ON `accounts` (`email`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_document_id_unique` ON `roles` (`document_id`);--> statement-breakpoint
CREATE TABLE `assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`url` text,
	`type` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_document_id_unique` ON `assets` (`document_id`);--> statement-breakpoint
CREATE TABLE `user_assets_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` integer NOT NULL,
	`asset_id` integer NOT NULL,
	`type` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_assets_lnk_document_id_unique` ON `user_assets_lnk` (`document_id`);--> statement-breakpoint
CREATE TABLE `user_accounts_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` integer NOT NULL,
	`account_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_accounts_lnk_document_id_unique` ON `user_accounts_lnk` (`document_id`);--> statement-breakpoint
CREATE TABLE `clubs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`capacity` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`address` text NOT NULL,
	`street_number` text NOT NULL,
	`state` text NOT NULL,
	`city` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clubs_document_id_unique` ON `clubs` (`document_id`);--> statement-breakpoint
CREATE TABLE `club_assets_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`club_id` integer NOT NULL,
	`asset_id` integer NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `club_assets_lnk_document_id_unique` ON `club_assets_lnk` (`document_id`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_document_id_unique` ON `services` (`document_id`);--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`quantity` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`description` text NOT NULL,
	`club_id` integer NOT NULL,
	`type` text DEFAULT 'general' NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tickets_document_id_unique` ON `tickets` (`document_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ticket_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`club_id` integer NOT NULL,
	`status` text,
	`amount` real NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_document_id_unique` ON `payments` (`document_id`);--> statement-breakpoint
CREATE TABLE `chat` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chat_document_id_unique` ON `chat` (`document_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`from_id` integer NOT NULL,
	`to_id` integer NOT NULL,
	`content` text NOT NULL,
	`chat_id` integer NOT NULL,
	FOREIGN KEY (`from_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`chat_id`) REFERENCES `chat`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `messages_document_id_unique` ON `messages` (`document_id`);