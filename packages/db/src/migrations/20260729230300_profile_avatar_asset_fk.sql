ALTER TABLE `users` ADD `avatar_id` integer REFERENCES `assets`(`id`) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `owners` ADD `avatar_id` integer REFERENCES `assets`(`id`) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `staff` ADD `avatar_id` integer REFERENCES `assets`(`id`) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `avatar`;--> statement-breakpoint
ALTER TABLE `owners` DROP COLUMN `avatar`;--> statement-breakpoint
ALTER TABLE `staff` DROP COLUMN `avatar`;--> statement-breakpoint
DROP TABLE `user_assets_lnk`;
