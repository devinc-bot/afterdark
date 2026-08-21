ALTER TABLE `tickets_sold` ADD `checked_in_by_account_id` integer REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `tickets_sold` ADD `checked_in_by_role` text;