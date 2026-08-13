ALTER TABLE `orders` ADD `external_order_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_external_order_id_unique` ON `orders` (`external_order_id`);