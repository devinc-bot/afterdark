ALTER TABLE `orders` ADD `paid_at` integer;--> statement-breakpoint
ALTER TABLE `tickets_sold` ADD `checked_in` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets_sold` ADD `used_at` integer;