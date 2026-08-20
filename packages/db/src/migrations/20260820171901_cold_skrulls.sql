PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_owners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text NOT NULL,
	`avatar_id` integer,
	`birthday` text,
	`national_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`avatar_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_owners`("id", "document_id", "created_at", "updated_at", "name", "last_name", "phone", "avatar_id", "birthday", "national_id", "status") SELECT "id", "document_id", "created_at", "updated_at", "name", "last_name", "phone", "avatar_id", "birthday", "national_id", "status" FROM `owners`;--> statement-breakpoint
DROP TABLE `owners`;--> statement-breakpoint
ALTER TABLE `__new_owners` RENAME TO `owners`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `owners_document_id_unique` ON `owners` (`document_id`);