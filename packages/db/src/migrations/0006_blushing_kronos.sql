CREATE TABLE `account_role_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`account_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_role_lnk_document_id_unique` ON `account_role_lnk` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `account_role_lnk_account_id_unique` ON `account_role_lnk` (`account_id`);--> statement-breakpoint
INSERT INTO `account_role_lnk` (`document_id`, `created_at`, `updated_at`, `account_id`, `role_id`)
SELECT
	`accounts`.`document_id` || '-account-role-lnk',
	`user_accounts_lnk`.`created_at`,
	`user_accounts_lnk`.`updated_at`,
	`user_accounts_lnk`.`account_id`,
	`user_accounts_lnk`.`role_id`
FROM `user_accounts_lnk`
INNER JOIN `accounts` ON `accounts`.`id` = `user_accounts_lnk`.`account_id`;--> statement-breakpoint
CREATE TABLE `__new_user_accounts_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` integer NOT NULL,
	`account_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_accounts_lnk` (`id`, `document_id`, `created_at`, `updated_at`, `user_id`, `account_id`)
SELECT `id`, `document_id`, `created_at`, `updated_at`, `user_id`, `account_id` FROM `user_accounts_lnk`;--> statement-breakpoint
DROP TABLE `user_accounts_lnk`;--> statement-breakpoint
ALTER TABLE `__new_user_accounts_lnk` RENAME TO `user_accounts_lnk`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_accounts_lnk_document_id_unique` ON `user_accounts_lnk` (`document_id`);
