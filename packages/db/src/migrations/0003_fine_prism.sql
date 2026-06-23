CREATE TABLE `staff_invitations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`email` text NOT NULL,
	`club_id` integer NOT NULL,
	`slug` text NOT NULL,
	`token` text NOT NULL,
	`security_word_hash` text,
	`expires_at` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`accepted_at` integer,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_invitations_document_id_unique` ON `staff_invitations` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `staff_invitations_token_unique` ON `staff_invitations` (`token`);