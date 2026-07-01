CREATE TABLE `staff_club_lnk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`staff_id` integer NOT NULL,
	`club_id` integer NOT NULL,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_club_lnk_document_id_unique` ON `staff_club_lnk` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `staff_club_lnk_unique` ON `staff_club_lnk` (`staff_id`,`club_id`);